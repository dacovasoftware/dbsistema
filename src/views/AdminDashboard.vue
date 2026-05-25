<script setup>
import { ref, onMounted } from 'vue'

const hora = ref('')

const actualizarHora = () => {
  hora.value = new Date().toLocaleString()
}

onMounted(() => {
  actualizarHora()
  setInterval(actualizarHora, 1000)
})
</script>

<template>
  <div class="admin-dashboard">

    <section class="dashboard-hero">
      <div>
        <h1>Panel Administrativo</h1>
        <p>Sistema de ventas, inventario y control de productos.</p>
      </div>

      <div class="dashboard-clock">
        <span>Fecha y hora actual</span>
        <strong>{{ hora }}</strong>
      </div>
    </section>

    <div class="dashboard-cards">

      <router-link to="/productos" class="dashboard-card card-blue">
        <div class="card-icon">📦</div>
        <h3>Productos</h3>
        <p>Registrar, modificar, consultar y eliminar productos.</p>
        <span>Entrar →</span>
      </router-link>

      <router-link to="/clientes" class="dashboard-card card-green">
        <div class="card-icon">👥</div>
        <h3>Clientes</h3>
        <p>Administrar clientes registrados en el sistema.</p>
        <span>Entrar →</span>
      </router-link>

      <router-link to="/ventas" class="dashboard-card card-orange">
        <div class="card-icon">🧾</div>
        <h3>Ventas</h3>
        <p>Generar ventas, tickets y reportes generales.</p>
        <span>Entrar →</span>
      </router-link>

      <router-link to="/inventario" class="dashboard-card card-purple">
        <div class="card-icon">📊</div>
        <h3>Inventario</h3>
        <p>Controlar entradas, salidas y stock disponible.</p>
        <span>Entrar →</span>
      </router-link>

    </div>

  </div>
</template>