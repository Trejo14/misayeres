import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? { color: '#1a1a1a' } : {};

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logo} alt="Mis Ayeres" style={{ height: '40px', width: 'auto' }} />
          Mis<span>Ayeres</span>
        </Link>
        <ul className="nav-links">
          <li><Link to="/" style={isActive('/')}>Inicio</Link></li>
          <li><Link to="/menu" style={isActive('/menu')}>Menu</Link></li>
          <li><Link to="/promos" style={isActive('/promos')}>Promos</Link></li>
          <li><Link to="/noches" style={isActive('/noches')}>Noches Mis Ayeres</Link></li>
          <li><Link to="/reservations" style={isActive('/reservations')}>Reservaciones</Link></li>
          <li><Link to="/contact" style={isActive('/contact')}>Contacto</Link></li>
        </ul>
      </div>
    </nav>
  );
}
