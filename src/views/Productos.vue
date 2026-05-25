<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const productos = ref([])

const form = ref({
  nombre: '',
  descripcion: '',
  id_categoria: 1,
  precio: '',
  stock: '',
  imagen: null
})

const cargarProductos = async () => {
  const res = await api.get('/productos')
  productos.value = res.data
}

const seleccionarImagen = (e) => {
  form.value.imagen = e.target.files[0]
}

const guardarProducto = async () => {
  const datos = new FormData()

  datos.append('nombre', form.value.nombre)
  datos.append('descripcion', form.value.descripcion)
  datos.append('id_categoria', form.value.id_categoria)
  datos.append('precio', form.value.precio)
  datos.append('stock', form.value.stock)

  if (form.value.imagen) {
    datos.append('imagen', form.value.imagen)
  }

  await api.post('/productos', datos)

  form.value = {
    nombre: '',
    descripcion: '',
    id_categoria: 1,
    precio: '',
    stock: '',
    imagen: null
  }

  cargarProductos()
}

const eliminarProducto = async (id) => {
  await api.delete(`/productos/${id}`)
  cargarProductos()
}

onMounted(() => {
  cargarProductos()
})
</script>

<template>
  <div class="content-page">
    <h1>Productos</h1>

    <div class="form-card">
      <input v-model="form.nombre" placeholder="Nombre del producto">
      <textarea v-model="form.descripcion" placeholder="Descripción"></textarea>

      <select v-model="form.id_categoria">
        <option value="1">Computadoras</option>
        <option value="2">Teléfonos</option>
        <option value="3">Relojes</option>
        <option value="4">Impresoras 3D</option>
        <option value="5">Accesorios</option>
      </select>

      <input v-model="form.precio" type="number" placeholder="Precio">
      <input v-model="form.stock" type="number" placeholder="Stock">
      <input type="file" @change="seleccionarImagen">

      <button @click="guardarProducto">Guardar producto</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Imagen</th>
          <th>Producto</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Estado</th>
          <th>Acción</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="p in productos" :key="p.id_producto">
          <td>
            <img :src="p.imagen" width="60" v-if="p.imagen">
          </td>
          <td>{{ p.nombre }}</td>
          <td>{{ p.categoria }}</td>
          <td>${{ p.precio }}</td>
          <td>{{ p.stock }}</td>
          <td>{{ p.estado }}</td>
          <td>
            <button @click="eliminarProducto(p.id_producto)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>