import { Router } from 'express';
import { query, run } from '../db.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();
const TIPOS_CLIENTE = ['normal', 'vip', 'empresarial'];

router.get('/', authMiddleware, roleMiddleware('dueno', 'admin', 'empleado'), async (req, res) => {
  try {
    const items = await query('SELECT * FROM clientes ORDER BY created_at DESC');
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const { nombre, telefono, email, alergias, tipo_cliente, fecha_cumpleanos } = req.body;

    if (!nombre || !telefono) {
      return res.status(400).json({ error: 'Campos requeridos: nombre, telefono' });
    }

    if (tipo_cliente && !TIPOS_CLIENTE.includes(tipo_cliente)) {
      return res.status(400).json({ error: 'Tipo de cliente inválido' });
    }

    await run(
      `INSERT INTO clientes (nombre, telefono, email, alergias, tipo_cliente, fecha_cumpleanos)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [nombre, telefono, email || '', alergias || '', tipo_cliente || 'normal', fecha_cumpleanos || null]
    );

    res.status(201).json({ message: 'Cliente creado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    const { nombre, telefono, email, alergias, tipo_cliente, fecha_cumpleanos } = req.body;

    if (!nombre || !telefono) {
      return res.status(400).json({ error: 'Campos requeridos: nombre, telefono' });
    }

    if (tipo_cliente && !TIPOS_CLIENTE.includes(tipo_cliente)) {
      return res.status(400).json({ error: 'Tipo de cliente inválido' });
    }

    await run(
      `UPDATE clientes
       SET nombre = $1, telefono = $2, email = $3, alergias = $4, tipo_cliente = $5, fecha_cumpleanos = $6
       WHERE id = $7`,
      [nombre, telefono, email || '', alergias || '', tipo_cliente || 'normal', fecha_cumpleanos || null, req.params.id]
    );

    res.json({ message: 'Cliente actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('dueno', 'admin'), async (req, res) => {
  try {
    await run('DELETE FROM clientes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
