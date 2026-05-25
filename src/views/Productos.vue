<script setup>
import { ref, onMounted } from 'vue'
import api, { API_URL } from '../services/api'

const productos = ref([])
const modoEditar = ref(false)
const idEditar = ref(null)

const form = ref({
  nombre: '',
  descripcion: '',
  id_categoria: 1,
  precio: '',
  stock: '',
  estado: 'Activo',
  imagen: null,
  imagen_actual: ''
})

const cargarProductos = async () => {
  const res = await api.get('/productos')
  productos.value = res.data
}

const urlImagen = (imagen) => {
  if (!imagen) return ''

  if (imagen.startsWith('http')) {
    return imagen.replace('http://localhost:3000', API_URL)
  }

  return `${API_URL}${imagen}`
}

const seleccionarImagen = (e) => {
  form.value.imagen = e.target.files[0]
}

const limpiarFormulario = () => {
  form.value = {
    nombre: '',
    descripcion: '',
    id_categoria: 1,
    precio: '',
    stock: '',
    estado: 'Activo',
    imagen: null,
    imagen_actual: ''
  }

  modoEditar.value = false
  idEditar.value = null
}

const guardarProducto = async () => {
  const datos = new FormData()

  datos.append('nombre', form.value.nombre)
  datos.append('descripcion', form.value.descripcion)
  datos.append('id_categoria', form.value.id_categoria)
  datos.append('precio', form.value.precio)
  datos.append('stock', form.value.stock)
  datos.append('estado', form.value.estado)
  datos.append('imagen_actual', form.value.imagen_actual || '')

  if (form.value.imagen) {
    datos.append('imagen', form.value.imagen)
  }

  if (modoEditar.value) {
    await api.put(`/productos/${idEditar.value}`, datos)
    alert('Producto actualizado correctamente')
  } else {
    await api.post('/productos', datos)
    alert('Producto registrado correctamente')
  }

  limpiarFormulario()
  cargarProductos()
}

const editarProducto = (producto) => {
  modoEditar.value = true
  idEditar.value = producto.id_producto

  form.value = {
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    id_categoria: producto.id_categoria,
    precio: producto.precio,
    stock: producto.stock,
    estado: producto.estado,
    imagen: null,
    imagen_actual: producto.imagen
  }
}

const verProducto = (producto) => {
  alert(
    `Producto: ${producto.nombre}\nCategoría: ${producto.categoria}\nPrecio: $${producto.precio}\nStock: ${producto.stock}\nEstado: ${producto.estado}\nDescripción: ${producto.descripcion}`
  )
}

const eliminarProducto = async (id) => {
  if (!confirm('¿Deseas eliminar este producto?')) return

  await api.delete(`/productos/${id}`)
  alert('Producto eliminado correctamente')
  cargarProductos()
}

onMounted(() => {
  cargarProductos()
})
</script>

<template>
  <div class="content-page">
    <div class="page-header">
      <div>
        <h1>Productos</h1>
        <p>CRUD completo de productos con imagen.</p>
      </div>
    </div>

    <div class="form-card">
      <input v-model="form.nombre" placeholder="Nombre del producto">
      <textarea v-model="form.descripcion" placeholder="Descripción"></textarea>

      <select v-model="form.id_categoria">
        <option value="1">Computadoras</option>
        <option value="2">Teléfonos</option>
        <option value="3">Relojes</option>
        <option value="4">Impresoras 3D</option>
        <option value="5">Accesorios</option>
        <option value="6">Gamer</option>
      </select>

      <input v-model="form.precio" type="number" placeholder="Precio">
      <input v-model="form.stock" type="number" placeholder="Stock">

      <select v-model="form.estado">
        <option>Activo</option>
        <option>Inactivo</option>
        <option>Agotado</option>
      </select>

      <input type="file" @change="seleccionarImagen">

      <div class="button-group">
        <button class="btn btn-primary" @click="guardarProducto">
          {{ modoEditar ? 'Actualizar producto' : 'Guardar producto' }}
        </button>

        <button class="btn btn-secondary" @click="limpiarFormulario" v-if="modoEditar">
          Cancelar
        </button>
      </div>
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
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="p in productos" :key="p.id_producto">
          <td>
            <img
              :src="urlImagen(p.imagen)"
              width="60"
              height="60"
              v-if="p.imagen"
            >
          </td>

          <td>{{ p.nombre }}</td>
          <td>{{ p.categoria }}</td>
          <td>${{ p.precio }}</td>
          <td>{{ p.stock }}</td>
          <td>{{ p.estado }}</td>

          <td>
            <div class="table-actions">
              <button class="btn btn-info" @click="verProducto(p)">Ver</button>
              <button class="btn btn-warning" @click="editarProducto(p)">Editar</button>
              <button class="btn btn-danger" @click="eliminarProducto(p.id_producto)">Eliminar</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>