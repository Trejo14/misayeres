import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  Users,
  AlertTriangle,
  MessageSquare,
  LogOut,
} from 'lucide-react';

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
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
    { path: '/admin/reservations', label: 'Reservas', icon: CalendarDays },
    { path: '/admin/users', label: 'Usuarios', icon: Users },
    { path: '/admin/complaints', label: 'Quejas', icon: AlertTriangle },
    { path: '/admin/messages', label: 'Mensajes', icon: MessageSquare },
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
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} style={isActive(item.path)}>
                <Icon size={18} strokeWidth={1.5} style={{ opacity: 0.6 }} />
                {item.label}
              </Link>
            );
          })}
          <a href="#" onClick={handleLogout} style={{ marginTop: 'auto', color: 'var(--text-light)', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <LogOut size={18} strokeWidth={1.5} style={{ opacity: 0.6 }} />
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
