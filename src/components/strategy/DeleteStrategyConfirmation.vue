<script setup lang="ts">
import { ref } from 'vue'
import type { Strategy } from '@/types'
import { useStrategiesStore } from '@/stores'

interface Props {
  show: boolean
  strategy: Strategy | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const strategiesStore = useStrategiesStore()

// Local state
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

/**
 * Handle delete confirmation
 */
const handleDelete = async () => {
  if (!props.strategy) {
    deleteError.value = 'Strategy tidak ditemukan'
    return
  }

  isDeleting.value = true
  deleteError.value = null

  try {
    await strategiesStore.deleteStrategy(props.strategy.id)
    emit('success')
    emit('close')
  } catch (err: any) {
    deleteError.value = err.message || 'Gagal menghapus strategy'
  } finally {
    isDeleting.value = false
  }
}

/**
 * Handle cancel
 */
const handleCancel = () => {
  if (!isDeleting.value) {
    deleteError.value = null
    emit('close')
  }
}
</script>

<template>
  <!-- Modal Backdrop -->
  <Transition name="fade">
    <div
      v-if="show && strategy"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="handleCancel"
    >
      <!-- Modal Container -->
      <div
        class="bg-white border-[5px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full"
      >
        <!-- Modal Header -->
        <div class="bg-[#ef4444] border-b-[5px] border-black p-6">
          <div class="flex items-center gap-3">
            <div class="bg-white border-[3px] border-black p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-6 h-6 text-[#ef4444]"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h2 class="text-xl font-bold uppercase text-white tracking-wide">
              Konfirmasi Hapus
            </h2>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-4">
          <!-- Error Alert -->
          <div
            v-if="deleteError"
            class="bg-[#ef4444] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div class="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-5 h-5 text-white flex-shrink-0"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <p class="text-white font-mono text-sm">{{ deleteError }}</p>
            </div>
          </div>

          <!-- Warning Message -->
          <div class="space-y-3">
            <p class="text-[#0a0a0a] font-mono text-sm">
              Anda yakin ingin menghapus strategy berikut?
            </p>

            <!-- Strategy Info -->
            <div class="bg-[#fef3c7] border-[3px] border-black p-4">
              <div class="space-y-2">
                <div>
                  <div class="text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
                    Nama Strategy
                  </div>
                  <div class="text-base font-bold text-[#0a0a0a]">
                    {{ strategy.name }}
                  </div>
                </div>
                <div v-if="strategy.description">
                  <div class="text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
                    Deskripsi
                  </div>
                  <div class="text-sm text-[#0a0a0a] font-mono">
                    {{ strategy.description }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Danger Warning -->
            <div class="bg-[#fee2e2] border-[3px] border-black p-4">
              <div class="flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-5 h-5 text-[#ef4444] flex-shrink-0"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
                <div class="text-sm text-[#0a0a0a] font-mono space-y-1">
                  <p class="font-bold">PERINGATAN!</p>
                  <p>
                    Menghapus strategy tidak akan menghapus trades yang sudah di-link ke strategy ini.
                  </p>
                  <p>
                    Trades tersebut akan memiliki <strong>orphaned strategy reference</strong>.
                  </p>
                  <p class="text-[#ef4444] font-bold">
                    Aksi ini tidak dapat dibatalkan!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-[#fafafa] border-t-[5px] border-black p-6">
          <div class="flex gap-4 justify-end">
            <button
              type="button"
              class="bg-white border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isDeleting"
              @click="handleCancel"
            >
              Batal
            </button>
            <button
              type="button"
              class="bg-[#ef4444] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              :disabled="isDeleting"
              @click="handleDelete"
            >
              <span v-if="isDeleting" class="inline-block animate-spin rounded-full h-4 w-4 border-[2px] border-white border-t-transparent"></span>
              <svg
                v-if="!isDeleting"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              {{ isDeleting ? 'Menghapus...' : 'Ya, Hapus Strategy' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
