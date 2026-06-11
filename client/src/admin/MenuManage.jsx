import { useState, useEffect } from 'react';
import axios from 'axios';

const CATEGORIES = ['Entradas', 'Platos Fuertes', 'Pastas', 'Pizzas', 'Ensaladas', 'Postres', 'Bebidas'];

export default function MenuManage() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', categoria: 'Entradas', imagen: '', disponible: 1 });

  const loadItems = () => {
    axios.get('/api/menu/all')
      .then(res => setItems(res.data))
      .catch(console.error);
  };

  useEffect(loadItems, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', descripcion: '', precio: '', categoria: 'Entradas', imagen: '', disponible: 1 });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...item });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`/api/menu/${editing.id}`, form);
      } else {
        await axios.post('/api/menu', form);
      }
      setShowModal(false);
      loadItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este platillo?')) return;
    try {
      await axios.delete(`/api/menu/${id}`);
      loadItems();
    } catch {
      alert('Error al eliminar');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Gestión de Menú</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuevo Platillo</button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Disponible</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.nombre}</td>
                <td>{item.categoria}</td>
                <td>${parseFloat(item.precio).toFixed(2)}</td>
                <td>
                  <span className={`badge ${item.disponible ? 'badge-confirmada' : 'badge-cancelada'}`}>
                    {item.disponible ? 'Sí' : 'No'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => openEdit(item)} style={{ marginRight: '8px' }}>
                    Editar
                  </button>
                  <button className="btn btn-sm" onClick={() => handleDelete(item.id)}
                    style={{ background: '#dc3545', color: 'white', border: 'none' }}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px' }}>
                No hay platillos registrados
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Editar Platillo' : 'Nuevo Platillo'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea rows="3" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Precio *</label>
                  <input type="number" step="0.01" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Categoría *</label>
                  <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>URL de imagen (opcional)</label>
                <input value={form.imagen} onChange={e => setForm({ ...form, imagen: e.target.value })} />
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={form.disponible} onChange={e => setForm({ ...form, disponible: e.target.checked ? 1 : 0 })} />
                  {' '}Disponible
                </label>
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
