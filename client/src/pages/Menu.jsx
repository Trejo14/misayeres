import { useState, useEffect } from 'react';
import axios from 'axios';
import Carousel from '../components/Carousel';
import Media from '../components/Media';

import { CATEGORIAS } from '../utils/categorias';

const paleta = (bg1, bg2, headerBg, accent, cardBorder, tagBg, tagText, title) => ({
  bg: `linear-gradient(135deg, ${bg1}, ${bg2})`,
  headerBg,
  headerText: '#ffffff',
  accent,
  cardBorder,
  tagBg,
  tagText,
  title,
});

const CLARO = {
  ambar: paleta('#fff8e1', '#ffecb3', '#f9a825', '#f57f17', '#ffe082', '#fff8e1', '#f57f17', '#e65100'),
  verde: paleta('#f1f8e9', '#dcedc8', '#558b2f', '#7cb342', '#c5e1a5', '#f1f8e9', '#33691e', '#33691e'),
  terracota: paleta('#fbe9e7', '#ffccbc', '#bf360c', '#e64a19', '#ffab91', '#fbe9e7', '#bf360c', '#8d2c0b'),
  rosa: paleta('#fce4ec', '#f8bbd0', '#ad1457', '#d81b60', '#f48fb1', '#fce4ec', '#ad1457', '#880e4f'),
  cian: paleta('#e0f7fa', '#b2ebf2', '#00838f', '#00acc1', '#80deea', '#e0f7fa', '#00838f', '#006064'),
  crema: paleta('#fdf6ec', '#f3e5d0', '#8d6e63', '#a1887f', '#d7ccc8', '#efebe9', '#5d4037', '#4e342e'),
};

const OSCURO = paleta('#263238', '#37474f', '#263238', '#78909c', '#455a64', '#37474f', '#b0bec5', '#eceff1');

const SECCIONES = {
  'Entradas': { subtitle: 'Para abrir el apetito mientras llega lo mejor.', colors: CLARO.terracota },
  'Desayunos': { subtitle: 'El mejor inicio para su dia con ingredientes frescos y sabores unicos.', colors: CLARO.ambar },
  'Ensaladas': { subtitle: 'Frescas, ligeras y llenas de sabor.', colors: CLARO.verde },
  'Sopas': { subtitle: 'Caldos y sopas tradicionales que reconfortan.', colors: CLARO.terracota },
  'Pastas': { subtitle: 'Pastas preparadas al momento con salsas de la casa.', colors: CLARO.crema },
  'Fuertes': { subtitle: 'Una experiencia gastronomica completa para los momentos mas especiales.', colors: OSCURO },
  'Hamburguesas y hot dog': { subtitle: 'Clasicos jugosos acompañados de papas.', colors: CLARO.ambar },
  'Para botanear': { subtitle: 'Para compartir entre amigos y acompañar la bebida.', colors: CLARO.terracota },
  'Combos': { subtitle: 'Combinaciones pensadas para disfrutar de todo un poco.', colors: OSCURO },
  'Postres': { subtitle: 'Dulces tentaciones elaboradas al momento para cerrar con broche de oro.', colors: CLARO.rosa },
  'Bebidas': { subtitle: 'Refrescos, cocteleria y bebidas artesanales para acompañar cada platillo.', colors: CLARO.cian },
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

  // Platillos con una categoria que ya no esta en la lista no se pierden:
  // se muestran al final en "Otros".
  const otros = items.filter(i => !CATEGORIAS.includes(i.categoria));
  const secciones = [
    ...CATEGORIAS.map(cat => ({ title: cat, ...SECCIONES[cat], items: items.filter(i => i.categoria === cat) })),
    { title: 'Otros', subtitle: 'Mas opciones de nuestra cocina.', colors: CLARO.crema, items: otros },
  ].filter(sec => sec.items.length > 0);

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
          <Carousel label={title}>
            {items.map(item => (
              <div key={item.id} className="card menu-card" style={{ borderColor: colors.cardBorder }}>
                {item.imagen ? (
                  <Media
                    src={item.imagen}
                    tipo={item.imagen_tipo}
                    alt={item.nombre}
                    video={{ autoPlay: true, loop: true }}
                    className="menu-card-media"
                  />
                ) : (
                  <div className="menu-card-media" style={{
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
                )}
                <div className="card-body">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{item.nombre}</h3>
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
          </Carousel>
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

      {secciones.map(sec => (
        <div key={sec.title}>
          {renderSection(sec.title, sec.subtitle, sec.items, sec.colors)}
        </div>
      ))}
    </section>
  );
}
