import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Lock, Send } from 'lucide-react';
import { formatDateTime } from '../utils/format';

const TIPOS = ['Atencion al cliente', 'Puntualidad', 'Calidad de trabajo', 'Actitud', 'Incumplimiento', 'Instalaciones', 'Otro'];
const ESTADOS = ['abierta', 'investigando', 'resuelta', 'cerrada'];
const EMPTY_FORM = { empleado_id: '', tipo: TIPOS[0], descripcion: '', anonima: false };

// Formulario para enviar una queja. Lo usan todos los roles.
function ComplaintForm({ onSent, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [companeros, setCompaneros] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/users/companeros').then(res => setCompaneros(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await axios.post('/api/complaints', { ...form, empleado_id: form.empleado_id || null });
      setForm(EMPTY_FORM);
      onSent?.();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo enviar la queja');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>¿Sobre quien es la queja?</label>
        <select value={form.empleado_id} onChange={e => setForm({ ...form, empleado_id: e.target.value })}>
          <option value="">General (no es sobre una persona)</option>
          {companeros.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Tipo</label>
        <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
          {TIPOS.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Descripcion</label>
        <textarea rows="5" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Describe lo que paso, cuando y cualquier detalle util." required />
      </div>
      <div className="form-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={form.anonima} onChange={e => setForm({ ...form, anonima: e.target.checked })} />
          Enviar de forma anonima
        </label>
        <p className="form-hint">Si la marcas, no se guarda quien la envio.</p>
      </div>
      {error && <div className="notice notice-error" style={{ marginBottom: '12px' }}>{error}</div>}
      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-outline" onClick={onCancel}>Cancelar</button>}
        <button type="submit" className="btn btn-primary" disabled={sending}>
          <Send size={14} strokeWidth={1.5} /> {sending ? 'Enviando...' : 'Enviar Queja'}
        </button>
      </div>
    </form>
  );
}

// Vista para admin y empleados: solo pueden escribir, no ver las quejas.
function SubmitOnlyView() {
  const [sent, setSent] = useState(false);

  return (
    <div style={{ maxWidth: '640px' }}>
      <div className="admin-header">
        <h1>Enviar una Queja</h1>
      </div>
      <div className="admin-card">
        <p style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-light)', fontSize: '14px', marginBottom: '20px' }}>
          <Lock size={16} strokeWidth={1.5} /> Tu queja es confidencial: solo el dueño puede leerla.
        </p>
        {sent ? (
          <>
            <div className="notice notice-success">Queja enviada. Gracias por avisar.</div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => setSent(false)}>Enviar otra</button>
            </div>
          </>
        ) : (
          <ComplaintForm onSent={() => setSent(true)} />
        )}
      </div>
    </div>
  );
}

function OwnerView() {
  const [complaints, setComplaints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterEstado, setFilterEstado] = useState('');

  const loadData = () => {
    axios.get('/api/complaints').then(res => setComplaints(res.data)).catch(console.error);
  };

  useEffect(loadData, []);

  const handleStatus = async (id, estado) => {
    try {
      await axios.put(`/api/complaints/${id}`, { estado });
      loadData();
      setSelected(s => (s && s.id === id ? { ...s, estado } : s));
    } catch {
      alert('Error al actualizar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta queja?')) return;
    try {
      await axios.delete(`/api/complaints/${id}`);
      setSelected(null);
      loadData();
    } catch {
      alert('Error al eliminar');
    }
  };

  const autor = (c) => (c.anonima ? 'Anonimo' : c.reportero_nombre || 'Usuario eliminado');
  const visible = complaints.filter(c => !filterEstado || c.estado === filterEstado);

  return (
    <div>
      <div className="admin-header">
        <h1>Sistema de Quejas</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} strokeWidth={2} /> Nueva Queja
        </button>
      </div>

      <div className="toolbar">
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e}>{e}</option>)}
        </select>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sobre</th>
              <th>Enviada por</th>
              <th>Tipo</th>
              <th>Descripcion</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(c => (
              <tr key={c.id} className="row-clickable" onClick={() => setSelected(c)}>
                <td><strong>{c.empleado_nombre || 'General'}</strong></td>
                <td>{autor(c)}</td>
                <td>{c.tipo}</td>
                <td className="cell-truncate">{c.descripcion}</td>
                <td><span className={`badge badge-${c.estado}`}>{c.estado}</span></td>
                <td style={{ color: 'var(--text-light)', fontSize: '13px', whiteSpace: 'nowrap' }}>{formatDateTime(c.created_at)}</td>
                <td onClick={e => e.stopPropagation()}>
                  <select className="table-select" value={c.estado} onChange={e => handleStatus(c.id, e.target.value)}>
                    {ESTADOS.map(e => <option key={e}>{e}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan="7" className="empty-row">No hay quejas registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Queja: {selected.tipo}</h2>
            <dl className="detail-meta">
              <dt>Sobre</dt><dd>{selected.empleado_nombre || 'General'}</dd>
              <dt>Enviada por</dt><dd>{autor(selected)}</dd>
              <dt>Fecha</dt><dd>{formatDateTime(selected.created_at)}</dd>
              {selected.fecha_resuelta && (<><dt>Resuelta</dt><dd>{formatDateTime(selected.fecha_resuelta)}</dd></>)}
              <dt>Estado</dt>
              <dd>
                <select className="table-select" value={selected.estado} onChange={e => handleStatus(selected.id, e.target.value)}>
                  {ESTADOS.map(e => <option key={e}>{e}</option>)}
                </select>
              </dd>
            </dl>
            <div className="detail-body">{selected.descripcion}</div>
            <div className="form-actions">
              <button className="btn btn-danger" onClick={() => handleDelete(selected.id)}>
                <Trash2 size={14} strokeWidth={1.5} /> Eliminar
              </button>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Nueva Queja</h2>
            <ComplaintForm
              onCancel={() => setShowModal(false)}
              onSent={() => { setShowModal(false); loadData(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComplaintsManage() {
  const { user } = useAuth();
  return user?.rol === 'dueno' ? <OwnerView /> : <SubmitOnlyView />;
}
