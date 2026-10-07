import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, ImageOff } from 'lucide-react';
import ImageDropzone from '../components/ImageDropzone';
import { formatPrice } from '../utils/format';

const CATEGORIES = ['Desayuno', 'Almuerzo', 'Comida', 'Cena', 'Postres', 'Bebidas'];
const EMPTY_FORM = { nombre: '', descripcion: '', precio: '', categoria: 'Desayuno', imagen: '', disponible: 1 };

// Evita que soltar un archivo fuera de la zona haga que el navegador lo abra.
const blockFileDrop = (e) => {
  if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
};

export default function MenuManage() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const loadItems = () => {
    axios.get('/api/menu/all')
      .then(res => setItems(res.data))
      .catch(console.error);
  };

  useEffect(loadItems, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      precio: item.precio,
      categoria: item.categoria,
      imagen: item.imagen || '',
      disponible: item.disponible,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  const toggleDisponible = async (item) => {
    try {
      await axios.put(`/api/menu/${item.id}`, { ...item, disponible: item.disponible ? 0 : 1 });
      loadItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar');
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`¿Eliminar "${item.nombre}"?`)) return;
    try {
      await axios.delete(`/api/menu/${item.id}`);
      loadItems();
    } catch {
      alert('Error al eliminar');
    }
  };

  const term = search.trim().toLowerCase();
  const visible = items.filter(item =>
    (!filterCat || item.categoria === filterCat) &&
    (!term || item.nombre.toLowerCase().includes(term) || (item.descripcion || '').toLowerCase().includes(term))
  );

  return (
    <div>
      <div className="admin-header">
        <h1>Gestion de Menu</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} strokeWidth={2} /> Nuevo Platillo
        </button>
      </div>

      <div className="toolbar">
        <input placeholder="Buscar platillo..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">Todas las categorias</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Foto</th>
              <th>Nombre</th>
              <th>Categoria</th>
              <th>Precio</th>
              <th>Disponible</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(item => (
              <tr key={item.id}>
                <td>
                  {item.imagen ? (
                    <img className="thumb" src={item.imagen} alt="" loading="lazy" />
                  ) : (
                    <div className="thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-lightest)' }}>
                      <ImageOff size={16} strokeWidth={1.5} />
                    </div>
                  )}
                </td>
                <td>{item.nombre}</td>
                <td>{item.categoria}</td>
                <td>{formatPrice(item.precio)}</td>
                <td>
                  <button
                    type="button"
                    className={`badge ${item.disponible ? 'badge-confirmada' : 'badge-cancelada'}`}
                    style={{ border: 'none', cursor: 'pointer' }}
                    title="Clic para cambiar"
                    onClick={() => toggleDisponible(item)}
                  >
                    {item.disponible ? 'Si' : 'No'}
                  </button>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(item)}>
                      <Pencil size={14} strokeWidth={1.5} /> Editar
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item)}>
                      <Trash2 size={14} strokeWidth={1.5} /> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan="6" className="empty-row">
                {items.length === 0 ? 'No hay platillos registrados' : 'Ningun platillo coincide con la busqueda'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} onDragOver={blockFileDrop} onDrop={blockFileDrop}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Editar Platillo' : 'Nuevo Platillo'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Imagen (opcional)</label>
                <ImageDropzone value={form.imagen} onChange={imagen => setForm(f => ({ ...f, imagen }))} />
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Descripcion</label>
                <textarea rows="3" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Precio</label>
                  <input type="number" step="0.01" min="0" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={!!form.disponible} onChange={e => setForm({ ...form, disponible: e.target.checked ? 1 : 0 })} />
                  Disponible
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
