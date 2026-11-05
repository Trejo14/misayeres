import { Router } from 'express';
import pool, { query } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

// Control de mesas para la hostess. Cada cambio se avisa al instante a todos
// los paneles abiertos por Server-Sent Events (/api/mesas/stream).
const router = Router();

// Cuadricula de cada zona. Las mesas extra ocupan las casillas despues de las base.
export const ZONAS = {
  piso: { nombre: 'Piso', prefijo: 'P', base: 9, columnas: 3, maxExtra: 5 },
  terraza: { nombre: 'Terraza', prefijo: 'T', base: 20, columnas: 5, maxExtra: 5 },
};

const ESTADOS = ['libre', 'reservada', 'ocupada'];
const MAX_PERSONAS = 99;

export function adyacentes(zona, a, b) {
  const c = ZONAS[zona].columnas;
  return Math.abs(Math.floor(a / c) - Math.floor(b / c)) + Math.abs((a % c) - (b % c)) === 1;
}

// Cada mesa cuadrada tiene una silla por lado. Al juntar dos mesas se pierden
// las dos sillas del lado que se toca: 1 mesa = 4, 2 en fila = 6, 3 = 8, 2x2 = 8.
export function capacidad(zona, posiciones) {
  let pares = 0;
  for (let i = 0; i < posiciones.length; i++) {
    for (let j = i + 1; j < posiciones.length; j++) {
      if (adyacentes(zona, posiciones[i], posiciones[j])) pares++;
    }
  }
  return posiciones.length * 4 - pares * 2;
}

function conectadas(zona, posiciones) {
  const vistos = new Set([posiciones[0]]);
  const pila = [posiciones[0]];
  while (pila.length) {
    const actual = pila.pop();
    for (const p of posiciones) {
      if (!vistos.has(p) && adyacentes(zona, actual, p)) {
        vistos.add(p);
        pila.push(p);
      }
    }
  }
  return vistos.size === posiciones.length;
}

class ErrorMesa extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

// --- Tiempo real ---------------------------------------------------------

const clientes = new Set();

async function estadoActual() {
  return query('SELECT id, zona, pos, extra, grupo, estado, personas, nota, desde FROM mesas ORDER BY zona, pos');
}

async function emitir() {
  if (clientes.size === 0) return;
  try {
    const datos = `data: ${JSON.stringify(await estadoActual())}\n\n`;
    for (const res of clientes) res.write(datos);
  } catch (err) {
    console.error('No se pudo avisar el cambio de mesas:', err);
  }
}

// EventSource no puede mandar encabezados, asi que el token llega en la URL.
router.get('/stream', (req, res, next) => {
  if (req.query.token) req.headers.authorization = `Bearer ${req.query.token}`;
  next();
}, authMiddleware, async (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();
  res.write('retry: 3000\n\n');

  clientes.add(res);
  // Comentario periodico para que los proxies no corten la conexion inactiva.
  const latido = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => {
    clearInterval(latido);
    clientes.delete(res);
  });

  try {
    res.write(`data: ${JSON.stringify(await estadoActual())}\n\n`);
  } catch (err) {
    console.error(err);
  }
});

// --- Lectura y cambios ---------------------------------------------------

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    res.json({ zonas: ZONAS, mesas: await estadoActual() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Ejecuta un cambio en transaccion. El candado evita que dos hostess junten o
// cambien las mismas mesas al mismo tiempo.
const cambio = (fn) => async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(7301)');
    const respuesta = await fn(req, client);
    await client.query('COMMIT');
    res.json(respuesta || { ok: true });
    emitir();
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (err instanceof ErrorMesa) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    client.release();
  }
};

async function grupoDe(client, id) {
  const { rows } = await client.query('SELECT * FROM mesas WHERE id = $1', [parseInt(id) || 0]);
  if (rows.length === 0) throw new ErrorMesa(404, 'Mesa no encontrada');
  const mesa = rows[0];
  if (!mesa.grupo) return { mesa, miembros: [mesa], principal: mesa.id };
  const miembros = (await client.query('SELECT * FROM mesas WHERE grupo = $1 ORDER BY pos', [mesa.grupo])).rows;
  return { mesa, miembros, principal: mesa.grupo };
}

// Cambia el estado de una mesa (o de todo su grupo si esta unida).
router.put('/:id/estado', cambio(async (req, client) => {
  const { miembros, principal } = await grupoDe(client, req.params.id);
  const estado = req.body.estado;
  if (!ESTADOS.includes(estado)) throw new ErrorMesa(400, 'Estado inválido');

  let personas = parseInt(req.body.personas) || 0;
  const nota = String(req.body.nota || '').trim().slice(0, 80);
  if (personas < 0 || personas > MAX_PERSONAS) throw new ErrorMesa(400, 'Número de personas inválido');
  if (estado === 'ocupada' && personas < 1) throw new ErrorMesa(400, 'Indica cuántas personas hay en la mesa');
  if (estado === 'libre') personas = 0;

  // Si la mesa ya estaba en el mismo estado se conserva la hora de llegada.
  const mismoEstado = miembros[0].estado === estado;
  const desde = estado === 'libre' ? null : (mismoEstado && miembros[0].desde) || new Date();

  await client.query(
    `UPDATE mesas SET estado = $1, nota = $2, desde = $3,
            personas = CASE WHEN id = $4 THEN $5 ELSE 0 END
      WHERE id = ANY($6::int[])`,
    [estado, estado === 'libre' ? '' : nota, desde, principal, personas, miembros.map(m => m.id)]
  );
}));

