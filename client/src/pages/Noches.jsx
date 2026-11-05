import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Media from '../components/Media';
import { formatDate } from '../utils/format';
import { addDays, nochesWeekStartISO, nochesDays, todayISO, formatWeekday, formatDayMonth } from '../utils/format';

export default function Noches() {
  // La semana se calcula con la fecha de hoy, asi que cambia sola cada domingo.
  const desde = nochesWeekStartISO();
  const hoy = todayISO();
  const [dias, setDias] = useState({});
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'recuerdos' ? 'recuerdos' : 'programa';
  const [recuerdos, setRecuerdos] = useState(null);

  // Los recuerdos se cargan solo la primera vez que se abre su pestaña.
  useEffect(() => {
    if (tab !== 'recuerdos' || recuerdos) return;
    axios.get('/api/recuerdos')
      .then(res => setRecuerdos(res.data))
      .catch(() => setRecuerdos([]));
  }, [tab, recuerdos]);

  const cambiarTab = (nuevo) => setParams(nuevo === 'recuerdos' ? { tab: 'recuerdos' } : {}, { replace: true });

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

        <div className="noches-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'programa'} className={tab === 'programa' ? 'active' : ''} onClick={() => cambiarTab('programa')}>
            Programa
          </button>
          <button type="button" role="tab" aria-selected={tab === 'recuerdos'} className={tab === 'recuerdos' ? 'active' : ''} onClick={() => cambiarTab('recuerdos')}>
            Nuestros recuerdos
          </button>
        </div>

        {tab === 'recuerdos' ? (
          <>
            <p className="section-subtitle">Lo que hemos vivido juntos en Noches Mis Ayeres.</p>
            {!recuerdos ? (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>Cargando recuerdos...</p>
            ) : recuerdos.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Muy pronto compartiremos aqui nuestros recuerdos.</p>
            ) : (
              <div className="recuerdos-grid">
                {recuerdos.map(item => (
                  <figure key={item.id} className="recuerdo">
                    <Media
                      className="recuerdo-media"
                      src={item.media}
                      tipo={item.media_tipo}
                      alt={item.titulo || 'Recuerdo de Noches Mis Ayeres'}
                      video={{ controls: true, muted: false }}
                    />
                    {(item.titulo || item.descripcion) && (
                      <figcaption>
                        {item.titulo && <strong>{item.titulo}</strong>}
                        {item.descripcion && <p>{item.descripcion}</p>}
                        <small>{formatDate(item.created_at)}</small>
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </>
        ) : (
        <>
        <p className="section-subtitle">
          Programa de martes {formatDayMonth(addDays(desde, 1))} a sabado {formatDayMonth(addDays(desde, 5))}.
        </p>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>Cargando programa...</p>
        ) : (
          <div className="noches-list">
            {nochesDays(desde).map(fecha => {
              const dia = dias[fecha];
              const vacia = !dia || (!dia.evento && !dia.cantante && !dia.promo_titulo && !dia.media);
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
                              {dia.cantante_foto && dia.cantante_foto_tipo !== 'video' && <img src={dia.cantante_foto} alt="" loading="lazy" />}
                              <p>{dia.cantante}</p>
                            </div>
                            {dia.cantante_foto && dia.cantante_foto_tipo === 'video' && (
                              <video className="noche-video" src={dia.cantante_foto} controls playsInline preload="metadata" />
                            )}
                          </div>
                        )}
                        {dia.media && (
                          <Media
                            className="noche-video"
                            src={dia.media}
                            tipo={dia.media_tipo}
                            video={{ controls: true, muted: false }}
                          />
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
        </>
        )}
      </div>
    </section>
  );
}
