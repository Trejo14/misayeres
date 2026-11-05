import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Plus, Minus, Link2, Unlink, Trash2, RotateCcw, X, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ESTADOS = [
  { id: 'libre', label: 'Libre' },
  { id: 'reservada', label: 'Reservada' },
  { id: 'ocupada', label: 'Ocupada' },
];
const LADOS = ['arr', 'der', 'abj', 'izq'];

// Misma regla que el servidor: cada mesa tiene 4 sillas (una por lado) y al
// juntar dos mesas se pierden las 2 sillas del lado donde se tocan.
function adyacentes(cols, a, b) {
  return Math.abs(Math.floor(a / cols) - Math.floor(b / cols)) + Math.abs((a % cols) - (b % cols)) === 1;
}

function vecino(cols, pos, lado) {
  const col = pos % cols;
  if (lado === 'arr') return pos - cols;
  if (lado === 'abj') return pos + cols;
  if (lado === 'izq') return col === 0 ? -1 : pos - 1;
  return col === cols - 1 ? -1 : pos + 1;
}

function minutosDesde(fecha, ahora) {
  if (!fecha) return null;
  const min = Math.max(0, Math.floor((ahora - new Date(fecha).getTime()) / 60000));
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}

function horaDe(fecha) {
  return new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

// Agrupa las mesas de una zona en "partes" (mesa suelta o grupo unido) y
// calcula todo lo que la vista necesita de cada una.
function analizarZona(zona, mesas) {
  const cols = zona.columnas;
  const porPos = new Map(mesas.map(m => [m.pos, m]));
  const partes = new Map();
  for (const m of mesas) {
    const clave = m.grupo || m.id;
    if (!partes.has(clave)) partes.set(clave, { clave, mesas: [] });
    partes.get(clave).mesas.push(m);
  }

  for (const parte of partes.values()) {
    parte.mesas.sort((a, b) => a.pos - b.pos);
    const principal = parte.mesas[0];
    parte.principal = principal;
    parte.estado = principal.estado;
    parte.nota = principal.nota;
    parte.desde = principal.desde;
    parte.personas = parte.mesas.reduce((s, m) => s + m.personas, 0);
    parte.nombre = parte.mesas.map(m => `${zona.prefijo}${m.pos + 1}`).join(' + ');

    // Sillas visibles en orden, para pintar ocupadas tantas como personas haya.
    const sillas = new Map();
    let n = 0;
    for (const m of parte.mesas) {
      const lados = {};
      for (const lado of LADOS) {
        const otra = porPos.get(vecino(cols, m.pos, lado));
        const unida = !!otra && (otra.grupo || otra.id) === parte.clave;
        lados[lado] = unida ? null : n++;
      }
      sillas.set(m.id, lados);
    }
    parte.sillas = sillas;
    parte.capacidad = n;
  }

  const parteDe = (m) => partes.get(m.grupo || m.id);

  // Mesas libres de otras partes que tocan a esta parte: con las que se puede juntar.
  const juntables = (parte) => {
    const res = new Map();
    for (const m of parte.mesas) {
      for (const lado of LADOS) {
        const otra = porPos.get(vecino(cols, m.pos, lado));
        if (!otra) continue;
        const otraParte = parteDe(otra);
        if (otraParte.clave === parte.clave) continue;
        if (otraParte.estado !== 'libre' && parte.estado !== 'libre') continue;
        res.set(otraParte.clave, otraParte);
      }
    }
    return [...res.values()];
  };

  return { cols, porPos, partes, parteDe, juntables };
}

export default function MesasManage() {
  const { token, user } = useAuth();
  const [zonas, setZonas] = useState(null);
  const [mesas, setMesas] = useState([]);
  const [conectado, setConectado] = useState(false);
  const [zonaId, setZonaId] = useState('piso');
  const [uniendo, setUniendo] = useState(false);
  const [seleccion, setSeleccion] = useState([]);
  const [abierta, setAbierta] = useState(null);
  const [form, setForm] = useState({ estado: 'libre', personas: 0, nota: '' });
  const [ocupado, setOcupado] = useState(false);
  const [ahora, setAhora] = useState(Date.now());

  const recargar = useCallback(() => {
    axios.get('/api/mesas')
      .then(res => { setZonas(res.data.zonas); setMesas(res.data.mesas); })
      .catch(console.error);
  }, []);

  useEffect(recargar, [recargar]);

  // Tiempo real: el servidor manda el estado completo cada vez que alguien cambia algo.
  useEffect(() => {
    if (!token) return undefined;
    const fuente = new EventSource(`/api/mesas/stream?token=${encodeURIComponent(token)}`);
    fuente.onopen = () => setConectado(true);
    fuente.onerror = () => setConectado(false);
    fuente.onmessage = (e) => {
      try { setMesas(JSON.parse(e.data)); } catch { /* mensaje incompleto */ }
    };
    return () => fuente.close();
  }, [token]);

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const analisis = useMemo(() => {
    if (!zonas) return null;
    return Object.fromEntries(Object.entries(zonas).map(([id, zona]) => (
      [id, analizarZona(zona, mesas.filter(m => m.zona === id))]
    )));
  }, [zonas, mesas]);

  const accion = async (fn) => {
    setOcupado(true);
    try {
      await fn();
      if (!conectado) recargar();
      return true;
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo completar la accion');
      return false;
    } finally {
      setOcupado(false);
    }
  };

  if (!zonas || !analisis) {
    return <p style={{ color: 'var(--text-light)' }}>Cargando mesas...</p>;
  }

  const zona = zonas[zonaId];
  const datos = analisis[zonaId];
  const partesZona = [...datos.partes.values()];
  const extras = mesas.filter(m => m.zona === zonaId && m.extra).length;
  const parteAbierta = abierta ? partesZona.find(p => p.clave === abierta) : null;

  const resumen = (id) => {
    const partes = [...analisis[id].partes.values()];
    const deEstado = (e) => partes.filter(p => p.estado === e);
    return {
      mesas: mesas.filter(m => m.zona === id).length,
      ocupadas: deEstado('ocupada').reduce((s, p) => s + p.mesas.length, 0),
      reservadas: deEstado('reservada').reduce((s, p) => s + p.mesas.length, 0),
      personas: partes.reduce((s, p) => s + (p.estado === 'ocupada' ? p.personas : 0), 0),
      lugares: deEstado('libre').reduce((s, p) => s + p.capacidad, 0),
    };
  };
  const total = Object.keys(zonas).map(resumen).reduce((a, r) => ({
    mesas: a.mesas + r.mesas, ocupadas: a.ocupadas + r.ocupadas, reservadas: a.reservadas + r.reservadas,
    personas: a.personas + r.personas, lugares: a.lugares + r.lugares,
  }));
  const rz = resumen(zonaId);

  // --- Union de mesas ---
  const seleccionPartes = seleccion.map(c => datos.partes.get(c)).filter(Boolean);
  const sugeridas = new Set();
  for (const p of seleccionPartes) {
    for (const j of datos.juntables(p)) {
      if (!seleccion.includes(j.clave)) sugeridas.add(j.clave);
    }
  }

  const clicMesa = (mesa) => {
    const parte = datos.parteDe(mesa);
    if (uniendo) {
      setSeleccion(s => s.includes(parte.clave) ? s.filter(c => c !== parte.clave) : [...s, parte.clave]);
      return;
    }
    setAbierta(parte.clave);
    setForm({ estado: parte.estado, personas: parte.personas, nota: parte.nota || '' });
  };

  const unir = (claves) => {
    const ids = claves.flatMap(c => datos.partes.get(c)?.mesas.map(m => m.id) || []);
    return accion(() => axios.post('/api/mesas/unir', { ids }));
  };

  const confirmarUnion = async () => {
    if (await unir(seleccion)) {
      setUniendo(false);
      setSeleccion([]);
    }
  };

  const guardarEstado = async (e) => {
    e.preventDefault();
    if (form.estado === 'ocupada' && form.personas > parteAbierta.capacidad &&
      !confirm(`Son ${form.personas} personas y la mesa tiene ${parteAbierta.capacidad} lugares. ¿Guardar de todos modos?`)) return;
    const ok = await accion(() => axios.put(`/api/mesas/${parteAbierta.principal.id}/estado`, form));
    if (ok) setAbierta(null);
  };

  const liberar = async () => {
    const ok = await accion(() => axios.put(`/api/mesas/${parteAbierta.principal.id}/estado`, { estado: 'libre' }));
    if (ok) setAbierta(null);
  };

  const reiniciar = () => {
    if (!confirm(`¿Liberar y separar TODAS las mesas de ${zona.nombre}? Usalo al cerrar el turno.`)) return;
    accion(() => axios.post(`/api/mesas/zona/${zonaId}/reiniciar`));
  };

  // --- Cuadricula ---
  const ultimaPos = Math.max(zona.base - 1, ...mesas.filter(m => m.zona === zonaId).map(m => m.pos));
  const filas = Math.ceil((ultimaPos + 1) / datos.cols);
  const casillas = Array.from({ length: filas * datos.cols }, (_, pos) => pos);

  const renderMesa = (mesa) => {
    const parte = datos.parteDe(mesa);
    const sillas = parte.sillas.get(mesa.id);
    const unidaPor = LADOS.filter(l => sillas[l] === null);
    const esPrincipal = parte.principal.id === mesa.id;
    const clases = [
      'mesa', `mesa-${parte.estado}`,
      ...unidaPor.map(l => `une-${l}`),
      uniendo && seleccion.includes(parte.clave) && 'seleccionada',
      uniendo && sugeridas.has(parte.clave) && 'sugerida',
    ].filter(Boolean).join(' ');
    const sobrecupo = parte.estado === 'ocupada' ? parte.personas - parte.capacidad : 0;

    return (
      <button
        type="button"
        key={mesa.id}
        className={clases}
        onClick={() => clicMesa(mesa)}
        title={`${parte.nombre} · ${parte.capacidad} lugares`}
      >
        {LADOS.map(lado => sillas[lado] !== null && (
          <span
            key={lado}
            className={`silla silla-${lado}${parte.estado === 'ocupada' && sillas[lado] < parte.personas ? ' llena' : ''}`}
          />
        ))}
        <span className="mesa-tabla">
          <strong>{zona.prefijo}{mesa.pos + 1}</strong>
          {esPrincipal && parte.estado === 'ocupada' && (
            <small><Users size={11} strokeWidth={2} /> {parte.personas}/{parte.capacidad}{sobrecupo > 0 && ` +${sobrecupo}`}</small>
          )}
          {esPrincipal && parte.estado === 'reservada' && <small>Reservada</small>}
          {esPrincipal && parte.estado !== 'libre' && parte.desde && <small>{minutosDesde(parte.desde, ahora)}</small>}
          {esPrincipal && parte.estado === 'libre' && parte.mesas.length > 1 && <small>{parte.capacidad} lugares</small>}
          {mesa.extra && parte.estado === 'libre' && parte.mesas.length === 1 && <small>Extra</small>}
        </span>
      </button>
    );
  };

  return (
    <div>
      <div className="admin-header" style={{ marginBottom: '16px' }}>
        <h1>Mesas</h1>
        <span className={`en-vivo ${conectado ? 'si' : ''}`}>
          <span className="en-vivo-punto" /> {conectado ? 'En tiempo real' : 'Reconectando...'}
        </span>
      </div>

      <div className="mesas-resumen">
        <div><strong>{total.ocupadas}/{total.mesas}</strong><span>Mesas ocupadas</span></div>
        <div><strong>{total.personas}</strong><span>Personas en el lugar</span></div>
        <div><strong>{total.reservadas}</strong><span>Mesas reservadas</span></div>
        <div><strong>{total.lugares}</strong><span>Lugares libres</span></div>
      </div>

      <div className="tabs" role="tablist">
        {Object.entries(zonas).map(([id, z]) => {
          const r = resumen(id);
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={zonaId === id}
              className={zonaId === id ? 'active' : ''}
              onClick={() => { setZonaId(id); setSeleccion([]); setUniendo(false); }}
            >
              {z.nombre} <span className="tab-contador">{r.ocupadas}/{r.mesas}</span>
            </button>
          );
        })}
      </div>

      <div className="mesas-barra">
        <span className="form-hint" style={{ margin: 0 }}>
          {zona.nombre}: {rz.personas} personas · {rz.lugares} lugares libres · {extras}/{zona.maxExtra} mesas extra
        </span>
        <div className="table-actions">
          {uniendo ? (
            <>
              <button className="btn btn-sm btn-primary" disabled={seleccion.length < 2 || ocupado} onClick={confirmarUnion}>
                <Link2 size={14} strokeWidth={1.5} /> Juntar {seleccion.length > 1 ? `(${seleccionPartes.reduce((s, p) => s + p.mesas.length, 0)} mesas)` : ''}
              </button>
              <button className="btn btn-sm btn-outline" onClick={() => { setUniendo(false); setSeleccion([]); }}>
                <X size={14} strokeWidth={1.5} /> Cancelar
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-sm btn-outline" onClick={() => setUniendo(true)}>
                <Link2 size={14} strokeWidth={1.5} /> Juntar mesas
              </button>
              <button
                className="btn btn-sm btn-outline"
                disabled={extras >= zona.maxExtra || ocupado}
                onClick={() => accion(() => axios.post(`/api/mesas/zona/${zonaId}/agregar`))}
                title={extras >= zona.maxExtra ? `Maximo ${zona.maxExtra} mesas extra` : ''}
              >
                <Plus size={14} strokeWidth={1.5} /> Agregar mesa
              </button>
              {['dueno', 'admin'].includes(user?.rol) && (
                <button className="btn btn-sm btn-outline" onClick={reiniciar} disabled={ocupado}>
                  <RotateCcw size={14} strokeWidth={1.5} /> Reiniciar zona
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {uniendo && (
        <p className="form-hint" style={{ marginBottom: '12px' }}>
          Toca las mesas que quieres juntar. Deben estar una junto a otra; las marcadas con borde punteado se pueden juntar con tu seleccion.
        </p>
      )}

      <div className="admin-card mesas-card">
        <div className="mesas-plano" style={{ gridTemplateColumns: `repeat(${datos.cols}, minmax(0, 1fr))`, maxWidth: `${datos.cols * 130}px` }}>
          {casillas.map(pos => {
            const mesa = datos.porPos.get(pos);
            return mesa ? renderMesa(mesa) : <span key={`vacia-${pos}`} className="mesa-hueco" />;
          })}
        </div>
        <div className="mesas-leyenda">
          <span><i className="ley-libre" /> Libre</span>
          <span><i className="ley-reservada" /> Reservada</span>
          <span><i className="ley-ocupada" /> Ocupada</span>
          <span><i className="ley-silla" /> Silla con persona</span>
        </div>
      </div>

      {parteAbierta && (
        <div className="modal-overlay" onClick={() => setAbierta(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '6px' }}>
              {parteAbierta.mesas.length > 1 ? `Mesas ${parteAbierta.nombre}` : `Mesa ${parteAbierta.nombre}`}
            </h2>
            <p className="form-hint" style={{ marginBottom: '20px' }}>
              {zona.nombre} · {parteAbierta.capacidad} lugares
              {parteAbierta.mesas.length > 1 && ` (${parteAbierta.mesas.length} mesas juntas)`}
              {parteAbierta.estado !== 'libre' && parteAbierta.desde &&
                ` · ${parteAbierta.estado === 'ocupada' ? 'Ocupada' : 'Reservada'} desde ${horaDe(parteAbierta.desde)} (${minutosDesde(parteAbierta.desde, ahora)})`}
            </p>

            <form onSubmit={guardarEstado}>
              <div className="form-group">
                <label>Estado</label>
                <div className="segmentado">
                  {ESTADOS.map(e => (
                    <button
                      key={e.id}
                      type="button"
                      className={`seg-${e.id} ${form.estado === e.id ? 'active' : ''}`}
                      onClick={() => setForm(f => ({
                        ...f,
                        estado: e.id,
                        personas: e.id === 'ocupada' && !f.personas ? Math.min(2, parteAbierta.capacidad) : f.personas,
                      }))}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>

              {form.estado !== 'libre' && (
                <>
                  <div className="form-group">
                    <label>Personas</label>
                    <div className="contador">
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => setForm(f => ({ ...f, personas: Math.max(0, f.personas - 1) }))} aria-label="Menos">
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={form.personas}
                        onChange={e => setForm(f => ({ ...f, personas: Math.max(0, Math.min(99, parseInt(e.target.value) || 0)) }))}
                      />
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => setForm(f => ({ ...f, personas: Math.min(99, f.personas + 1) }))} aria-label="Mas">
                        <Plus size={14} />
                      </button>
                      <span className="form-hint" style={{ margin: 0 }}>de {parteAbierta.capacidad} lugares</span>
                    </div>
                    {form.personas > parteAbierta.capacidad && (
                      <p className="form-hint" style={{ color: 'var(--rojo)' }}>
                        Rebasa la capacidad de la mesa. Conviene juntarla con otra.
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Nombre o nota (opcional)</label>
                    <input value={form.nota} maxLength={80} placeholder="Ej. Familia Lopez, cumpleaños" onChange={e => setForm(f => ({ ...f, nota: e.target.value }))} />
                  </div>
                </>
              )}

              {(() => {
                const juntables = datos.juntables(parteAbierta);
                if (juntables.length === 0) return null;
                return (
                  <div className="form-group">
                    <label>Se puede juntar con</label>
                    <div className="table-actions" style={{ flexWrap: 'wrap' }}>
                      {juntables.map(j => (
                        <button
                          key={j.clave}
                          type="button"
                          className="btn btn-sm btn-outline"
                          disabled={ocupado}
                          onClick={async () => {
                            if (await unir([parteAbierta.clave, j.clave])) setAbierta(null);
                          }}
                          title={`Quedarian ${j.capacidad + parteAbierta.capacidad - 2} lugares o mas`}
                        >
                          <Link2 size={13} strokeWidth={1.5} /> {j.nombre}
                          {j.estado !== 'libre' && ` (${j.estado})`}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="form-actions" style={{ flexWrap: 'wrap' }}>
                {parteAbierta.mesas.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={ocupado || parteAbierta.estado !== 'libre'}
                    title={parteAbierta.estado !== 'libre' ? 'Libera las mesas antes de separarlas' : ''}
                    onClick={async () => {
                      if (await accion(() => axios.post(`/api/mesas/${parteAbierta.principal.id}/separar`))) setAbierta(null);
                    }}
                  >
                    <Unlink size={14} strokeWidth={1.5} /> Separar
                  </button>
                )}
                {parteAbierta.mesas.length === 1 && parteAbierta.principal.extra && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={ocupado || parteAbierta.estado !== 'libre'}
                    onClick={async () => {
                      if (!confirm(`¿Quitar la mesa extra ${parteAbierta.nombre}?`)) return;
                      if (await accion(() => axios.delete(`/api/mesas/${parteAbierta.principal.id}`))) setAbierta(null);
                    }}
                  >
                    <Trash2 size={14} strokeWidth={1.5} /> Quitar mesa
                  </button>
                )}
                {parteAbierta.estado !== 'libre' && (
                  <button type="button" className="btn btn-outline" disabled={ocupado} onClick={liberar}>Liberar</button>
                )}
                <button type="button" className="btn btn-outline" onClick={() => setAbierta(null)}>Cerrar</button>
                <button type="submit" className="btn btn-primary" disabled={ocupado}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
