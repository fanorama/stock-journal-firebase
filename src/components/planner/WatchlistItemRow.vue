<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WatchlistItem } from '@/types'
import EditWatchlistItemModal from './EditWatchlistItemModal.vue'
import StrategyBadgePopover from './StrategyBadgePopover.vue'

interface Props {
  item: WatchlistItem
  isExpanded: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggleExpand: []
  update: [itemId: string, updates: Partial<WatchlistItem>]
  delete: [itemId: string]
}>()

// Modal states
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)

/**
 * Status badge styling
 */
const statusBadge = computed(() => {
  switch (props.item.status) {
    case 'planned':
      return {
        text: 'Planned',
        bg: 'bg-[#fbbf24]',
        border: 'border-[#f59e0b]',
      }
    case 'executed':
      return {
        text: 'Executed',
        bg: 'bg-[#34d399]',
        border: 'border-[#10b981]',
      }
    case 'skipped':
      return {
        text: 'Skipped',
        bg: 'bg-[#a3a3a3]',
        border: 'border-[#737373]',
      }
    case 'missed':
      return {
        text: 'Missed',
        bg: 'bg-[#f87171]',
        border: 'border-[#ef4444]',
      }
    default:
      return {
        text: 'Unknown',
        bg: 'bg-[#d4d4d4]',
        border: 'border-[#a3a3a3]',
      }
  }
})

/**
 * Truncate text for display
 */
const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Handle update from edit modal
 */
const handleUpdate = (updates: Partial<WatchlistItem>) => {
  emit('update', props.item.id, updates)
  showEditModal.value = false
}

/**
 * Handle delete confirmation
 */
const handleDelete = () => {
  emit('delete', props.item.id)
  showDeleteConfirm.value = false
}
</script>

<template>
  <div class="watchlist-item-row bg-white hover:bg-[#fafafa] transition-colors">
    <!-- Main Row Content -->
    <div class="grid grid-cols-12 gap-3 px-4 py-4 items-center">
      <!-- Symbol -->
      <div class="col-span-2">
        <p class="font-bold text-lg text-[#0a0a0a] uppercase">
          {{ item.symbol }}
        </p>
      </div>

      <!-- Strategy -->
      <div class="col-span-3">
        <StrategyBadgePopover
          :strategy-id="item.strategyId"
          :strategy-name="item.strategyName"
        />
      </div>

      <!-- Notes (truncated) -->
      <div class="col-span-3">
        <p class="text-sm font-mono text-[#525252]">
          {{ truncateText(item.notes, 60) }}
        </p>
      </div>

      <!-- Targets -->
      <div class="col-span-2">
        <div class="text-xs font-mono space-y-1">
          <p v-if="item.targetEntry" class="text-[#10b981]">
            Entry: {{ item.targetEntry }}
          </p>
          <p v-if="item.targetExit" class="text-[#ef4444]">
            Exit: {{ item.targetExit }}
          </p>
          <p v-if="!item.targetEntry && !item.targetExit" class="text-[#a3a3a3]">
            No targets
          </p>
        </div>
      </div>

      <!-- Status Badge -->
      <div class="col-span-1">
        <span
          :class="[
            'inline-block px-2 py-1 border-[2px] font-bold text-xs uppercase tracking-wide text-[#0a0a0a]',
            statusBadge.bg,
            statusBadge.border,
          ]"
        >
          {{ statusBadge.text }}
        </span>
      </div>

      <!-- Actions -->
      <div class="col-span-1 flex gap-2 justify-center">
        <!-- Expand/Collapse Button -->
        <button
          class="p-1 border-[2px] border-black hover:bg-[#fafafa] transition-colors"
          :title="isExpanded ? 'Collapse' : 'Expand'"
          @click="$emit('toggleExpand')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': isExpanded }"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>

        <!-- Edit Button -->
        <button
          class="p-1 border-[2px] border-black hover:bg-[#3b82f6] hover:text-white transition-colors"
          title="Edit"
          @click="showEditModal = true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </button>

        <!-- Delete Button -->
        <button
          class="p-1 border-[2px] border-black hover:bg-[#ef4444] hover:text-white transition-colors"
          title="Delete"
          @click="showDeleteConfirm = true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Expanded Content -->
    <div
      v-if="isExpanded"
      class="border-t-[3px] border-black bg-[#fafafa] px-4 py-4"
    >
      <div class="grid grid-cols-2 gap-4">
        <!-- Full Notes -->
        <div>
          <h5 class="text-xs font-bold uppercase text-[#0a0a0a] mb-2 tracking-wide">
            Notes
          </h5>
          <p class="text-sm font-mono text-[#525252] whitespace-pre-wrap">
            {{ item.notes || 'No notes' }}
          </p>
        </div>

        <!-- Metadata -->
        <div>
          <h5 class="text-xs font-bold uppercase text-[#0a0a0a] mb-2 tracking-wide">
            Metadata
          </h5>
          <div class="text-xs font-mono text-[#525252] space-y-1">
            <p>
              <span class="font-bold">Added:</span>
              {{ new Date(item.addedAt.toDate()).toLocaleString('id-ID') }}
            </p>
            <p v-if="item.tradeId">
              <span class="font-bold">Linked Trade:</span>
              {{ item.tradeId }}
            </p>
            <p v-if="item.outcome">
              <span class="font-bold">Executed:</span>
              {{ new Date(item.outcome.executedAt.toDate()).toLocaleString('id-ID') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <EditWatchlistItemModal
      :show="showEditModal"
      :item="item"
      @close="showEditModal = false"
      @success="handleUpdate"
    />

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showDeleteConfirm = false"
      >
        <div class="bg-white border-[5px] border-black p-6 max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 class="text-xl font-bold uppercase text-[#0a0a0a] mb-4 tracking-wide">
            Hapus dari Watchlist?
          </h3>
          <p class="text-sm font-mono text-[#525252] mb-6">
            Apakah Anda yakin ingin menghapus <strong>{{ item.symbol }}</strong> dari watchlist?
            {{ item.tradeId ? 'Item ini sudah linked ke trade.' : '' }}
          </p>

          <div class="flex gap-3 justify-end">
            <button
              class="bg-[#fafafa] border-[3px] border-black px-4 py-2 font-bold uppercase text-sm tracking-wide text-[#0a0a0a] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
              @click="showDeleteConfirm = false"
            >
              Batal
            </button>
            <button
              class="bg-[#ef4444] border-[3px] border-black px-4 py-2 font-bold uppercase text-sm tracking-wide text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
              @click="handleDelete"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
