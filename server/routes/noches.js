import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

function fechaValida(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor || '')) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

// Programa de los 7 dias que empiezan en `desde`. La promo solo se incluye
// si sigue activa; promo_id se envia siempre para que el panel la muestre.
// `cantante` es el nombre del cantante elegido del catalogo.
router.get('/', async (req, res) => {
  try {
    const { desde } = req.query;
    if (!fechaValida(desde)) {
      return res.status(400).json({ error: 'Fecha inválida' });
    }

    const items = await query(
      `SELECT n.fecha, n.promo_id, n.cantante_id, n.evento,
              c.nombre AS cantante, c.foto AS cantante_foto,
              p.titulo AS promo_titulo, p.descripcion AS promo_descripcion,
              p.media AS promo_media, p.media_tipo AS promo_media_tipo
         FROM noches n
         LEFT JOIN promos p ON p.id = n.promo_id AND p.activa = 1
         LEFT JOIN cantantes c ON c.id = n.cantante_id
        WHERE n.fecha BETWEEN $1::date AND $1::date + 6
        ORDER BY n.fecha`,
      [desde]
    );
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Copia el programa de una semana a otra sin tocar los dias que ya tienen algo.
router.post('/copiar', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const { desde, hacia } = req.body;
    if (!fechaValida(desde) || !fechaValida(hacia) || desde === hacia) {
      return res.status(400).json({ error: 'Fechas inválidas' });
    }

    const result = await run(
      `INSERT INTO noches (fecha, promo_id, cantante_id, evento)
       SELECT fecha + ($2::date - $1::date), promo_id, cantante_id, evento
         FROM noches
        WHERE fecha BETWEEN $1::date AND $1::date + 6
       ON CONFLICT (fecha) DO NOTHING`,
      [desde, hacia]
    );

    res.json({ message: 'Semana copiada', copiados: result.rowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:fecha', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const { fecha } = req.params;
    if (!fechaValida(fecha)) {
      return res.status(400).json({ error: 'Fecha inválida' });
    }

    const evento = (req.body.evento || '').trim();
    const promoId = req.body.promo_id ? parseInt(req.body.promo_id) : null;
    const cantanteId = req.body.cantante_id ? parseInt(req.body.cantante_id) : null;

    if (evento.length > 160) {
      return res.status(400).json({ error: 'El texto es demasiado largo' });
    }
    if (cantanteId !== null) {
      if (Number.isNaN(cantanteId)) return res.status(400).json({ error: 'Cantante inválido' });
      const cantante = await query('SELECT id FROM cantantes WHERE id = $1', [cantanteId]);
      if (cantante.length === 0) return res.status(400).json({ error: 'El cantante ya no existe' });
    }
    if (promoId !== null) {
      if (Number.isNaN(promoId)) return res.status(400).json({ error: 'Promo inválida' });
      const promo = await query('SELECT id FROM promos WHERE id = $1', [promoId]);
      if (promo.length === 0) return res.status(400).json({ error: 'La promo ya no existe' });
    }

    // Un dia sin nada asignado no ocupa fila.
    if (cantanteId === null && !evento && promoId === null) {
      await run('DELETE FROM noches WHERE fecha = $1', [fecha]);
      return res.json({ message: 'Día vaciado' });
    }

    await run(
      `INSERT INTO noches (fecha, promo_id, cantante_id, evento) VALUES ($1, $2, $3, $4)
       ON CONFLICT (fecha) DO UPDATE
         SET promo_id = EXCLUDED.promo_id, cantante_id = EXCLUDED.cantante_id,
             evento = EXCLUDED.evento, updated_at = CURRENT_TIMESTAMP`,
      [fecha, promoId, cantanteId, evento]
    );

    res.json({ message: 'Día actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
