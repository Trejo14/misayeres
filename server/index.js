import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './db.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import menuRoutes from './routes/menu.js';
import reservationsRoutes from './routes/reservations.js';
import clientsRoutes from './routes/clients.js';
import complaintsRoutes from './routes/complaints.js';
import dashboardRoutes from './routes/dashboard.js';
import contactRoutes from './routes/contact.js';
import imagesRoutes from './routes/images.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/images', imagesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contact', contactRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Antes una ruta /api inexistente dejaba la peticion colgada sin respuesta.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

async function start() {
  try {
    await initDB();
  } catch (err) {
    console.error('No se pudo inicializar la base de datos:', err);
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}

start();
