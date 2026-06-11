import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TIPOS = ['Atención al cliente', 'Puntualidad', 'Calidad de trabajo', 'Actitud', 'Incumplimiento', 'Otro'];
const ESTADOS = ['abierta', 'investigando', 'resuelta', 'cerrada'];

export default function ComplaintsManage() {
  const [complaints, setComplaints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ empleado_id: '', tipo: TIPOS[0], descripcion: '' });
  const { user } = useAuth();

  const loadData = () => {
    axios.get('/api/complaints').then(res => setComplaints(res.data)).catch(console.error);
    axios.get('/api/users').then(res => setEmployees(res.data.filter(u => u.rol !== 'dueno'))).catch(console.error);
  };

  useEffect(loadData, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/complaints', form);
      setShowModal(false);
      setForm({ empleado_id: '', tipo: TIPOS[0], descripcion: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear queja');
    }
  };

  const handleStatus = async (id, estado) => {
    try {
      await axios.put(`/api/complaints/${id}`, { estado });
      loadData();
    } catch {
      alert('Error al actualizar');
    }
  };

  if (user?.rol !== 'dueno') {
    return <p style={{ color: 'var(--text-light)' }}>Solo el dueño puede gestionar quejas.</p>;
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Sistema de Quejas</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nueva Queja</button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Reportado por</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.id}>
                <td><strong>{c.empleado_nombre}</strong></td>
                <td>{c.reportero_nombre}</td>
                <td>{c.tipo}</td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.descripcion}
                </td>
                <td><span className={`badge badge-${c.estado}`}>{c.estado}</span></td>
                <td>{c.created_at}</td>
                <td>
                  <select
                    value={c.estado}
                    onChange={e => handleStatus(c.id, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    {ESTADOS.map(e => <option key={e}>{e}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px' }}>
                No hay quejas registradas
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Nueva Queja</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Empleado *</label>
                <select value={form.empleado_id} onChange={e => setForm({ ...form, empleado_id: e.target.value })} required>
                  <option value="">Seleccionar empleado</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre} ({e.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tipo *</label>
                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Descripción *</label>
                <textarea rows="4" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear Queja</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
