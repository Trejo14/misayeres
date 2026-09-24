import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();
const ROLES = ['dueno', 'admin', 'empleado'];

router.get('/', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const users = await query('SELECT id, nombre, email, rol, created_at FROM usuarios ORDER BY created_at DESC');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Lista minima de compañeros (sin emails) para el formulario de quejas.
router.get('/companeros', authMiddleware, async (req, res) => {
  try {
    const users = await query(
      "SELECT id, nombre FROM usuarios WHERE rol <> 'dueno' AND id <> $1 ORDER BY nombre",
      [req.user.id]
    );
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

    if (!ROLES.includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existing = await query('SELECT id FROM usuarios WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    await run('INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
      [nombre.trim(), email.trim(), hashedPassword, rol]);

    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('dueno'), async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const id = parseInt(req.params.id);

    if (!nombre || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }

    const existing = await query('SELECT id FROM usuarios WHERE LOWER(email) = LOWER($1) AND id <> $2', [email.trim(), id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    let sql = 'UPDATE usuarios SET nombre = $1, email = $2';
    const params = [nombre.trim(), email.trim()];
    let idx = 3;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      sql += `, password = $${idx++}`;
      params.push(bcrypt.hashSync(password, 10));
    }
    if (rol) {
      if (!ROLES.includes(rol)) {
        return res.status(400).json({ error: 'Rol inválido' });
      }
      // Evita que el dueño se quite a si mismo el rol y el sistema quede sin dueño.
      if (id === req.user.id && rol !== 'dueno') {
        return res.status(400).json({ error: 'No puedes quitarte el rol de dueño a ti mismo' });
      }
      sql += `, rol = $${idx++}`;
      params.push(rol);
    }

    sql += ` WHERE id = $${idx}`;
    params.push(id);

    await run(sql, params);
    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('dueno'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (id === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    const quejas = await query('SELECT COUNT(*)::int as total FROM quejas WHERE empleado_id = $1', [id]);
    if (quejas[0].total > 0) {
      return res.status(400).json({ error: 'No se puede eliminar: el usuario tiene quejas registradas. Elimina esas quejas primero.' });
    }

    // Las quejas que este usuario envio se conservan, pero sin autor.
    await run('UPDATE quejas SET reportero_id = NULL WHERE reportero_id = $1', [id]);
    await run('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
