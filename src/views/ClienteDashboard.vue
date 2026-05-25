<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const productos = ref([])

const cargarProductos = async () => {
  try {

    const res = await api.get('/productos')

    productos.value = res.data

  } catch (error) {

    console.log(error)

  }
}

const agregarCarrito = (producto) => {

  let carrito = JSON.parse(localStorage.getItem('carrito')) || []

  const existe = carrito.find(
    p => p.id_producto === producto.id_producto
  )

  if (existe) {

    existe.cantidad++

  } else {

    carrito.push({
      ...producto,
      cantidad: 1
    })

  }

  localStorage.setItem(
    'carrito',
    JSON.stringify(carrito)
  )

  alert('Producto agregado al carrito')
}

onMounted(() => {
  cargarProductos()
})
</script>

<template>

<div>

  <header class="cliente-header">

    <h1>TechStore</h1>

    <nav>

      <router-link to="/cliente">
        Inicio
      </router-link>

      <router-link to="/carrito">
        Carrito
      </router-link>

    </nav>

  </header>

  <section class="productos-grid">

    <div
      class="producto-card"
      v-for="p in productos"
      :key="p.id_producto"
    >

      <img
        :src="p.imagen"
        v-if="p.imagen"
      >
      <h3>{{ p.nombre }}</h3>
      <p>{{ p.descripcion }}</p>
      <strong>${{ p.precio }}</strong>
      <p>
        Stock: {{ p.stock }}
      </p>
      <button @click="agregarCarrito(p)">
        Agregar al carrito
      </button>

    </div>

  </section>

</div>

</template>