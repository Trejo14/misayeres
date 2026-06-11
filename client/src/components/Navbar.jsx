import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? { color: '#1a1a1a' } : {};

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">Mis<span>Ayeres</span></Link>
        <ul className="nav-links">
          <li><Link to="/" style={isActive('/')}>Inicio</Link></li>
          <li><Link to="/menu" style={isActive('/menu')}>Menu</Link></li>
          <li><Link to="/reservations" style={isActive('/reservations')}>Reservaciones</Link></li>
          <li><Link to="/contact" style={isActive('/contact')}>Contacto</Link></li>
          {user && <li><Link to="/admin">Admin</Link></li>}
        </ul>
      </div>
    </nav>
  );
}
