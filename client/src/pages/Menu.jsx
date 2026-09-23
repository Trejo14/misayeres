import { useState, useEffect } from 'react';
import axios from 'axios';

const CATEGORIES = ['Desayuno', 'Almuerzo', 'Comida', 'Cena', 'Bebidas'];
const DAY_CATS = ['Desayuno', 'Almuerzo'];
const NIGHT_CATS = ['Comida', 'Cena'];
const DRINK_CATS = ['Bebidas'];

const DAY_COLORS = {
  bg: 'linear-gradient(135deg, #fff8e1, #ffecb3)',
  headerBg: '#f9a825',
  headerText: '#ffffff',
  accent: '#f57f17',
  cardBorder: '#ffe082',
  tagBg: '#fff8e1',
  tagText: '#f57f17',
  title: '#e65100',
};

const NIGHT_COLORS = {
  bg: 'linear-gradient(135deg, #263238, #37474f)',
  headerBg: '#263238',
  headerText: '#ffffff',
  accent: '#78909c',
  cardBorder: '#455a64',
  tagBg: '#37474f',
  tagText: '#b0bec5',
  title: '#eceff1',
};

const DRINK_COLORS = {
  bg: 'linear-gradient(135deg, #e0f7fa, #b2ebf2)',
  headerBg: '#00838f',
  headerText: '#ffffff',
  accent: '#00acc1',
  cardBorder: '#80deea',
  tagBg: '#e0f7fa',
  tagText: '#00838f',
  title: '#006064',
};

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/menu')
      .then(res => setItems(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section style={{ padding: '60px 0' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--text-light)' }}>
          Cargando menu...
        </div>
      </section>
    );
  }

  const dayItems = items.filter(i => DAY_CATS.includes(i.categoria));
  const nightItems = items.filter(i => NIGHT_CATS.includes(i.categoria));
  const drinkItems = items.filter(i => DRINK_CATS.includes(i.categoria));

  const renderSection = (title, subtitle, items, colors) => (
    <div style={{
      padding: '60px 0',
      background: colors.bg,
      borderTop: `1px solid ${colors.cardBorder}`,
      borderBottom: `1px solid ${colors.cardBorder}`,
    }}>
      <div className="container">
        <h2 style={{
          textAlign: 'center',
          fontSize: '2rem',
          fontWeight: 600,
          marginBottom: '8px',
          color: colors.title,
        }}>
          {title}
        </h2>
        <div style={{
          width: '40px',
          height: '2px',
          background: colors.accent,
          margin: '16px auto',
        }} />
        <p className="section-subtitle">{subtitle}</p>

        {items.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '14px' }}>
            No hay platillos disponibles en esta seccion.
          </p>
        ) : (
          <div className="menu-grid">
            {items.map(item => (
              <div key={item.id} className="card" style={{ borderColor: colors.cardBorder }}>
                <div style={{
                  height: '180px',
                  background: `linear-gradient(135deg, ${colors.headerBg}, ${colors.accent})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.headerText,
                  fontSize: '14px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}>
                  {item.categoria}
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{item.nombre}</h3>
                    <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1.1rem', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                      ${parseFloat(item.precio).toFixed(2)}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '12px', lineHeight: '1.7' }}>{item.descripcion}</p>
                  <span style={{
                    fontSize: '11px',
                    color: colors.tagText,
                    background: colors.tagBg,
                    padding: '2px 10px',
                    borderRadius: '4px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}>
                    {item.categoria}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section>
      <div style={{ padding: '60px 0', background: 'var(--bg)' }}>
        <div className="container">
          <h2 className="section-title">Nuestro Menu</h2>
          <div className="divider" />
          <p className="section-subtitle">Descubra nuestra seleccion de platillos para cada momento del dia.</p>
        </div>
      </div>

      {renderSection(
        'Desayuno / Almuerzo',
        'El mejor inicio para su dia con ingredientes frescos y sabores unicos.',
        dayItems,
        DAY_COLORS
      )}

      {renderSection(
        'Comida / Cena',
        'Una experiencia gastronomica completa para los momentos mas especiales.',
        nightItems,
        NIGHT_COLORS
      )}

      {renderSection(
        'Bebidas',
        'Refrescos, coctelería y bebidas artesanales para acompañar cada platillo.',
        drinkItems,
        DRINK_COLORS
      )}
    </section>
  );
}
