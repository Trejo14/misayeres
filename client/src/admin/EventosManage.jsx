import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, ImageOff } from 'lucide-react';
import ImageDropzone from '../components/ImageDropzone';
import Media from '../components/Media';
import { formatDate } from '../utils/format';

const MAX_DESCRIPCION = 400;
const EMPTY_FORM = { titulo: '', descripcion: '', fecha: '', imagen: '', imagen_tipo: 'imagen', activa: 1 };

// Evita que soltar un archivo fuera de la zona haga que el navegador lo abra.
const blockFileDrop = (e) => {
  if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
};

export default function EventosManage() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadItems = () => {
    axios.get('/api/eventos/all')
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
      fecha: item.fecha || '',
      imagen: item.imagen || '',
      imagen_tipo: item.imagen_tipo || 'imagen',
      activa: item.activa,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`/api/eventos/${editing.id}`, form);
      } else {
        await axios.post('/api/eventos', form);
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
      await axios.put(`/api/eventos/${item.id}`, { ...item, activa: item.activa ? 0 : 1 });
      loadItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar');
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`¿Eliminar el evento "${item.titulo}"?`)) return;
    try {
      await axios.delete(`/api/eventos/${item.id}`);
      loadItems();
    } catch {
      alert('Error al eliminar');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Eventos Destacados</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} strokeWidth={2} /> Nuevo Evento
        </button>
      </div>

      <p className="form-hint" style={{ marginBottom: '16px' }}>
        Los eventos activos aparecen en una ventana flotante al abrir el sitio. Los que tienen fecha dejan de mostrarse cuando esa fecha pasa.
      </p>

      <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Archivo</th>
              <th>Titulo</th>
              <th>Descripcion</th>
              <th>Fecha</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>
                  {item.imagen ? (
                    <Media className="thumb" src={item.imagen} tipo={item.imagen_tipo} />
                  ) : (
                    <div className="thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-lightest)' }}>
                      <ImageOff size={18} strokeWidth={1.5} />
                    </div>
                  )}
                </td>
                <td>{item.titulo}</td>
                <td className="cell-wrap" style={{ color: 'var(--text-light)' }}>{item.descripcion || '-'}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{item.fecha ? formatDate(item.fecha) : 'Sin fecha'}</td>
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
              <tr><td colSpan="6" className="empty-row">No hay eventos registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} onDragOver={blockFileDrop} onDrop={blockFileDrop}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Editar Evento' : 'Nuevo Evento'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Foto o video (opcional)</label>
                <ImageDropzone
                  allowVideo
                  value={form.imagen}
                  tipo={form.imagen_tipo}
                  onChange={(imagen, tipo) => setForm(f => ({ ...f, imagen, imagen_tipo: tipo || 'imagen' }))}
                />
              </div>
              <div className="form-group">
                <label>Titulo</label>
                <input value={form.titulo} maxLength={120} onChange={e => setForm({ ...form, titulo: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Descripcion</label>
                <textarea rows="3" maxLength={MAX_DESCRIPCION} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
                <p className="form-hint">{form.descripcion.length} / {MAX_DESCRIPCION}</p>
              </div>
              <div className="form-group">
                <label>Fecha del evento (opcional)</label>
                <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
                <p className="form-hint">Sin fecha, el evento se muestra hasta que lo desactives.</p>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={!!form.activa} onChange={e => setForm({ ...form, activa: e.target.checked ? 1 : 0 })} />
                  Activo (se muestra al abrir el sitio)
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
