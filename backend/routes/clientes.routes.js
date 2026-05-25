const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  db.query('SELECT * FROM clientes ORDER BY id_cliente DESC', (error, resultados) => {
    if (error) return res.status(500).json(error);
    res.json(resultados);
  });
});

router.post('/', (req, res) => {
  const { nombre, correo, telefono, ciudad, direccion } = req.body;

  db.query(
    'INSERT INTO clientes(nombre, correo, telefono, ciudad, direccion) VALUES (?, ?, ?, ?, ?)',
    [nombre, correo, telefono, ciudad, direccion],
    (error) => {
      if (error) return res.status(500).json(error);
      res.json({ mensaje: 'Cliente registrado correctamente' });
    }
  );
});

router.put('/:id', (req, res) => {
  const { nombre, correo, telefono, ciudad, direccion } = req.body;

  db.query(
    `UPDATE clientes
     SET nombre=?, correo=?, telefono=?, ciudad=?, direccion=?
     WHERE id_cliente=?`,
    [nombre, correo, telefono, ciudad, direccion, req.params.id],
    (error) => {
      if (error) return res.status(500).json(error);
      res.json({ mensaje: 'Cliente actualizado correctamente' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM clientes WHERE id_cliente=?', [req.params.id], (error) => {
    if (error) return res.status(500).json(error);
    res.json({ mensaje: 'Cliente eliminado correctamente' });
  });
});

module.exports = router;