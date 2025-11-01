<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TradeInput } from '@/types'
import { useTradesStore } from '@/stores'
import { usePortfoliosStore } from '@/stores'

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: [tradeId: string]
}>()

const tradesStore = useTradesStore()
const portfoliosStore = usePortfoliosStore()

// Form state
const formData = ref<Omit<TradeInput, 'portfolioId'>>({
  symbol: '',
  type: 'BUY',
  quantity: 0,
  price: 0,
  date: new Date(),
  fees: 0,
  notes: '',
})

// Validation errors
const errors = ref<Partial<Record<keyof Omit<TradeInput, 'portfolioId'>, string>>>({})

// Local loading state
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

/**
 * Common IDX stock symbols for autocomplete
 */
const commonSymbols = [
  'BBCA', 'BBRI', 'BMRI', 'BBNI', 'TLKM',
  'ASII', 'UNVR', 'ICBP', 'HMSP', 'INDF',
  'KLBF', 'UNTR', 'GGRM', 'SMGR', 'ADRO',
  'INTP', 'PTBA', 'ITMG', 'AKRA', 'AMRT'
]

/**
 * Format date to YYYY-MM-DD for input
 */
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Current date input value
 */
const dateInput = computed({
  get: () => {
    if (formData.value.date instanceof Date) {
      return formatDateForInput(formData.value.date)
    }
    return formatDateForInput(new Date())
  },
  set: (value: string) => {
    formData.value.date = new Date(value)
  }
})

/**
 * Validate form
 */
const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.symbol.trim()) {
    errors.value.symbol = 'Symbol saham wajib diisi'
  } else if (formData.value.symbol.trim().length > 10) {
    errors.value.symbol = 'Symbol saham maksimal 10 karakter'
  } else if (!/^[A-Z0-9]+$/.test(formData.value.symbol.trim())) {
    errors.value.symbol = 'Symbol harus huruf kapital dan angka saja'
  }

  if (!formData.value.quantity || formData.value.quantity <= 0) {
    errors.value.quantity = 'Jumlah saham harus lebih dari 0'
  } else if (formData.value.quantity % 1 !== 0) {
    errors.value.quantity = 'Jumlah saham harus bilangan bulat'
  } else if (formData.value.quantity > 999999999) {
    errors.value.quantity = 'Jumlah saham terlalu besar'
  }

  if (!formData.value.price || formData.value.price <= 0) {
    errors.value.price = 'Harga per saham harus lebih dari 0'
  } else if (formData.value.price > 999999999) {
    errors.value.price = 'Harga terlalu besar'
  }

  if (formData.value.fees !== undefined && formData.value.fees < 0) {
    errors.value.fees = 'Biaya tidak boleh negatif'
  }

  if (!formData.value.date) {
    errors.value.date = 'Tanggal trade wajib diisi'
  }

  if (formData.value.notes && formData.value.notes.length > 500) {
    errors.value.notes = 'Catatan maksimal 500 karakter'
  }

  return Object.keys(errors.value).length === 0
}

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  if (!portfoliosStore.activePortfolioId) {
    submitError.value = 'Silakan pilih portfolio terlebih dahulu'
    return
  }

  isSubmitting.value = true
  submitError.value = null

  try {
    const tradeInput: TradeInput = {
      ...formData.value,
      portfolioId: portfoliosStore.activePortfolioId,
      symbol: formData.value.symbol.toUpperCase().trim(),
    }

    const tradeId = await tradesStore.createTrade(tradeInput)

    // Reset form
    formData.value = {
      symbol: '',
      type: 'BUY',
      quantity: 0,
      price: 0,
      date: new Date(),
      fees: 0,
      notes: '',
    }
    errors.value = {}

    emit('success', tradeId)
    emit('close')
  } catch (err: any) {
    submitError.value = err.message || 'Gagal membuat trade'
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Handle cancel/close
 */
const handleClose = () => {
  if (!isSubmitting.value) {
    // Reset form
    formData.value = {
      symbol: '',
      type: 'BUY',
      quantity: 0,
      price: 0,
      date: new Date(),
      fees: 0,
      notes: '',
    }
    errors.value = {}
    submitError.value = null
    emit('close')
  }
}

/**
 * Calculate total cost/proceeds
 */
const totalAmount = computed(() => {
  const subtotal = formData.value.quantity * formData.value.price
  const fees = formData.value.fees || 0

  if (formData.value.type === 'BUY') {
    return subtotal + fees
  } else {
    return subtotal - fees
  }
})

/**
 * Format number with thousand separators
 */
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value)
}
</script>

