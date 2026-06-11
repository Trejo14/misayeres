import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const ROLES = ['empleado', 'admin', 'dueno'];

export default function UsersManage() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'empleado' });
  const { user } = useAuth();

  const loadUsers = () => {
    axios.get('/api/users')
      .then(res => setUsers(res.data))
      .catch(console.error);
  };

  useEffect(loadUsers, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', email: '', password: '', rol: 'empleado' });
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const payload = { nombre: form.nombre, email: form.email, rol: form.rol };
        if (form.password) payload.password = form.password;
        await axios.put(`/api/users/${editing.id}`, payload);
      } else {
        await axios.post('/api/users', form);
      }
      setShowModal(false);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este usuario?')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      loadUsers();
    } catch {
      alert('Error al eliminar');
    }
  };

  if (user?.rol !== 'dueno') {
    return <p style={{ color: 'var(--text-light)' }}>Solo el dueno puede gestionar usuarios.</p>;
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Gestion de Usuarios</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} strokeWidth={2} /> Nuevo Usuario
        </button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.rol === 'dueno' ? 'badge-confirmada' : u.rol === 'admin' ? 'badge-pendiente' : 'badge-completada'}`}>{u.rol}</span></td>
                <td style={{ color: 'var(--text-light)', fontSize: '13px' }}>{u.created_at}</td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => openEdit(u)} style={{ marginRight: '8px' }}>
                    <Pencil size={14} strokeWidth={1.5} /> Editar
                  </button>
                  {u.rol !== 'dueno' && (
                    <button className="btn btn-sm" onClick={() => handleDelete(u.id)}
                      style={{ background: '#1a1a1a', color: 'white', border: 'none' }}>
                      <Trash2 size={14} strokeWidth={1.5} /> Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px' }}>
                No hay usuarios
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>{editing ? 'Nueva contrasena (dejar vacio para no cambiar)' : 'Contrasena'}</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  required={!editing} />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
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
