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

router.get('/ventas', (req, res) => {
  db.query(
    `SELECT ventas.*, clientes.nombre AS cliente, usuarios.nombre AS usuario
     FROM ventas
     LEFT JOIN clientes ON ventas.id_cliente = clientes.id_cliente
     LEFT JOIN usuarios ON ventas.id_usuario = usuarios.id_usuario
     ORDER BY ventas.fecha DESC`,
    (error, ventas) => {
      if (error) return res.status(500).json(error)

      const doc = new PDFDocument({ margin: 40 })

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'inline; filename=reporte-ventas.pdf')

      doc.pipe(res)

      doc.fontSize(20).text('TechStore', { align: 'center' })
      doc.fontSize(14).text('Reporte general de ventas', { align: 'center' })
      doc.moveDown()

      let totalGeneral = 0

      ventas.forEach(v => {
        totalGeneral += Number(v.total)

        doc.fontSize(10).text(
          `Venta #${v.id_venta} | Cliente: ${v.cliente || 'Público general'} | Usuario: ${v.usuario || 'N/A'} | Pago: ${v.metodo_pago} | Total: $${v.total} | Fecha: ${v.fecha}`
        )

        doc.moveDown(0.5)
      })

      doc.moveDown()
      doc.fontSize(14).text(`Total vendido: $${totalGeneral}`, { align: 'right' })

      doc.end()
    }
  )
})

router.get('/productos', (req, res) => {
  db.query(
    `SELECT productos.*, categorias.nombre AS categoria
     FROM productos
     LEFT JOIN categorias ON productos.id_categoria = categorias.id_categoria
     ORDER BY productos.nombre ASC`,
    (error, productos) => {
      if (error) return res.status(500).json(error)

      const doc = new PDFDocument({ margin: 40 })

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'inline; filename=reporte-productos.pdf')

      doc.pipe(res)

      doc.fontSize(20).text('TechStore', { align: 'center' })
      doc.fontSize(14).text('Reporte de productos', { align: 'center' })
      doc.moveDown()

      productos.forEach(p => {
        doc.fontSize(10).text(
          `ID: ${p.id_producto} | ${p.nombre} | Categoría: ${p.categoria || 'Sin categoría'} | Precio: $${p.precio} | Stock: ${p.stock} | Estado: ${p.estado}`
        )

        doc.moveDown(0.5)
      })

      doc.end()
    }
  )
})

router.get('/inventario', (req, res) => {
  db.query(
    `SELECT inventario.*, productos.nombre AS producto
     FROM inventario
     INNER JOIN productos ON inventario.id_producto = productos.id_producto
     ORDER BY inventario.fecha DESC`,
    (error, movimientos) => {
      if (error) return res.status(500).json(error)

      const doc = new PDFDocument({ margin: 40 })

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'inline; filename=reporte-inventario.pdf')

      doc.pipe(res)

      doc.fontSize(20).text('TechStore', { align: 'center' })
      doc.fontSize(14).text('Reporte de inventario', { align: 'center' })
      doc.moveDown()

      movimientos.forEach(m => {
        doc.fontSize(10).text(
          `Producto: ${m.producto} | Movimiento: ${m.tipo_movimiento} | Cantidad: ${m.cantidad} | Descripción: ${m.descripcion || 'N/A'} | Fecha: ${m.fecha}`
        )

        doc.moveDown(0.5)
      })

      doc.end()
    }
  )
})

module.exports = router;