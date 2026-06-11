import { useState } from 'react';
import axios from 'axios';

export default function Contact() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('enviando');
    try {
      await axios.post('/api/contact', form);
      setStatus('exito');
      setForm({ nombre: '', email: '', mensaje: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section style={{ padding: '60px 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h2 className="section-title">Contacto</h2>
        <p className="section-subtitle">Estamos aquí para atenderte</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '8px' }}>📍 Dirección</h3>
              <p style={{ color: 'var(--text-light)' }}>Calle Principal #123, Ciudad</p>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '8px' }}>📞 Teléfono</h3>
              <p style={{ color: 'var(--text-light)' }}>(123) 456-7890</p>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '8px' }}>✉️ Email</h3>
              <p style={{ color: 'var(--text-light)' }}>info@misayeres.com</p>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '20px' }}>Envíanos un mensaje</h3>
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
                  value={form.mensaje}
                  onChange={e => setForm({ ...form, mensaje: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={status === 'enviando'}>
                {status === 'enviando' ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
              {status === 'exito' && (
                <p style={{ color: '#155724', marginTop: '12px' }}>Mensaje enviado con éxito.</p>
              )}
              {status === 'error' && (
                <p style={{ color: '#721c24', marginTop: '12px' }}>Error al enviar. Intenta de nuevo.</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
