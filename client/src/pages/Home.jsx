import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Bienvenido a Mis Ayeres</h1>
          <p>Descubra una experiencia culinaria donde los sabores tradicionales se encuentran con la cocina contemporanea.</p>
          <div className="btn-group">
            <Link to="/menu" className="btn btn-primary">Ver Menu</Link>
            <Link to="/reservations" className="btn btn-outline">Reservar Mesa</Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 className="section-title">Nuestra Especialidad</h2>
          <div className="divider" />
          <p className="section-subtitle">Platos cuidadosamente preparados por nuestro equipo de chefs</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[
              { title: 'Entradas', desc: 'Comience su experiencia con nuestras entradas artesanales, preparadas con ingredientes frescos y de temporada.' },
              { title: 'Platos Fuertes', desc: 'Cortes de primera, pastas artesanales y platos de autor que definen nuestra cocina.' },
              { title: 'Postres', desc: 'Dulces tentaciones elaboradas al momento por nuestro chef pastelero.' },
            ].map((item, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: '40px 32px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-alt)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'var(--text-light)', border: '1px solid var(--border)' }}>
                  {['E', 'P', 'D'][i]}
                </div>
                <h3 style={{ marginBottom: '12px', fontSize: '1.3rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: '1.8' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-gray" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Reserve su Mesa</h2>
          <div className="divider" />
          <p style={{ marginBottom: '32px', color: 'var(--text-light)', maxWidth: '500px', margin: '0 auto 32px' }}>
          Una experiencia gastronomica inolvidable le espera. Reserve ahora y dejese consentir.
          </p>
          <Link to="/reservations" className="btn btn-primary">Reservar Ahora</Link>
        </div>
      </section>
    </>
  );
}
