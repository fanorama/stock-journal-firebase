<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TradeInput } from '@/types'
import { useTradesStore } from '@/stores'
import { usePortfoliosStore } from '@/stores'
import StrategySelector from '@/components/strategy/StrategySelector.vue'
import { toast } from 'vue-sonner'

interface Props {
  show: boolean
  prefillData?: {
    symbol?: string
    strategyId?: string
    strategyName?: string
    notes?: string
    targetEntry?: number
    targetExit?: number
  }
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
  strategyId: undefined,
})

// Validation errors
const errors = ref<Partial<Record<keyof Omit<TradeInput, 'portfolioId'>, string>>>({})

// Local loading state
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

/**
 * Watch for modal show and apply prefill data
 */
watch(
  () => props.show,
  (newShow) => {
    if (newShow && props.prefillData) {
      // Apply prefill data when modal opens
      if (props.prefillData.symbol) {
        formData.value.symbol = props.prefillData.symbol
      }
      if (props.prefillData.strategyId) {
        formData.value.strategyId = props.prefillData.strategyId
      }
      if (props.prefillData.notes) {
        formData.value.notes = props.prefillData.notes
      }
      if (props.prefillData.targetEntry) {
        formData.value.price = props.prefillData.targetEntry
      }
      // Note: targetExit could be used for notes or future fields
    }
  }
)

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

    // Show success toast
    toast.success('Trade berhasil ditambahkan!')

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
    const errorMessage = err.message || 'Gagal membuat trade'
    submitError.value = errorMessage
    // Show error toast
    toast.error(`Gagal menambahkan trade: ${errorMessage}`)
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
      class="fixed inset-0 bg-black/50 sm:flex sm:items-center sm:justify-center z-50 p-0 sm:p-4 overflow-y-auto"
      @click.self="handleClose"
    >
      <!-- Modal Container -->
      <div
        class="h-full sm:h-auto bg-white border-0 sm:border-[5px] border-black sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] sm:max-w-2xl w-full sm:max-h-[90vh] overflow-y-auto sm:my-8"
      >
        <!-- Modal Header -->
        <div class="bg-[#10b981] border-b-[5px] border-black p-4 sm:p-6 sticky top-0 z-10">
          <div class="flex items-center justify-between">
            <!-- Back Button - Mobile Only -->
            <button
              class="sm:hidden bg-white border-[3px] border-black p-2 min-h-[44px] min-w-[44px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-100 touch-manipulation flex items-center justify-center"
              :disabled="isSubmitting"
              @click="handleClose"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>

            <h2 class="text-xl sm:text-2xl font-bold uppercase text-white tracking-wide">
              Tambah Trade Baru
            </h2>

            <!-- Close Button - Desktop Only -->
            <button
              class="hidden sm:block bg-white border-[3px] border-black p-2 min-h-[44px] min-w-[44px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 touch-manipulation"
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
        <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
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
          <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-6">
            <!-- Trade Type -->
            <div>
              <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                Tipe Trade <span class="text-[#ef4444]">*</span>
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="border-[3px] border-black px-6 py-4 min-h-[44px] font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 touch-manipulation"
                  :class="formData.type === 'BUY' ? 'bg-[#10b981] text-white' : 'bg-white text-[#0a0a0a]'"
                  :disabled="isSubmitting"
                  @click="formData.type = 'BUY'"
                >
                  📈 BUY
                </button>
                <button
                  type="button"
                  class="border-[3px] border-black px-6 py-4 min-h-[44px] font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 touch-manipulation"
                  :class="formData.type === 'SELL' ? 'bg-[#ef4444] text-white' : 'bg-white text-[#0a0a0a]'"
                  :disabled="isSubmitting"
                  @click="formData.type = 'SELL'"
                >
                  📉 SELL
                </button>
              </div>
            </div>

            <!-- Symbol and Date -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <!-- Symbol -->
              <div>
                <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                  Symbol Saham <span class="text-[#ef4444]">*</span>
                </label>
                <input
                  v-model="formData.symbol"
                  type="text"
                  list="symbol-suggestions"
                  class="w-full border-[3px] border-black p-3 min-h-[44px] font-mono uppercase focus:outline-none focus:ring-4 focus:ring-[#10b981] transition-all touch-manipulation"
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
                  class="w-full border-[3px] border-black p-3 min-h-[44px] font-mono focus:outline-none focus:ring-4 focus:ring-[#10b981] transition-all touch-manipulation"
                  :class="{ 'border-[#ef4444] ring-2 ring-[#ef4444]': errors.date }"
                  :disabled="isSubmitting"
                />
                <p v-if="errors.date" class="mt-2 text-sm text-[#ef4444] font-mono">
                  {{ errors.date }}
                </p>
              </div>
            </div>

            <!-- Quantity and Price -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <!-- Quantity -->
              <div>
                <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                  Jumlah Lot/Saham <span class="text-[#ef4444]">*</span>
                </label>
                <input
                  v-model.number="formData.quantity"
                  type="number"
                  inputmode="numeric"
                  step="1"
                  class="w-full border-[3px] border-black p-3 min-h-[44px] font-mono focus:outline-none focus:ring-4 focus:ring-[#10b981] transition-all touch-manipulation"
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
                  inputmode="decimal"
                  step="1"
                  class="w-full border-[3px] border-black p-3 min-h-[44px] font-mono focus:outline-none focus:ring-4 focus:ring-[#10b981] transition-all touch-manipulation"
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
                inputmode="decimal"
                step="1"
                class="w-full border-[3px] border-black p-3 min-h-[44px] font-mono focus:outline-none focus:ring-4 focus:ring-[#10b981] transition-all touch-manipulation"
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
                class="w-full border-[3px] border-black p-3 min-h-[80px] font-mono focus:outline-none focus:ring-4 focus:ring-[#10b981] transition-all resize-none touch-manipulation"
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

            <!-- Strategy Selector -->
            <StrategySelector v-model="formData.strategyId" />
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="bg-[#fafafa] border-t-[5px] border-black p-4 sm:p-6 sticky bottom-0">
          <div class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              class="w-full sm:w-auto bg-white border-[3px] border-black px-6 py-3 min-h-[44px] font-bold uppercase text-sm tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSubmitting"
              @click="handleClose"
            >
              Batal
            </button>
            <button
              type="submit"
              class="w-full sm:w-auto bg-[#10b981] border-[3px] border-black px-6 py-3 min-h-[44px] font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
