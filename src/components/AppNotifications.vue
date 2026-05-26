<script setup>
import { computed } from 'vue'
import { useNotifications } from '../services/notifications'

const { state, acceptModal, closeModal, removeToast } = useNotifications()

const icons = {
  success: '✓',
  warning: '!',
  error: '!',
  info: 'i'
}

const modalIcon = computed(() => icons[state.modal?.type] || icons.info)
</script>

<template>
  <div class="app-toast-stack" aria-live="polite">
    <TransitionGroup name="app-toast">
      <div
        v-for="toast in state.toasts"
        :key="toast.id"
        class="app-toast"
        :class="`app-toast-${toast.type}`"
        role="status"
      >
        <div class="app-toast-icon">{{ icons[toast.type] || icons.info }}</div>

        <div class="app-toast-content">
          <strong v-if="toast.title">{{ toast.title }}</strong>
          <span>{{ toast.message }}</span>
        </div>

        <button
          class="app-toast-close"
          type="button"
          aria-label="Cerrar aviso"
          @click="removeToast(toast.id)"
        >
          &times;
        </button>
      </div>
    </TransitionGroup>
  </div>

  <Transition name="app-modal">
    <div
      v-if="state.modal"
      class="app-modal-backdrop"
      @keydown.esc="closeModal"
      @click.self="closeModal"
    >
      <div
        class="app-modal-card"
        :class="`app-modal-${state.modal.type}`"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        aria-describedby="app-modal-message"
      >
        <div class="app-modal-icon">{{ modalIcon }}</div>

        <h2 id="app-modal-title">{{ state.modal.title }}</h2>

        <p id="app-modal-message">{{ state.modal.message }}</p>

        <div class="app-modal-actions">
          <button
            v-if="state.modal.mode === 'confirm'"
            class="app-modal-button app-modal-button-secondary"
            type="button"
            @click="closeModal"
          >
            {{ state.modal.cancelText }}
          </button>

          <button
            class="app-modal-button"
            :class="{ 'app-modal-button-danger': state.modal.buttonStyle === 'danger' }"
            type="button"
            autofocus
            @click="state.modal.mode === 'confirm' ? acceptModal() : closeModal()"
          >
            {{ state.modal.buttonText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
