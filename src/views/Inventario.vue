<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const movimientos = ref([])
const productos = ref([])

const form = ref({
  id_producto: '',
  cantidad: '',
  descripcion: ''
})

const cargarInventario = async () => {
  const res = await api.get('/inventario')
  movimientos.value = res.data
}

const cargarProductos = async () => {
  const res = await api.get('/productos')
  productos.value = res.data
}

const registrarEntrada = async () => {
  await api.post('/inventario/entrada', form.value)

  form.value = {
    id_producto: '',
    cantidad: '',
    descripcion: ''
  }

  cargarInventario()
  cargarProductos()
}

onMounted(() => {
  cargarInventario()
  cargarProductos()
})
</script>

<template>
  <div class="content-page">
    <h1>Inventario</h1>

    <div class="form-card">
      <select v-model="form.id_producto">
        <option value="">Selecciona producto</option>
        <option 
          v-for="p in productos" 
          :key="p.id_producto" 
          :value="p.id_producto"
        >
          {{ p.nombre }} - Stock actual: {{ p.stock }}
        </option>
      </select>

      <input v-model="form.cantidad" type="number" placeholder="Cantidad de entrada">
      <input v-model="form.descripcion" placeholder="Descripción">

      <button @click="registrarEntrada">Registrar entrada</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Movimiento</th>
          <th>Cantidad</th>
          <th>Descripción</th>
          <th>Fecha</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="m in movimientos" :key="m.id_inventario">
          <td>{{ m.producto }}</td>
          <td>{{ m.tipo_movimiento }}</td>
          <td>{{ m.cantidad }}</td>
          <td>{{ m.descripcion }}</td>
          <td>{{ m.fecha }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>