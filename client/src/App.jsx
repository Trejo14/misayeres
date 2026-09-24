import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Contact from './pages/Contact';
import Reservations from './pages/Reservations';
import Login from './admin/Login';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import MenuManage from './admin/MenuManage';
import ReservationsManage from './admin/ReservationsManage';
import ClientsManage from './admin/ClientsManage';
import UsersManage from './admin/UsersManage';
import ComplaintsManage from './admin/ComplaintsManage';
import ContactMessages from './admin/ContactMessages';
import ProtectedRoute from './components/ProtectedRoute';

const STAFF = ['dueno', 'admin'];
const OWNER = ['dueno'];

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="menu" element={<ProtectedRoute roles={STAFF}><MenuManage /></ProtectedRoute>} />
          <Route path="reservations" element={<ProtectedRoute roles={STAFF}><ReservationsManage /></ProtectedRoute>} />
          <Route path="clients" element={<ClientsManage />} />
          <Route path="users" element={<ProtectedRoute roles={OWNER}><UsersManage /></ProtectedRoute>} />
          <Route path="complaints" element={<ComplaintsManage />} />
          <Route path="messages" element={<ProtectedRoute roles={STAFF}><ContactMessages /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/reservations" element={<Reservations />} />
            </Routes>
            <Footer />
          </>
        } />
      </Routes>
    </AuthProvider>
  );
}
