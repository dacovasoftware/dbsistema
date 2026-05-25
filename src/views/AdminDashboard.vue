<script setup>
import { ref, onMounted } from 'vue'

const hora = ref('')

const actualizarHora = () => {
  hora.value = new Date().toLocaleString()
}

onMounted(() => {

  actualizarHora()

  setInterval(() => {
    actualizarHora()
  }, 1000)
})
</script>

<template>
  <div>
    <h1>Panel Administrativo</h1>
    <div class="cards">
      <div class="card">
        <h3>Productos</h3>
        <p>Registrar, modificar y eliminar productos.</p>
      </div>

      <div class="card">
        <h3>Clientes</h3>
        <p>Administrar clientes registrados.</p>
      </div>

      <div class="card">
        <h3>Ventas</h3>
        <p>Generar ventas, tickets y reportes.</p>
      </div>

      <div class="card">
        <h3>Inventario</h3>
        <p>Control de entradas y salidas.</p>
      </div>
    </div>
  </div>
</template>