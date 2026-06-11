import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path ? { background: '#f7f7f7', color: '#1a1a1a' } : {};

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/menu', label: 'Menu' },
    { path: '/admin/reservations', label: 'Reservas' },
    { path: '/admin/users', label: 'Usuarios' },
    { path: '/admin/complaints', label: 'Quejas' },
    { path: '/admin/messages', label: 'Mensajes' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="logo">
          Mis<span>Ayeres</span>
        </div>
        <div className="user-info">
          <strong>{user?.nombre}</strong>
          <span>{user?.rol}</span>
        </div>
        <nav className="admin-nav">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} style={isActive(item.path)}>
              <span className="nav-icon">--</span>
              {item.label}
            </Link>
          ))}
          <a href="#" onClick={handleLogout} style={{ marginTop: '16px', color: 'var(--text-light)', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
            <span className="nav-icon">xx</span>
            Cerrar Sesion
          </a>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
