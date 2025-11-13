<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { WatchlistItem, WatchlistStatus } from '@/types'

interface Props {
  show: boolean
  item: WatchlistItem | null
  action: 'skipped' | 'missed'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: [status: WatchlistStatus, outcomeNotes: string]
}>()

// Form state
const outcomeNotes = ref('')
const selectedReason = ref('')

// Predefined reasons for "skipped"
const skipReasons = [
  'Price tidak sesuai target entry',
  'Volume terlalu rendah',
  'Market condition tidak mendukung',
  'Setup tidak valid lagi',
  'Risk/Reward tidak favorable',
  'Other (tulis di notes)',
]

// Predefined reasons for "missed"
const missedReasons = [
  'Terlambat execute, price sudah run',
  'Tidak sempat monitor',
  'Terlalu ragu untuk entry',
  'Modal sudah terpakai di trade lain',
  'Lupa set alert',
  'Other (tulis di notes)',
]

// Get reasons based on action
const reasons = computed(() => {
  return props.action === 'skipped' ? skipReasons : missedReasons
})

// Modal title
const modalTitle = computed(() => {
  return props.action === 'skipped' ? 'Mark as Skipped' : 'Mark as Missed'
})

// Modal description
const modalDescription = computed(() => {
  if (props.action === 'skipped') {
    return 'Kamu dengan sengaja skip stock ini. Catat alasannya untuk learning.'
  } else {
    return 'Kamu miss opportunity untuk execute. Catat apa yang terjadi.'
  }
})

// Button color
const buttonColor = computed(() => {
  return props.action === 'skipped' ? 'bg-[#a3a3a3]' : 'bg-[#f87171]'
})

/**
 * Watch modal show to reset form
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
 * Reset form to initial state
 */
const resetForm = () => {
  outcomeNotes.value = ''
  selectedReason.value = ''
}

/**
 * Handle confirm
 */
const handleConfirm = () => {
  // Build notes from reason + custom notes
  let finalNotes = selectedReason.value

  if (outcomeNotes.value.trim()) {
    if (selectedReason.value) {
      finalNotes += `\n\n${outcomeNotes.value.trim()}`
    } else {
      finalNotes = outcomeNotes.value.trim()
    }
  }

  // Emit confirm with status and notes
  const status: WatchlistStatus = props.action === 'skipped' ? 'skipped' : 'missed'
  emit('confirm', status, finalNotes)
  emit('close')
}

/**
 * Handle close
 */
const handleClose = () => {
  resetForm()
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show && item"
      class="fixed inset-0 bg-black/50 sm:flex sm:items-center sm:justify-center z-50 p-0 sm:p-4"
      @click.self="handleClose"
    >
      <div
        class="h-full sm:h-auto bg-white border-0 sm:border-[5px] border-black p-4 sm:p-6 sm:max-w-md w-full sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <!-- Modal Header -->
        <div class="mb-3 sm:mb-4">
          <h3 class="text-lg sm:text-xl font-bold uppercase text-[#0a0a0a] tracking-wide">
            {{ modalTitle }}
          </h3>
          <p class="text-xs font-mono text-[#525252] mt-1">
            {{ item.symbol }} - {{ item.strategyName }}
          </p>
        </div>

        <!-- Description -->
        <div class="bg-[#dbeafe] border-[3px] border-black p-3 mb-4">
          <p class="text-xs font-mono text-[#0a0a0a]">
            {{ modalDescription }}
          </p>
        </div>

        <!-- Reason Selector -->
        <div class="mb-4">
          <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
            Alasan {{ action === 'skipped' ? 'Skip' : 'Missed' }}
          </label>
          <select
            v-model="selectedReason"
            class="w-full border-[3px] border-black p-3 min-h-[44px] font-mono text-sm text-[#0a0a0a] focus:outline-none focus:ring-4 focus:ring-[#3b82f6] transition-all bg-white touch-manipulation"
          >
            <option value="">Pilih alasan...</option>
            <option v-for="reason in reasons" :key="reason" :value="reason">
              {{ reason }}
            </option>
          </select>
        </div>

        <!-- Additional Notes -->
        <div class="mb-6">
          <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
            Catatan Tambahan (Optional)
          </label>
          <textarea
            v-model="outcomeNotes"
            rows="3"
            placeholder="Tambahkan detail lainnya..."
            class="w-full border-[3px] border-black p-3 min-h-[80px] font-mono text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-4 focus:ring-[#3b82f6] transition-all resize-none touch-manipulation"
            maxlength="300"
          ></textarea>
          <p class="text-xs text-[#525252] font-mono mt-1">
            {{ outcomeNotes.length }}/300 characters
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            class="w-full sm:w-auto bg-[#fafafa] border-[3px] border-black px-4 py-2 min-h-[44px] font-bold uppercase text-sm tracking-wide text-[#0a0a0a] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 touch-manipulation"
            @click="handleClose"
          >
            Batal
          </button>
          <button
            :disabled="!selectedReason && !outcomeNotes.trim()"
            :class="[
              'w-full sm:w-auto border-[3px] border-black px-4 py-2 min-h-[44px] font-bold uppercase text-sm tracking-wide text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed',
              buttonColor,
            ]"
            @click="handleConfirm"
          >
            {{ action === 'skipped' ? 'Mark as Skipped' : 'Mark as Missed' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
