import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime, todayISO } from '../utils/format';

const ESTADOS = ['pendiente', 'confirmada', 'cancelada', 'completada'];
const EMPTY_FORM = { nombre_cliente: '', telefono: '', email: '', fecha: '', hora: '', personas: 2, notas: '', estado: 'confirmada' };

export default function ReservationsManage() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const canDelete = user?.rol === 'dueno';
  const today = todayISO();

  const loadItems = () => {
    axios.get('/api/reservations')
      .then(res => setItems(res.data))
      .catch(console.error);
  };

  useEffect(loadItems, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { estado, ...payload } = form;
      const { data } = await axios.post('/api/reservations', payload);
      if (estado !== 'pendiente' && data?.id) {
        await axios.put(`/api/reservations/${data.id}`, { estado });
      }
      setShowModal(false);
      loadItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear la reserva');
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id, estado) => {
    try {
      await axios.put(`/api/reservations/${id}`, { estado });
      loadItems();
    } catch {
      alert('Error al actualizar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar esta reserva?')) return;
    try {
      await axios.delete(`/api/reservations/${id}`);
      loadItems();
    } catch {
      alert('Error al eliminar');
    }
  };

  const term = search.trim().toLowerCase();
  const visible = items.filter(item =>
    (!filterEstado || item.estado === filterEstado) &&
    (!term || item.nombre_cliente.toLowerCase().includes(term) || item.telefono.includes(term))
  );

  return (
    <div>
      <div className="admin-header">
        <h1>Reservaciones</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>{items.length} reservas</span>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} strokeWidth={2} /> Nueva Reserva
          </button>
        </div>
      </div>

      <div className="toolbar">
        <input placeholder="Buscar por nombre o telefono..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e}>{e}</option>)}
        </select>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Telefono</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Personas</th>
              <th>Notas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(item => (
              <tr key={item.id}>
                <td>{item.nombre_cliente}</td>
                <td>{item.telefono}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{formatDate(item.fecha)}</td>
                <td>{formatTime(item.hora)}</td>
                <td>{item.personas}</td>
                <td className="cell-truncate" style={{ maxWidth: '180px', color: 'var(--text-light)' }} title={item.notas}>{item.notas || '-'}</td>
                <td>
                  <span className={`badge badge-${item.estado}`}>{item.estado}</span>
                </td>
                <td>
                  <div className="table-actions">
                    <select className="table-select" value={item.estado} onChange={e => handleStatus(item.id, e.target.value)}>
                      {ESTADOS.map(e => <option key={e}>{e}</option>)}
                    </select>
                    {canDelete && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={14} strokeWidth={1.5} /> Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan="8" className="empty-row">
                {items.length === 0 ? 'No hay reservaciones' : 'Ninguna reserva coincide con el filtro'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Nueva Reserva</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input value={form.nombre_cliente} onChange={e => setForm({ ...form, nombre_cliente: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Telefono</label>
                  <input type="tel" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha</label>
                  <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} min={today} required />
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <input type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Personas</label>
                  <input type="number" value={form.personas} onChange={e => setForm({ ...form, personas: e.target.value })} min={1} max={20} required />
                </div>
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                  {ESTADOS.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Notas (opcional)</label>
                <textarea rows="3" value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Alergias, ocasiones especiales, preferencias..." />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
