<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const correo = ref('')
const password = ref('')

const login = async () => {
  try {
    const res = await api.post('/auth/login', {
      correo: correo.value,
      password: password.value
    });

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('usuario', JSON.stringify(res.data.usuario));

    if (res.data.usuario.rol === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/cliente');
    }

  } catch (error) {
    alert('Correo o contraseña incorrectos');
  }
};
</script>

<template>
  <div class="login-page">

    <div class="login-box">

      <h1>TechStore</h1>

      <p>Sistema de ventas e inventario</p>

      <input
        type="email"
        placeholder="Correo"
        v-model="correo"
      >

      <input
        type="password"
        placeholder="Contraseña"
        v-model="password"
      >

      <button @click="login">
        Iniciar sesión
      </button>

    </div>

  </div>
</template>