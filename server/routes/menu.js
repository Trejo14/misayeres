import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;

    let sql = 'SELECT * FROM platillos WHERE disponible = 1';
    const params = [];

    if (categoria) {
      params.push(categoria);
      sql += ` AND categoria = $${params.length}`;
    }

    sql += ' ORDER BY categoria, nombre';

    const items = await query(sql, params);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/all', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const items = await query('SELECT * FROM platillos ORDER BY categoria, nombre');
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria, imagen } = req.body;

    if (!nombre || !precio || !categoria) {
      return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
    }

    await run(
      'INSERT INTO platillos (nombre, descripcion, precio, categoria, imagen) VALUES ($1, $2, $3, $4, $5)',
      [nombre, descripcion || '', parseFloat(precio), categoria, imagen || '']
    );

    res.status(201).json({ message: 'Platillo creado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria, imagen, disponible } = req.body;

    await run(
      'UPDATE platillos SET nombre=$1, descripcion=$2, precio=$3, categoria=$4, imagen=$5, disponible=$6 WHERE id=$7',
      [nombre, descripcion, parseFloat(precio), categoria, imagen || '', disponible !== undefined ? (disponible ? 1 : 0) : 1, req.params.id]
    );

    res.json({ message: 'Platillo actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    await run('DELETE FROM platillos WHERE id = $1', [req.params.id]);
    res.json({ message: 'Platillo eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
