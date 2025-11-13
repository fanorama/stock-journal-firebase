<script setup lang="ts">
import { computed } from 'vue'
import AdherenceMetrics from './AdherenceMetrics.vue'
import ReviewNotesEditor from './ReviewNotesEditor.vue'
import type { WatchlistItem, ReviewData } from '@/types'

interface Props {
  planId: string
  watchlist: WatchlistItem[]
  review: ReviewData
  status: 'draft' | 'active' | 'completed'
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updateNotes: [notes: string]
  completePlan: []
}>()

/**
 * Calculate adherence metrics from watchlist
 */
const adherenceMetrics = computed(() => {
  const executed = props.watchlist.filter((item) => item.status === 'executed').length
  const skipped = props.watchlist.filter((item) => item.status === 'skipped').length
  const missed = props.watchlist.filter((item) => item.status === 'missed').length
  const planned = props.watchlist.filter((item) => item.status === 'planned').length

  const total = props.watchlist.length
  const decided = executed + skipped // Items that have been decided (not including planned)
  const adherenceRate = decided > 0 ? Math.round((executed / decided) * 100) : 0

  return {
    total,
    executed,
    skipped,
    missed,
    planned,
    decided,
    adherenceRate,
  }
})

/**
 * Get linked trades summary
 */
const linkedTrades = computed(() => {
  return props.watchlist.filter((item) => item.tradeId).length
})

/**
 * Can complete plan check
 */
const canCompletePlan = computed(() => {
  return props.status !== 'completed' && props.watchlist.length > 0
})

/**
 * Pre-completion validation errors
 */
const validationErrors = computed(() => {
  const errors: string[] = []

  // Check for watchlist items still in "planned" status
  const plannedCount = adherenceMetrics.value.planned
  if (plannedCount > 0) {
    errors.push(
      `${plannedCount} watchlist item${plannedCount > 1 ? 's' : ''} masih berstatus "Planned". Mark sebagai Executed/Skipped/Missed terlebih dahulu.`
    )
  }

  // Check for empty review notes
  const notes = props.review.notes.trim()
  if (!notes || notes.length === 0) {
    errors.push('Review notes masih kosong. Tulis refleksi tentang execution hari ini.')
  }

  return errors
})

/**
 * Has validation errors
 */
const hasValidationErrors = computed(() => {
  return validationErrors.value.length > 0
})

/**
 * Handle update review notes
 */
const handleUpdateNotes = (notes: string) => {
  emit('updateNotes', notes)
}

/**
 * Handle complete plan with pre-completion validation
 */
const handleCompletePlan = () => {
  if (!canCompletePlan.value) return

  // Pre-completion validation
  if (hasValidationErrors.value) {
    const errorMessage = [
      '⚠️ Plan belum bisa di-complete:',
      '',
      ...validationErrors.value.map((err, idx) => `${idx + 1}. ${err}`),
      '',
      'Selesaikan semua hal di atas terlebih dahulu.',
    ].join('\n')

    alert(errorMessage)
    return
  }

  const confirmed = confirm(
    'Mark plan sebagai completed? Kamu tidak bisa edit watchlist/checklist setelah plan completed.'
  )

  if (confirmed) {
    emit('completePlan')
  }
}
</script>

<template>
  <div class="review-section bg-white border-[5px] border-black p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
    <!-- Section Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 mb-4">
      <div class="flex-1">
        <h3 class="text-lg sm:text-xl lg:text-2xl font-bold uppercase text-[#0a0a0a] tracking-wide">
          📝 Post-Market Review
        </h3>
        <p class="text-xs font-mono text-[#525252] mt-1">
          Reflect on your execution and adherence to the plan
        </p>
      </div>

      <!-- Plan Status Badge -->
      <span
        :class="[
          'inline-block px-3 py-1 border-[3px] border-black font-bold text-xs uppercase tracking-wide',
          {
            'bg-[#fbbf24] text-[#0a0a0a]': status === 'draft',
            'bg-[#3b82f6] text-white': status === 'active',
            'bg-[#10b981] text-white': status === 'completed',
          },
        ]"
      >
        {{ status }}
      </span>
    </div>

    <!-- Adherence Metrics -->
    <AdherenceMetrics
      :total="adherenceMetrics.total"
      :executed="adherenceMetrics.executed"
      :skipped="adherenceMetrics.skipped"
      :missed="adherenceMetrics.missed"
      :planned="adherenceMetrics.planned"
      :adherence-rate="adherenceMetrics.adherenceRate"
    />

    <!-- Perfect Adherence Celebration -->
    <div
      v-if="adherenceMetrics.adherenceRate === 100 && adherenceMetrics.decided > 0"
      class="mb-4 sm:mb-6 bg-[#fef3c7] border-[3px] border-black p-4 animate-pulse"
    >
      <div class="flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-6 h-6 text-[#f59e0b] flex-shrink-0"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
          />
        </svg>
        <div>
          <p class="font-bold text-sm uppercase text-[#f59e0b] tracking-wide">
            ⭐ Perfect Adherence!
          </p>
          <p class="text-xs font-mono text-[#0a0a0a]">
            100% adherence rate - kamu execute semua plan yang sudah dibuat!
          </p>
        </div>
      </div>
    </div>

    <!-- Linked Trades Summary -->
    <div v-if="linkedTrades > 0" class="mb-4 sm:mb-6 bg-[#dbeafe] border-[3px] border-black p-4">
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-5 h-5 text-[#3b82f6]"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
          />
        </svg>
        <div class="flex-1">
          <p class="font-bold text-sm uppercase text-[#0a0a0a]">Linked Trades</p>
          <p class="text-xs font-mono text-[#0a0a0a]">
            {{ linkedTrades }} watchlist item{{ linkedTrades !== 1 ? 's' : '' }} linked to actual trades
          </p>
        </div>
      </div>
    </div>

    <!-- Review Notes Editor -->
    <ReviewNotesEditor
      :notes="review.notes"
      :is-readonly="status === 'completed'"
      @update="handleUpdateNotes"
    />

    <!-- Complete Plan Button -->
    <div v-if="canCompletePlan" class="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-[3px] border-black">
      <button
        class="w-full bg-[#10b981] border-[3px] border-black px-6 py-4 min-h-[44px] font-bold uppercase text-sm sm:text-base lg:text-lg tracking-wide text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-100 touch-manipulation"
        @click="handleCompletePlan"
      >
        ✓ Complete Plan
      </button>
      <p class="text-xs font-mono text-[#525252] text-center mt-2">
        Mark this plan as completed. You won't be able to edit after completion.
      </p>
    </div>

    <!-- Completed Message -->
    <div v-else-if="status === 'completed'" class="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-[3px] border-black">
      <div class="bg-[#d1fae5] border-[3px] border-black p-6 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-12 h-12 mx-auto text-[#10b981] mb-3"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
          />
        </svg>
        <h4 class="text-lg font-bold uppercase text-[#0a0a0a] mb-2 tracking-wide">
          Plan Completed
        </h4>
        <p class="text-sm font-mono text-[#525252]">
          This plan has been marked as completed and is now read-only.
        </p>
        <p v-if="review.completedAt" class="text-xs font-mono text-[#a3a3a3] mt-2">
          Completed: {{ new Date(review.completedAt.toDate()).toLocaleString('id-ID') }}
        </p>
      </div>
    </div>
  </div>
</template>
