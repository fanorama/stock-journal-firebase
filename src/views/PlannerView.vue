<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import WatchlistSection from '@/components/planner/WatchlistSection.vue'
import ChecklistSection from '@/components/planner/ChecklistSection.vue'
import ReviewSection from '@/components/planner/ReviewSection.vue'
import type { WatchlistItem, ChecklistItem } from '@/types'
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

// Watchlist actions
const handleAddWatchlistItem = async (
  item: Omit<WatchlistItem, 'id' | 'addedAt' | 'position'>
) => {
  if (!currentPlan.value) {
    alert('⚠️ Plan belum tersedia. Silakan refresh halaman.')
    return
  }

  try {
    await dailyPlansStore.addWatchlistItem(currentPlan.value.id, item)
  } catch (error) {
    console.error('Failed to add watchlist item:', error)
    alert(
      '❌ Gagal menambahkan stock ke watchlist.\n\nPesan error: ' +
        (error instanceof Error ? error.message : 'Unknown error') +
        '\n\nSilakan coba lagi atau refresh halaman.'
    )
  }
}

const handleUpdateWatchlistItem = async (
  itemId: string,
  updates: Partial<WatchlistItem>
) => {
  if (!currentPlan.value) return

  try {
    await dailyPlansStore.updateWatchlistItem(currentPlan.value.id, itemId, updates)
  } catch (error) {
    console.error('Failed to update watchlist item:', error)
  }
}

const handleDeleteWatchlistItem = async (itemId: string) => {
  if (!currentPlan.value) {
    alert('⚠️ Plan belum tersedia. Silakan refresh halaman.')
    return
  }

  try {
    await dailyPlansStore.deleteWatchlistItem(currentPlan.value.id, itemId)
  } catch (error) {
    console.error('Failed to delete watchlist item:', error)
    alert(
      '❌ Gagal menghapus item dari watchlist.\n\nPesan error: ' +
        (error instanceof Error ? error.message : 'Unknown error') +
        '\n\nSilakan coba lagi atau refresh halaman.'
    )
  }
}

const handleReorderWatchlist = async (items: WatchlistItem[]) => {
  if (!currentPlan.value) return

  try {
    // Update position field for each item
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index,
    }))
    // Use store method to update watchlist order
    // Note: Store should have a method to update entire watchlist
    // For now, we'll implement individual updates
    for (const item of updatedItems) {
      await dailyPlansStore.updateWatchlistItem(currentPlan.value.id, item.id, {
        position: item.position,
      })
    }
  } catch (error) {
    console.error('Failed to reorder watchlist:', error)
  }
}

// Checklist actions
const handleAddChecklistItem = async (text: string) => {
  if (!currentPlan.value) return

  try {
    await dailyPlansStore.addChecklistItem(currentPlan.value.id, { text })
  } catch (error) {
    console.error('Failed to add checklist item:', error)
  }
}

const handleUpdateChecklistItem = async (itemId: string, completed: boolean) => {
  if (!currentPlan.value) return

  try {
    await dailyPlansStore.updateChecklistItem(currentPlan.value.id, itemId, completed)
  } catch (error) {
    console.error('Failed to update checklist item:', error)
  }
}

const handleUpdateChecklistItemText = async (itemId: string, text: string) => {
  if (!currentPlan.value) return

  try {
    // Find the item and update with new text
    const item = currentPlan.value.checklist.find((i) => i.id === itemId)
    if (item) {
      await dailyPlansStore.updateChecklistItem(currentPlan.value.id, itemId, item.completed, text)
    }
  } catch (error) {
    console.error('Failed to update checklist item text:', error)
  }
}

const handleDeleteChecklistItem = async (itemId: string) => {
  if (!currentPlan.value) return

  try {
    await dailyPlansStore.deleteChecklistItem(currentPlan.value.id, itemId)
  } catch (error) {
    console.error('Failed to delete checklist item:', error)
  }
}

const handleApplyChecklistTemplate = async (
  items: Omit<ChecklistItem, 'id' | 'position'>[]
) => {
  if (!currentPlan.value) return

  try {
    // Add all template items
    for (const item of items) {
      await dailyPlansStore.addChecklistItem(currentPlan.value.id, {
        text: item.text,
        isTemplate: item.isTemplate,
      })
    }
  } catch (error) {
    console.error('Failed to apply checklist template:', error)
  }
}

