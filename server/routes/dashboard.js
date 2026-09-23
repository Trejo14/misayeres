import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/stats', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const totalPlatillos = (await query('SELECT COUNT(*) as count FROM platillos'))[0].count;
    const totalReservas = (await query('SELECT COUNT(*) as count FROM reservas'))[0].count;
    const reservasHoy = (await query("SELECT COUNT(*) as count FROM reservas WHERE fecha = CURRENT_DATE"))[0].count;
    const reservasSemana = (await query("SELECT COUNT(*) as count FROM reservas WHERE fecha BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'"))[0].count;
    const totalEmpleados = (await query("SELECT COUNT(*) as count FROM usuarios WHERE rol IN ('admin','empleado')"))[0].count;
    const totalQuejas = (await query('SELECT COUNT(*) as count FROM quejas'))[0].count;
    const quejasAbiertas = (await query("SELECT COUNT(*) as count FROM quejas WHERE estado IN ('abierta','investigando')"))[0].count;
    const totalContactos = (await query('SELECT COUNT(*) as count FROM contactos'))[0].count;
    const contactosNoLeidos = (await query('SELECT COUNT(*) as count FROM contactos WHERE leido = 0'))[0].count;
    const totalClientes = (await query('SELECT COUNT(*) as count FROM clientes'))[0].count;
    const clientesVIP = (await query("SELECT COUNT(*) as count FROM clientes WHERE tipo_cliente = 'vip'"))[0].count;

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
    const platillosPorCategoria = await query('SELECT categoria, COUNT(*)::int as total FROM platillos GROUP BY categoria ORDER BY total DESC');

    const reservasProximas = await query(`
      SELECT id, nombre_cliente, telefono, fecha, hora, personas, estado
      FROM reservas
      WHERE fecha >= CURRENT_DATE AND estado IN ('pendiente', 'confirmada')
      ORDER BY fecha, hora
      LIMIT 6
    `);

    const topClientes = await query(`
      SELECT c.id, c.nombre, c.telefono, c.tipo_cliente,
        COUNT(r.id) FILTER (WHERE r.estado = 'completada')::int as visitas
      FROM clientes c
      JOIN reservas r ON r.telefono = c.telefono
      GROUP BY c.id
      HAVING COUNT(r.id) FILTER (WHERE r.estado = 'completada') > 0
      ORDER BY visitas DESC
      LIMIT 5
    `);

    res.json({
      totalPlatillos,
      totalReservas,
      reservasHoy,
      reservasSemana,
      totalEmpleados,
      totalQuejas,
      quejasAbiertas,
      totalContactos,
      contactosNoLeidos,
      totalClientes,
      clientesVIP,
      quejasPorEmpleado,
      quejasPorEstado,
      quejasPorTipo,
      reservasPorEstado,
      platillosPorCategoria,
      reservasProximas,
      topClientes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
