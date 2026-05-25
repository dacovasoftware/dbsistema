const express = require('express')
const db = require('../db')

const router = express.Router()

router.get('/', (req, res) => {
  db.query(
    `SELECT ventas.*, clientes.nombre AS cliente, usuarios.nombre AS usuario
     FROM ventas
     LEFT JOIN clientes ON ventas.id_cliente = clientes.id_cliente
     LEFT JOIN usuarios ON ventas.id_usuario = usuarios.id_usuario
     ORDER BY ventas.fecha DESC`,
    (error, resultados) => {
      if (error) return res.status(500).json(error)
      res.json(resultados)
    }
  )
})

router.get('/:id', (req, res) => {
  db.query(
    `SELECT ventas.*, clientes.nombre AS cliente, usuarios.nombre AS usuario
     FROM ventas
     LEFT JOIN clientes ON ventas.id_cliente = clientes.id_cliente
     LEFT JOIN usuarios ON ventas.id_usuario = usuarios.id_usuario
     WHERE ventas.id_venta = ?`,
    [req.params.id],
    (error, venta) => {
      if (error) return res.status(500).json(error)

      db.query(
        `SELECT detalle_venta.*, productos.nombre AS producto
         FROM detalle_venta
         INNER JOIN productos ON detalle_venta.id_producto = productos.id_producto
         WHERE detalle_venta.id_venta = ?`,
        [req.params.id],
        (error, detalle) => {
          if (error) return res.status(500).json(error)
          res.json({ venta: venta[0], detalle })
        }
      )
    }
  )
})

router.post('/', (req, res) => {
  const { id_cliente, id_usuario, metodo_pago, productos } = req.body

  if (!productos || productos.length === 0) {
    return res.status(400).json({ mensaje: 'No hay productos en la venta' })
  }

  const total = productos.reduce((suma, p) => {
    return suma + Number(p.cantidad) * Number(p.precio_unitario)
  }, 0)

  db.beginTransaction((error) => {
    if (error) return res.status(500).json(error)

    db.query(
      'INSERT INTO ventas(id_cliente, id_usuario, total, metodo_pago) VALUES (?, ?, ?, ?)',
      [id_cliente || null, id_usuario, total, metodo_pago],
      (error, resultadoVenta) => {
        if (error) return db.rollback(() => res.status(500).json(error))

        const id_venta = resultadoVenta.insertId

        const detalles = productos.map(p => [
          id_venta,
          p.id_producto,
          p.cantidad,
          p.precio_unitario,
          Number(p.cantidad) * Number(p.precio_unitario)
        ])

        db.query(
          `INSERT INTO detalle_venta(id_venta, id_producto, cantidad, precio_unitario, subtotal)
           VALUES ?`,
          [detalles],
          (error) => {
            if (error) return db.rollback(() => res.status(500).json(error))

            let pendientes = productos.length

            productos.forEach(p => {
              db.query(
                'UPDATE productos SET stock = stock - ? WHERE id_producto = ? AND stock >= ?',
                [p.cantidad, p.id_producto, p.cantidad],
                (error, resultado) => {
                  if (error || resultado.affectedRows === 0) {
                    return db.rollback(() => res.status(400).json({
                      mensaje: 'Stock insuficiente en algún producto'
                    }))
                  }

                  db.query(
                    `INSERT INTO inventario(id_producto, tipo_movimiento, cantidad, descripcion)
                     VALUES (?, 'Salida', ?, ?)`,
                    [p.id_producto, p.cantidad, `Venta #${id_venta}`],
                    (error) => {
                      if (error) return db.rollback(() => res.status(500).json(error))

                      pendientes--

                      if (pendientes === 0) {
                        db.commit((error) => {
                          if (error) return db.rollback(() => res.status(500).json(error))

                          res.json({
                            mensaje: 'Venta registrada correctamente',
                            id_venta,
                            total
                          })
                        })
                      }
                    }
                  )
                }
              )
            })
          }
        )
      }
    )
  })
})

router.post('/factura/:id', (req, res) => {
  const idVenta = req.params.id

  db.query(
    'SELECT * FROM ventas WHERE id_venta = ?',
    [idVenta],
    (error, ventaResultado) => {
      if (error) return res.status(500).json(error)

      if (ventaResultado.length === 0) {
        return res.status(404).json({ mensaje: 'Venta no encontrada' })
      }

      const venta = ventaResultado[0]

      db.query(
        'SELECT * FROM facturas WHERE id_venta = ?',
        [idVenta],
        (error, facturaExistente) => {
          if (error) return res.status(500).json(error)

          if (facturaExistente.length > 0) {
            return res.json({
              mensaje: 'La factura ya existe',
              factura: facturaExistente[0]
            })
          }

          const folio = `FAC-${String(idVenta).padStart(5, '0')}`

          db.query(
            'INSERT INTO facturas(id_venta, folio, total) VALUES (?, ?, ?)',
            [idVenta, folio, venta.total],
            (error, resultado) => {
              if (error) return res.status(500).json(error)

              res.json({
                mensaje: 'Factura generada correctamente',
                factura: {
                  id_factura: resultado.insertId,
                  id_venta: idVenta,
                  folio,
                  total: venta.total
                }
              })
            }
          )
        }
      )
    }
  )
})

router.delete('/:id', (req, res) => {
  const idVenta = req.params.id

  db.beginTransaction((error) => {
    if (error) return res.status(500).json(error)

    db.query(
      'SELECT * FROM detalle_venta WHERE id_venta = ?',
      [idVenta],
      (error, detalles) => {
        if (error) return db.rollback(() => res.status(500).json(error))

        let pendientes = detalles.length

        const eliminar = () => {
          db.query('DELETE FROM detalle_venta WHERE id_venta = ?', [idVenta], (error) => {
            if (error) return db.rollback(() => res.status(500).json(error))

            db.query('DELETE FROM facturas WHERE id_venta = ?', [idVenta], (error) => {
              if (error) return db.rollback(() => res.status(500).json(error))

              db.query('DELETE FROM ventas WHERE id_venta = ?', [idVenta], (error) => {
                if (error) return db.rollback(() => res.status(500).json(error))

                db.commit(() => {
                  res.json({ mensaje: 'Venta eliminada, factura eliminada y stock restaurado' })
                })
              })
            })
          })
        }

        if (pendientes === 0) return eliminar()

        detalles.forEach(d => {
          db.query(
            'UPDATE productos SET stock = stock + ? WHERE id_producto = ?',
            [d.cantidad, d.id_producto],
            (error) => {
              if (error) return db.rollback(() => res.status(500).json(error))

              pendientes--

              if (pendientes === 0) eliminar()
            }
          )
        })
      }
    )
  })
})

module.exports = router