<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { useNotifications } from '../services/notifications'

const clientes = ref([])
const editando = ref(false)
const idEditando = ref(null)
const { toast, showModal, confirmModal } = useNotifications()

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

const limpiar = () => {
  form.value = {
    nombre: '',
    correo: '',
    telefono: '',
    ciudad: '',
    direccion: ''
  }

  editando.value = false
  idEditando.value = null
}

const guardarCliente = async () => {
  if (editando.value) {
    await api.put(`/clientes/${idEditando.value}`, form.value)
  } else {
    await api.post('/clientes', form.value)
  }

  limpiar()
  cargarClientes()
}

const editarCliente = (c) => {
  form.value = { ...c }
  editando.value = true
  idEditando.value = c.id_cliente
}

const verCliente = (c) => {
  showModal({
    type: 'info',
    title: c.nombre,
    message: `Correo: ${c.correo}\nTeléfono: ${c.telefono}\nCiudad: ${c.ciudad}`
  })
}

const eliminarCliente = async (id) => {
  const confirmado = await confirmModal({
    title: 'Eliminar cliente',
    message: 'El registro del cliente será eliminado permanentemente.',
    buttonText: 'Eliminar'
  })

  if (!confirmado) return

  await api.delete(`/clientes/${id}`)
  toast({
    type: 'success',
    title: 'Cliente eliminado',
    message: 'El cliente se eliminó correctamente.'
  })
  cargarClientes()
}

onMounted(cargarClientes)
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

      <button class="btn btn-primary" @click="guardarCliente">
        {{ editando ? 'Actualizar cliente' : 'Guardar cliente' }}
      </button>

      <button class="btn btn-secondary" @click="limpiar" v-if="editando">
        Cancelar
      </button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Teléfono</th>
          <th>Ciudad</th>
          <th>Dirección</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="c in clientes" :key="c.id_cliente">
          <td>{{ c.nombre }}</td>
          <td>{{ c.correo }}</td>
          <td>{{ c.telefono }}</td>
          <td>{{ c.ciudad }}</td>
          <td>{{ c.direccion }}</td>
          <td class="acciones">
            <button class="btn btn-info" @click="verCliente(c)">Ver</button>
            <button class="btn btn-warning" @click="editarCliente(c)">Editar</button>
            <button class="btn btn-danger" @click="eliminarCliente(c.id_cliente)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
