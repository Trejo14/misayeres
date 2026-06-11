import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', authMiddleware, roleMiddleware('dueno', 'admin'), (req, res) => {
  const users = query('SELECT id, nombre, email, rol, created_at FROM usuarios ORDER BY created_at DESC');
  res.json(users);
});

router.post('/', authMiddleware, roleMiddleware('dueno'), (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  if (!['dueno', 'admin', 'empleado'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  const existing = query('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (existing.length > 0) {
    return res.status(400).json({ error: 'El email ya está registrado' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  run('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, hashedPassword, rol]);

  res.status(201).json({ message: 'Usuario creado exitosamente' });
});

router.put('/:id', authMiddleware, roleMiddleware('dueno'), (req, res) => {
  const { nombre, email, password, rol } = req.body;

  let sql = 'UPDATE usuarios SET nombre = ?, email = ?';
  const params = [nombre, email];

  if (password) {
    sql += ', password = ?';
    params.push(bcrypt.hashSync(password, 10));
  }
  if (rol) {
    if (!['dueno', 'admin', 'empleado'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
    sql += ', rol = ?';
    params.push(rol);
  }

  sql += ' WHERE id = ?';
  params.push(req.params.id);

  run(sql, params);
  res.json({ message: 'Usuario actualizado' });
});

router.delete('/:id', authMiddleware, roleMiddleware('dueno'), (req, res) => {
  run('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
  res.json({ message: 'Usuario eliminado' });
});

export default router;
