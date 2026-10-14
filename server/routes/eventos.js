import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import { deleteImageIfUnused } from './images.js';

const router = Router();

const MAX_DESCRIPCION = 400;

function validar({ titulo, descripcion, fecha }) {
  if (!titulo?.trim()) {
    return 'El título es requerido';
  }
  if (titulo.length > 120) {
    return 'El título es demasiado largo';
  }
  if ((descripcion || '').length > MAX_DESCRIPCION) {
    return `La descripción no puede pasar de ${MAX_DESCRIPCION} caracteres`;
  }
  if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return 'Fecha inválida';
  }
  return null;
}

// Eventos visibles en el sitio: activos y sin fecha o con fecha de hoy en adelante.
router.get('/', async (req, res) => {
  try {
    const items = await query(
      `SELECT * FROM eventos
        WHERE activa = 1 AND (fecha IS NULL OR fecha >= CURRENT_DATE)
        ORDER BY fecha ASC NULLS LAST, id DESC`
    );
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/all', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const items = await query('SELECT * FROM eventos ORDER BY fecha DESC NULLS FIRST, id DESC');
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const { titulo, descripcion, fecha, imagen, activa } = req.body;

    const error = validar(req.body);
    if (error) return res.status(400).json({ error });

    await run(
      'INSERT INTO eventos (titulo, descripcion, fecha, imagen, activa) VALUES ($1, $2, $3, $4, $5)',
      [titulo.trim(), (descripcion || '').trim(), fecha || null, imagen || null, activa === undefined || activa ? 1 : 0]
    );

    res.status(201).json({ message: 'Evento creado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const { titulo, descripcion, fecha, imagen, activa } = req.body;

    const error = validar(req.body);
    if (error) return res.status(400).json({ error });

    const actual = await query('SELECT imagen FROM eventos WHERE id = $1', [req.params.id]);
    if (actual.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    await run(
      'UPDATE eventos SET titulo=$1, descripcion=$2, fecha=$3, imagen=$4, activa=$5 WHERE id=$6',
      [titulo.trim(), (descripcion || '').trim(), fecha || null, imagen || null, activa !== undefined ? (activa ? 1 : 0) : 1, req.params.id]
    );

    if (actual[0].imagen && actual[0].imagen !== imagen) {
      await deleteImageIfUnused(actual[0].imagen);
    }

    res.json({ message: 'Evento actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const result = await run('DELETE FROM eventos WHERE id = $1 RETURNING imagen', [req.params.id]);
    if (result.rows[0]?.imagen) {
      await deleteImageIfUnused(result.rows[0].imagen);
    }
    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
