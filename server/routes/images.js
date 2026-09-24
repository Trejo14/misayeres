import { Router } from 'express';
import multer from 'multer';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

const MAX_SIZE = 5 * 1024 * 1024;
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (TIPOS_PERMITIDOS.includes(file.mimetype)) cb(null, true);
    else cb(new Error('TIPO_INVALIDO'));
  },
});

const IMAGE_URL = /^\/api\/images\/(\d+)$/;

// Borra una imagen subida si la URL apunta a una y ningun platillo la usa ya.
export async function deleteImageIfUnused(url) {
  const match = IMAGE_URL.exec(url || '');
  if (!match) return;
  const uses = await query('SELECT COUNT(*)::int as total FROM platillos WHERE imagen = $1', [url]);
  if (uses[0].total === 0) {
    await run('DELETE FROM imagenes WHERE id = $1', [match[1]]);
  }
}

router.post('/', authMiddleware, roleMiddleware('dueno', 'admin'), (req, res) => {
  upload.single('imagen')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'La imagen no puede pesar mas de 5 MB' });
      }
      if (err.message === 'TIPO_INVALIDO') {
        return res.status(400).json({ error: 'Formato no permitido. Usa JPG, PNG, WEBP o GIF' });
      }
      console.error(err);
      return res.status(500).json({ error: 'Error al subir la imagen' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se recibio ninguna imagen' });
    }

    try {
      const result = await run(
        'INSERT INTO imagenes (mime, datos) VALUES ($1, $2) RETURNING id',
        [req.file.mimetype, req.file.buffer]
      );
      res.status(201).json({ url: `/api/images/${result.rows[0].id}` });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error al guardar la imagen' });
    }
  });
});

router.get('/:id', async (req, res) => {
  try {
    const rows = await query('SELECT mime, datos FROM imagenes WHERE id = $1', [parseInt(req.params.id) || 0]);
    if (rows.length === 0) return res.status(404).end();

    // Las imagenes nunca cambian (una nueva subida crea un id nuevo), asi que se cachean.
    res.set('Content-Type', rows[0].mime);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(rows[0].datos);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

export default router;
