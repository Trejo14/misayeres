import { useState } from 'react';
import axios from 'axios';

export default function Reservations() {
  const [form, setForm] = useState({
    nombre_cliente: '',
    telefono: '',
    email: '',
    fecha: '',
    hora: '',
    personas: 2,
    notas: '',
  });
  const [status, setStatus] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('enviando');
    try {
      await axios.post('/api/reservations', form);
      setStatus('exito');
      setForm({ nombre_cliente: '', telefono: '', email: '', fecha: '', hora: '', personas: 2, notas: '' });
    } catch {
      setStatus('error');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <section style={{ padding: '60px 0' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <h2 className="section-title">Reservaciones</h2>
        <p className="section-subtitle">Reserva tu mesa y disfruta de una experiencia única</p>

        <div className="admin-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre Completo *</label>
              <input
                type="text"
                name="nombre_cliente"
                value={form.nombre_cliente}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Fecha *</label>
                <input
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  min={today}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hora *</label>
                <input
                  type="time"
                  name="hora"
                  value={form.hora}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Personas *</label>
                <input
                  type="number"
                  name="personas"
                  value={form.personas}
                  onChange={handleChange}
                  min={1}
                  max={20}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notas (opcional)</label>
              <textarea
                name="notas"
                rows="3"
                value={form.notas}
                onChange={handleChange}
                placeholder="Alergias, ocasiones especiales, preferencias..."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={status === 'enviando'}>
              {status === 'enviando' ? 'Reservando...' : 'Reservar Mesa'}
            </button>

            {status === 'exito' && (
              <p style={{ color: '#155724', marginTop: '12px', fontWeight: 500 }}>
                ¡Reserva creada con éxito! Te contactaremos para confirmar.
              </p>
            )}
            {status === 'error' && (
              <p style={{ color: '#721c24', marginTop: '12px' }}>
                Error al crear la reserva. Intenta de nuevo.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
