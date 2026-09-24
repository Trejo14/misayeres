import jwt from 'jsonwebtoken';
import { query } from '../db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'restaurante-secret-key-2024';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('ADVERTENCIA: JWT_SECRET no esta definido; se usa una clave por defecto insegura.');
}

// Ademas de validar el token se lee el usuario de la base, para que un usuario
// eliminado o con el rol cambiado no siga operando con los datos viejos del token.
export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token requerido' });

  const token = header.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }

  try {
    const users = await query('SELECT id, nombre, email, rol FROM usuarios WHERE id = $1', [decoded.id]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    req.user = users[0];
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

export function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    next();
  };
}
