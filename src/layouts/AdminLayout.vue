<script setup>
import { ref, onMounted } from 'vue'

const hora = ref('')

const actualizarHora = () => {
  hora.value = new Date().toLocaleString()
}

const salir = () => {
  localStorage.clear()
  location.href = '/'
}

onMounted(() => {
  actualizarHora()
  setInterval(actualizarHora, 1000)
})
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <h2>TechStore</h2>
      <p>Panel administrador</p>

      <router-link to="/admin">Inicio</router-link>
      <router-link to="/productos">Productos</router-link>
      <router-link to="/clientes">Clientes</router-link>
      <router-link to="/ventas">Ventas</router-link>
      <router-link to="/inventario">Inventario</router-link>

      <button class="btn-logout" @click="salir">
        Cerrar sesión
      </button>
    </aside>

    <main class="content">
      <div class="topbar">
        <h1>Sistema de Ventas</h1>
        <span>{{ hora }}</span>
      </div>

      <router-view />
    </main>
  </div>
</template>