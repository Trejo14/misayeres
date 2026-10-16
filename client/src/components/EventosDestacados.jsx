import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';
import { formatDate } from '../utils/format';

// Aviso fijo dentro del hero con los eventos destacados que se configuran en el panel.
export default function EventosDestacados() {
  const [eventos, setEventos] = useState([]);
  const [index, setIndex] = useState(0);
  const [visor, setVisor] = useState(false);

  useEffect(() => {
    axios.get('/api/eventos')
      .then(res => setEventos(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!visor) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setVisor(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visor]);

  const total = eventos.length;
  if (total === 0) return null;

  const evento = eventos[index];
  const prev = () => setIndex(i => (i - 1 + total) % total);
  const next = () => setIndex(i => (i + 1) % total);

  return (
    <aside className="evento-aviso" aria-label="Eventos destacados">
      {evento.imagen && (
        <button type="button" className="evento-aviso-thumb" onClick={() => setVisor(true)} aria-label="Ver imagen del evento">
          <img className="evento-aviso-img" src={evento.imagen} alt={evento.titulo} />
        </button>
      )}

      <div className="evento-aviso-body">
        <span className="evento-aviso-kicker">
          <span className="evento-aviso-dot" /> Evento destacado
        </span>
        <h2>{evento.titulo}</h2>
        {evento.fecha && (
          <p className="evento-aviso-fecha">
            <CalendarDays size={14} strokeWidth={1.5} /> {formatDate(evento.fecha)}
          </p>
        )}
        <Link to="/reservations" className="evento-aviso-link">Reservar para este evento</Link>
      </div>

      {total > 1 && (
        <div className="evento-aviso-nav">
          <button type="button" onClick={prev} aria-label="Evento anterior"><ChevronLeft size={16} /></button>
          <span>{index + 1}/{total}</span>
          <button type="button" onClick={next} aria-label="Siguiente evento"><ChevronRight size={16} /></button>
        </div>
      )}

      {/* Portal: el backdrop-filter del aviso atraparia el position: fixed del visor */}
      {visor && evento.imagen && createPortal(
        <div className="evento-visor" role="dialog" aria-modal="true" aria-label={evento.titulo} onClick={() => setVisor(false)}>
          <button type="button" className="evento-visor-close" onClick={() => setVisor(false)} aria-label="Cerrar">
            <X size={20} strokeWidth={2} />
          </button>
          <img src={evento.imagen} alt={evento.titulo} onClick={e => e.stopPropagation()} />
        </div>,
        document.body
      )}
    </aside>
  );
}
