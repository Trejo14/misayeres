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
    alergias: '',
    tipo_cliente: 'normal',
    fecha_cumpleanos: '',
  });
  const [status, setStatus] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('enviando');
    try {
      await axios.post('/api/reservations', form);
      setStatus('exito');
      setForm({
        nombre_cliente: '', telefono: '', email: '', fecha: '', hora: '', personas: 2, notas: '',
        alergias: '', tipo_cliente: 'normal', fecha_cumpleanos: '',
      });
    } catch {
      setStatus('error');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <section style={{ padding: '60px 0' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <h2 className="section-title">Reservaciones</h2>
        <div className="divider" />
        <p className="section-subtitle">Reserve su mesa y disfrute de una experiencia gastronomica unica.</p>

        <div className="admin-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre Completo</label>
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
                <label>Telefono</label>
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
                <label>Fecha</label>
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
                <label>Hora</label>
                <input
                  type="time"
                  name="hora"
                  value={form.hora}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Personas</label>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Tipo de Cliente</label>
                <select
                  name="tipo_cliente"
                  value={form.tipo_cliente}
                  onChange={handleChange}
                >
                  <option value="normal">Normal</option>
                  <option value="vip">VIP</option>
                  <option value="empresarial">Empresarial</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de Cumpleaños (opcional)</label>
                <input
                  type="date"
                  name="fecha_cumpleanos"
                  value={form.fecha_cumpleanos}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Alergias (opcional)</label>
              <input
                type="text"
                name="alergias"
                value={form.alergias}
                onChange={handleChange}
                placeholder="Ej. mariscos, nueces, gluten..."
              />
            </div>

            <div className="form-group">
              <label>Notas (opcional)</label>
              <textarea
                name="notas"
                rows="3"
                value={form.notas}
                onChange={handleChange}
                placeholder="Ocasiones especiales, preferencias..."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={status === 'enviando'}>
              {status === 'enviando' ? 'Procesando...' : 'Reservar Mesa'}
            </button>

            {status === 'exito' && (
              <p style={{ color: 'var(--text)', fontSize: '14px', marginTop: '12px' }}>
                Reserva creada con exito. Le contactaremos para confirmar.
              </p>
            )}
            {status === 'error' && (
              <p style={{ color: 'var(--text-light)', fontSize: '14px', marginTop: '12px' }}>
                Error al crear la reserva. Intente de nuevo.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
