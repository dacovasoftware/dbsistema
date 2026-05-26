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

          if (!venta) {
            return res.status(404).json({ mensaje: 'Venta no encontrada' });
          }

          const money = (value) => `$${Number(value).toFixed(2)}`;
          const fecha = new Date(venta.fecha).toLocaleString('es-MX', {
            dateStyle: 'medium',
            timeStyle: 'short'
          });
          const pageWidth = 226.77;
          const margin = 16;
          const contentWidth = pageWidth - margin * 2;
          const productX = margin;
          const qtyX = 135;
          const amountX = 166;
          const rowHeight = 17;
          const ticketHeight = Math.max(390, 345 + detalles.length * rowHeight);
          const doc = new PDFDocument({
            size: [pageWidth, ticketHeight],
            margin
          });

          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `inline; filename=ticket-${idVenta}.pdf`);

          doc.pipe(res);

          doc.rect(0, 0, pageWidth, 72).fill('#0f172a');
          doc.fillColor('#ffffff')
            .font('Helvetica-Bold')
            .fontSize(20)
            .text('TechStore', margin, 18, { width: contentWidth, align: 'center' });
          doc.font('Helvetica')
            .fontSize(8)
            .fillColor('#cbd5e1')
            .text('Tecnología y accesorios', margin, 44, { width: contentWidth, align: 'center' });
          doc.fillColor('#334155')
            .fontSize(9)
            .text('TICKET DE COMPRA', margin, 89, { width: contentWidth, align: 'center' });

          let y = 112;
          doc.fontSize(8)
            .fillColor('#64748b')
            .font('Helvetica-Bold')
            .text('FOLIO', margin, y)
            .text('FECHA', 82, y);
          doc.fillColor('#0f172a')
            .font('Helvetica')
            .fontSize(9)
            .text(`#${venta.id_venta}`, margin, y + 13)
            .text(fecha, 82, y + 13, { width: contentWidth - 66 });

          y += 42;
          doc.strokeColor('#e2e8f0').moveTo(margin, y).lineTo(pageWidth - margin, y).stroke();
          y += 12;
          doc.fillColor('#64748b')
            .font('Helvetica-Bold')
            .fontSize(8)
            .text('CLIENTE', margin, y)
            .text('PAGO', 123, y);
          doc.fillColor('#0f172a')
            .font('Helvetica')
            .fontSize(9)
            .text(venta.cliente || 'Público general', margin, y + 13, { width: 103 })
            .text(venta.metodo_pago, 123, y + 13, { width: contentWidth - 107 });

          y += 43;
          doc.rect(margin, y, contentWidth, 22).fill('#f1f5f9');
          doc.fillColor('#475569')
            .font('Helvetica-Bold')
            .fontSize(8)
            .text('PRODUCTO', productX + 5, y + 7)
            .text('CANT.', qtyX, y + 7)
            .text('IMPORTE', amountX, y + 7, { width: 44, align: 'right' });

          y += 31;
          detalles.forEach((detalle) => {
            const producto = String(detalle.producto || '').slice(0, 22);
            doc.fillColor('#0f172a')
              .font('Helvetica')
              .fontSize(8.5)
              .text(producto, productX + 5, y, { width: 112 })
              .text(`x${detalle.cantidad}`, qtyX, y, { width: 28 })
              .text(money(detalle.subtotal), amountX, y, { width: 44, align: 'right' });

            y += rowHeight;
          });

          y += 5;
          doc.strokeColor('#cbd5e1').dash(3, { space: 3 })
            .moveTo(margin, y)
            .lineTo(pageWidth - margin, y)
            .stroke()
            .undash();

          y += 17;
          doc.fillColor('#334155')
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('TOTAL', margin + 5, y + 4);
          doc.fillColor('#0f172a')
            .fontSize(15)
            .text(money(venta.total), 104, y, { width: 106, align: 'right' });

          y += 41;
          doc.fillColor('#64748b')
            .font('Helvetica')
            .fontSize(8)
            .text('Gracias por tu compra', margin, y, { width: contentWidth, align: 'center' });
          doc.fontSize(7.5)
            .text('Conserva este comprobante para cualquier aclaración.', margin, y + 15, {
              width: contentWidth,
              align: 'center'
            });

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


