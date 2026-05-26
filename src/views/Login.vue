<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { useNotifications } from '../services/notifications'

const router = useRouter()
const { showModal } = useNotifications()

const correo = ref('')
const password = ref('')
const cargando = ref(false)

const login = async () => {

  try {

    cargando.value = true

    const res = await api.post('/auth/login', {
      correo: correo.value,
      password: password.value
    })

    localStorage.setItem('token', res.data.token)
    localStorage.setItem(
      'usuario',
      JSON.stringify(res.data.usuario)
    )

    if (res.data.usuario.rol === 'ADMIN') {
      router.push('/admin')
    } else {
      router.push('/cliente')
    }

  } catch (error) {

    showModal({
      type: 'error',
      title: 'Acceso denegado',
      message: 'El correo o la contraseña son incorrectos. Verifica tus datos e intenta nuevamente.',
      buttonText: 'Intentar de nuevo'
    })

  } finally {

    cargando.value = false

  }

}
</script>

<template>

<div class="login-wrapper">

  <div class="login-overlay"></div>

  <div class="login-container">

    <section class="login-left">

      <div class="brand-badge">
        TechStore
      </div>

      <h1>
        Bienvenido de nuevo
      </h1>

      <p>
        Plataforma inteligente para gestión de ventas,
        inventario, clientes y productos tecnológicos.
      </p>

      <div class="login-features">

        <div class="feature-item">
          <div class="feature-icon">📦</div>

          <div>
            <h3>Control de inventario</h3>
            <span>Administra productos y stock en tiempo real.</span>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🧾</div>

          <div>
            <h3>Ventas y tickets</h3>
            <span>Genera ventas y tickets PDF automáticamente.</span>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon">👥</div>

          <div>
            <h3>Clientes y usuarios</h3>
            <span>Acceso multiusuario con roles y permisos.</span>
          </div>
        </div>

      </div>

    </section>

    <section class="login-right">

      <div class="login-card">

        <div class="login-logo">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png"
          >
        </div>

        <h2>Iniciar sesión</h2>

        <p>
          Accede al sistema para continuar
        </p>

        <div class="input-group">

          <label>Correo electrónico</label>

          <input
            type="email"
            placeholder="correo@techstore.com"
            v-model="correo"
          >

        </div>

        <div class="input-group">

          <label>Contraseña</label>

          <input
            type="password"
            placeholder="********"
            v-model="password"
          >

        </div>

        <button
          class="btn-login-modern"
          @click="login"
          :disabled="cargando"
        >

          {{ cargando ? 'Ingresando...' : 'Entrar al sistema' }}

        </button>

      </div>

    </section>

  </div>

</div>

</template>
