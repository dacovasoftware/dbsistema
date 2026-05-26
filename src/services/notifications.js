import { reactive } from 'vue'

const state = reactive({
  modal: null,
  toasts: []
})

let toastId = 0
let modalResolver = null

const removeToast = (id) => {
  state.toasts = state.toasts.filter(toast => toast.id !== id)
}

const toast = ({ type = 'info', title = '', message, duration = 3200 }) => {
  const id = ++toastId

  state.toasts.push({ id, type, title, message })

  window.setTimeout(() => {
    removeToast(id)
  }, duration)
}

const showModal = ({
  type = 'info',
  title,
  message,
  buttonText = 'Aceptar'
}) => {
  closeModal()
  state.modal = { type, title, message, buttonText, mode: 'alert' }
}

const closeModal = () => {
  if (modalResolver) {
    modalResolver(false)
    modalResolver = null
  }

  state.modal = null
}

const confirmModal = ({
  type = 'warning',
  title,
  message,
  buttonText = 'Confirmar',
  cancelText = 'Cancelar',
  buttonStyle = 'danger'
}) => {
  closeModal()

  return new Promise(resolve => {
    modalResolver = resolve
    state.modal = {
      type,
      title,
      message,
      buttonText,
      cancelText,
      buttonStyle,
      mode: 'confirm'
    }
  })
}

const acceptModal = () => {
  if (modalResolver) {
    modalResolver(true)
    modalResolver = null
  }

  state.modal = null
}

export const useNotifications = () => ({
  state,
  toast,
  showModal,
  confirmModal,
  acceptModal,
  closeModal,
  removeToast
})
