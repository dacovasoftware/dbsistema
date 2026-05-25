const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/clientes', require('./routes/clientes.routes'));
app.use('/api/ventas', require('./routes/ventas.routes'));
app.use('/api/inventario', require('./routes/inventario.routes'));
app.use('/api/reportes', require('./routes/reportes.routes'));

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});