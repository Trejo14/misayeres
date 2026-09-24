import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, Trash2, Reply } from 'lucide-react';
import { formatDateTime } from '../utils/format';

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [soloNuevos, setSoloNuevos] = useState(false);
  const { user } = useAuth();
  const canDelete = user?.rol === 'dueno';

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

  // Abrir un mensaje lo marca como leido automaticamente.
  const openMessage = (m) => {
    setSelected(m);
    if (!m.leido) markAsRead(m.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este mensaje?')) return;
    try {
      await axios.delete(`/api/contact/${id}`);
      setSelected(null);
      loadMessages();
    } catch {
      alert('Error al eliminar');
    }
  };

  const noLeidos = messages.filter(m => !m.leido).length;
  const visible = soloNuevos ? messages.filter(m => !m.leido) : messages;

  return (
    <div>
      <div className="admin-header">
        <h1>Mensajes de Contacto</h1>
        <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>
          {noLeidos} sin leer de {messages.length}
        </span>
      </div>

      <div className="toolbar">
        <label className="checkbox-label" style={{ fontSize: '14px', color: 'var(--text-light)' }}>
          <input type="checkbox" checked={soloNuevos} onChange={e => setSoloNuevos(e.target.checked)} />
          Mostrar solo sin leer
        </label>
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
            {visible.map(m => (
              <tr key={m.id} className="row-clickable" onClick={() => openMessage(m)}
                style={m.leido ? {} : { fontWeight: 600 }}>
                <td>{m.nombre}</td>
                <td>{m.email}</td>
                <td className="cell-truncate">{m.mensaje}</td>
                <td style={{ color: 'var(--text-light)', fontSize: '13px', whiteSpace: 'nowrap' }}>{formatDateTime(m.created_at)}</td>
                <td>
                  <span className={`badge ${m.leido ? 'badge-completada' : 'badge-pendiente'}`}>
                    {m.leido ? 'Leido' : 'Nuevo'}
                  </span>
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <div className="table-actions">
                    {!m.leido && (
                      <button className="btn btn-sm btn-outline" onClick={() => markAsRead(m.id)}>
                        <Check size={14} strokeWidth={1.5} /> Leido
                      </button>
                    )}
                    {canDelete && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id)}>
                        <Trash2 size={14} strokeWidth={1.5} /> Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan="6" className="empty-row">No hay mensajes</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Mensaje de {selected.nombre}</h2>
            <dl className="detail-meta">
              <dt>Email</dt><dd>{selected.email}</dd>
              <dt>Fecha</dt><dd>{formatDateTime(selected.created_at)}</dd>
            </dl>
            <div className="detail-body">{selected.mensaje}</div>
            <div className="form-actions">
              {canDelete && (
                <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>
                  <Trash2 size={14} strokeWidth={1.5} /> Eliminar
                </button>
              )}
              <a className="btn btn-outline" href={`mailto:${selected.email}?subject=${encodeURIComponent('Re: Mensaje a Mis Ayeres')}`}>
                <Reply size={14} strokeWidth={1.5} /> Responder
              </a>
              <button className="btn btn-primary" onClick={() => setSelected(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
