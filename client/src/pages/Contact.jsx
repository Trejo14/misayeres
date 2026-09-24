import { useState } from 'react';
import axios from 'axios';

export default function Contact() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [status, setStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('enviando');
    try {
      await axios.post('/api/contact', form);
      setStatus('exito');
      setForm({ nombre: '', email: '', mensaje: '' });
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Error al enviar. Intente de nuevo.');
      setStatus('error');
    }
  };

  return (
    <section style={{ padding: '60px 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h2 className="section-title">Contacto</h2>
        <div className="divider" />
        <p className="section-subtitle">Estamos aqui para atenderle. No dude en escribirnos.</p>

        <div className="contact-grid">
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Direccion</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Calle Principal #123, Ciudad</p>
            </div>
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Telefono</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>(123) 456-7890</p>
            </div>
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Email</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>info@misayeres.com</p>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '20px', fontSize: '1rem' }}>Envie su mensaje</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mensaje</label>
                <textarea
                  rows="4"
                  maxLength={5000}
                  value={form.mensaje}
                  onChange={e => setForm({ ...form, mensaje: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={status === 'enviando'}>
                {status === 'enviando' ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
              {status === 'exito' && (
                <div className="notice notice-success">Mensaje enviado con exito. Le responderemos pronto.</div>
              )}
              {status === 'error' && (
                <div className="notice notice-error">{errorMsg}</div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
