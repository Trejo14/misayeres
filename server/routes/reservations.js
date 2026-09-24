import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const items = await query('SELECT * FROM reservas ORDER BY fecha DESC, hora DESC');
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre_cliente, telefono, email, fecha, hora, personas, notas } = req.body;

    if (!nombre_cliente || !telefono || !fecha || !hora || !personas) {
      return res.status(400).json({ error: 'Campos requeridos: nombre, teléfono, fecha, hora, personas' });
    }

    const numPersonas = parseInt(personas);
    if (Number.isNaN(numPersonas) || numPersonas < 1 || numPersonas > 20) {
      return res.status(400).json({ error: 'El número de personas debe estar entre 1 y 20' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}/.test(hora)) {
      return res.status(400).json({ error: 'Fecha u hora inválida' });
    }

    const [{ pasada }] = await query('SELECT $1::date < CURRENT_DATE as pasada', [fecha]);
    if (pasada) {
      return res.status(400).json({ error: 'No se pueden hacer reservas en fechas pasadas' });
    }

    const result = await run(
      'INSERT INTO reservas (nombre_cliente, telefono, email, fecha, hora, personas, notas) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [nombre_cliente.trim(), telefono.trim(), email || '', fecha, hora, numPersonas, notas || '']
    );

    res.status(201).json({ message: 'Reserva creada exitosamente', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const { estado } = req.body;

    if (!['pendiente', 'confirmada', 'cancelada', 'completada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    await run('UPDATE reservas SET estado = $1 WHERE id = $2', [estado, req.params.id]);
    res.json({ message: 'Reserva actualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('dueno'), async (req, res) => {
  try {
    await run('DELETE FROM reservas WHERE id = $1', [req.params.id]);
    res.json({ message: 'Reserva eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