const handleCopyFromYesterday = async () => {
  if (!currentPlan.value) return

  try {
    // Calculate yesterday's date
    const yesterday = new Date(selectedDate.value)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayId = formatDateToId(yesterday)

    // Get yesterday's plan
    const yesterdayPlan = dailyPlansStore.getPlanByDate(yesterdayId)

    if (!yesterdayPlan || !yesterdayPlan.checklist || yesterdayPlan.checklist.length === 0) {
      alert('Tidak ada checklist dari kemarin untuk di-copy.')
      return
    }

    // Confirm copy action
    const confirmed = confirm(
      `Copy ${yesterdayPlan.checklist.length} checklist items dari kemarin? Items akan ditambahkan dengan status unchecked.`
    )

    if (!confirmed) return

    // Copy items with completion reset
    for (const item of yesterdayPlan.checklist) {
      await dailyPlansStore.addChecklistItem(currentPlan.value.id, {
        text: item.text,
        isTemplate: item.isTemplate,
      })
    }

    alert(`Berhasil copy ${yesterdayPlan.checklist.length} items dari kemarin!`)
  } catch (error) {
    console.error('Failed to copy checklist from yesterday:', error)
    alert('Gagal copy checklist dari kemarin. Silakan coba lagi.')
  }
}

const handleClearAllChecklist = async () => {
  if (!currentPlan.value) return

  try {
    // Delete all checklist items
    for (const item of currentPlan.value.checklist) {
      await dailyPlansStore.deleteChecklistItem(currentPlan.value.id, item.id)
    }
  } catch (error) {
    console.error('Failed to clear checklist:', error)
  }
}

const handleReorderChecklist = async (items: ChecklistItem[]) => {
  if (!currentPlan.value) return

  try {
    // Update position field for each item
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index,
    }))
    // Update position for each item individually
    for (const item of updatedItems) {
      await dailyPlansStore.updateChecklistItem(
        currentPlan.value.id,
        item.id,
        item.completed,
        item.text
      )
    }
  } catch (error) {
    console.error('Failed to reorder checklist:', error)
  }
}

// Review actions
const handleUpdateReviewNotes = async (notes: string) => {
  if (!currentPlan.value) return

  try {
    await dailyPlansStore.updateReviewNotes(currentPlan.value.id, notes)
  } catch (error) {
    console.error('Failed to update review notes:', error)
  }
}

const handleCompletePlan = async () => {
  if (!currentPlan.value) {
    alert('⚠️ Plan belum tersedia. Silakan refresh halaman.')
    return
  }

  try {
    await dailyPlansStore.completePlan(currentPlan.value.id)
    alert('✅ Plan berhasil di-complete! Semua data sudah tersimpan.')
  } catch (error) {
    console.error('Failed to complete plan:', error)
    alert(
      '❌ Gagal melakukan complete plan.\n\nPesan error: ' +
        (error instanceof Error ? error.message : 'Unknown error') +
        '\n\nSilakan coba lagi atau refresh halaman.'
    )
  }
}
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
        class="bg-white border-[5px] border-black p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <!-- Navigation Buttons - Side by Side on Mobile -->
          <div class="flex gap-2 sm:gap-0 w-full sm:w-auto justify-between sm:justify-start order-2 sm:order-1">
            <button
              class="bg-[#fafafa] border-[3px] border-black px-4 py-2 min-h-[44px] font-bold text-sm sm:text-base text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 touch-manipulation"
              @click="goToPreviousDay"
            >
              ← Previous
            </button>
            <button
              class="bg-[#fafafa] border-[3px] border-black px-4 py-2 min-h-[44px] font-bold text-sm sm:text-base text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 touch-manipulation sm:hidden"
              @click="goToNextDay"
            >
              Next →
            </button>
          </div>

          <!-- Current Date Display -->
          <div class="text-center flex-1 order-1 sm:order-2">
            <h2 class="text-lg sm:text-2xl font-bold uppercase text-[#0a0a0a] tracking-wide">
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

          <!-- Next Day Button - Desktop Only -->
          <button
            class="hidden sm:block bg-[#fafafa] border-[3px] border-black px-4 py-2 font-bold text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 order-3"
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
        <!-- Watchlist Section -->
        <WatchlistSection
          :plan-id="currentPlan.id"
          :watchlist="currentPlan.watchlist"
          :is-loading="false"
          @add="handleAddWatchlistItem"
          @update="handleUpdateWatchlistItem"
          @delete="handleDeleteWatchlistItem"
          @reorder="handleReorderWatchlist"
        />

        <!-- Checklist Section -->
        <ChecklistSection
          :plan-id="currentPlan.id"
          :plan-date="currentPlan.planDate"
          :checklist="currentPlan.checklist"
          :checklist-progress="currentPlan.checklistProgress"
          :is-loading="false"
          @add="handleAddChecklistItem"
          @update="handleUpdateChecklistItem"
          @update-text="handleUpdateChecklistItemText"
          @delete="handleDeleteChecklistItem"
          @reorder="handleReorderChecklist"
          @apply-template="handleApplyChecklistTemplate"
          @clear-all="handleClearAllChecklist"
          @copy-from-yesterday="handleCopyFromYesterday"
        />

        <!-- Review Section -->
        <ReviewSection
          :plan-id="currentPlan.id"
          :watchlist="currentPlan.watchlist"
          :review="currentPlan.review"
          :status="currentPlan.status"
          :is-loading="false"
          @update-notes="handleUpdateReviewNotes"
          @complete-plan="handleCompletePlan"
        />
      </template>
    </div>
  </MainLayout>
</template>
