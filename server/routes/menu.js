import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const { categoria } = req.query;

  let sql = 'SELECT * FROM platillos WHERE disponible = 1';
  const params = [];

  if (categoria) {
    sql += ' AND categoria = ?';
    params.push(categoria);
  }

  sql += ' ORDER BY categoria, nombre';

  const items = query(sql, params);
  res.json(items);
});

router.get('/all', authMiddleware, roleMiddleware('dueno', 'admin'), (req, res) => {
  const items = query('SELECT * FROM platillos ORDER BY categoria, nombre');
  res.json(items);
});

router.post('/', authMiddleware, roleMiddleware('dueno', 'admin'), (req, res) => {
  const { nombre, descripcion, precio, categoria, imagen } = req.body;

  if (!nombre || !precio || !categoria) {
    return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
  }

  run(
    'INSERT INTO platillos (nombre, descripcion, precio, categoria, imagen) VALUES (?, ?, ?, ?, ?)',
    [nombre, descripcion || '', parseFloat(precio), categoria, imagen || '']
  );

  res.status(201).json({ message: 'Platillo creado' });
});

router.put('/:id', authMiddleware, roleMiddleware('dueno', 'admin'), (req, res) => {
  const { nombre, descripcion, precio, categoria, imagen, disponible } = req.body;

  run(
    'UPDATE platillos SET nombre=?, descripcion=?, precio=?, categoria=?, imagen=?, disponible=? WHERE id=?',
    [nombre, descripcion, parseFloat(precio), categoria, imagen || '', disponible !== undefined ? (disponible ? 1 : 0) : 1, req.params.id]
  );

  res.json({ message: 'Platillo actualizado' });
});

router.delete('/:id', authMiddleware, roleMiddleware('dueno', 'admin'), (req, res) => {
  run('DELETE FROM platillos WHERE id = ?', [req.params.id]);
  res.json({ message: 'Platillo eliminado' });
});

export default router;