router.get('/factura/:id', (req, res) => {
  const idVenta = req.params.id

  db.query(
    `SELECT facturas.*, ventas.fecha AS fecha_venta, ventas.metodo_pago,
            clientes.nombre AS cliente, clientes.correo, clientes.telefono, clientes.ciudad
     FROM facturas
     INNER JOIN ventas ON facturas.id_venta = ventas.id_venta
     LEFT JOIN clientes ON ventas.id_cliente = clientes.id_cliente
     WHERE facturas.id_venta = ?`,
    [idVenta],
    (error, facturaResultado) => {
      if (error) return res.status(500).json(error)

      if (facturaResultado.length === 0) {
        return res.status(404).json({ mensaje: 'Factura no encontrada' })
      }

      const factura = facturaResultado[0]

      db.query(
        `SELECT detalle_venta.*, productos.nombre AS producto
         FROM detalle_venta
         INNER JOIN productos ON detalle_venta.id_producto = productos.id_producto
         WHERE detalle_venta.id_venta = ?`,
        [idVenta],
        (error, detalles) => {
          if (error) return res.status(500).json(error)

          const money = (value) => `$${Number(value).toFixed(2)}`
          const formatDate = (value) => new Date(value).toLocaleString('es-MX', {
            dateStyle: 'medium',
            timeStyle: 'short'
          })
          const doc = new PDFDocument({ size: 'A4', margin: 46 })
          const left = 46
          const right = 549
          const width = right - left
          const columns = {
            product: left + 14,
            quantity: 315,
            price: 380,
            subtotal: 470
          }

          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Content-Disposition', `inline; filename=factura-${factura.folio}.pdf`)

          doc.pipe(res)

          doc.rect(0, 0, 595.28, 116).fill('#0f172a')
          doc.fillColor('#ffffff')
            .font('Helvetica-Bold')
            .fontSize(29)
            .text('TechStore', left, 38)
          doc.font('Helvetica')
            .fontSize(10)
            .fillColor('#cbd5e1')
            .text('Tecnología y accesorios', left, 75)

          doc.roundedRect(406, 30, 143, 59, 10).fill('#2563eb')
          doc.fillColor('#dbeafe')
            .font('Helvetica-Bold')
            .fontSize(9)
            .text('FACTURA DE VENTA', 421, 44, { width: 113, align: 'right' })
          doc.fillColor('#ffffff')
            .fontSize(18)
            .text(factura.folio, 421, 59, { width: 113, align: 'right' })

          let y = 148
          doc.fillColor('#0f172a')
            .font('Helvetica-Bold')
            .fontSize(13)
            .text('Datos de facturación', left, y)

          y += 28
          doc.roundedRect(left, y, width, 92, 10).fill('#f8fafc')
          doc.fillColor('#64748b')
            .font('Helvetica-Bold')
            .fontSize(8)
            .text('CLIENTE', left + 16, y + 16)
            .text('FECHA DE FACTURA', left + 276, y + 16)
            .text('CORREO', left + 16, y + 51)
            .text('MÉTODO DE PAGO', left + 276, y + 51)
          doc.fillColor('#0f172a')
            .font('Helvetica')
            .fontSize(10)
            .text(factura.cliente || 'Público general', left + 16, y + 30, { width: 220 })
            .text(formatDate(factura.fecha), left + 276, y + 30, { width: 205 })
            .text(factura.correo || 'No registrado', left + 16, y + 65, { width: 220 })
            .text(factura.metodo_pago, left + 276, y + 65, { width: 205 })

          y += 122
          doc.fillColor('#0f172a')
            .font('Helvetica-Bold')
            .fontSize(13)
            .text('Detalle de productos', left, y)

          y += 27
          doc.roundedRect(left, y, width, 31, 7).fill('#0f172a')
          doc.fillColor('#ffffff')
            .font('Helvetica-Bold')
            .fontSize(9)
            .text('PRODUCTO', columns.product, y + 11)
            .text('CANT.', columns.quantity, y + 11, { width: 48, align: 'center' })
            .text('PRECIO', columns.price, y + 11, { width: 75, align: 'right' })
            .text('SUBTOTAL', columns.subtotal, y + 11, { width: 65, align: 'right' })

          y += 31
          detalles.forEach((detalle, index) => {
            const rowY = y + index * 35

            if (index % 2 === 0) {
              doc.rect(left, rowY, width, 35).fill('#f8fafc')
            }

            doc.fillColor('#0f172a')
              .font('Helvetica')
              .fontSize(9.5)
              .text(detalle.producto, columns.product, rowY + 13, { width: 252 })
              .text(String(detalle.cantidad), columns.quantity, rowY + 13, { width: 48, align: 'center' })
              .text(money(detalle.precio_unitario), columns.price, rowY + 13, { width: 75, align: 'right' })
              .text(money(detalle.subtotal), columns.subtotal, rowY + 13, { width: 65, align: 'right' })
          })

          y += detalles.length * 35 + 28
          doc.strokeColor('#e2e8f0').moveTo(left, y).lineTo(right, y).stroke()
          y += 21
          doc.fillColor('#64748b')
            .font('Helvetica')
            .fontSize(10)
            .text(`Venta asociada: #${factura.id_venta}`, left, y + 12)
            .text(`Fecha de venta: ${formatDate(factura.fecha_venta)}`, left, y + 28)

          doc.roundedRect(378, y, 171, 64, 10).fill('#eff6ff')
          doc.fillColor('#2563eb')
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('TOTAL', 395, y + 15)
          doc.fillColor('#0f172a')
            .fontSize(20)
            .text(money(factura.total), 395, y + 31, { width: 137, align: 'right' })

          doc.fillColor('#64748b')
            .font('Helvetica')
            .fontSize(9)
            .text('Gracias por confiar en TechStore.', left, 779, { width, align: 'center' })
          doc.strokeColor('#e2e8f0').moveTo(left, 766).lineTo(right, 766).stroke()

          doc.end()
        }
      )
    }
  )
})


module.exports = router;
