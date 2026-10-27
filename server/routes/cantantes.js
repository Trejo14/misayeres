import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import { deleteImageIfUnused } from './images.js';

const router = Router();

const tipoMedia = (tipo) => (tipo === 'video' ? 'video' : 'imagen');

function validar({ nombre }) {
  if (!nombre?.trim()) return 'El nombre es requerido';
  if (nombre.length > 120) return 'El nombre es demasiado largo';
  return null;
}

router.get('/', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const items = await query('SELECT * FROM cantantes ORDER BY nombre');
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const { nombre, foto, foto_tipo } = req.body;

    const error = validar(req.body);
    if (error) return res.status(400).json({ error });

    const result = await run(
      'INSERT INTO cantantes (nombre, foto, foto_tipo) VALUES ($1, $2, $3) RETURNING *',
      [nombre.trim(), foto || '', tipoMedia(foto_tipo)]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const { nombre, foto, foto_tipo } = req.body;

    const error = validar(req.body);
    if (error) return res.status(400).json({ error });

    const actual = await query('SELECT foto FROM cantantes WHERE id = $1', [req.params.id]);
    if (actual.length === 0) {
      return res.status(404).json({ error: 'Cantante no encontrado' });
    }

    await run('UPDATE cantantes SET nombre=$1, foto=$2, foto_tipo=$3 WHERE id=$4', [nombre.trim(), foto || '', tipoMedia(foto_tipo), req.params.id]);

    if (actual[0].foto !== (foto || '')) {
      await deleteImageIfUnused(actual[0].foto);
    }

    res.json({ message: 'Cantante actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const result = await run('DELETE FROM cantantes WHERE id = $1 RETURNING foto', [req.params.id]);
    if (result.rows[0]) {
      await deleteImageIfUnused(result.rows[0].foto);
    }
    res.json({ message: 'Cantante eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