<template>
  <!-- Modal Backdrop -->
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="handleClose"
    >
      <!-- Modal Container -->
      <div
        class="bg-white border-[5px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <!-- Modal Header -->
        <div class="bg-[#10b981] border-b-[5px] border-black p-6 sticky top-0 z-10">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold uppercase text-white tracking-wide">
              Tambah Trade Baru
            </h2>
            <button
              class="bg-white border-[3px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
              :disabled="isSubmitting"
              @click="handleClose"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6">
          <!-- Submit Error Alert -->
          <div
            v-if="submitError"
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
              <p class="text-white font-mono text-sm">{{ submitError }}</p>
            </div>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Trade Type -->
            <div>
              <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                Tipe Trade <span class="text-[#ef4444]">*</span>
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="border-[3px] border-black px-6 py-4 font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-100"
                  :class="formData.type === 'BUY' ? 'bg-[#10b981] text-white' : 'bg-white text-[#0a0a0a]'"
                  :disabled="isSubmitting"
                  @click="formData.type = 'BUY'"
                >
                  📈 BUY
                </button>
                <button
                  type="button"
                  class="border-[3px] border-black px-6 py-4 font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-100"
                  :class="formData.type === 'SELL' ? 'bg-[#ef4444] text-white' : 'bg-white text-[#0a0a0a]'"
                  :disabled="isSubmitting"
                  @click="formData.type = 'SELL'"
                >
                  📉 SELL
                </button>
              </div>
            </div>

            <!-- Symbol and Date -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Symbol -->
              <div>
                <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                  Symbol Saham <span class="text-[#ef4444]">*</span>
                </label>
                <input
                  v-model="formData.symbol"
                  type="text"
                  list="symbol-suggestions"
                  class="w-full border-[3px] border-black p-3 font-mono uppercase focus:outline-none focus:ring-4 focus:ring-[#10b981] transition-all"
                  :class="{ 'border-[#ef4444] ring-2 ring-[#ef4444]': errors.symbol }"
                  placeholder="e.g., BBCA"
                  maxlength="10"
                  :disabled="isSubmitting"
                />
                <datalist id="symbol-suggestions">
                  <option v-for="symbol in commonSymbols" :key="symbol" :value="symbol" />
                </datalist>
                <p v-if="errors.symbol" class="mt-2 text-sm text-[#ef4444] font-mono">
                  {{ errors.symbol }}
                </p>
              </div>

              <!-- Date -->
              <div>
                <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                  Tanggal Trade <span class="text-[#ef4444]">*</span>
                </label>
                <input
                  v-model="dateInput"
                  type="date"
                  class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#10b981] transition-all"
                  :class="{ 'border-[#ef4444] ring-2 ring-[#ef4444]': errors.date }"
                  :disabled="isSubmitting"
                />
                <p v-if="errors.date" class="mt-2 text-sm text-[#ef4444] font-mono">
                  {{ errors.date }}
                </p>
              </div>
            </div>

            <!-- Quantity and Price -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Quantity -->
              <div>
                <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                  Jumlah Lot/Saham <span class="text-[#ef4444]">*</span>
                </label>
                <input
                  v-model.number="formData.quantity"
                  type="number"
                  step="1"
                  class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#10b981] transition-all"
                  :class="{ 'border-[#ef4444] ring-2 ring-[#ef4444]': errors.quantity }"
                  placeholder="100"
                  :disabled="isSubmitting"
                />
                <p v-if="errors.quantity" class="mt-2 text-sm text-[#ef4444] font-mono">
                  {{ errors.quantity }}
                </p>
              </div>

              <!-- Price -->
              <div>
                <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                  Harga per Saham <span class="text-[#ef4444]">*</span>
                </label>
                <input
                  v-model.number="formData.price"
                  type="number"
                  step="1"
                  class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#10b981] transition-all"
                  :class="{ 'border-[#ef4444] ring-2 ring-[#ef4444]': errors.price }"
                  placeholder="8500"
                  :disabled="isSubmitting"
                />
                <p v-if="errors.price" class="mt-2 text-sm text-[#ef4444] font-mono">
                  {{ errors.price }}
                </p>
                <p v-else class="mt-1 text-xs text-[#525252] font-mono">
                  Rp {{ formatNumber(formData.price) }}
                </p>
              </div>
            </div>

            <!-- Fees -->
            <div>
              <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                Biaya (Fee + Tax)
              </label>
              <input
                v-model.number="formData.fees"
                type="number"
                step="1"
                class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#10b981] transition-all"
                :class="{ 'border-[#ef4444] ring-2 ring-[#ef4444]': errors.fees }"
                placeholder="0"
                :disabled="isSubmitting"
              />
              <p v-if="errors.fees" class="mt-2 text-sm text-[#ef4444] font-mono">
                {{ errors.fees }}
              </p>
              <p v-else class="mt-1 text-xs text-[#525252] font-mono">
                Rp {{ formatNumber(formData.fees || 0) }}
              </p>
            </div>

            <!-- Total Calculation -->
            <div class="bg-[#fef3c7] border-[3px] border-black p-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold uppercase tracking-wide text-[#0a0a0a]">
                  Total {{ formData.type === 'BUY' ? 'Biaya' : 'Penerimaan' }}:
                </span>
                <span class="text-lg font-bold font-mono text-[#0a0a0a]">
                  Rp {{ formatNumber(totalAmount) }}
                </span>
              </div>
              <p class="mt-2 text-xs text-[#525252] font-mono">
                {{ formData.quantity }} × Rp {{ formatNumber(formData.price) }}
                {{ formData.type === 'BUY' ? '+' : '-' }} Rp {{ formatNumber(formData.fees || 0) }} (fees)
              </p>
            </div>

            <!-- Notes (Optional) -->
            <div>
              <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                v-model="formData.notes"
                rows="3"
                class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#10b981] transition-all resize-none"
                :class="{ 'border-[#ef4444] ring-2 ring-[#ef4444]': errors.notes }"
                placeholder="Catatan singkat tentang trade ini..."
                maxlength="500"
                :disabled="isSubmitting"
              ></textarea>
              <p v-if="errors.notes" class="mt-2 text-sm text-[#ef4444] font-mono">
                {{ errors.notes }}
              </p>
              <p class="mt-1 text-xs text-[#525252] font-mono">
                {{ (formData.notes || '').length }}/500 karakter
              </p>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="bg-[#fafafa] border-t-[5px] border-black p-6 sticky bottom-0">
          <div class="flex gap-4 justify-end">
            <button
              type="button"
              class="bg-white border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSubmitting"
              @click="handleClose"
            >
              Batal
            </button>
            <button
              type="submit"
              class="bg-[#10b981] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              <span v-if="isSubmitting" class="inline-block animate-spin rounded-full h-4 w-4 border-[2px] border-white border-t-transparent"></span>
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Trade' }}
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

/* Input and textarea text color */
input,
textarea,
select {
  color: #0a0a0a;
}

/* Placeholder styling */
input::placeholder,
textarea::placeholder {
  color: #737373;
  opacity: 1;
}
</style>
