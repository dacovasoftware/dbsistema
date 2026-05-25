<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const clientes = ref([])
const productos = ref([])
const ventas = ref([])
const carrito = ref([])

const id_cliente = ref('')
const metodo_pago = ref('Efectivo')

const cargarDatos = async () => {
  const resClientes = await api.get('/clientes')
  clientes.value = resClientes.data

  const resProductos = await api.get('/productos')
  productos.value = resProductos.data

  const resVentas = await api.get('/ventas')
  ventas.value = resVentas.data
}

const agregarProducto = (producto) => {
  const existe = carrito.value.find(p => p.id_producto === producto.id_producto)

  if (existe) {
    existe.cantidad++
  } else {
    carrito.value.push({
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      cantidad: 1,
      precio_unitario: producto.precio
    })
  }
}

const total = () => {
  return carrito.value.reduce((suma, p) => {
    return suma + p.cantidad * p.precio_unitario
  }, 0)
}

const registrarVenta = async () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'))

  await api.post('/ventas', {
    id_cliente: id_cliente.value,
    id_usuario: usuario.id_usuario,
    metodo_pago: metodo_pago.value,
    productos: carrito.value
  })

  carrito.value = []
  id_cliente.value = ''
  metodo_pago.value = 'Efectivo'

  cargarDatos()
}

const imprimirTicket = (id) => {
  window.open(`http://localhost:3000/api/reportes/ticket/${id}`, '_blank')
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <div class="content-page">
    <h1>Ventas</h1>

    <div class="form-card">
      <select v-model="id_cliente">
        <option value="">Público general</option>
        <option 
          v-for="c in clientes" 
          :key="c.id_cliente" 
          :value="c.id_cliente"
        >
          {{ c.nombre }}
        </option>
      </select>

      <select v-model="metodo_pago">
        <option>Efectivo</option>
        <option>Tarjeta</option>
        <option>Transferencia</option>
      </select>
    </div>

    <h2>Productos disponibles</h2>

    <div class="productos-grid">
      <div class="producto-card" v-for="p in productos" :key="p.id_producto">
        <img :src="p.imagen" v-if="p.imagen">
        <h3>{{ p.nombre }}</h3>
        <p>${{ p.precio }}</p>
        <p>Stock: {{ p.stock }}</p>
        <button @click="agregarProducto(p)">Agregar</button>
      </div>
    </div>

    <h2>Carrito de venta</h2>

    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio</th>
          <th>Subtotal</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="p in carrito" :key="p.id_producto">
          <td>{{ p.nombre }}</td>
          <td>
            <input v-model="p.cantidad" type="number" min="1">
          </td>
          <td>${{ p.precio_unitario }}</td>
          <td>${{ p.cantidad * p.precio_unitario }}</td>
        </tr>
      </tbody>
    </table>

    <h2>Total: ${{ total() }}</h2>

    <button @click="registrarVenta" v-if="carrito.length > 0">
      Registrar venta
    </button>

    <h2>Historial de ventas</h2>

    <table>
      <thead>
        <tr>
          <th>ID Venta</th>
          <th>Cliente</th>
          <th>Usuario</th>
          <th>Total</th>
          <th>Pago</th>
          <th>Fecha</th>
          <th>Ticket</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="v in ventas" :key="v.id_venta">
          <td>{{ v.id_venta }}</td>
          <td>{{ v.cliente || 'Público general' }}</td>
          <td>{{ v.usuario }}</td>
          <td>${{ v.total }}</td>
          <td>{{ v.metodo_pago }}</td>
          <td>{{ v.fecha }}</td>
          <td>
            <button @click="imprimirTicket(v.id_venta)">Ticket PDF</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>