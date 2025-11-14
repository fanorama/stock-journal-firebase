<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Trade } from '@/types'
import { useTradesStore } from '@/stores'
import { toast } from 'vue-sonner'

interface Props {
  show: boolean
  trade: Trade | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const tradesStore = useTradesStore()

// Local loading state
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

/**
 * Format currency
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Calculate trade total
 */
const tradeTotal = computed(() => {
  if (!props.trade) return 0
  const subtotal = props.trade.quantity * props.trade.price
  const fees = props.trade.fees || 0
  return props.trade.type === 'BUY' ? subtotal + fees : subtotal - fees
})

/**
 * Handle delete confirmation
 */
const handleDelete = async () => {
  if (!props.trade) {
    deleteError.value = 'Trade tidak ditemukan'
    return
  }

  isDeleting.value = true
  deleteError.value = null

  try {
    await tradesStore.deleteTrade(props.trade.id)

    // Show success toast
    toast.success('Trade berhasil dihapus!')

    emit('success')
    emit('close')
  } catch (err: any) {
    const errorMessage = err.message || 'Gagal menghapus trade'
    deleteError.value = errorMessage
    // Show error toast
    toast.error(`Gagal menghapus trade: ${errorMessage}`)
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
      v-if="show && trade"
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-8 h-8 text-white"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            <h2 class="text-2xl font-bold uppercase text-white tracking-wide">
              Hapus Trade?
            </h2>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-4">
          <!-- Delete Error Alert -->
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
          <p class="text-[#0a0a0a] font-mono text-sm">
            Anda yakin ingin menghapus trade ini? <strong>Tindakan ini tidak bisa dibatalkan.</strong>
          </p>

          <!-- Trade Info -->
          <div class="bg-[#fafafa] border-[3px] border-black p-4">
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold uppercase tracking-wide text-[#525252]">Symbol:</span>
                <span class="text-sm font-bold font-mono text-[#0a0a0a]">{{ trade.symbol }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold uppercase tracking-wide text-[#525252]">Type:</span>
                <span
                  class="inline-block px-2 py-1 text-xs font-bold uppercase border-[2px] border-black"
                  :class="trade.type === 'BUY' ? 'bg-[#10b981] text-white' : 'bg-[#ef4444] text-white'"
                >
                  {{ trade.type }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold uppercase tracking-wide text-[#525252]">Quantity:</span>
                <span class="text-sm font-mono text-[#0a0a0a]">{{ trade.quantity.toLocaleString('id-ID') }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold uppercase tracking-wide text-[#525252]">Price:</span>
                <span class="text-sm font-mono text-[#0a0a0a]">{{ formatCurrency(trade.price) }}</span>
              </div>
              <div class="flex justify-between items-center border-t-[2px] border-black pt-2 mt-2">
                <span class="text-xs font-bold uppercase tracking-wide text-[#0a0a0a]">Total:</span>
                <span class="text-base font-bold font-mono text-[#0a0a0a]">{{ formatCurrency(tradeTotal) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-[#fafafa] border-t-[5px] border-black p-6">
          <div class="flex gap-4 justify-end">
            <button
              type="button"
              class="bg-white border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isDeleting"
              @click="handleCancel"
            >
              Batal
            </button>
            <button
              type="button"
              class="bg-[#ef4444] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              :disabled="isDeleting"
              @click="handleDelete"
            >
              <span v-if="isDeleting" class="inline-block animate-spin rounded-full h-4 w-4 border-[2px] border-white border-t-transparent"></span>
              {{ isDeleting ? 'Menghapus...' : 'Hapus Trade' }}
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
