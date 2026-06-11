import bcrypt from 'bcryptjs';
import { initDB, query, run, saveDB } from './db.js';

async function seed() {
  await initDB();

  const existing = query('SELECT id FROM usuarios WHERE email = ?', ['dueno@restaurante.com']);

  if (existing.length === 0) {
    const password = bcrypt.hashSync('admin123', 10);
    run('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      ['Dueño', 'dueno@restaurante.com', password, 'dueno']);

    const adminPassword = bcrypt.hashSync('admin123', 10);
    run('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      ['Admin', 'admin@restaurante.com', adminPassword, 'admin']);

    const empPassword = bcrypt.hashSync('empleado123', 10);
    run('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      ['Empleado1', 'empleado1@restaurante.com', empPassword, 'empleado']);

    saveDB();
    console.log('Usuarios semilla creados:');
    console.log('  Dueño:    dueno@restaurante.com / admin123');
    console.log('  Admin:    admin@restaurante.com / admin123');
    console.log('  Empleado: empleado1@restaurante.com / empleado123');
  } else {
    console.log('Ya existen usuarios en la BD');
  }
}

seed().catch(console.error);
