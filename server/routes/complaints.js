import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();
const ESTADOS = ['abierta', 'investigando', 'resuelta', 'cerrada'];

// Solo el dueño puede ver las quejas.
router.get('/', authMiddleware, roleMiddleware('dueno'), async (req, res) => {
  try {
    const items = await query(`
      SELECT q.*,
        CASE WHEN q.anonima THEN NULL ELSE r.nombre END as reportero_nombre,
        e.nombre as empleado_nombre
      FROM quejas q
      LEFT JOIN usuarios r ON q.reportero_id = r.id
      LEFT JOIN usuarios e ON q.empleado_id = e.id
      ORDER BY q.created_at DESC
    `);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Cualquier usuario del sistema puede enviar una queja. Puede ser sobre un
// compañero concreto o general, y puede ser anonima.
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { empleado_id, tipo, descripcion, anonima } = req.body;

    if (!tipo || !descripcion?.trim()) {
      return res.status(400).json({ error: 'Tipo y descripcion son requeridos' });
    }

    if (empleado_id) {
      const empleado = await query('SELECT id, rol FROM usuarios WHERE id = $1', [empleado_id]);
      if (empleado.length === 0) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }
      if (empleado[0].rol === 'dueno') {
        return res.status(400).json({ error: 'No puedes crear quejas contra el dueño' });
      }
      if (empleado[0].id === req.user.id) {
        return res.status(400).json({ error: 'No puedes crear una queja sobre ti mismo' });
      }
    }

    const esAnonima = Boolean(anonima);
    await run(
      'INSERT INTO quejas (reportero_id, empleado_id, tipo, descripcion, anonima) VALUES ($1, $2, $3, $4, $5)',
      [esAnonima ? null : req.user.id, empleado_id || null, tipo, descripcion.trim(), esAnonima]
    );

    res.status(201).json({ message: 'Queja enviada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('dueno'), async (req, res) => {
  try {
    const { estado } = req.body;

    if (!ESTADOS.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    if (estado === 'resuelta' || estado === 'cerrada') {
      await run(
        'UPDATE quejas SET estado = $1, fecha_resuelta = COALESCE(fecha_resuelta, CURRENT_TIMESTAMP) WHERE id = $2',
        [estado, req.params.id]
      );
    } else {
      await run('UPDATE quejas SET estado = $1, fecha_resuelta = NULL WHERE id = $2', [estado, req.params.id]);
    }

    res.json({ message: 'Queja actualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('dueno'), async (req, res) => {
  try {
    await run('DELETE FROM quejas WHERE id = $1', [req.params.id]);
    res.json({ message: 'Queja eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
