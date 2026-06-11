import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Bienvenido a Mis Ayères</h1>
          <p>Descubre una experiencia culinaria única donde los sabores tradicionales se encuentran con la cocina contemporánea.</p>
          <div className="btn-group">
            <Link to="/menu" className="btn btn-accent">Ver Menú</Link>
            <Link to="/reservations" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>
              Reservar Mesa
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 className="section-title">Nuestra Especialidad</h2>
          <p className="section-subtitle">Platos cuidadosamente preparados por nuestros chefs</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[
              { title: 'Entradas', desc: 'Comienza tu experiencia con nuestras entradas artesanales.', icon: '🥗' },
              { title: 'Platos Fuertes', desc: 'Cortes de primera, pastas artesanales y más.', icon: '🥩' },
              { title: 'Postres', desc: 'Dulces tentaciones preparadas al momento.', icon: '🍰' },
            ].map((item, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '32px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{item.icon}</div>
                <h3 style={{ marginBottom: '12px' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-light)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--secondary)', color: 'white', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>¿Listo para una experiencia inolvidable?</h2>
          <p style={{ marginBottom: '32px', opacity: 0.8, maxWidth: '500px', margin: '0 auto 32px' }}>
            Haz tu reservación hoy y déjate consentir.
          </p>
          <Link to="/reservations" className="btn btn-accent">Reservar Ahora</Link>
        </div>
      </section>
    </>
  );
}
