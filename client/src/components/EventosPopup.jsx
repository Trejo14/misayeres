import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { X, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { formatDate } from '../utils/format';

// Se recuerda por sesion para no volver a mostrarlo en cada recarga.
const VISTO_KEY = 'eventos-popup-visto';

const yaVisto = () => {
  try { return sessionStorage.getItem(VISTO_KEY) === '1'; } catch { return false; }
};

const marcarVisto = () => {
  try { sessionStorage.setItem(VISTO_KEY, '1'); } catch { /* sin almacenamiento */ }
};

// Ventana flotante con los eventos destacados que se configuran en el panel.
export default function EventosPopup() {
  const [eventos, setEventos] = useState([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (yaVisto()) return;
    axios.get('/api/eventos')
      .then(res => {
        if (res.data.length > 0) {
          setEventos(res.data);
          setOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  const total = eventos.length;

  const close = () => {
    setOpen(false);
    marcarVisto();
  };
  const prev = () => setIndex(i => (i - 1 + total) % total);
  const next = () => setIndex(i => (i + 1) % total);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (total > 1 && e.key === 'ArrowLeft') prev();
      else if (total > 1 && e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, total]);

  if (!open || total === 0) return null;
  const evento = eventos[index];

  return (
    <div className="eventos-overlay" onClick={close}>
      <div className="eventos-popup" role="dialog" aria-modal="true" aria-labelledby="eventos-titulo" onClick={e => e.stopPropagation()}>
        <button type="button" className="eventos-close" onClick={close} aria-label="Cerrar">
          <X size={18} strokeWidth={2} />
        </button>

        {evento.imagen && (
          <div className="eventos-media">
            <img src={evento.imagen} alt={evento.titulo} />
          </div>
        )}

        <div className="eventos-body">
          <span className="eventos-kicker">Evento destacado</span>
          <h2 id="eventos-titulo">{evento.titulo}</h2>
          {evento.fecha && (
            <p className="eventos-fecha">
              <CalendarDays size={15} strokeWidth={1.5} /> {formatDate(evento.fecha)}
            </p>
          )}
          {evento.descripcion && <p className="eventos-desc">{evento.descripcion}</p>}

          <div className="eventos-footer">
            <Link to="/reservations" className="btn btn-primary" onClick={close}>Reservar Mesa</Link>
            {total > 1 && (
              <div className="eventos-nav">
                <button type="button" onClick={prev} aria-label="Evento anterior"><ChevronLeft size={18} /></button>
                <span>{index + 1} / {total}</span>
                <button type="button" onClick={next} aria-label="Siguiente evento"><ChevronRight size={18} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
