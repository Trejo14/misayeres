import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path ? { background: 'rgba(255,255,255,0.08)', color: 'white' } : {};

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/menu', label: 'Menú', icon: '🍽️' },
    { path: '/admin/reservations', label: 'Reservas', icon: '📅' },
    { path: '/admin/users', label: 'Usuarios', icon: '👥' },
    { path: '/admin/complaints', label: 'Quejas', icon: '⚠️' },
    { path: '/admin/messages', label: 'Mensajes', icon: '✉️' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="logo">
          Mis<span>Ayères</span>
        </div>
        <div className="user-info">
          <strong>{user?.nombre}</strong>
          <span>{user?.rol}</span>
        </div>
        <nav className="admin-nav">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} style={isActive(item.path)}>
              <span className="icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <a href="#" onClick={handleLogout} style={{ marginTop: '16px', color: '#f8d7da' }}>
            <span className="icon">🚪</span>
            Cerrar Sesión
          </a>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
