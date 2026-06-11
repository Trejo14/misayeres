import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const users = await query('SELECT id, nombre, email, rol, created_at FROM usuarios ORDER BY created_at DESC');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authMiddleware, roleMiddleware('dueno'), async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (!['dueno', 'admin', 'empleado'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const existing = await query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    await run('INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
      [nombre, email, hashedPassword, rol]);

    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('dueno'), async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    let sql = 'UPDATE usuarios SET nombre = $1, email = $2';
    const params = [nombre, email];
    let idx = 3;

    if (password) {
      sql += `, password = $${idx++}`;
      params.push(bcrypt.hashSync(password, 10));
    }
    if (rol) {
      if (!['dueno', 'admin', 'empleado'].includes(rol)) {
        return res.status(400).json({ error: 'Rol inválido' });
      }
      sql += `, rol = $${idx++}`;
      params.push(rol);
    }

    sql += ` WHERE id = $${idx}`;
    params.push(req.params.id);

    await run(sql, params);
    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('dueno'), async (req, res) => {
  try {
    await run('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
