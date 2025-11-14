<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Portfolio, PortfolioInput } from '@/types'
import { usePortfoliosStore } from '@/stores'
import { toast } from 'vue-sonner'

interface Props {
  show: boolean
  portfolio: Portfolio | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const portfoliosStore = usePortfoliosStore()

// Form state
const formData = ref<PortfolioInput>({
  name: '',
  description: '',
  initialCapital: 10000000,
  baseCurrency: 'IDR',
  marketType: 'IDX',
})

// Validation errors
const errors = ref<Partial<Record<keyof PortfolioInput, string>>>({})

// Local loading state (separate from store loading)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

/**
 * Market type options
 */
const marketTypeOptions = [
  { value: 'IDX', label: 'IDX (Bursa Efek Indonesia)' },
  { value: 'US_STOCKS', label: 'US Stocks' },
  { value: 'CRYPTO', label: 'Cryptocurrency' },
  { value: 'FOREX', label: 'Forex' },
]

/**
 * Currency options based on market type
 */
const currencyOptions = computed(() => {
  const currencyMap: Record<string, string[]> = {
    IDX: ['IDR'],
    US_STOCKS: ['USD'],
    CRYPTO: ['USD', 'USDT'],
    FOREX: ['USD', 'EUR', 'JPY', 'GBP'],
  }
  return currencyMap[formData.value.marketType] || ['IDR']
})

/**
 * Update currency when market type changes
 */
const handleMarketTypeChange = () => {
  const availableCurrencies = currencyOptions.value
  if (!availableCurrencies.includes(formData.value.baseCurrency)) {
    formData.value.baseCurrency = availableCurrencies[0] || 'IDR'
  }
}

/**
 * Load portfolio data into form when portfolio prop changes
 */
watch(
  () => props.portfolio,
  (newPortfolio) => {
    if (newPortfolio) {
      formData.value = {
        name: newPortfolio.name,
        description: newPortfolio.description || '',
        initialCapital: newPortfolio.initialCapital,
        baseCurrency: newPortfolio.baseCurrency,
        marketType: newPortfolio.marketType,
      }
      errors.value = {}
      submitError.value = null
    }
  },
  { immediate: true }
)

/**
 * Validate form
 */
const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = 'Nama portfolio wajib diisi'
  } else if (formData.value.name.trim().length < 3) {
    errors.value.name = 'Nama portfolio minimal 3 karakter'
  } else if (formData.value.name.trim().length > 50) {
    errors.value.name = 'Nama portfolio maksimal 50 karakter'
  }

  if (formData.value.description && formData.value.description.length > 200) {
    errors.value.description = 'Deskripsi maksimal 200 karakter'
  }

  if (!formData.value.initialCapital || formData.value.initialCapital <= 0) {
    errors.value.initialCapital = 'Modal awal harus lebih dari 0'
  } else if (formData.value.initialCapital > 999999999999) {
    errors.value.initialCapital = 'Modal awal terlalu besar'
  }

  if (!formData.value.baseCurrency) {
    errors.value.baseCurrency = 'Mata uang wajib dipilih'
  }

  if (!formData.value.marketType) {
    errors.value.marketType = 'Tipe market wajib dipilih'
  }

  return Object.keys(errors.value).length === 0
}

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  if (!props.portfolio) {
    submitError.value = 'Portfolio tidak ditemukan'
    return
  }

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  submitError.value = null

  try {
    await portfoliosStore.updatePortfolio(props.portfolio.id, formData.value)
    toast.success('Portfolio berhasil diupdate!')
    emit('success')
    emit('close')
  } catch (err: any) {
    const errorMessage = err.message || 'Gagal update portfolio'
    submitError.value = errorMessage
    toast.error(`Gagal mengupdate portfolio: ${errorMessage}`)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Handle cancel/close
 */
const handleClose = () => {
  if (!isSubmitting.value) {
    errors.value = {}
    submitError.value = null
    emit('close')
  }
}

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
      v-if="show && portfolio"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="handleClose"
    >
      <!-- Modal Container -->
      <div
        class="bg-white border-[5px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <!-- Modal Header -->
        <div class="bg-[#3b82f6] border-b-[5px] border-black p-6 sticky top-0 z-10">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold uppercase text-white tracking-wide">
              Edit Portfolio
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
            <!-- Portfolio Name -->
            <div>
              <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                Nama Portfolio <span class="text-[#ef4444]">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#3b82f6] transition-all"
                :class="{ 'border-[#ef4444] ring-2 ring-[#ef4444]': errors.name }"
                placeholder="e.g., Portfolio Saham IDX"
                maxlength="50"
                :disabled="isSubmitting"
              />
              <p v-if="errors.name" class="mt-2 text-sm text-[#ef4444] font-mono">
                {{ errors.name }}
              </p>
            </div>

            <!-- Description (Optional) -->
            <div>
              <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                Deskripsi (Opsional)
              </label>
              <textarea
                v-model="formData.description"
                rows="3"
                class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#3b82f6] transition-all resize-none"
                :class="{ 'border-[#ef4444] ring-2 ring-[#ef4444]': errors.description }"
                placeholder="Deskripsi singkat portfolio ini..."
                maxlength="200"
                :disabled="isSubmitting"
              ></textarea>
              <p v-if="errors.description" class="mt-2 text-sm text-[#ef4444] font-mono">
                {{ errors.description }}
              </p>
              <p class="mt-1 text-xs text-[#525252] font-mono">
                {{ (formData.description || '').length }}/200 karakter
              </p>
            </div>

            <!-- Market Type -->
            <div>
              <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                Tipe Market <span class="text-[#ef4444]">*</span>
              </label>
              <select
                v-model="formData.marketType"
                class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#3b82f6] transition-all bg-white"
                :class="{ 'border-[#ef4444] ring-2 ring-[#ef4444]': errors.marketType }"
                :disabled="isSubmitting"
                @change="handleMarketTypeChange"
              >
                <option v-for="option in marketTypeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <p v-if="errors.marketType" class="mt-2 text-sm text-[#ef4444] font-mono">
                {{ errors.marketType }}
              </p>
            </div>

            <!-- Initial Capital and Currency -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Initial Capital -->
              <div>
                <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                  Modal Awal <span class="text-[#ef4444]">*</span>
                </label>
                <input
                  v-model.number="formData.initialCapital"
                  type="number"
                  step="1000"
                  class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#3b82f6] transition-all"
                  :class="{ 'border-[#ef4444] ring-2 ring-[#ef4444]': errors.initialCapital }"
                  placeholder="10000000"
                  :disabled="isSubmitting"
                />
                <p v-if="errors.initialCapital" class="mt-2 text-sm text-[#ef4444] font-mono">
                  {{ errors.initialCapital }}
                </p>
                <p v-else class="mt-1 text-xs text-[#525252] font-mono">
                  {{ formatNumber(formData.initialCapital) }}
                </p>
              </div>

              <!-- Base Currency -->
              <div>
                <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                  Mata Uang <span class="text-[#ef4444]">*</span>
                </label>
                <select
                  v-model="formData.baseCurrency"
                  class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#3b82f6] transition-all bg-white"
                  :class="{ 'border-[#ef4444] ring-2 ring-[#ef4444]': errors.baseCurrency }"
                  :disabled="isSubmitting"
                >
                  <option v-for="currency in currencyOptions" :key="currency" :value="currency">
                    {{ currency }}
                  </option>
                </select>
                <p v-if="errors.baseCurrency" class="mt-2 text-sm text-[#ef4444] font-mono">
                  {{ errors.baseCurrency }}
                </p>
              </div>
            </div>

            <!-- Info Box -->
            <div class="bg-[#dbeafe] border-[3px] border-black p-4">
              <div class="flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-5 h-5 text-[#3b82f6] flex-shrink-0"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  />
                </svg>
                <p class="text-sm text-[#0a0a0a] font-mono">
                  Perubahan pada portfolio akan segera diterapkan. Pastikan data yang Anda masukkan sudah benar.
                </p>
              </div>
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
              class="bg-[#3b82f6] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              <span v-if="isSubmitting" class="inline-block animate-spin rounded-full h-4 w-4 border-[2px] border-white border-t-transparent"></span>
              {{ isSubmitting ? 'Menyimpan...' : 'Update Portfolio' }}
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

/* Input and textarea text color - dark and visible */
input,
textarea,
select {
  color: #0a0a0a;
}

/* Placeholder styling - medium gray */
input::placeholder,
textarea::placeholder {
  color: #737373;
  opacity: 1;
}

/* Select option styling */
select option {
  color: #0a0a0a;
  background: white;
}
</style>
