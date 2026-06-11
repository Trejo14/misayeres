import { useState, useEffect } from 'react';
import axios from 'axios';

const ESTADOS = ['pendiente', 'confirmada', 'cancelada', 'completada'];

export default function ReservationsManage() {
  const [items, setItems] = useState([]);

  const loadItems = () => {
    axios.get('/api/reservations')
      .then(res => setItems(res.data))
      .catch(console.error);
  };

  useEffect(loadItems, []);

  const handleStatus = async (id, estado) => {
    try {
      await axios.put(`/api/reservations/${id}`, { estado });
      loadItems();
    } catch {
      alert('Error al actualizar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta reserva?')) return;
    try {
      await axios.delete(`/api/reservations/${id}`);
      loadItems();
    } catch {
      alert('Error al eliminar');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Reservaciones</h1>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Personas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.nombre_cliente}</td>
                <td>{item.telefono}</td>
                <td>{item.fecha}</td>
                <td>{item.hora}</td>
                <td>{item.personas}</td>
                <td>
                  <span className={`badge badge-${item.estado}`}>{item.estado}</span>
                </td>
                <td>
                  <select
                    value={item.estado}
                    onChange={e => handleStatus(item.id, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', marginRight: '8px' }}
                  >
                    {ESTADOS.map(e => <option key={e}>{e}</option>)}
                  </select>
                  <button className="btn btn-sm" onClick={() => handleDelete(item.id)}
                    style={{ background: '#dc3545', color: 'white', border: 'none' }}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px' }}>
                No hay reservaciones
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