// Junta mesas que se tocan. Puede incluir mesas ya unidas (se agrega el grupo
// completo). Solo una de las partes puede estar ocupada o reservada; el grupo
// nuevo conserva ese estado, por ejemplo cuando llegan mas personas a una mesa.
router.post('/unir', cambio(async (req, client) => {
  const ids = [...new Set((req.body.ids || []).map(n => parseInt(n)).filter(Boolean))];
  if (ids.length < 2) throw new ErrorMesa(400, 'Selecciona al menos dos mesas');

  const elegidas = (await client.query('SELECT * FROM mesas WHERE id = ANY($1::int[])', [ids])).rows;
  if (elegidas.length !== ids.length) throw new ErrorMesa(400, 'Alguna mesa ya no existe');
  const zona = elegidas[0].zona;
  if (elegidas.some(m => m.zona !== zona)) throw new ErrorMesa(400, 'Solo se pueden juntar mesas de la misma zona');

  const grupos = elegidas.map(m => m.grupo).filter(Boolean);
  const todas = (await client.query(
    'SELECT * FROM mesas WHERE id = ANY($1::int[]) OR grupo = ANY($2::int[]) ORDER BY pos',
    [ids, grupos]
  )).rows;

  // Cada parte es una mesa suelta o un grupo ya unido.
  const partes = new Map();
  for (const m of todas) {
    const clave = m.grupo || m.id;
    if (!partes.has(clave)) partes.set(clave, []);
    partes.get(clave).push(m);
  }
  if (partes.size < 2) throw new ErrorMesa(400, 'Esas mesas ya están unidas');

  const conGente = [...partes.values()].filter(p => p[0].estado !== 'libre');
  if (conGente.length > 1) throw new ErrorMesa(400, 'Solo una de las mesas puede estar ocupada o reservada');

  if (!conectadas(zona, todas.map(m => m.pos))) {
    throw new ErrorMesa(400, 'Las mesas deben estar una junto a otra para poder juntarlas');
  }

  const principal = todas[0].id;
  const base = conGente[0] || null;
  const personas = base ? base.reduce((s, m) => s + m.personas, 0) : 0;
  await client.query(
    `UPDATE mesas SET grupo = $1, estado = $2, nota = $3, desde = $4,
            personas = CASE WHEN id = $1 THEN $5 ELSE 0 END
      WHERE id = ANY($6::int[])`,
    [principal, base ? base[0].estado : 'libre', base ? base[0].nota : '', base ? base[0].desde : null,
      personas, todas.map(m => m.id)]
  );
}));

router.post('/:id/separar', cambio(async (req, client) => {
  const { mesa, miembros } = await grupoDe(client, req.params.id);
  if (!mesa.grupo) throw new ErrorMesa(400, 'La mesa no está unida a otra');
  if (mesa.estado !== 'libre') throw new ErrorMesa(400, 'Libera las mesas antes de separarlas');
  await client.query('UPDATE mesas SET grupo = NULL WHERE id = ANY($1::int[])', [miembros.map(m => m.id)]);
}));

router.post('/zona/:zona/agregar', cambio(async (req, client) => {
  const zona = ZONAS[req.params.zona];
  if (!zona) throw new ErrorMesa(400, 'Zona inválida');
  const usadas = (await client.query('SELECT pos FROM mesas WHERE zona = $1 AND extra', [req.params.zona])).rows.map(r => r.pos);
  if (usadas.length >= zona.maxExtra) {
    throw new ErrorMesa(400, `Solo se pueden agregar ${zona.maxExtra} mesas extra en ${zona.nombre}`);
  }
  let pos = zona.base;
  while (usadas.includes(pos)) pos++;
  await client.query('INSERT INTO mesas (zona, pos, extra) VALUES ($1, $2, true)', [req.params.zona, pos]);
}));

router.delete('/:id', cambio(async (req, client) => {
  const { mesa } = await grupoDe(client, req.params.id);
  if (!mesa.extra) throw new ErrorMesa(400, 'Solo se pueden quitar las mesas extra');
  if (mesa.grupo) throw new ErrorMesa(400, 'Separa la mesa antes de quitarla');
  if (mesa.estado !== 'libre') throw new ErrorMesa(400, 'Libera la mesa antes de quitarla');
  await client.query('DELETE FROM mesas WHERE id = $1', [mesa.id]);
}));

// Fin del turno: libera y separa todas las mesas de la zona.
router.post('/zona/:zona/reiniciar', roleMiddleware('dueno', 'admin'), cambio(async (req, client) => {
  if (!ZONAS[req.params.zona]) throw new ErrorMesa(400, 'Zona inválida');
  await client.query(
    "UPDATE mesas SET grupo = NULL, estado = 'libre', personas = 0, nota = '', desde = NULL WHERE zona = $1",
    [req.params.zona]
  );
}));

export default router;
