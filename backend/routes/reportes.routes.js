const express = require('express');
const PDFDocument = require('pdfkit');
const db = require('../db');

const router = express.Router();

router.get('/ticket/:id', (req, res) => {
  const idVenta = req.params.id;

  db.query(
    `SELECT ventas.*, clientes.nombre AS cliente
     FROM ventas
     LEFT JOIN clientes ON ventas.id_cliente = clientes.id_cliente
     WHERE ventas.id_venta = ?`,
    [idVenta],
    (error, ventaResultado) => {
      if (error) return res.status(500).json(error);

      db.query(
        `SELECT detalle_venta.*, productos.nombre AS producto
         FROM detalle_venta
         INNER JOIN productos ON detalle_venta.id_producto = productos.id_producto
         WHERE detalle_venta.id_venta = ?`,
        [idVenta],
        (error, detalles) => {
          if (error) return res.status(500).json(error);

          const venta = ventaResultado[0];

          const doc = new PDFDocument();

          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `inline; filename=ticket-${idVenta}.pdf`);

          doc.pipe(res);

          doc.fontSize(18).text('TechStore', { align: 'center' });
          doc.fontSize(12).text('Ticket de venta', { align: 'center' });
          doc.moveDown();

          doc.text(`Venta: ${venta.id_venta}`);
          doc.text(`Cliente: ${venta.cliente || 'Público general'}`);
          doc.text(`Fecha: ${venta.fecha}`);
          doc.text(`Método de pago: ${venta.metodo_pago}`);
          doc.moveDown();

          detalles.forEach(d => {
            doc.text(`${d.producto} x${d.cantidad} - $${d.subtotal}`);
          });

          doc.moveDown();
          doc.fontSize(16).text(`Total: $${venta.total}`, { align: 'right' });

          doc.end();
        }
      );
    }
  );
});

router.get('/dashboard', (req, res) => {
  const datos = {};

  db.query('SELECT COUNT(*) AS totalProductos FROM productos', (e, r1) => {
    datos.totalProductos = r1[0].totalProductos;

    db.query('SELECT COUNT(*) AS totalClientes FROM clientes', (e, r2) => {
      datos.totalClientes = r2[0].totalClientes;

      db.query('SELECT COUNT(*) AS totalVentas FROM ventas', (e, r3) => {
        datos.totalVentas = r3[0].totalVentas;

        db.query('SELECT IFNULL(SUM(total),0) AS ingresos FROM ventas', (e, r4) => {
          datos.ingresos = r4[0].ingresos;

          res.json(datos);
        });
      });
    });
  });
});

module.exports = router;