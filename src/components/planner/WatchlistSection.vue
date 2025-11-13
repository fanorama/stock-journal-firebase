<script setup lang="ts">
import { ref } from 'vue'
import type { WatchlistItem } from '@/types'
import WatchlistTable from './WatchlistTable.vue'
import AddWatchlistItemModal from './AddWatchlistItemModal.vue'

interface Props {
  planId: string
  watchlist: WatchlistItem[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: [item: Omit<WatchlistItem, 'id' | 'addedAt' | 'position'>]
  update: [itemId: string, updates: Partial<WatchlistItem>]
  delete: [itemId: string]
  reorder: [items: WatchlistItem[]]
}>()

// Modal state
const showAddModal = ref(false)

/**
 * Handle add new watchlist item
 */
const handleAdd = (item: Omit<WatchlistItem, 'id' | 'addedAt' | 'position'>) => {
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
  <div class="watchlist-section bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
    <!-- Section Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-xl font-bold uppercase text-[#0a0a0a] tracking-wide">
          📋 Watchlist
        </h3>
        <p class="text-xs font-mono text-[#525252] mt-1">
          {{ watchlist.length }} stock{{ watchlist.length !== 1 ? 's' : '' }} planned
        </p>
      </div>

      <!-- Add Button -->
      <button
        class="bg-[#3b82f6] border-[3px] border-black px-4 py-2 font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
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
