import { Router } from 'express';
import multer from 'multer';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

const MAX_SIZE = 5 * 1024 * 1024;
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const MAX_VIDEO = 50 * 1024 * 1024;
const VIDEOS_PERMITIDOS = ['video/mp4', 'video/webm', 'video/quicktime'];
// Tamano maximo de cada fragmento de video que se envia por peticion.
const FRAGMENTO = 2 * 1024 * 1024;

const crearUpload = (tipos, limite) => multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: limite },
  fileFilter: (req, file, cb) => {
    if (tipos.includes(file.mimetype)) cb(null, true);
    else cb(new Error('TIPO_INVALIDO'));
  },
});

const upload = crearUpload(TIPOS_PERMITIDOS, MAX_SIZE);
const uploadVideo = crearUpload(VIDEOS_PERMITIDOS, MAX_VIDEO);

const IMAGE_URL = /^\/api\/images\/(\d+)$/;

// Borra un archivo subido si la URL apunta a uno y ya no lo usa ningun platillo ni promo.
export async function deleteImageIfUnused(url) {
  const match = IMAGE_URL.exec(url || '');
  if (!match) return;
  const uses = await query(
    `SELECT (SELECT COUNT(*) FROM platillos WHERE imagen = $1)::int
          + (SELECT COUNT(*) FROM promos WHERE media = $1)::int AS total`,
    [url]
  );
  if (uses[0].total === 0) {
    await run('DELETE FROM imagenes WHERE id = $1', [match[1]]);
  }
}

// Guarda el archivo recibido en la base y responde con su URL.
const guardar = (subida, campo, mensajes) => (req, res) => {
  subida.single(campo)(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: mensajes.peso });
      }
      if (err.message === 'TIPO_INVALIDO') {
        return res.status(400).json({ error: mensajes.tipo });
      }
      console.error(err);
      return res.status(500).json({ error: mensajes.subir });
    }

    if (!req.file) {
      return res.status(400).json({ error: mensajes.vacio });
    }

    try {
      const result = await run(
        'INSERT INTO imagenes (mime, datos) VALUES ($1, $2) RETURNING id',
        [req.file.mimetype, req.file.buffer]
      );
      res.status(201).json({ url: `/api/images/${result.rows[0].id}` });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: mensajes.guardar });
    }
  });
};

router.post('/', authMiddleware, roleMiddleware('dueno', 'admin'), guardar(upload, 'imagen', {
  peso: 'La imagen no puede pesar mas de 5 MB',
  tipo: 'Formato no permitido. Usa JPG, PNG, WEBP o GIF',
  subir: 'Error al subir la imagen',
  vacio: 'No se recibio ninguna imagen',
  guardar: 'Error al guardar la imagen',
}));

router.post('/video', authMiddleware, roleMiddleware('dueno', 'admin'), guardar(uploadVideo, 'video', {
  peso: 'El video no puede pesar mas de 50 MB',
  tipo: 'Formato no permitido. Usa MP4, WEBM o MOV',
  subir: 'Error al subir el video',
  vacio: 'No se recibio ningun video',
  guardar: 'Error al guardar el video',
}));

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id) || 0;
    const meta = await query('SELECT mime, octet_length(datos) AS total FROM imagenes WHERE id = $1', [id]);
    if (meta.length === 0) return res.status(404).end();
    const { mime, total } = meta[0];

    // Los archivos nunca cambian (una nueva subida crea un id nuevo), asi que se cachean.
    res.set('Content-Type', mime);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.set('Accept-Ranges', 'bytes');

    const rango = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (!rango || (rango[1] === '' && rango[2] === '')) {
      const rows = await query('SELECT datos FROM imagenes WHERE id = $1', [id]);
      if (rows.length === 0) return res.status(404).end();
      return res.send(rows[0].datos);
    }

    // Los navegadores piden los videos por rangos; se responde por fragmentos
    // para no cargar el archivo completo en memoria en cada peticion.
    let inicio;
    let fin;
    if (rango[1] === '') {
      inicio = Math.max(0, total - parseInt(rango[2]));
      fin = total - 1;
    } else {
      inicio = parseInt(rango[1]);
      fin = rango[2] === '' ? total - 1 : Math.min(parseInt(rango[2]), total - 1);
    }
    if (inicio >= total || inicio > fin) {
      return res.status(416).set('Content-Range', `bytes */${total}`).end();
    }
    fin = Math.min(fin, inicio + FRAGMENTO - 1);

    const rows = await query(
      'SELECT substring(datos from $2::int for $3::int) AS datos FROM imagenes WHERE id = $1',
      [id, inicio + 1, fin - inicio + 1]
    );
    if (rows.length === 0) return res.status(404).end();

    res.status(206);
    res.set('Content-Range', `bytes ${inicio}-${fin}/${total}`);
    res.send(rows[0].datos);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

export default router;
