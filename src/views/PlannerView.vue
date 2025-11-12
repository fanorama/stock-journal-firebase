<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useDailyPlansStore } from '@/stores'
import { formatDateToId } from '@/firebase/firestore'

const dailyPlansStore = useDailyPlansStore()

// Selected date state (default to today)
const selectedDate = ref(new Date())
const selectedDateId = computed(() => formatDateToId(selectedDate.value))

// Get plan for selected date
const currentPlan = computed(() => {
  return dailyPlansStore.getPlanByDate(selectedDateId.value)
})

// Auto-create plan if it doesn't exist for selected date
const isCreatingPlan = ref(false)

watch(
  selectedDateId,
  async (newDateId) => {
    if (!dailyPlansStore.hasPlanForDate(newDateId) && !isCreatingPlan.value) {
      isCreatingPlan.value = true
      try {
        await dailyPlansStore.createPlan(newDateId)
      } catch (error) {
        console.error('Failed to create plan:', error)
      } finally {
        isCreatingPlan.value = false
      }
    }
  },
  { immediate: true }
)

// Date navigation helpers
const goToToday = () => {
  selectedDate.value = new Date()
}

const goToPreviousDay = () => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() - 1)
  selectedDate.value = date
}

const goToNextDay = () => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + 1)
  selectedDate.value = date
}

// Format date for display
const formattedDate = computed(() => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return selectedDate.value.toLocaleDateString('id-ID', options)
})

// Check if selected date is today
const isToday = computed(() => {
  return formatDateToId(selectedDate.value) === formatDateToId(new Date())
})

// Plan status badge
const planStatusBadge = computed(() => {
  if (!currentPlan.value) return { text: 'No Plan', color: 'bg-gray-400' }

  const status = currentPlan.value.status
  switch (status) {
    case 'draft':
      return { text: 'Draft', color: 'bg-yellow-400' }
    case 'active':
      return { text: 'Active', color: 'bg-blue-500' }
    case 'completed':
      return { text: 'Completed', color: 'bg-green-500' }
    default:
      return { text: 'Unknown', color: 'bg-gray-400' }
  }
})
</script>

<template>
  <MainLayout>
    <template #header-title>Daily Planner</template>

    <template #header-actions>
      <button
        v-if="!isToday"
        class="bg-[#3b82f6] border-[3px] border-black px-4 py-2 font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
        @click="goToToday"
      >
        Today
      </button>
    </template>

    <div class="space-y-6">
      <!-- Date Selector -->
      <div
        class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <div class="flex items-center justify-between">
          <!-- Previous Day Button -->
          <button
            class="bg-[#fafafa] border-[3px] border-black px-4 py-2 font-bold text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
            @click="goToPreviousDay"
          >
            ← Previous
          </button>

          <!-- Current Date Display -->
          <div class="text-center">
            <h2 class="text-2xl font-bold uppercase text-[#0a0a0a] tracking-wide">
              {{ formattedDate }}
            </h2>
            <div class="mt-2">
              <span
                :class="[
                  'inline-block px-4 py-1 border-[3px] border-black font-bold text-xs uppercase tracking-wide text-white',
                  planStatusBadge.color,
                ]"
              >
                {{ planStatusBadge.text }}
              </span>
            </div>
          </div>

          <!-- Next Day Button -->
          <button
            class="bg-[#fafafa] border-[3px] border-black px-4 py-2 font-bold text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
            @click="goToNextDay"
          >
            Next →
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="dailyPlansStore.isLoading || isCreatingPlan"
        class="bg-white border-[5px] border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center"
      >
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-[4px] border-black border-t-transparent"
        ></div>
        <p class="mt-4 text-[#525252] font-mono font-bold uppercase tracking-wide">
          Loading Plan...
        </p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="dailyPlansStore.error"
        class="bg-[#ef4444] border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <div class="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-6 h-6 text-white"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <div>
            <h3 class="font-bold uppercase text-white tracking-wide">Error</h3>
            <p class="text-white font-mono text-sm">{{ dailyPlansStore.error }}</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <template v-else-if="currentPlan">
        <!-- Watchlist Section Placeholder -->
        <div
          class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <h3 class="text-xl font-bold uppercase text-[#0a0a0a] mb-4 tracking-wide">
            📋 Watchlist
          </h3>
          <p class="text-[#525252] font-mono text-sm">
            Watchlist component will be added in Phase 2.3
          </p>
          <div class="mt-4 p-4 bg-[#fafafa] border-[3px] border-black">
            <p class="font-mono text-xs text-[#525252]">
              Items in watchlist: {{ currentPlan.watchlist.length }}
            </p>
          </div>
        </div>

        <!-- Checklist Section Placeholder -->
        <div
          class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <h3 class="text-xl font-bold uppercase text-[#0a0a0a] mb-4 tracking-wide">
            ✅ Pre-Market Checklist
          </h3>
          <p class="text-[#525252] font-mono text-sm">
            Checklist component will be added in Phase 2.4
          </p>
          <div class="mt-4 p-4 bg-[#fafafa] border-[3px] border-black">
            <p class="font-mono text-xs text-[#525252]">
              Progress: {{ currentPlan.checklistProgress.completed }}/{{
                currentPlan.checklistProgress.total
              }}
            </p>
          </div>
        </div>

        <!-- Review Section Placeholder -->
        <div
          class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <h3 class="text-xl font-bold uppercase text-[#0a0a0a] mb-4 tracking-wide">
            📝 Post-Market Review
          </h3>
          <p class="text-[#525252] font-mono text-sm">
            Review component will be added in Phase 2.5
          </p>
          <div class="mt-4 p-4 bg-[#fafafa] border-[3px] border-black">
            <p class="font-mono text-xs text-[#525252]">
              Adherence Rate: {{ currentPlan.review.adherenceRate.toFixed(1) }}%
            </p>
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>
