import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'restaurante.db');

let db = null;

export async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'empleado' CHECK(rol IN ('dueno', 'admin', 'empleado')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS platillos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL NOT NULL,
    categoria TEXT NOT NULL,
    imagen TEXT,
    disponible INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_cliente TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    personas INTEGER NOT NULL,
    notas TEXT,
    estado TEXT DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS quejas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reportero_id INTEGER NOT NULL,
    empleado_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    estado TEXT DEFAULT 'abierta' CHECK(estado IN ('abierta', 'investigando', 'resuelta', 'cerrada')),
    fecha_resuelta DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reportero_id) REFERENCES usuarios(id),
    FOREIGN KEY (empleado_id) REFERENCES usuarios(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS contactos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    leido INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  saveDB();
  return db;
}

export function getDB() {
  return db;
}

export function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export function query(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function run(sql, params = []) {
  if (params.length > 0) {
    db.run(sql, params);
  } else {
    db.run(sql);
  }
}
