import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/stats', authMiddleware, roleMiddleware('dueno'), async (req, res) => {
  try {
    const totalPlatillos = (await query('SELECT COUNT(*) as count FROM platillos'))[0].count;
    const totalReservas = (await query('SELECT COUNT(*) as count FROM reservas'))[0].count;
    const reservasHoy = (await query("SELECT COUNT(*) as count FROM reservas WHERE fecha = CURRENT_DATE"))[0].count;
    const totalEmpleados = (await query("SELECT COUNT(*) as count FROM usuarios WHERE rol IN ('admin','empleado')"))[0].count;
    const totalQuejas = (await query('SELECT COUNT(*) as count FROM quejas'))[0].count;
    const quejasAbiertas = (await query("SELECT COUNT(*) as count FROM quejas WHERE estado IN ('abierta','investigando')"))[0].count;
    const totalContactos = (await query('SELECT COUNT(*) as count FROM contactos'))[0].count;
    const contactosNoLeidos = (await query('SELECT COUNT(*) as count FROM contactos WHERE leido = 0'))[0].count;

    const quejasPorEmpleado = await query(`
      SELECT e.nombre, e.id, COUNT(q.id)::int as total,
        COALESCE(SUM(CASE WHEN q.estado IN ('abierta','investigando') THEN 1 ELSE 0 END), 0)::int as abiertas
      FROM quejas q
      RIGHT JOIN usuarios e ON q.empleado_id = e.id
      WHERE e.rol IN ('admin','empleado')
      GROUP BY e.id
      ORDER BY total DESC
    `);

    const quejasPorEstado = await query('SELECT estado, COUNT(*)::int as total FROM quejas GROUP BY estado');
    const quejasPorTipo = await query('SELECT tipo, COUNT(*)::int as total FROM quejas GROUP BY tipo ORDER BY total DESC');
    const reservasPorEstado = await query('SELECT estado, COUNT(*)::int as total FROM reservas GROUP BY estado');

    res.json({
      totalPlatillos,
      totalReservas,
      reservasHoy,
      totalEmpleados,
      totalQuejas,
      quejasAbiertas,
      totalContactos,
      contactosNoLeidos,
      quejasPorEmpleado,
      quejasPorEstado,
      quejasPorTipo,
      reservasPorEstado,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
