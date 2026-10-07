import { useState, useEffect } from 'react';
import axios from 'axios';
import { addDays, weekStartISO, weekDays, todayISO, formatWeekday, formatDayMonth } from '../utils/format';

export default function Noches() {
  // La semana se calcula con la fecha de hoy, asi que cambia sola cada lunes.
  const desde = weekStartISO();
  const hoy = todayISO();
  const [dias, setDias] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/noches', { params: { desde } })
      .then(res => setDias(Object.fromEntries(res.data.map(d => [d.fecha, d]))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [desde]);

  return (
    <section className="noches">
      <div className="container">
        <h2 className="section-title">Noches Mis Ayeres</h2>
        <div className="divider" />
        <p className="section-subtitle">
          Programa de la semana del {formatDayMonth(desde)} al {formatDayMonth(addDays(desde, 6))}.
        </p>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>Cargando programa...</p>
        ) : (
          <div className="noches-list">
            {weekDays(desde).map(fecha => {
              const dia = dias[fecha];
              const vacia = !dia || (!dia.evento && !dia.cantante && !dia.promo_titulo);
              const clases = ['noche', fecha === hoy && 'hoy', vacia && 'vacia'].filter(Boolean).join(' ');
              return (
                <div key={fecha} className={clases}>
                  <div className="noche-fecha">
                    <strong>{formatWeekday(fecha)}</strong>
                    <span>{formatDayMonth(fecha)}</span>
                    {fecha === hoy && <><br /><span className="noche-hoy">Hoy</span></>}
                  </div>

                  {vacia ? (
                    <p className="noche-sin">Sin programa para este dia.</p>
                  ) : (
                    <>
                      <div>
                        {dia.evento && (
                          <div className="noche-dato">
                            <span className="noche-etiqueta">Evento</span>
                            <p>{dia.evento}</p>
                          </div>
                        )}
                        {dia.cantante && (
                          <div className="noche-dato">
                            <span className="noche-etiqueta">Cantante</span>
                            <div className="noche-cantante">
                              {dia.cantante_foto && <img src={dia.cantante_foto} alt="" loading="lazy" />}
                              <p>{dia.cantante}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        {dia.promo_titulo && (
                          <>
                            <span className="noche-etiqueta" style={{ marginBottom: '6px' }}>Promo del dia</span>
                            <div className="noche-promo">
                              {dia.promo_media_tipo === 'video' ? (
                                <video className="noche-promo-media" src={dia.promo_media} muted loop autoPlay playsInline preload="metadata" />
                              ) : (
                                <img className="noche-promo-media" src={dia.promo_media} alt="" loading="lazy" />
                              )}
                              <div>
                                <p>{dia.promo_titulo}</p>
                                {dia.promo_descripcion && <small>{dia.promo_descripcion}</small>}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
