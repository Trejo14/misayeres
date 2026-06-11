import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const items = await query(`
      SELECT q.*, r.nombre as reportero_nombre, e.nombre as empleado_nombre
      FROM quejas q
      JOIN usuarios r ON q.reportero_id = r.id
      JOIN usuarios e ON q.empleado_id = e.id
      ORDER BY q.created_at DESC
    `);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authMiddleware, roleMiddleware('dueno'), async (req, res) => {
  try {
    const { empleado_id, tipo, descripcion } = req.body;

    if (!empleado_id || !tipo || !descripcion) {
      return res.status(400).json({ error: 'empleado_id, tipo y descripcion son requeridos' });
    }

    const empleado = await query('SELECT id, rol FROM usuarios WHERE id = $1', [empleado_id]);
    if (empleado.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    if (empleado[0].rol === 'dueno') {
      return res.status(400).json({ error: 'No puedes crear quejas contra el dueño' });
    }

    await run(
      'INSERT INTO quejas (reportero_id, empleado_id, tipo, descripcion) VALUES ($1, $2, $3, $4)',
      [req.user.id, empleado_id, tipo, descripcion]
    );

    res.status(201).json({ message: 'Queja creada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('dueno'), async (req, res) => {
  try {
    const { estado, fecha_resuelta } = req.body;

    if (!['abierta', 'investigando', 'resuelta', 'cerrada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    if (estado === 'resuelta' || estado === 'cerrada') {
      await run(
        'UPDATE quejas SET estado = $1, fecha_resuelta = $2 WHERE id = $3',
        [estado, fecha_resuelta || new Date().toISOString(), req.params.id]
      );
    } else {
      await run('UPDATE quejas SET estado = $1 WHERE id = $2', [estado, req.params.id]);
    }

    res.json({ message: 'Queja actualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
