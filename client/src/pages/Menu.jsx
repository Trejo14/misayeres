import { useState, useEffect } from 'react';
import axios from 'axios';

const CATEGORIES = ['Entradas', 'Platos Fuertes', 'Pastas', 'Pizzas', 'Ensaladas', 'Postres', 'Bebidas'];

export default function Menu() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = category ? { categoria: category } : {};
    axios.get('/api/menu', { params })
      .then(res => setItems(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <section style={{ padding: '60px 0' }}>
      <div className="container">
        <h2 className="section-title">Nuestro Menu</h2>
        <div className="divider" />
        <p className="section-subtitle">Explore nuestra seleccion de platillos preparados con los ingredientes mas frescos.</p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
          <button
            className={`category-btn ${!category ? 'active' : ''}`}
            onClick={() => setCategory('')}
          >
            Todos
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Cargando menu ...</p>
        ) : items.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>No hay platillos disponibles en esta categoria.</p>
        ) : (
          <div className="menu-grid">
            {items.map(item => (
              <div key={item.id} className="card">
                <div style={{
                  height: '200px',
                  background: `linear-gradient(135deg, var(--bg-alt), var(--border))`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-lightest)',
                  fontSize: '28px',
                  letterSpacing: '4px',
                }}>
                  {item.categoria.toUpperCase()}
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{item.nombre}</h3>
                    <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1.1rem', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                      ${parseFloat(item.precio).toFixed(2)}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '12px', lineHeight: '1.7' }}>{item.descripcion}</p>
                  <span style={{ fontSize: '12px', color: 'var(--text-lightest)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    {item.categoria}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
