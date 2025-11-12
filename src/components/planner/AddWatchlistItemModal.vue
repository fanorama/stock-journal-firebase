<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { WatchlistItem } from '@/types'
import { useStrategiesStore } from '@/stores'
import StrategyPreviewPanel from '../strategy/StrategyPreviewPanel.vue'

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: [item: Omit<WatchlistItem, 'id' | 'addedAt' | 'position'>]
}>()

const strategiesStore = useStrategiesStore()

// Form state
const formData = ref({
  symbol: '',
  strategyId: '',
  strategyName: '',
  notes: '',
  targetEntry: undefined as number | undefined,
  targetExit: undefined as number | undefined,
})

// UI state
const showStrategyPreview = ref(false)
const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

// Get selected strategy
const selectedStrategy = computed(() => {
  if (!formData.value.strategyId) return null
  return strategiesStore.getStrategyById(formData.value.strategyId)
})

/**
 * Watch strategy selection to auto-fill strategy name and show preview
 */
watch(
  () => formData.value.strategyId,
  (newStrategyId) => {
    if (newStrategyId) {
      const strategy = strategiesStore.getStrategyById(newStrategyId)
      if (strategy) {
        formData.value.strategyName = strategy.name
        showStrategyPreview.value = true
      }
    } else {
      formData.value.strategyName = ''
      showStrategyPreview.value = false
    }
  }
)

/**
 * Reset form when modal closes
 */
watch(
  () => props.show,
  (newShow) => {
    if (!newShow) {
      resetForm()
    }
  }
)

/**
 * Validate form
 */
const validateForm = (): boolean => {
  errors.value = {}

  // Symbol is required
  if (!formData.value.symbol.trim()) {
    errors.value.symbol = 'Symbol wajib diisi'
  } else if (formData.value.symbol.trim().length > 10) {
    errors.value.symbol = 'Symbol maksimal 10 karakter'
  }

  // Strategy is required
  if (!formData.value.strategyId) {
    errors.value.strategyId = 'Strategy wajib dipilih'
  }

  // Notes validation (optional but limited length)
  if (formData.value.notes && formData.value.notes.length > 500) {
    errors.value.notes = 'Notes maksimal 500 karakter'
  }

  // Validate target prices (optional)
  if (formData.value.targetEntry !== undefined && formData.value.targetEntry <= 0) {
    errors.value.targetEntry = 'Target entry harus > 0'
  }

  if (formData.value.targetExit !== undefined && formData.value.targetExit <= 0) {
    errors.value.targetExit = 'Target exit harus > 0'
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

  isSubmitting.value = true

  try {
    // Emit success with form data
    emit('success', {
      symbol: formData.value.symbol.trim().toUpperCase(),
      strategyId: formData.value.strategyId,
      strategyName: formData.value.strategyName,
      notes: formData.value.notes.trim(),
      targetEntry: formData.value.targetEntry,
      targetExit: formData.value.targetExit,
      status: 'planned',
      tradeId: undefined,
      outcome: undefined,
    })

    resetForm()
  } catch (error) {
    console.error('Error adding watchlist item:', error)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Reset form to initial state
 */
const resetForm = () => {
  formData.value = {
    symbol: '',
    strategyId: '',
    strategyName: '',
    notes: '',
    targetEntry: undefined,
    targetExit: undefined,
  }
  errors.value = {}
  showStrategyPreview.value = false
}

/**
 * Handle modal close
 */
const handleClose = () => {
  resetForm()
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      @click.self="handleClose"
    >
      <div
        class="bg-white border-[5px] border-black p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-8"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold uppercase text-[#0a0a0a] tracking-wide">
            Add to Watchlist
          </h3>
          <button
            class="p-2 border-[3px] border-black hover:bg-[#fafafa] transition-colors"
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

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Symbol Input -->
          <div>
            <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
              Stock Symbol *
            </label>
            <input
              v-model="formData.symbol"
              type="text"
              placeholder="e.g., BBCA, BMRI, TLKM"
              class="w-full border-[3px] border-black p-3 font-mono uppercase focus:outline-none focus:ring-4 focus:ring-[#3b82f6] transition-all"
              :class="{ 'border-[#ef4444]': errors.symbol }"
            />
            <p v-if="errors.symbol" class="text-xs text-[#ef4444] font-mono mt-1">
              {{ errors.symbol }}
            </p>
          </div>

          <!-- Strategy Selector -->
          <div>
            <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
              Strategy *
            </label>
            <select
              v-model="formData.strategyId"
              class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#3b82f6] transition-all bg-white"
              :class="{ 'border-[#ef4444]': errors.strategyId }"
            >
              <option value="">Pilih Strategy</option>
              <option
                v-for="strategy in strategiesStore.strategies"
                :key="strategy.id"
                :value="strategy.id"
              >
                {{ strategy.name }}
              </option>
            </select>
            <p v-if="errors.strategyId" class="text-xs text-[#ef4444] font-mono mt-1">
              {{ errors.strategyId }}
            </p>

            <!-- No strategies warning -->
            <div
              v-if="!strategiesStore.hasStrategies"
              class="mt-2 bg-[#fef3c7] border-[2px] border-black p-3 flex gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4 text-[#f59e0b] flex-shrink-0"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
              <p class="text-xs text-[#0a0a0a] font-mono">
                Belum ada strategy. Buat strategy di halaman Strategies terlebih dahulu.
              </p>
            </div>
          </div>

          <!-- Strategy Preview (conditionally shown) -->
          <div v-if="selectedStrategy && showStrategyPreview">
            <StrategyPreviewPanel :strategy="selectedStrategy" mode="inline" />
          </div>

          <!-- Notes Input -->
          <div>
            <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
              Notes / Reasoning
            </label>
            <textarea
              v-model="formData.notes"
              rows="3"
              placeholder="Why this stock matches the strategy? Key levels to watch?"
              class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#3b82f6] transition-all resize-none"
              :class="{ 'border-[#ef4444]': errors.notes }"
            ></textarea>
            <p v-if="errors.notes" class="text-xs text-[#ef4444] font-mono mt-1">
              {{ errors.notes }}
            </p>
            <p class="text-xs text-[#525252] font-mono mt-1">
              {{ formData.notes.length }}/500 characters
            </p>
          </div>

          <!-- Target Prices (Optional) -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Target Entry -->
            <div>
              <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                Target Entry (Optional)
              </label>
              <input
                v-model.number="formData.targetEntry"
                type="number"
                step="any"
                placeholder="e.g., 8500"
                class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#3b82f6] transition-all"
                :class="{ 'border-[#ef4444]': errors.targetEntry }"
              />
              <p v-if="errors.targetEntry" class="text-xs text-[#ef4444] font-mono mt-1">
                {{ errors.targetEntry }}
              </p>
            </div>

            <!-- Target Exit -->
            <div>
              <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                Target Exit (Optional)
              </label>
              <input
                v-model.number="formData.targetExit"
                type="number"
                step="any"
                placeholder="e.g., 9000"
                class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#3b82f6] transition-all"
                :class="{ 'border-[#ef4444]': errors.targetExit }"
              />
              <p v-if="errors.targetExit" class="text-xs text-[#ef4444] font-mono mt-1">
                {{ errors.targetExit }}
              </p>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex gap-3 justify-end pt-4 border-t-[3px] border-black">
            <button
              type="button"
              class="bg-[#fafafa] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
              @click="handleClose"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || !strategiesStore.hasStrategies"
              class="bg-[#3b82f6] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Adding...' : 'Add to Watchlist' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Custom styling for inputs */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
