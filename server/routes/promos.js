import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import { deleteImageIfUnused } from './images.js';

const router = Router();

const MAX_DESCRIPCION = 300;

function validar({ titulo, descripcion, media, media_tipo }) {
  if (!titulo?.trim() || !media) {
    return 'El título y la foto o video son requeridos';
  }
  if (titulo.length > 120) {
    return 'El título es demasiado largo';
  }
  if ((descripcion || '').length > MAX_DESCRIPCION) {
    return `La descripción no puede pasar de ${MAX_DESCRIPCION} caracteres`;
  }
  if (!['imagen', 'video'].includes(media_tipo)) {
    return 'Tipo de archivo inválido';
  }
  return null;
}

router.get('/', async (req, res) => {
  try {
    const items = await query('SELECT * FROM promos WHERE activa = 1 ORDER BY created_at DESC, id DESC');
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/all', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const items = await query('SELECT * FROM promos ORDER BY created_at DESC, id DESC');
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const { titulo, descripcion, media, media_tipo, activa } = req.body;

    const error = validar(req.body);
    if (error) return res.status(400).json({ error });

    await run(
      'INSERT INTO promos (titulo, descripcion, media, media_tipo, activa) VALUES ($1, $2, $3, $4, $5)',
      [titulo.trim(), (descripcion || '').trim(), media, media_tipo, activa === undefined || activa ? 1 : 0]
    );

    res.status(201).json({ message: 'Promo creada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const { titulo, descripcion, media, media_tipo, activa } = req.body;

    const error = validar(req.body);
    if (error) return res.status(400).json({ error });

    const actual = await query('SELECT media FROM promos WHERE id = $1', [req.params.id]);
    if (actual.length === 0) {
      return res.status(404).json({ error: 'Promo no encontrada' });
    }

    await run(
      'UPDATE promos SET titulo=$1, descripcion=$2, media=$3, media_tipo=$4, activa=$5 WHERE id=$6',
      [titulo.trim(), (descripcion || '').trim(), media, media_tipo, activa !== undefined ? (activa ? 1 : 0) : 1, req.params.id]
    );

    if (actual[0].media !== media) {
      await deleteImageIfUnused(actual[0].media);
    }

    res.json({ message: 'Promo actualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const result = await run('DELETE FROM promos WHERE id = $1 RETURNING media', [req.params.id]);
    if (result.rows[0]) {
      await deleteImageIfUnused(result.rows[0].media);
    }
    res.json({ message: 'Promo eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
