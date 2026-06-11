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
        <h2 className="section-title">Nuestro Menú</h2>
        <p className="section-subtitle">Explora nuestra selección de platillos</p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
          <button
            className={`btn btn-sm ${!category ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCategory('')}
          >
            Todos
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Cargando menú...</p>
        ) : items.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>No hay platillos disponibles en esta categoría.</p>
        ) : (
          <div className="menu-grid">
            {items.map(item => (
              <div key={item.id} className="card">
                <div style={{
                  height: '200px',
                  background: item.imagen ? `url(${item.imagen}) center/cover` : `linear-gradient(135deg, var(--primary), var(--accent))`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {!item.imagen && <span style={{ color: 'white', fontSize: '3rem' }}>🍽️</span>}
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3>{item.nombre}</h3>
                    <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.2rem' }}>
                      ${parseFloat(item.precio).toFixed(2)}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '8px' }}>{item.descripcion}</p>
                  <span className="badge badge-confirmada" style={{ background: '#e8f4f8', color: '#2c7be5' }}>
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
