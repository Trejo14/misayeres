import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';
import Media from './Media';
import { formatDate } from '../utils/format';

// Ventana con los eventos especiales que se abre al entrar al sitio.
export default function EventoPopup() {
  const [eventos, setEventos] = useState([]);
  const [index, setIndex] = useState(0);
  const [abierto, setAbierto] = useState(true);

  useEffect(() => {
    axios.get('/api/eventos')
      .then(res => setEventos(res.data))
      .catch(() => {});
  }, []);

  const total = eventos.length;
  const visible = abierto && total > 0;

  useEffect(() => {
    if (!visible) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setAbierto(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  if (!visible) return null;

  const evento = eventos[index];
  const cerrar = () => setAbierto(false);
  const prev = () => setIndex(i => (i - 1 + total) % total);
  const next = () => setIndex(i => (i + 1) % total);

  return (
    <div className="evento-popup-overlay" onClick={cerrar}>
      <div className="evento-popup" role="dialog" aria-modal="true" aria-label={evento.titulo} onClick={e => e.stopPropagation()}>
        <button type="button" className="evento-popup-close" onClick={cerrar} aria-label="Cerrar">
          <X size={18} strokeWidth={2} />
        </button>

        {evento.imagen && (
          <Media
            key={evento.id}
            className="evento-popup-media"
            src={evento.imagen}
            tipo={evento.imagen_tipo}
            alt={evento.titulo}
            video={{ autoPlay: true, loop: true, controls: true }}
          />
        )}

        <div className="evento-popup-body">
          <span className="evento-aviso-kicker">
            <span className="evento-aviso-dot" /> Evento especial
          </span>
          <h2>{evento.titulo}</h2>
          {evento.fecha && (
            <p className="evento-popup-fecha">
              <CalendarDays size={14} strokeWidth={1.5} /> {formatDate(evento.fecha)}
            </p>
          )}
          {evento.descripcion && <p className="evento-popup-desc">{evento.descripcion}</p>}

          <div className="evento-popup-actions">
            <Link to="/reservations" className="btn btn-primary" onClick={cerrar}>Reservar</Link>
            {total > 1 && (
              <div className="evento-popup-nav">
                <button type="button" onClick={prev} aria-label="Evento anterior"><ChevronLeft size={16} /></button>
                <span>{index + 1}/{total}</span>
                <button type="button" onClick={next} aria-label="Siguiente evento"><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
