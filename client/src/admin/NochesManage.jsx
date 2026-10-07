import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Copy, Pencil, Plus, Trash2, User } from 'lucide-react';
import ImageDropzone from '../components/ImageDropzone';
import { addDays, weekStartISO, weekDays, todayISO, formatWeekday, formatDayMonth } from '../utils/format';

const EMPTY_FORM = { promo_id: '', cantante_id: '', evento: '' };
const EMPTY_CANTANTE = { nombre: '', foto: '' };

// Evita que soltar un archivo fuera de la zona haga que el navegador lo abra.
const blockFileDrop = (e) => {
  if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
};

export default function NochesManage() {
  const semanaActual = weekStartISO();
  const [desde, setDesde] = useState(semanaActual);
  const [dias, setDias] = useState({});
  const [promos, setPromos] = useState([]);
  const [cantantes, setCantantes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  // Modal de cantante: null cerrado, {} nuevo, o el cantante que se edita.
  const [cantanteModal, setCantanteModal] = useState(null);
  const [cantanteForm, setCantanteForm] = useState(EMPTY_CANTANTE);
  const [savingCantante, setSavingCantante] = useState(false);

  const loadDias = () => {
    axios.get('/api/noches', { params: { desde } })
      .then(res => setDias(Object.fromEntries(res.data.map(d => [d.fecha, d]))))
      .catch(console.error);
  };

  const loadCantantes = () => {
    axios.get('/api/cantantes')
      .then(res => setCantantes(res.data))
      .catch(console.error);
  };

  useEffect(loadDias, [desde]);

  useEffect(() => {
    axios.get('/api/promos/all')
      .then(res => setPromos(res.data))
      .catch(console.error);
    loadCantantes();
  }, []);

  const openEdit = (fecha) => {
    const dia = dias[fecha];
    setEditing(fecha);
    setForm({
      promo_id: dia?.promo_id || '',
      cantante_id: dia?.cantante_id || '',
      evento: dia?.evento || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`/api/noches/${editing}`, form);
      setEditing(null);
      loadDias();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const copiarAnterior = async () => {
    setCopying(true);
    try {
      const res = await axios.post('/api/noches/copiar', { desde: addDays(desde, -7), hacia: desde });
      if (res.data.copiados === 0) {
        alert('No habia nada que copiar: la semana anterior esta vacia o esta semana ya tiene todos esos dias llenos.');
      }
      loadDias();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al copiar');
    } finally {
      setCopying(false);
    }
  };

  const openCantante = (cantante = {}) => {
    setCantanteModal(cantante);
    setCantanteForm({ nombre: cantante.nombre || '', foto: cantante.foto || '' });
  };

  const handleCantanteSubmit = async (e) => {
    e.preventDefault();
    setSavingCantante(true);
    try {
      if (cantanteModal.id) {
        await axios.put(`/api/cantantes/${cantanteModal.id}`, cantanteForm);
      } else {
        const res = await axios.post('/api/cantantes', cantanteForm);
        // Si se creo desde el dia que se esta editando, queda elegido.
        if (editing) setForm(f => ({ ...f, cantante_id: res.data.id }));
      }
      setCantanteModal(null);
      loadCantantes();
      loadDias();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSavingCantante(false);
    }
  };

  const handleCantanteDelete = async (cantante) => {
    if (!confirm(`¿Eliminar a "${cantante.nombre}"? Tambien se quitara de los dias donde este asignado.`)) return;
    try {
      await axios.delete(`/api/cantantes/${cantante.id}`);
      loadCantantes();
      loadDias();
    } catch {
      alert('Error al eliminar');
    }
  };

  const hoy = todayISO();
  const nombrePromo = (id) => {
    const promo = promos.find(p => p.id === id);
    if (!promo) return '-';
    return promo.activa ? promo.titulo : `${promo.titulo} (inactiva)`;
  };

  const fotoCantante = (foto) => foto ? (
    <img className="thumb thumb-round" src={foto} alt="" loading="lazy" />
  ) : (
    <div className="thumb thumb-round" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-lightest)' }}>
      <User size={18} strokeWidth={1.5} />
    </div>
  );

  return (
    <div>
      <div className="admin-header">
        <h1>Noches Mis Ayeres</h1>
        <div className="week-nav">
          <button className="btn btn-sm btn-outline" onClick={() => setDesde(addDays(desde, -7))} aria-label="Semana anterior">
            <ChevronLeft size={14} strokeWidth={1.5} />
          </button>
          <strong>{formatDayMonth(desde)} &ndash; {formatDayMonth(addDays(desde, 6))}</strong>
          <button className="btn btn-sm btn-outline" onClick={() => setDesde(addDays(desde, 7))} aria-label="Semana siguiente">
            <ChevronRight size={14} strokeWidth={1.5} />
          </button>
          {desde !== semanaActual && (
            <button className="btn btn-sm btn-outline" onClick={() => setDesde(semanaActual)}>Semana actual</button>
          )}
          <button className="btn btn-sm btn-primary" onClick={copiarAnterior} disabled={copying}>
            <Copy size={14} strokeWidth={1.5} /> {copying ? 'Copiando...' : 'Copiar semana anterior'}
          </button>
        </div>
      </div>

      <p className="form-hint" style={{ marginBottom: '16px' }}>
        El sitio muestra siempre la semana en curso (lunes a domingo) y cambia sola cada lunes.
        Puedes adelantar las semanas siguientes desde aqui. "Copiar semana anterior" solo llena los dias vacios.
      </p>

      <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Dia</th>
              <th>Promo del dia</th>
              <th>Cantante</th>
              <th>Evento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {weekDays(desde).map(fecha => {
              const dia = dias[fecha];
              return (
                <tr key={fecha}>
                  <td>
                    <strong>{formatWeekday(fecha)}</strong> {formatDayMonth(fecha)}
                    {fecha === hoy && <span className="badge badge-vip" style={{ marginLeft: '8px' }}>Hoy</span>}
                  </td>
                  <td>{dia?.promo_id ? nombrePromo(dia.promo_id) : '-'}</td>
                  <td>{dia?.cantante || '-'}</td>
                  <td>{dia?.evento || '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(fecha)}>
                      <Pencil size={14} strokeWidth={1.5} /> Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="admin-header" style={{ marginTop: '40px', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.3rem' }}>Cantantes</h1>
        <button className="btn btn-primary" onClick={() => openCantante()}>
          <Plus size={16} strokeWidth={2} /> Nuevo Cantante
        </button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Foto</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cantantes.map(cantante => (
              <tr key={cantante.id}>
                <td>{fotoCantante(cantante.foto)}</td>
                <td>{cantante.nombre}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => openCantante(cantante)}>
                      <Pencil size={14} strokeWidth={1.5} /> Editar
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleCantanteDelete(cantante)}>
                      <Trash2 size={14} strokeWidth={1.5} /> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {cantantes.length === 0 && (
              <tr><td colSpan="3" className="empty-row">No hay cantantes registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{formatWeekday(editing)} {formatDayMonth(editing)}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Promo del dia</label>
                <select value={form.promo_id} onChange={e => setForm({ ...form, promo_id: e.target.value })}>
                  <option value="">Sin promo</option>
                  {promos.map(p => (
                    <option key={p.id} value={p.id}>{p.activa ? p.titulo : `${p.titulo} (inactiva)`}</option>
                  ))}
                </select>
                {promos.length === 0 && <p className="form-hint">Primero sube promos en la seccion Promos.</p>}
              </div>
              <div className="form-group">
                <label>Cantante</label>
                <div className="select-with-action">
                  <select value={form.cantante_id} onChange={e => setForm({ ...form, cantante_id: e.target.value })}>
                    <option value="">Sin cantante</option>
                    {cantantes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => openCantante()}>
                    <Plus size={14} strokeWidth={1.5} /> Nuevo cantante
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Evento</label>
                <input value={form.evento} maxLength={160} onChange={e => setForm({ ...form, evento: e.target.value })} />
              </div>
              <p className="form-hint">Deja todo vacio para quitar el programa de este dia.</p>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cantanteModal && (
        <div className="modal-overlay" onClick={() => setCantanteModal(null)} onDragOver={blockFileDrop} onDrop={blockFileDrop}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{cantanteModal.id ? 'Editar Cantante' : 'Nuevo Cantante'}</h2>
            <form onSubmit={handleCantanteSubmit}>
              <div className="form-group">
                <label>Foto (opcional)</label>
                <ImageDropzone value={cantanteForm.foto} onChange={foto => setCantanteForm(f => ({ ...f, foto }))} />
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input value={cantanteForm.nombre} maxLength={120} onChange={e => setCantanteForm({ ...cantanteForm, nombre: e.target.value })} required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setCantanteModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={savingCantante}>
                  {savingCantante ? 'Guardando...' : cantanteModal.id ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
