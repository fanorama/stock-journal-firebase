<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WatchlistItem } from '@/types'
import WatchlistItemRow from './WatchlistItemRow.vue'
import draggable from 'vuedraggable'

interface Props {
  watchlist: WatchlistItem[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [itemId: string, updates: Partial<WatchlistItem>]
  delete: [itemId: string]
  reorder: [items: WatchlistItem[]]
}>()

// Expanded rows tracking
const expandedRows = ref<Set<string>>(new Set())

// Local draggable list (v-model for draggable)
const localWatchlist = computed({
  get: () => props.watchlist,
  set: (value) => {
    // Emit reorder event when drag completes
    emit('reorder', value)
  },
})

/**
 * Toggle row expansion
 */
const toggleExpand = (itemId: string) => {
  if (expandedRows.value.has(itemId)) {
    expandedRows.value.delete(itemId)
  } else {
    expandedRows.value.add(itemId)
  }
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
</script>

<template>
  <div class="watchlist-table">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="bg-[#fafafa] border-[3px] border-black p-12 text-center"
    >
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-[4px] border-black border-t-transparent"
      ></div>
      <p class="mt-4 text-[#525252] font-mono font-bold uppercase tracking-wide text-sm">
        Loading Watchlist...
      </p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!watchlist || watchlist.length === 0"
      class="bg-[#fafafa] border-[3px] border-black p-12 text-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-16 h-16 mx-auto text-[#a3a3a3] mb-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
        />
      </svg>
      <h4 class="text-lg font-bold uppercase text-[#0a0a0a] mb-2 tracking-wide">
        Watchlist Kosong
      </h4>
      <p class="text-sm font-mono text-[#525252]">
        Belum ada stock yang di-plan. Klik "Add Stock" untuk mulai planning.
      </p>
    </div>

    <!-- Watchlist Table Content -->
    <div v-else class="border-[3px] border-black overflow-hidden">
      <!-- Table Header -->
      <div
        class="grid grid-cols-12 gap-3 bg-[#f59e0b] border-b-[3px] border-black px-4 py-3 font-bold text-sm uppercase tracking-wide text-[#0a0a0a]"
      >
        <div class="col-span-2">Symbol</div>
        <div class="col-span-3">Strategy</div>
        <div class="col-span-3">Notes</div>
        <div class="col-span-2">Targets</div>
        <div class="col-span-1">Status</div>
        <div class="col-span-1 text-center">Actions</div>
      </div>

      <!-- Table Body with Drag-and-Drop -->
      <draggable
        v-model="localWatchlist"
        item-key="id"
        class="divide-y-[3px] divide-black"
        handle=".drag-handle"
        :animation="200"
        ghost-class="ghost"
      >
        <template #item="{ element: item }">
          <WatchlistItemRow
            :item="item"
            :is-expanded="expandedRows.has(item.id)"
            @toggle-expand="toggleExpand(item.id)"
            @update="handleUpdate"
            @delete="handleDelete"
          />
        </template>
      </draggable>
    </div>
  </div>
</template>

<style scoped>
/* Drag-and-drop ghost effect */
:deep(.ghost) {
  opacity: 0.5;
  background: #fbbf24;
}

/* Responsive adjustments for mobile */
@media (max-width: 640px) {
  /* Hide table header on mobile, use card layout in WatchlistItemRow instead */
}
</style>
