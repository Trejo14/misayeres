import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import { deleteImageIfUnused } from './images.js';

const router = Router();

function validar({ nombre, precio, categoria }) {
  if (!nombre?.trim() || precio === undefined || precio === '' || !categoria) {
    return 'Nombre, precio y categoría son requeridos';
  }
  const valor = parseFloat(precio);
  if (Number.isNaN(valor) || valor < 0) {
    return 'El precio debe ser un número mayor o igual a 0';
  }
  return null;
}

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
    const { nombre, descripcion, precio, categoria, imagen, disponible } = req.body;

    const error = validar(req.body);
    if (error) return res.status(400).json({ error });

    await run(
      'INSERT INTO platillos (nombre, descripcion, precio, categoria, imagen, disponible) VALUES ($1, $2, $3, $4, $5, $6)',
      [nombre.trim(), descripcion || '', parseFloat(precio), categoria, imagen || '', disponible === undefined || disponible ? 1 : 0]
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

    const error = validar(req.body);
    if (error) return res.status(400).json({ error });

    const actual = await query('SELECT imagen FROM platillos WHERE id = $1', [req.params.id]);
    if (actual.length === 0) {
      return res.status(404).json({ error: 'Platillo no encontrado' });
    }

    await run(
      'UPDATE platillos SET nombre=$1, descripcion=$2, precio=$3, categoria=$4, imagen=$5, disponible=$6 WHERE id=$7',
      [nombre.trim(), descripcion || '', parseFloat(precio), categoria, imagen || '', disponible !== undefined ? (disponible ? 1 : 0) : 1, req.params.id]
    );

    if (actual[0].imagen !== (imagen || '')) {
      await deleteImageIfUnused(actual[0].imagen);
    }

    res.json({ message: 'Platillo actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const result = await run('DELETE FROM platillos WHERE id = $1 RETURNING imagen', [req.params.id]);
    if (result.rows[0]) {
      await deleteImageIfUnused(result.rows[0].imagen);
    }
    res.json({ message: 'Platillo eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
