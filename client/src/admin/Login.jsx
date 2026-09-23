import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch {
      setError('Credenciales invalidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ position: 'relative' }}>
        <Link to="/" style={{
          position: 'absolute',
          top: '20px',
          left: '24px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-light)',
          fontSize: '13px',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.target.style.color = '#1a1a1a'}
          onMouseLeave={e => e.target.style.color = 'var(--text-light)'}
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Regresar
        </Link>
        <img src={logo} alt="Mis Ayeres" style={{ height: '64px', width: 'auto', display: 'block', margin: '0 auto 12px' }} />
        <h1>Mis Ayeres</h1>
        <p className="login-subtitle">Panel de Administracion</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@restaurante.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="admin123"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Iniciar Sesion'}
          </button>
        </form>

        <div style={{ marginTop: '32px', fontSize: '12px', color: 'var(--text-lightest)', textAlign: 'center' }}>
          <p style={{ marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credenciales de prueba</p>
          <p>dueno@restaurante.com / admin123</p>
          <p>admin@restaurante.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
