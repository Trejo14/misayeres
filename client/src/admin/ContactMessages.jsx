import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const { user } = useAuth();

  const loadMessages = () => {
    axios.get('/api/contact')
      .then(res => setMessages(res.data))
      .catch(console.error);
  };

  useEffect(loadMessages, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/contact/${id}/leer`);
      loadMessages();
    } catch {
      alert('Error al marcar como leido');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este mensaje?')) return;
    try {
      await axios.delete(`/api/contact/${id}`);
      loadMessages();
    } catch {
      alert('Error al eliminar');
    }
  };

  if (user?.rol !== 'dueno') {
    return <p style={{ color: 'var(--text-light)' }}>Solo el dueno puede ver mensajes.</p>;
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Mensajes de Contacto</h1>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Mensaje</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(m => (
              <tr key={m.id} style={m.leido ? {} : { background: '#fafafa' }}>
                <td>{m.nombre}</td>
                <td>{m.email}</td>
                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.mensaje}
                </td>
                <td style={{ color: 'var(--text-light)', fontSize: '13px' }}>{m.created_at}</td>
                <td>
                  <span className={`badge ${m.leido ? 'badge-completada' : 'badge-pendiente'}`}>
                    {m.leido ? 'Leido' : 'Nuevo'}
                  </span>
                </td>
                <td>
                  {!m.leido && (
                    <button className="btn btn-sm btn-outline" onClick={() => markAsRead(m.id)} style={{ marginRight: '8px' }}>
                      Marcar leido
                    </button>
                  )}
                  <button className="btn btn-sm" onClick={() => handleDelete(m.id)}
                    style={{ background: '#1a1a1a', color: 'white', border: 'none' }}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {messages.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px' }}>
                No hay mensajes
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
