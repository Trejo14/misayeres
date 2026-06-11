import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.rol === 'dueno') {
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
    { label: 'Platillos', value: stats?.totalPlatillos || '--' },
    { label: 'Reservas Totales', value: stats?.totalReservas || '--' },
    { label: 'Reservas Hoy', value: stats?.reservasHoy || '--' },
    { label: 'Empleados', value: stats?.totalEmpleados || '--' },
    { label: 'Quejas Totales', value: stats?.totalQuejas || '--' },
    { label: 'Quejas Abiertas', value: stats?.quejasAbiertas || '--' },
    { label: 'Mensajes', value: stats?.totalContactos || '--' },
    { label: 'No Leidos', value: stats?.contactosNoLeidos || '--' },
  ];

  return (
    <div>
      <div className="admin-header">
        <h1>Dashboard</h1>
        <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>{user?.nombre} -- {user?.rol}</span>
      </div>

      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className="stat-header">
              <div className="stat-dot" />
              <p>{card.label}</p>
            </div>
            <h3>{card.value}</h3>
          </div>
        ))}
      </div>

      {user?.rol === 'dueno' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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

          <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
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

          <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
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
        </div>
      )}
    </div>
  );
}
