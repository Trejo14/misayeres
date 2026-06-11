import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', authMiddleware, roleMiddleware('dueno', 'admin'), (req, res) => {
  const items = query(`
    SELECT q.*, r.nombre as reportero_nombre, e.nombre as empleado_nombre
    FROM quejas q
    JOIN usuarios r ON q.reportero_id = r.id
    JOIN usuarios e ON q.empleado_id = e.id
    ORDER BY q.created_at DESC
  `);
  res.json(items);
});

router.post('/', authMiddleware, roleMiddleware('dueno'), (req, res) => {
  const { empleado_id, tipo, descripcion } = req.body;

  if (!empleado_id || !tipo || !descripcion) {
    return res.status(400).json({ error: 'empleado_id, tipo y descripcion son requeridos' });
  }

  const empleado = query('SELECT id, rol FROM usuarios WHERE id = ?', [empleado_id]);
  if (empleado.length === 0) {
    return res.status(404).json({ error: 'Empleado no encontrado' });
  }

  if (empleado[0].rol === 'dueno') {
    return res.status(400).json({ error: 'No puedes crear quejas contra el dueño' });
  }

  run(
    'INSERT INTO quejas (reportero_id, empleado_id, tipo, descripcion) VALUES (?, ?, ?, ?)',
    [req.user.id, empleado_id, tipo, descripcion]
  );

  res.status(201).json({ message: 'Queja creada' });
});

router.put('/:id', authMiddleware, roleMiddleware('dueno'), (req, res) => {
  const { estado, fecha_resuelta } = req.body;

  if (!['abierta', 'investigando', 'resuelta', 'cerrada'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  let sql = 'UPDATE quejas SET estado = ?';
  const params = [estado];

  if (estado === 'resuelta' || estado === 'cerrada') {
    sql += ', fecha_resuelta = ?';
    params.push(fecha_resuelta || new Date().toISOString());
  }

  sql += ' WHERE id = ?';
  params.push(req.params.id);

  run(sql, params);
  res.json({ message: 'Queja actualizada' });
});

export default router;
