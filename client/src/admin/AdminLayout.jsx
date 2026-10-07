import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/format';
import logo from '../assets/logo.png';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Megaphone,
  Moon,
  CalendarDays,
  Contact,
  Users,
  AlertTriangle,
  MessageSquare,
  LogOut,
  ExternalLink,
} from 'lucide-react';

const ALL = ['dueno', 'admin', 'empleado'];
const STAFF = ['dueno', 'admin'];

// Cada seccion solo aparece para los roles que el servidor deja usarla.
const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ALL, end: true },
  { path: '/admin/menu', label: 'Menu', icon: UtensilsCrossed, roles: STAFF },
  { path: '/admin/promos', label: 'Promos', icon: Megaphone, roles: STAFF },
  { path: '/admin/noches', label: 'Noches Mis Ayeres', icon: Moon, roles: STAFF },
  { path: '/admin/reservations', label: 'Reservas', icon: CalendarDays, roles: STAFF },
  { path: '/admin/clients', label: 'Clientes', icon: Contact, roles: ALL },
  { path: '/admin/users', label: 'Usuarios', icon: Users, roles: ['dueno'] },
  { path: '/admin/complaints', label: 'Quejas', icon: AlertTriangle, roles: ALL },
  { path: '/admin/messages', label: 'Mensajes', icon: MessageSquare, roles: STAFF },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = NAV_ITEMS.filter(item => item.roles.includes(user?.rol));

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logo} alt="Mis Ayeres" style={{ height: '32px', width: 'auto' }} />
          Mis<span>Ayeres</span>
        </div>
        <div className="user-info">
          <strong>{user?.nombre}</strong>
          <span>{ROLE_LABELS[user?.rol] || user?.rol}</span>
        </div>
        <nav className="admin-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink key={item.path} to={item.path} end={item.end}>
                <Icon size={18} strokeWidth={1.5} style={{ opacity: 0.6 }} />
                {item.label}
              </NavLink>
            );
          })}
          <div className="admin-nav-footer">
            <Link to="/">
              <ExternalLink size={18} strokeWidth={1.5} style={{ opacity: 0.6 }} />
              Ver sitio
            </Link>
            <button type="button" onClick={handleLogout}>
              <LogOut size={18} strokeWidth={1.5} style={{ opacity: 0.6 }} />
              Cerrar Sesion
            </button>
          </div>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
