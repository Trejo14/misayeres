import pkg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool, types } = pkg;

// Devuelve las columnas DATE como texto 'YYYY-MM-DD' en lugar de un Date de JS,
// que al serializarse a JSON puede correrse un dia por la zona horaria.
types.setTypeParser(1082, (value) => value);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
});

export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        rol TEXT NOT NULL DEFAULT 'empleado' CHECK(rol IN ('dueno', 'admin', 'empleado')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS platillos (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio REAL NOT NULL,
        categoria TEXT NOT NULL,
        imagen TEXT,
        disponible INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS reservas (
        id SERIAL PRIMARY KEY,
        nombre_cliente TEXT NOT NULL,
        telefono TEXT NOT NULL,
        email TEXT,
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        personas INTEGER NOT NULL,
        notas TEXT,
        estado TEXT DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        telefono TEXT NOT NULL,
        email TEXT,
        alergias TEXT,
        tipo_cliente TEXT DEFAULT 'normal' CHECK(tipo_cliente IN ('normal', 'vip', 'empresarial')),
        fecha_cumpleanos DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS quejas (
        id SERIAL PRIMARY KEY,
        reportero_id INTEGER NOT NULL REFERENCES usuarios(id),
        empleado_id INTEGER NOT NULL REFERENCES usuarios(id),
        tipo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        estado TEXT DEFAULT 'abierta' CHECK(estado IN ('abierta', 'investigando', 'resuelta', 'cerrada')),
        fecha_resuelta TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS contactos (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL,
        mensaje TEXT NOT NULL,
        leido INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Imagenes subidas desde el panel. Se guardan en la base de datos para que
    // sobrevivan a los redeploys (el disco del contenedor es efimero).
    await client.query(`
      CREATE TABLE IF NOT EXISTS imagenes (
        id SERIAL PRIMARY KEY,
        mime TEXT NOT NULL,
        datos BYTEA NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migraciones de quejas: cualquier usuario puede enviarlas, de forma anonima
    // (sin reportero) y sin que sean necesariamente sobre un empleado concreto.
    await client.query('ALTER TABLE quejas ALTER COLUMN reportero_id DROP NOT NULL');
    await client.query('ALTER TABLE quejas ALTER COLUMN empleado_id DROP NOT NULL');
    await client.query('ALTER TABLE quejas ADD COLUMN IF NOT EXISTS anonima BOOLEAN DEFAULT false');

    const result = await client.query('SELECT COUNT(*) as count FROM usuarios');
    if (parseInt(result.rows[0].count) === 0) {
      const password = bcrypt.hashSync('admin123', 10);
      await client.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
        ['Dueño', 'dueno@restaurante.com', password, 'dueno']
      );
      await client.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
        ['Admin', 'admin@restaurante.com', bcrypt.hashSync('admin123', 10), 'admin']
      );
      await client.query(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
        ['Empleado1', 'empleado1@restaurante.com', bcrypt.hashSync('empleado123', 10), 'empleado']
      );
      console.log('Usuarios por defecto creados');
    }
  } finally {
    client.release();
  }
}

export async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

export async function run(sql, params = []) {
  const result = await pool.query(sql, params);
  return result;
}

export default pool;
