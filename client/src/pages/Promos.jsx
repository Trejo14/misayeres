import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Promos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/promos')
      .then(res => setItems(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{ padding: '60px 0' }}>
      <div className="container">
        <h2 className="section-title">Promociones</h2>
        <div className="divider" />
        <p className="section-subtitle">Aproveche nuestras promociones vigentes.</p>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Cargando promociones...</p>
        ) : items.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '14px' }}>
            Por el momento no hay promociones. Vuelva pronto.
          </p>
        ) : (
          <div className="menu-grid">
            {items.map(item => (
              <div key={item.id} className="card promo-card">
                {item.media_tipo === 'video' ? (
                  <video className="promo-card-media" src={item.media} controls playsInline preload="metadata" />
                ) : (
                  <img className="promo-card-media" src={item.media} alt={item.titulo} loading="lazy" />
                )}
                <div className="card-body">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{item.titulo}</h3>
                  {item.descripcion && (
                    <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: '1.7' }}>{item.descripcion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
