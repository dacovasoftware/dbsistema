const express = require('express')
const db = require('../db')

const router = express.Router()

router.get('/', (req, res) => {
  db.query(
    `SELECT inventario.*, productos.nombre AS producto
     FROM inventario
     INNER JOIN productos ON inventario.id_producto = productos.id_producto
     ORDER BY inventario.fecha DESC`,
    (error, resultados) => {
      if (error) return res.status(500).json(error)
      res.json(resultados)
    }
  )
})

router.post('/entrada', (req, res) => {
  const { id_producto, cantidad, descripcion } = req.body

  db.beginTransaction((error) => {
    if (error) return res.status(500).json(error)

    db.query(
      'UPDATE productos SET stock = stock + ? WHERE id_producto = ?',
      [cantidad, id_producto],
      (error) => {
        if (error) return db.rollback(() => res.status(500).json(error))

        db.query(
          `INSERT INTO inventario(id_producto, tipo_movimiento, cantidad, descripcion)
           VALUES (?, 'Entrada', ?, ?)`,
          [id_producto, cantidad, descripcion],
          (error) => {
            if (error) return db.rollback(() => res.status(500).json(error))

            db.commit(() => {
              res.json({ mensaje: 'Entrada registrada correctamente' })
            })
          }
        )
      }
    )
  })
})

router.post('/salida', (req, res) => {
  const { id_producto, cantidad, descripcion } = req.body

  db.beginTransaction((error) => {
    if (error) return res.status(500).json(error)

    db.query(
      'UPDATE productos SET stock = stock - ? WHERE id_producto = ? AND stock >= ?',
      [cantidad, id_producto, cantidad],
      (error, resultado) => {
        if (error || resultado.affectedRows === 0) {
          return db.rollback(() => res.status(400).json({ mensaje: 'Stock insuficiente' }))
        }

        db.query(
          `INSERT INTO inventario(id_producto, tipo_movimiento, cantidad, descripcion)
           VALUES (?, 'Salida', ?, ?)`,
          [id_producto, cantidad, descripcion],
          (error) => {
            if (error) return db.rollback(() => res.status(500).json(error))

            db.commit(() => {
              res.json({ mensaje: 'Salida registrada correctamente' })
            })
          }
        )
      }
    )
  })
})

router.delete('/:id', (req, res) => {
  db.query(
    'DELETE FROM inventario WHERE id_inventario = ?',
    [req.params.id],
    (error) => {
      if (error) return res.status(500).json(error)
      res.json({ mensaje: 'Movimiento eliminado correctamente' })
    }
  )
})

module.exports = router