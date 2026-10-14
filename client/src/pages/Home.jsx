import { Link } from 'react-router-dom';
import heroImg from '../assets/hero-misayeres.jpg';

function IconEntradas() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function IconPlatos() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function IconPostres() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function IconBebidas() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h14l-1.5 15a2 2 0 01-2 1.8H8.5a2 2 0 01-2-1.8L5 3z" />
      <path d="M7 9h10" />
      <path d="M12 3v18" />
    </svg>
  );
}

const FEATURES = [
  { title: 'Entradas', desc: 'Comience su experiencia con nuestras entradas artesanales, preparadas con ingredientes frescos y de temporada.', icon: <IconEntradas /> },
  { title: 'Platos Fuertes', desc: 'Cortes de primera, pastas artesanales y platos de autor que definen nuestra cocina.', icon: <IconPlatos /> },
  { title: 'Postres', desc: 'Dulces tentaciones elaboradas al momento por nuestro chef pastelero.', icon: <IconPostres /> },
  { title: 'Bebidas', desc: 'Coctelería de autor, vinos seleccionados y bebidas artesanales para acompañar su experiencia.', icon: <IconBebidas /> },
];

export default function Home() {
  return (
    <div style={{ fontFamily: "'Karla', sans-serif" }}>
      <section className="home-hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="home-hero-overlay" />
        <div className="container home-hero-content">
          <h1>Bienvenido a<br />Mis Ayeres</h1>
          <p>
            Descubra una experiencia culinaria donde los sabores tradicionales se encuentran con la cocina contemporanea.
          </p>
          <div className="home-hero-actions">
            <Link to="/menu" className="btn btn-light">Ver Menu</Link>
            <Link to="/reservations" className="btn btn-ghost-light">Reservar Mesa</Link>
          </div>
        </div>
      </section>

      <section style={{
        padding: '100px 0',
        background: '#f7f7f7',
        borderTop: '1px solid #e5e5e5',
        borderBottom: '1px solid #e5e5e5',
      }}>
        <div className="container">
          <h2 style={{
            fontFamily: "'Playfair Display SC', serif",
            textAlign: 'center',
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '12px',
          }}>
            Nuestra Especialidad
          </h2>
          <div style={{ width: '40px', height: '2px', background: '#1a1a1a', opacity: 0.15, margin: '20px auto' }} />
          <p style={{
            textAlign: 'center',
            color: '#6b6b6b',
            marginBottom: '60px',
            fontSize: '1rem',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Platos cuidadosamente preparados por nuestro equipo de chefs.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
          }}>
            {FEATURES.map((item, i) => (
              <div
                key={i}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '12px',
                  padding: '48px 32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 48px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#f7f7f7',
                  border: '1px solid #e5e5e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  color: '#1a1a1a',
                  transition: 'all 0.25s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f7f7f7'; e.currentTarget.style.color = '#1a1a1a'; }}
                >
                  {item.icon}
                </div>
                <h3 style={{
                  fontFamily: "'Playfair Display SC', serif",
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: '#1a1a1a',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  color: '#6b6b6b',
                  fontSize: '14px',
                  lineHeight: 1.8,
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        padding: '100px 0',
        textAlign: 'center',
        background: '#ffffff',
      }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2 style={{
            fontFamily: "'Playfair Display SC', serif",
            fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '12px',
          }}>
            Reserve su Mesa
          </h2>
          <div style={{ width: '40px', height: '2px', background: '#1a1a1a', opacity: 0.15, margin: '20px auto' }} />
          <p style={{
            color: '#6b6b6b',
            marginBottom: '36px',
            fontSize: '1rem',
            lineHeight: 1.8,
          }}>
            Una experiencia gastronomica inolvidable le espera. Reserve ahora y dejese consentir.
          </p>
          <Link
            to="/reservations"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 36px',
              background: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              letterSpacing: '0.3px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { e.target.style.background = '#4a4a4a'; }}
            onMouseLeave={e => { e.target.style.background = '#1a1a1a'; }}
          >
            Reservar Ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
