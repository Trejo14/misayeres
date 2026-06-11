import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', authMiddleware, roleMiddleware('dueno'), async (req, res) => {
  try {
    const items = await query('SELECT * FROM contactos ORDER BY created_at DESC');
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;

    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    await run('INSERT INTO contactos (nombre, email, mensaje) VALUES ($1, $2, $3)',
      [nombre, email, mensaje]);

    res.status(201).json({ message: 'Mensaje enviado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id/leer', authMiddleware, roleMiddleware('dueno'), async (req, res) => {
  try {
    await run('UPDATE contactos SET leido = 1 WHERE id = $1', [req.params.id]);
    res.json({ message: 'Marcado como leído' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('dueno'), async (req, res) => {
  try {
    await run('DELETE FROM contactos WHERE id = $1', [req.params.id]);
    res.json({ message: 'Mensaje eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
