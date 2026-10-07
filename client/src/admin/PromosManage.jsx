import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, Film } from 'lucide-react';
import ImageDropzone from '../components/ImageDropzone';

const MAX_DESCRIPCION = 300;
const EMPTY_FORM = { titulo: '', descripcion: '', media: '', media_tipo: 'imagen', activa: 1 };

// Evita que soltar un archivo fuera de la zona haga que el navegador lo abra.
const blockFileDrop = (e) => {
  if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
};

export default function PromosManage() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadItems = () => {
    axios.get('/api/promos/all')
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
      titulo: item.titulo,
      descripcion: item.descripcion || '',
      media: item.media,
      media_tipo: item.media_tipo,
      activa: item.activa,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.media) {
      alert('Sube la foto o el video de la promo');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`/api/promos/${editing.id}`, form);
      } else {
        await axios.post('/api/promos', form);
      }
      setShowModal(false);
      loadItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const toggleActiva = async (item) => {
    try {
      await axios.put(`/api/promos/${item.id}`, { ...item, activa: item.activa ? 0 : 1 });
      loadItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar');
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`¿Eliminar la promo "${item.titulo}"? Tambien se quitara de los dias de Noches Mis Ayeres donde este asignada.`)) return;
    try {
      await axios.delete(`/api/promos/${item.id}`);
      loadItems();
    } catch {
      alert('Error al eliminar');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Promos</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} strokeWidth={2} /> Nueva Promo
        </button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Archivo</th>
              <th>Titulo</th>
              <th>Descripcion</th>
              <th>Tipo</th>
              <th>Activa</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>
                  {item.media_tipo === 'video' ? (
                    <div className="thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                      <Film size={18} strokeWidth={1.5} />
                    </div>
                  ) : (
                    <img className="thumb" src={item.media} alt="" loading="lazy" />
                  )}
                </td>
                <td>{item.titulo}</td>
                <td className="cell-truncate">{item.descripcion}</td>
                <td>{item.media_tipo === 'video' ? 'Video' : 'Foto'}</td>
                <td>
                  <button
                    type="button"
                    className={`badge ${item.activa ? 'badge-confirmada' : 'badge-cancelada'}`}
                    style={{ border: 'none', cursor: 'pointer' }}
                    title="Clic para cambiar"
                    onClick={() => toggleActiva(item)}
                  >
                    {item.activa ? 'Si' : 'No'}
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
            {items.length === 0 && (
              <tr><td colSpan="6" className="empty-row">No hay promos registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} onDragOver={blockFileDrop} onDrop={blockFileDrop}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Editar Promo' : 'Nueva Promo'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Foto o video</label>
                <ImageDropzone
                  allowVideo
                  value={form.media}
                  tipo={form.media_tipo}
                  onChange={(media, tipo) => setForm(f => ({ ...f, media, media_tipo: tipo || 'imagen' }))}
                />
              </div>
              <div className="form-group">
                <label>Titulo</label>
                <input value={form.titulo} maxLength={120} onChange={e => setForm({ ...form, titulo: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Descripcion corta</label>
                <textarea rows="3" maxLength={MAX_DESCRIPCION} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
                <p className="form-hint">{form.descripcion.length} / {MAX_DESCRIPCION}</p>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={!!form.activa} onChange={e => setForm({ ...form, activa: e.target.checked ? 1 : 0 })} />
                  Activa (visible en el sitio)
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
