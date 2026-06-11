import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', authMiddleware, roleMiddleware('dueno'), (req, res) => {
  const items = query('SELECT * FROM contactos ORDER BY created_at DESC');
  res.json(items);
});

router.post('/', (req, res) => {
  const { nombre, email, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  run('INSERT INTO contactos (nombre, email, mensaje) VALUES (?, ?, ?)',
    [nombre, email, mensaje]);

  res.status(201).json({ message: 'Mensaje enviado exitosamente' });
});

router.put('/:id/leer', authMiddleware, roleMiddleware('dueno'), (req, res) => {
  run('UPDATE contactos SET leido = 1 WHERE id = ?', [req.params.id]);
  res.json({ message: 'Marcado como leído' });
});

router.delete('/:id', authMiddleware, roleMiddleware('dueno'), (req, res) => {
  run('DELETE FROM contactos WHERE id = ?', [req.params.id]);
  res.json({ message: 'Mensaje eliminado' });
});

export default router;
