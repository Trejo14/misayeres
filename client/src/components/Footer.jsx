import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Footer() {
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
            <p>Lunes a Viernes: 12:00 - 23:00</p>
            <p>Sabado: 13:00 - 00:00</p>
            <p>Domingo: 13:00 - 22:00</p>
          </div>
          <div>
            <h4>Contacto</h4>
            <p>Calle Principal #123, Ciudad</p>
            <p>(123) 456-7890</p>
            <p>info@misayeres.com</p>
          </div>
          <div>
            <h4>Enlaces</h4>
            <p><Link to="/menu">Menu</Link></p>
            <p><Link to="/reservations">Reservaciones</Link></p>
            <p><Link to="/contact">Contacto</Link></p>
            <p><Link to="/login" style={{ fontSize: '13px', opacity: 0.6 }}>Admin</Link></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Mis Ayeres. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
