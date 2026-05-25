const express = require('express');
const db = require('../db');

const router = express.Router();

router.post('/', (req, res) => {
  const { id_cliente, id_usuario, metodo_pago, productos } = req.body;

  let total = 0;

  productos.forEach(p => {
    total += p.cantidad * p.precio_unitario;
  });

  db.beginTransaction((error) => {
    if (error) return res.status(500).json(error);

    db.query(
      'INSERT INTO ventas(id_cliente, id_usuario, total, metodo_pago) VALUES (?, ?, ?, ?)',
      [id_cliente, id_usuario, total, metodo_pago],
      (error, resultadoVenta) => {
        if (error) {
          return db.rollback(() => res.status(500).json(error));
        }

        const id_venta = resultadoVenta.insertId;

        const detalles = productos.map(p => [
          id_venta,
          p.id_producto,
          p.cantidad,
          p.precio_unitario,
          p.cantidad * p.precio_unitario
        ]);

        db.query(
          `INSERT INTO detalle_venta(id_venta, id_producto, cantidad, precio_unitario, subtotal)
           VALUES ?`,
          [detalles],
          (error) => {
            if (error) {
              return db.rollback(() => res.status(500).json(error));
            }

            let consultasPendientes = productos.length;

            productos.forEach(p => {
              db.query(
                'UPDATE productos SET stock = stock - ? WHERE id_producto = ? AND stock >= ?',
                [p.cantidad, p.id_producto, p.cantidad],
                (error, resultado) => {
                  if (error || resultado.affectedRows === 0) {
                    return db.rollback(() => res.status(400).json({
                      mensaje: 'Stock insuficiente en algún producto'
                    }));
                  }

                  db.query(
                    `INSERT INTO inventario(id_producto, tipo_movimiento, cantidad, descripcion)
                     VALUES (?, 'Salida', ?, 'Venta realizada')`,
                    [p.id_producto, p.cantidad],
                    (error) => {
                      if (error) {
                        return db.rollback(() => res.status(500).json(error));
                      }

                      consultasPendientes--;

                      if (consultasPendientes === 0) {
                        db.commit((error) => {
                          if (error) {
                            return db.rollback(() => res.status(500).json(error));
                          }

                          res.json({
                            mensaje: 'Venta registrada correctamente',
                            id_venta,
                            total
                          });
                        });
                      }
                    }
                  );
                }
              );
            });
          }
        );
      }
    );
  });
});

router.get('/', (req, res) => {
  db.query(
    `SELECT ventas.*, clientes.nombre AS cliente, usuarios.nombre AS usuario
     FROM ventas
     LEFT JOIN clientes ON ventas.id_cliente = clientes.id_cliente
     LEFT JOIN usuarios ON ventas.id_usuario = usuarios.id_usuario
     ORDER BY ventas.fecha DESC`,
    (error, resultados) => {
      if (error) return res.status(500).json(error);
      res.json(resultados);
    }
  );
});

module.exports = router;