<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const movimientos = ref([])
const productos = ref([])

const form = ref({
  id_producto: '',
  tipo_movimiento: 'Entrada',
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

const limpiar = () => {
  form.value = {
    id_producto: '',
    tipo_movimiento: 'Entrada',
    cantidad: '',
    descripcion: ''
  }
}

const guardarMovimiento = async () => {
  if (form.value.tipo_movimiento === 'Entrada') {
    await api.post('/inventario/entrada', form.value)
  } else {
    await api.post('/inventario/salida', form.value)
  }

  limpiar()
  cargarInventario()
  cargarProductos()
}

const verMovimiento = (m) => {
  alert(`Producto: ${m.producto}\nMovimiento: ${m.tipo_movimiento}\nCantidad: ${m.cantidad}\nDescripción: ${m.descripcion}`)
}

const eliminarMovimiento = async (id) => {
  if (!confirm('¿Eliminar movimiento del historial?')) return
  await api.delete(`/inventario/${id}`)
  cargarInventario()
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
        <option v-for="p in productos" :key="p.id_producto" :value="p.id_producto">
          {{ p.nombre }} - Stock: {{ p.stock }}
        </option>
      </select>

      <select v-model="form.tipo_movimiento">
        <option>Entrada</option>
        <option>Salida</option>
      </select>

      <input v-model="form.cantidad" type="number" min="1" placeholder="Cantidad">
      <input v-model="form.descripcion" placeholder="Descripción">

      <button class="btn btn-primary" @click="guardarMovimiento">
        Registrar movimiento
      </button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Movimiento</th>
          <th>Cantidad</th>
          <th>Descripción</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="m in movimientos" :key="m.id_inventario">
          <td>{{ m.producto }}</td>
          <td>{{ m.tipo_movimiento }}</td>
          <td>{{ m.cantidad }}</td>
          <td>{{ m.descripcion }}</td>
          <td>{{ m.fecha }}</td>
          <td class="acciones">
            <button class="btn btn-info" @click="verMovimiento(m)">Ver</button>
            <button class="btn btn-danger" @click="eliminarMovimiento(m.id_inventario)">Borrar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>