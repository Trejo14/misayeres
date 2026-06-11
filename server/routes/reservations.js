import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', authMiddleware, roleMiddleware('dueno', 'admin'), (req, res) => {
  const items = query('SELECT * FROM reservas ORDER BY fecha DESC, hora DESC');
  res.json(items);
});

router.post('/', (req, res) => {
  const { nombre_cliente, telefono, email, fecha, hora, personas, notas } = req.body;

  if (!nombre_cliente || !telefono || !fecha || !hora || !personas) {
    return res.status(400).json({ error: 'Campos requeridos: nombre, teléfono, fecha, hora, personas' });
  }

  run(
    'INSERT INTO reservas (nombre_cliente, telefono, email, fecha, hora, personas, notas) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [nombre_cliente, telefono, email || '', fecha, hora, parseInt(personas), notas || '']
  );

  res.status(201).json({ message: 'Reserva creada exitosamente' });
});

router.put('/:id', authMiddleware, roleMiddleware('dueno', 'admin'), (req, res) => {
  const { estado } = req.body;

  if (!['pendiente', 'confirmada', 'cancelada', 'completada'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  run('UPDATE reservas SET estado = ? WHERE id = ?', [estado, req.params.id]);
  res.json({ message: 'Reserva actualizada' });
});

router.delete('/:id', authMiddleware, roleMiddleware('dueno'), (req, res) => {
  run('DELETE FROM reservas WHERE id = ?', [req.params.id]);
  res.json({ message: 'Reserva eliminada' });
});

export default router;
