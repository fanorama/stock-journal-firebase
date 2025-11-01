<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useJournalsStore, usePortfoliosStore, useTradesStore } from '@/stores'
import type { Journal, JournalInput } from '@/types'

/**
 * Props
 */
interface Props {
  show: boolean
  journal: Journal | null
}

const props = defineProps<Props>()

/**
 * Emits
 */
const emit = defineEmits<{
  close: []
  success: []
}>()

// Stores
const journalsStore = useJournalsStore()
const portfoliosStore = usePortfoliosStore()
const tradesStore = useTradesStore()

// Form state
const formData = ref<Omit<JournalInput, 'portfolioId'>>({
  tradeId: '',
  entryReason: '',
  exitStrategy: '',
  emotions: '',
  lessonsLearned: '',
})

const isSubmitting = ref(false)
const error = ref<string | null>(null)

/**
 * Available trades for linking
 */
const availableTrades = computed(() => {
  return tradesStore.trades || []
})

/**
 * Validate form: at least one field must be filled
 */
const isFormValid = computed(() => {
  return (
    formData.value.entryReason?.trim() ||
    formData.value.exitStrategy?.trim() ||
    formData.value.emotions?.trim() ||
    formData.value.lessonsLearned?.trim()
  )
})

/**
 * Load journal data into form
 */
const loadJournalData = (journal: Journal) => {
  formData.value = {
    tradeId: journal.tradeId || '',
    entryReason: journal.entryReason || '',
    exitStrategy: journal.exitStrategy || '',
    emotions: journal.emotions || '',
    lessonsLearned: journal.lessonsLearned || '',
  }
  error.value = null
}

/**
 * Watch journal prop changes
 */
watch(
  () => props.journal,
  (newJournal) => {
    if (newJournal && props.show) {
      loadJournalData(newJournal)
    }
  },
  { immediate: true }
)

/**
 * Watch show prop to load data
 */
watch(
  () => props.show,
  (newShow) => {
    if (newShow && props.journal) {
      loadJournalData(props.journal)
    }
  }
)

/**
 * Handle submit
 */
const handleSubmit = async () => {
  if (!isFormValid.value) {
    error.value = 'Minimal satu field harus diisi'
    return
  }

  if (!props.journal) {
    error.value = 'Journal tidak ditemukan'
    return
  }

  if (!portfoliosStore.activePortfolioId) {
    error.value = 'Portfolio harus dipilih terlebih dahulu'
    return
  }

  isSubmitting.value = true
  error.value = null

  try {
    const updates: Partial<JournalInput> = {
      tradeId: formData.value.tradeId || undefined,
      entryReason: formData.value.entryReason?.trim() || undefined,
      exitStrategy: formData.value.exitStrategy?.trim() || undefined,
      emotions: formData.value.emotions?.trim() || undefined,
      lessonsLearned: formData.value.lessonsLearned?.trim() || undefined,
    }

    await journalsStore.updateJournal(props.journal.id, updates)
    emit('success')
    emit('close')
  } catch (err: any) {
    error.value = err.message || 'Gagal update journal entry'
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Handle close
 */
const handleClose = () => {
  if (!isSubmitting.value) {
    emit('close')
    error.value = null
  }
}

/**
 * Format trade for display
 */
const formatTrade = (trade: any): string => {
  const type = trade.type === 'BUY' ? '📈' : '📉'
  const date = trade.date.toDate ? trade.date.toDate() : new Date(trade.date)
  const dateStr = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
  }).format(date)
  return `${type} ${trade.symbol} - ${trade.quantity} @ ${trade.price.toLocaleString('id-ID')} (${dateStr})`
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show && journal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="handleClose"
      >
        <div
          class="bg-white border-[5px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <!-- Modal Header -->
          <div class="bg-[#3b82f6] border-b-[5px] border-black p-6 flex items-center justify-between">
            <h2 class="text-2xl font-bold uppercase text-white tracking-wide">
              ✏️ Edit Journal Entry
            </h2>
            <button
              class="bg-white border-[3px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
              @click="handleClose"
              :disabled="isSubmitting"
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

          <!-- Modal Body -->
          <div class="flex-1 overflow-y-auto p-6">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Error Message -->
              <div
                v-if="error"
                class="bg-[#ef4444] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <p class="text-white font-mono text-sm">{{ error }}</p>
              </div>

              <!-- Info Banner -->
              <div class="bg-[#fef3c7] border-[3px] border-black p-4">
                <p class="text-sm font-mono text-[#525252]">
                  📝 Update your trading reflections. At least one field must be filled.
                </p>
              </div>

              <!-- Link to Trade (Optional) -->
              <div>
                <label class="block font-bold uppercase text-sm tracking-wide text-[#0a0a0a] mb-2">
                  🔗 Link to Trade (Optional)
                </label>
                <select
                  v-model="formData.tradeId"
                  class="w-full bg-white border-[3px] border-black px-4 py-3 font-mono text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all duration-100"
                >
                  <option value="">Standalone Journal (No Trade Link)</option>
                  <option
                    v-for="trade in availableTrades"
                    :key="trade.id"
                    :value="trade.id"
                  >
                    {{ formatTrade(trade) }}
                  </option>
                </select>
              </div>

              <!-- Entry Reason -->
              <div>
                <label class="block font-bold uppercase text-sm tracking-wide text-[#0a0a0a] mb-2">
                  📌 Entry Reason
                </label>
                <textarea
                  v-model="formData.entryReason"
                  rows="3"
                  class="w-full bg-white border-[3px] border-black px-4 py-3 font-mono text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all duration-100 resize-none"
                  placeholder="Why did you enter this position? What was your analysis?"
                ></textarea>
              </div>

              <!-- Exit Strategy -->
              <div>
                <label class="block font-bold uppercase text-sm tracking-wide text-[#0a0a0a] mb-2">
                  🎯 Exit Strategy
                </label>
                <textarea
                  v-model="formData.exitStrategy"
                  rows="3"
                  class="w-full bg-white border-[3px] border-black px-4 py-3 font-mono text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all duration-100 resize-none"
                  placeholder="What's your exit plan? Target price, stop loss, time frame?"
                ></textarea>
              </div>

              <!-- Emotions & Mindset -->
              <div>
                <label class="block font-bold uppercase text-sm tracking-wide text-[#0a0a0a] mb-2">
                  💭 Emotions & Mindset
                </label>
                <textarea
                  v-model="formData.emotions"
                  rows="3"
                  class="w-full bg-white border-[3px] border-black px-4 py-3 font-mono text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all duration-100 resize-none"
                  placeholder="How are you feeling about this trade? Any emotional triggers?"
                ></textarea>
              </div>

              <!-- Lessons Learned -->
              <div>
                <label class="block font-bold uppercase text-sm tracking-wide text-[#0a0a0a] mb-2">
                  📚 Lessons Learned
                </label>
                <textarea
                  v-model="formData.lessonsLearned"
                  rows="3"
                  class="w-full bg-white border-[3px] border-black px-4 py-3 font-mono text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all duration-100 resize-none"
                  placeholder="What did you learn? What would you do differently?"
                ></textarea>
              </div>
            </form>
          </div>

          <!-- Modal Footer -->
          <div class="border-t-[5px] border-black p-6 bg-[#fafafa] flex gap-3 justify-end">
            <button
              type="button"
              class="bg-white border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-100"
              @click="handleClose"
              :disabled="isSubmitting"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-[#3b82f6] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100"
              @click="handleSubmit"
              :disabled="!isFormValid || isSubmitting"
            >
              {{ isSubmitting ? 'Updating...' : 'Update Journal Entry' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.2s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
