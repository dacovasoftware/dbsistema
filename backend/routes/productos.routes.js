const express = require('express');
const multer = require('multer');
const db = require('../db');

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.get('/', (req, res) => {
  db.query(
    `SELECT productos.*, categorias.nombre AS categoria
     FROM productos
     LEFT JOIN categorias ON productos.id_categoria = categorias.id_categoria
     ORDER BY productos.id_producto DESC`,
    (error, resultados) => {
      if (error) return res.status(500).json(error);
      res.json(resultados);
    }
  );
});

router.post('/', upload.single('imagen'), (req, res) => {
  const { nombre, descripcion, id_categoria, precio, stock } = req.body;

  const imagen = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

  db.query(
    `INSERT INTO productos(nombre, descripcion, id_categoria, precio, stock, imagen)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, descripcion, id_categoria, precio, stock, imagen],
    (error) => {
      if (error) return res.status(500).json(error);

      res.json({ mensaje: 'Producto registrado correctamente' });
    }
  );
});

router.put('/:id', upload.single('imagen'), (req, res) => {
  const { nombre, descripcion, id_categoria, precio, stock, estado } = req.body;

  const imagen = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : req.body.imagen_actual;

  db.query(
    `UPDATE productos
     SET nombre=?, descripcion=?, id_categoria=?, precio=?, stock=?, imagen=?, estado=?
     WHERE id_producto=?`,
    [nombre, descripcion, id_categoria, precio, stock, imagen, estado, req.params.id],
    (error) => {
      if (error) return res.status(500).json(error);

      res.json({ mensaje: 'Producto actualizado correctamente' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.query(
    'DELETE FROM productos WHERE id_producto=?',
    [req.params.id],
    (error) => {
      if (error) return res.status(500).json(error);

      res.json({ mensaje: 'Producto eliminado correctamente' });
    }
  );
});

module.exports = router;