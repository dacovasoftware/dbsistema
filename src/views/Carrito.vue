<script setup>
import { ref, onMounted } from 'vue'
import api, { API_URL } from '../services/api'

const carrito = ref([])
const metodo_pago = ref('Efectivo')
const mensaje = ref('')
const cargando = ref(false)

const cargarCarrito = () => {
  carrito.value = JSON.parse(localStorage.getItem('carrito')) || []
}

const guardarCarrito = () => {
  localStorage.setItem('carrito', JSON.stringify(carrito.value))
}

const aumentar = (item) => {
  if (item.cantidad < item.stock) {
    item.cantidad++
    guardarCarrito()
  } else {
    alert('No puedes superar el stock disponible')
  }
}

const disminuir = (item) => {
  if (item.cantidad > 1) {
    item.cantidad--
    guardarCarrito()
  }
}

const eliminarProducto = (id) => {
  carrito.value = carrito.value.filter(p => p.id_producto !== id)
  guardarCarrito()
}

const vaciarCarrito = () => {
  if (!confirm('¿Vaciar todo el carrito?')) return
  carrito.value = []
  localStorage.removeItem('carrito')
}

const total = () => {
  return carrito.value.reduce((suma, p) => {
    return suma + Number(p.precio) * Number(p.cantidad)
  }, 0)
}

const comprar = async () => {
  if (carrito.value.length === 0) {
    alert('El carrito está vacío')
    return
  }

  const usuario = JSON.parse(localStorage.getItem('usuario'))

  if (!usuario) {
    alert('Debes iniciar sesión')
    return
  }

  const productos = carrito.value.map(p => ({
    id_producto: p.id_producto,
    cantidad: p.cantidad,
    precio_unitario: p.precio
  }))

  try {
    cargando.value = true

    const res = await api.post('/ventas', {
      id_cliente: null,
      id_usuario: usuario.id_usuario,
      metodo_pago: metodo_pago.value,
      productos
    })

    mensaje.value = `Compra realizada correctamente. Venta #${res.data.id_venta}`
    carrito.value = []
    localStorage.removeItem('carrito')

    window.open(`${API_URL}/api/reportes/ticket/${res.data.id_venta}`, '_blank')
  } catch (error) {
    alert(error.response?.data?.mensaje || 'Error al realizar la compra')
  } finally {
    cargando.value = false
  }
}

onMounted(cargarCarrito)
</script>

<template>
  <div class="cart-page">

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

    <section class="cart-hero">
      <div>
        <span class="cart-badge">Carrito de compras</span>
        <h2>Revisa tus productos antes de comprar</h2>
        <p>Confirma cantidades, método de pago y genera tu ticket automáticamente.</p>
      </div>

      <img src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png">
    </section>

    <main class="cart-container">

      <p v-if="mensaje" class="cart-alert">
        {{ mensaje }}
      </p>

      <div v-if="carrito.length === 0" class="cart-empty">
        <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png">
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos desde la tienda para poder realizar una compra.</p>

        <router-link to="/cliente" class="btn-cart-main">
          Ver productos
        </router-link>
      </div>

      <div v-else class="cart-layout">

        <section class="cart-items">

          <div
            class="cart-item"
            v-for="p in carrito"
            :key="p.id_producto"
          >

            <div class="cart-img">
              <img
                v-if="p.imagen"
                :src="p.imagen.startsWith('http') ? p.imagen : API_URL + p.imagen"
              >
            </div>

            <div class="cart-info">
              <h3>{{ p.nombre }}</h3>
              <p>{{ p.descripcion }}</p>
              <span>Stock disponible: {{ p.stock }}</span>
            </div>

            <div class="cart-price">
              <strong>${{ p.precio }}</strong>
              <small>Precio unitario</small>
            </div>

            <div class="cart-qty">
              <button @click="disminuir(p)">-</button>
              <strong>{{ p.cantidad }}</strong>
              <button @click="aumentar(p)">+</button>
            </div>

            <div class="cart-subtotal">
              <strong>${{ Number(p.precio) * Number(p.cantidad) }}</strong>
              <small>Subtotal</small>
            </div>

            <button
              class="cart-remove"
              @click="eliminarProducto(p.id_producto)"
            >
              Quitar
            </button>

          </div>

        </section>

        <aside class="cart-summary">

          <h3>Resumen de compra</h3>

          <div class="summary-row">
            <span>Productos</span>
            <strong>{{ carrito.length }}</strong>
          </div>

          <div class="summary-row">
            <span>Total</span>
            <strong>${{ total() }}</strong>
          </div>

          <label>Método de pago</label>

          <select v-model="metodo_pago">
            <option>Efectivo</option>
            <option>Tarjeta</option>
            <option>Transferencia</option>
          </select>

          <button
            class="btn-buy"
            @click="comprar"
            :disabled="cargando"
          >
            {{ cargando ? 'Procesando...' : 'Comprar ahora' }}
          </button>

          <button class="btn-empty-cart" @click="vaciarCarrito">
            Vaciar carrito
          </button>

        </aside>

      </div>

    </main>

  </div>
</template>