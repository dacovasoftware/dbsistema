<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const clientes = ref([])

const form = ref({
  nombre: '',
  correo: '',
  telefono: '',
  ciudad: '',
  direccion: ''
})

const cargarClientes = async () => {
  const res = await api.get('/clientes')
  clientes.value = res.data
}

const guardarCliente = async () => {
  await api.post('/clientes', form.value)

  form.value = {
    nombre: '',
    correo: '',
    telefono: '',
    ciudad: '',
    direccion: ''
  }

  cargarClientes()
}

const eliminarCliente = async (id) => {
  await api.delete(`/clientes/${id}`)
  cargarClientes()
}

onMounted(() => {
  cargarClientes()
})
</script>

<template>
  <div class="content-page">
    <h1>Clientes</h1>

    <div class="form-card">
      <input v-model="form.nombre" placeholder="Nombre">
      <input v-model="form.correo" placeholder="Correo">
      <input v-model="form.telefono" placeholder="Teléfono">
      <input v-model="form.ciudad" placeholder="Ciudad">
      <input v-model="form.direccion" placeholder="Dirección">

      <button @click="guardarCliente">Guardar cliente</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Teléfono</th>
          <th>Ciudad</th>
          <th>Dirección</th>
          <th>Acción</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="c in clientes" :key="c.id_cliente">
          <td>{{ c.nombre }}</td>
          <td>{{ c.correo }}</td>
          <td>{{ c.telefono }}</td>
          <td>{{ c.ciudad }}</td>
          <td>{{ c.direccion }}</td>
          <td>
            <button @click="eliminarCliente(c.id_cliente)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>