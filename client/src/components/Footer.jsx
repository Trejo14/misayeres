import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

// Redes sociales del restaurante. Las que no tienen enlace no se muestran.
const REDES = [
  {
    nombre: 'Facebook',
    url: 'https://www.facebook.com/misayeresavjuarez',
    icono: <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8.2v3h2.5V21h2.8z" />,
  },
  {
    nombre: 'Instagram',
    url: 'https://www.instagram.com/restaurantemisayeres',
    icono: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16.6" cy="7.4" r="1" />
      </>
    ),
  },
  {
    nombre: 'TikTok',
    url: 'https://www.tiktok.com/@misayeres',
    icono: <path d="M15.2 4h-2.6v10.7a2.2 2.2 0 1 1-2.2-2.2c.2 0 .4 0 .6.1V9.9a4.8 4.8 0 1 0 4.2 4.8V9.3a6 6 0 0 0 3.5 1.1V7.8a3.5 3.5 0 0 1-3.5-3.5V4z" />,
  },
];

export default function Footer() {
  const redes = REDES.filter(red => red.url);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <img src={logo} alt="Mis Ayeres" style={{ height: '36px', width: 'auto' }} />
              <h4 style={{ marginBottom: 0 }}>Mis Ayeres</h4>
            </div>
            <p>Donde cada bocado cuenta una historia.</p>
          </div>
          <div>
            <h4>Horario</h4>
            <p>Martes a Sabado: 9:00 - 00:00</p>
            {redes.length > 0 && (
              <div className="footer-social">
                {redes.map(red => (
                  <a key={red.nombre} href={red.url} target="_blank" rel="noopener noreferrer" aria-label={red.nombre} title={red.nombre}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{red.icono}</svg>
                  </a>
                ))}
              </div>
            )}
          </div>
          <div>
            <h4>Contacto</h4>
            <p>Av. Juárez 2109, La Paz, 72160 Heroica Puebla de Zaragoza, Pue., Mexico #123, Ciudad</p>
            <p>222 724 4119</p>
            <p>misayeres@gmail.com</p>
          </div>
          <div>
            <h4>Enlaces</h4>
            <p><Link to="/menu">Menu</Link></p>
            <p><Link to="/promos">Promos</Link></p>
            <p><Link to="/noches">Noches Mis Ayeres</Link></p>
            <p><Link to="/reservations">Reservaciones</Link></p>
            <p><Link to="/contact">Contacto</Link></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Mis Ayeres. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
