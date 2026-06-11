import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>Mis Ayères</h4>
            <p>Donde cada bocado cuenta una historia.</p>
            <p>Desde 2024 sirviendo la mejor experiencia gastronómica.</p>
          </div>
          <div>
            <h4>Horario</h4>
            <p>Lunes a Viernes: 12:00 - 23:00</p>
            <p>Sábado: 13:00 - 00:00</p>
            <p>Domingo: 13:00 - 22:00</p>
          </div>
          <div>
            <h4>Contacto</h4>
            <p>📍 Calle Principal #123</p>
            <p>📞 (123) 456-7890</p>
            <p>✉️ info@misayeres.com</p>
          </div>
          <div>
            <h4>Enlaces</h4>
            <p><Link to="/menu">Menú</Link></p>
            <p><Link to="/reservations">Reservaciones</Link></p>
            <p><Link to="/contact">Contacto</Link></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Mis Ayères. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
