import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import AdminLayout from '../layouts/AdminLayout.vue'

import AdminDashboard from '../views/AdminDashboard.vue'
import Productos from '../views/Productos.vue'
import Clientes from '../views/Clientes.vue'
import Ventas from '../views/Ventas.vue'
import Inventario from '../views/Inventario.vue'

import ClienteDashboard from '../views/ClienteDashboard.vue'
import Carrito from '../views/Carrito.vue'

const routes = [
  {
    path: '/',
    component: Login
  },

  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        component: AdminDashboard
      },
      {
        path: '/productos',
        component: Productos
      },
      {
        path: '/clientes',
        component: Clientes
      },
      {
        path: '/ventas',
        component: Ventas
      },
      {
        path: '/inventario',
        component: Inventario
      }
    ]
  },

  {
    path: '/cliente',
    component: ClienteDashboard
  },

  {
    path: '/carrito',
    component: Carrito
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router