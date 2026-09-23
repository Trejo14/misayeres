import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  UtensilsCrossed,
  CalendarDays,
  CalendarClock,
  Users,
  Crown,
  AlertTriangle,
  MessageSquare,
  Mail,
} from 'lucide-react';

const CAN_VIEW_STATS = ['dueno', 'admin'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (CAN_VIEW_STATS.includes(user?.rol)) {
      axios.get('/api/dashboard/stats')
        .then(res => setStats(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <p style={{ color: 'var(--text-light)' }}>Cargando dashboard...</p>;

  const statCards = [
    { label: 'Platillos', value: stats?.totalPlatillos ?? '--', icon: UtensilsCrossed },
    { label: 'Reservas Totales', value: stats?.totalReservas ?? '--', icon: CalendarDays },
    { label: 'Reservas Hoy', value: stats?.reservasHoy ?? '--', icon: CalendarDays },
    { label: 'Reservas 7 Dias', value: stats?.reservasSemana ?? '--', icon: CalendarClock },
    { label: 'Clientes', value: stats?.totalClientes ?? '--', icon: Users },
    { label: 'Clientes VIP', value: stats?.clientesVIP ?? '--', icon: Crown },
    { label: 'Empleados', value: stats?.totalEmpleados ?? '--', icon: Users },
    { label: 'Quejas Abiertas', value: stats?.quejasAbiertas ?? '--', icon: AlertTriangle },
    { label: 'Mensajes', value: stats?.totalContactos ?? '--', icon: MessageSquare },
    { label: 'No Leidos', value: stats?.contactosNoLeidos ?? '--', icon: Mail },
  ];

  return (
    <div>
      <div className="admin-header">
        <h1>Dashboard</h1>
        <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>{user?.nombre} -- {user?.rol}</span>
      </div>

      <div className="stats-grid">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="stat-card">
              <div className="stat-header">
                <Icon size={16} strokeWidth={1.5} style={{ opacity: 0.5 }} />
                <p>{card.label}</p>
              </div>
              <h3>{card.value}</h3>
            </div>
          );
        })}
      </div>

      {CAN_VIEW_STATS.includes(user?.rol) && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 500 }}>Proximas Reservas</h3>
            {stats.reservasProximas?.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Telefono</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Personas</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.reservasProximas.map(r => (
                    <tr key={r.id}>
                      <td>{r.nombre_cliente}</td>
                      <td>{r.telefono}</td>
                      <td>{r.fecha}</td>
                      <td>{r.hora}</td>
                      <td>{r.personas}</td>
                      <td><span className={`badge badge-${r.estado}`}>{r.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>No hay reservas proximas</p>}
          </div>

          <div className="admin-card">
            <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 500 }}>Clientes Frecuentes</h3>
            {stats.topClientes?.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Visitas</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topClientes.map(c => (
                    <tr key={c.id}>
                      <td>{c.nombre}</td>
                      <td><span className={`badge badge-${c.tipo_cliente || 'normal'}`}>{c.tipo_cliente || 'normal'}</span></td>
                      <td>{c.visitas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Aun no hay visitas completadas</p>}
          </div>

          <div className="admin-card">
            <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 500 }}>Platillos por Categoria</h3>
            {stats.platillosPorCategoria?.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.platillosPorCategoria.map((p, i) => (
                    <tr key={i}>
                      <td>{p.categoria}</td>
                      <td>{p.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Sin datos</p>}
          </div>

          <div className="admin-card">
            <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 500 }}>Reservas por Estado</h3>
            {stats.reservasPorEstado?.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.reservasPorEstado.map((r, i) => (
                    <tr key={i}>
                      <td><span className={`badge badge-${r.estado}`}>{r.estado}</span></td>
                      <td>{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Sin datos</p>}
          </div>

          <div className="admin-card">
            <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 500 }}>Quejas por Estado</h3>
            {stats.quejasPorEstado?.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.quejasPorEstado.map((q, i) => (
                    <tr key={i}>
                      <td><span className={`badge badge-${q.estado}`}>{q.estado}</span></td>
                      <td>{q.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Sin datos</p>}
          </div>

          {user?.rol === 'dueno' && (
            <>
              <div className="admin-card">
                <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 500 }}>Quejas por Tipo</h3>
                {stats.quejasPorTipo?.length > 0 ? (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.quejasPorTipo.map((q, i) => (
                        <tr key={i}>
                          <td>{q.tipo}</td>
                          <td>{q.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Sin datos</p>}
              </div>

              <div className="admin-card">
                <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 500 }}>Quejas por Empleado</h3>
                {stats.quejasPorEmpleado?.length > 0 ? (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Empleado</th>
                        <th>Total</th>
                        <th>Abiertas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.quejasPorEmpleado.map((q, i) => (
                        <tr key={i}>
                          <td>{q.nombre}</td>
                          <td>{q.total}</td>
                          <td>{q.abiertas}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Sin datos</p>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
