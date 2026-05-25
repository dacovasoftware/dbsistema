<script setup>
import { ref, onMounted, computed } from 'vue'
import api, { API_URL } from '../services/api'

const productos = ref([])
const busqueda = ref('')

const cargarProductos = async () => {
  const res = await api.get('/productos')
  productos.value = res.data
}

const imagenProducto = (imagen) => {
  if (!imagen) return ''

  if (imagen.startsWith('http')) {
    return imagen.replace('http://localhost:3000', API_URL)
  }

  return `${API_URL}${imagen}`
}

const productosFiltrados = computed(() => {
  return productos.value.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
  )
})

const agregarCarrito = (producto) => {
  if (producto.stock <= 0) {
    alert('Producto sin stock')
    return
  }

  let carrito = JSON.parse(localStorage.getItem('carrito')) || []

  const existe = carrito.find(
    p => p.id_producto === producto.id_producto
  )

  if (existe) {
    if (existe.cantidad < producto.stock) {
      existe.cantidad++
    } else {
      alert('No puedes agregar más del stock disponible')
      return
    }
  } else {
    carrito.push({
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      imagen: producto.imagen,
      cantidad: 1
    })
  }

  localStorage.setItem('carrito', JSON.stringify(carrito))
  alert('Producto agregado al carrito')
}

onMounted(cargarProductos)
</script>

<template>
  <div class="cliente-page">

    <header class="cliente-navbar">
      <div class="logo-tech">
        <span>🛒</span>
        <h1>TechStore</h1>
      </div>

      <nav>
        <router-link to="/cliente">Inicio</router-link>
        <router-link to="/carrito">Carrito</router-link>
      </nav>
    </header>

    <section class="hero-tech">
      <div class="hero-left">
        <span class="hero-badge">
          Tecnología y accesorios
        </span>

        <h2>
          Encuentra los mejores productos tecnológicos
        </h2>

        <p>
          Computadoras, consolas, teléfonos, impresoras 3D,
          accesorios y mucho más.
        </p>

        <div class="hero-search">
          <input
            v-model="busqueda"
            placeholder="Buscar producto..."
          >
        </div>
      </div>

      <div class="hero-right">
        <img src="https://cdn-icons-png.flaticon.com/512/1055/1055687.png">
      </div>
    </section>

    <section class="productos-section">
      <div class="section-title">
        <h2>Productos disponibles</h2>
        <span>{{ productosFiltrados.length }} productos</span>
      </div>

      <div class="productos-grid">
        <div
          class="producto-card-modern"
          v-for="p in productosFiltrados"
          :key="p.id_producto"
        >
          <div class="producto-image">
            <img
              :src="imagenProducto(p.imagen)"
              v-if="p.imagen"
            >

            <div
              class="stock-badge"
              :class="p.stock > 0 ? 'stock-ok' : 'stock-no'"
            >
              {{ p.stock > 0 ? 'Disponible' : 'Agotado' }}
            </div>
          </div>

          <div class="producto-content">
            <h3>{{ p.nombre }}</h3>

            <p class="producto-desc">
              {{ p.descripcion }}
            </p>

            <div class="producto-bottom">
              <div>
                <strong class="producto-price">
                  ${{ p.precio }}
                </strong>

                <p class="producto-stock">
                  Stock: {{ p.stock }}
                </p>
              </div>
            </div>

            <button
              class="btn-cart-modern"
              @click="agregarCarrito(p)"
              :disabled="p.stock <= 0"
            >
              {{ p.stock <= 0 ? 'Sin stock' : 'Agregar al carrito' }}
            </button>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>