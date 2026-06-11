import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/stats', authMiddleware, roleMiddleware('dueno'), (req, res) => {
  const totalPlatillos = query('SELECT COUNT(*) as count FROM platillos')[0].count;
  const totalReservas = query('SELECT COUNT(*) as count FROM reservas')[0].count;
  const reservasHoy = query("SELECT COUNT(*) as count FROM reservas WHERE fecha = date('now')")[0].count;
  const totalEmpleados = query("SELECT COUNT(*) as count FROM usuarios WHERE rol IN ('admin','empleado')")[0].count;
  const totalQuejas = query('SELECT COUNT(*) as count FROM quejas')[0].count;
  const quejasAbiertas = query("SELECT COUNT(*) as count FROM quejas WHERE estado IN ('abierta','investigando')")[0].count;
  const totalContactos = query('SELECT COUNT(*) as count FROM contactos')[0].count;
  const contactosNoLeidos = query('SELECT COUNT(*) as count FROM contactos WHERE leido = 0')[0].count;

  const quejasPorEmpleado = query(`
    SELECT e.nombre, e.id, COUNT(q.id) as total,
      SUM(CASE WHEN q.estado IN ('abierta','investigando') THEN 1 ELSE 0 END) as abiertas
    FROM quejas q
    RIGHT JOIN usuarios e ON q.empleado_id = e.id
    WHERE e.rol IN ('admin','empleado')
    GROUP BY e.id
    ORDER BY total DESC
  `);

  const quejasPorEstado = query(`SELECT estado, COUNT(*) as total FROM quejas GROUP BY estado`);
  const quejasPorTipo = query(`SELECT tipo, COUNT(*) as total FROM quejas GROUP BY tipo ORDER BY total DESC`);
  const reservasPorEstado = query(`SELECT estado, COUNT(*) as total FROM reservas GROUP BY estado`);

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
});

export default router;
