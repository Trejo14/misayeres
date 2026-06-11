import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, run } from '../db.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'restaurante-secret-key-2024';

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const users = query('SELECT * FROM usuarios WHERE email = ?', [email]);
  if (users.length === 0) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const user = users[0];
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
  });
});

router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

export default router;
