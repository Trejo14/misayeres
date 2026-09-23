import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const TIPOS = ['normal', 'vip', 'empresarial'];
const EMPTY_FORM = { nombre: '', telefono: '', email: '', alergias: '', tipo_cliente: 'normal', fecha_cumpleanos: '' };

export default function ClientsManage() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadClients = () => {
    axios.get('/api/clients')
      .then(res => setClients(res.data))
      .catch(console.error);
  };

  useEffect(loadClients, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      nombre: c.nombre,
      telefono: c.telefono,
      email: c.email || '',
      alergias: c.alergias || '',
      tipo_cliente: c.tipo_cliente || 'normal',
      fecha_cumpleanos: c.fecha_cumpleanos ? c.fecha_cumpleanos.slice(0, 10) : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`/api/clients/${editing.id}`, form);
      } else {
        await axios.post('/api/clients', form);
      }
      setShowModal(false);
      loadClients();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este cliente?')) return;
    try {
      await axios.delete(`/api/clients/${id}`);
      loadClients();
    } catch {
      alert('Error al eliminar');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Clientes</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} strokeWidth={2} /> Nuevo Cliente
        </button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Telefono</th>
              <th>Correo</th>
              <th>Tipo</th>
              <th>Visitas</th>
              <th>Ultima Visita</th>
              <th>Alergias</th>
              <th>Cumpleaños</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.telefono}</td>
                <td>{c.email || '-'}</td>
                <td>
                  <span className={`badge badge-${c.tipo_cliente || 'normal'}`}>{c.tipo_cliente || 'normal'}</span>
                </td>
                <td>
                  <span
                    className="badge"
                    title={`${c.total_reservas || 0} reserva(s) en total`}
                    style={{ background: c.visitas > 0 ? '#2d2d2d' : '#f5f5f5', color: c.visitas > 0 ? '#fff' : '#999' }}
                  >
                    {c.visitas || 0}
                  </span>
                </td>
                <td>{c.ultima_visita ? c.ultima_visita.slice(0, 10) : '-'}</td>
                <td>{c.alergias || '-'}</td>
                <td>{c.fecha_cumpleanos ? c.fecha_cumpleanos.slice(0, 10) : '-'}</td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => openEdit(c)} style={{ marginRight: '8px' }}>
                    <Pencil size={14} strokeWidth={1.5} /> Editar
                  </button>
                  <button className="btn btn-sm" onClick={() => handleDelete(c.id)}
                    style={{ background: '#1a1a1a', color: 'white', border: 'none' }}>
                    <Trash2 size={14} strokeWidth={1.5} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px' }}>
                No hay clientes
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Telefono</label>
                <input type="tel" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Correo</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Tipo de Cliente</label>
                <select value={form.tipo_cliente} onChange={e => setForm({ ...form, tipo_cliente: e.target.value })}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de Cumpleaños</label>
                <input type="date" value={form.fecha_cumpleanos} onChange={e => setForm({ ...form, fecha_cumpleanos: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Alergias</label>
                <input value={form.alergias} onChange={e => setForm({ ...form, alergias: e.target.value })} placeholder="Ej. mariscos, nueces, gluten..." />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
