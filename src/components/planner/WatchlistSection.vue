<script setup lang="ts">
import { ref } from 'vue'
import type { WatchlistItem, WatchlistItemInput } from '@/types'
import WatchlistTable from './WatchlistTable.vue'
import AddWatchlistItemModal from './AddWatchlistItemModal.vue'

interface Props {
  planId: string
  watchlist: WatchlistItem[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: [item: WatchlistItemInput]
  update: [itemId: string, updates: Partial<WatchlistItem>]
  delete: [itemId: string]
  reorder: [items: WatchlistItem[]]
}>()

// Modal state
const showAddModal = ref(false)

/**
 * Handle add new watchlist item
 */
const handleAdd = (item: WatchlistItemInput) => {
  emit('add', item)
  showAddModal.value = false
}

/**
 * Handle update watchlist item
 */
const handleUpdate = (itemId: string, updates: Partial<WatchlistItem>) => {
  emit('update', itemId, updates)
}

/**
 * Handle delete watchlist item
 */
const handleDelete = (itemId: string) => {
  emit('delete', itemId)
}

/**
 * Handle reorder watchlist items
 */
const handleReorder = (items: WatchlistItem[]) => {
  emit('reorder', items)
}
</script>

<template>
  <div class="watchlist-section bg-white border-[5px] border-black p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
    <!-- Section Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
      <div class="flex-1">
        <h3 class="text-lg sm:text-xl lg:text-2xl font-bold uppercase text-[#0a0a0a] tracking-wide">
          📋 Watchlist
        </h3>
        <p class="text-xs font-mono text-[#525252] mt-1">
          {{ watchlist.length }} stock{{ watchlist.length !== 1 ? 's' : '' }} planned
        </p>
      </div>

      <!-- Add Button -->
      <button
        class="bg-[#3b82f6] border-[3px] border-black px-4 py-3 min-h-[44px] font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all duration-100 touch-manipulation w-full sm:w-auto"
        @click="showAddModal = true"
      >
        + Add Stock
      </button>
    </div>

    <!-- Watchlist Table -->
    <WatchlistTable
      :watchlist="watchlist"
      :plan-id="planId"
      :is-loading="isLoading"
      @update="handleUpdate"
      @delete="handleDelete"
      @reorder="handleReorder"
    />

    <!-- Add Watchlist Item Modal -->
    <AddWatchlistItemModal
      :show="showAddModal"
      @close="showAddModal = false"
      @success="handleAdd"
    />
  </div>
</template>
