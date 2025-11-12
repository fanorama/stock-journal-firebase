<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ChecklistItem } from '@/types'
import ChecklistItemComponent from './ChecklistItem.vue'
import ChecklistTemplateSelector from './ChecklistTemplateSelector.vue'

interface Props {
  planId: string
  checklist: ChecklistItem[]
  checklistProgress: {
    completed: number
    total: number
  }
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: [text: string]
  update: [itemId: string, completed: boolean]
  updateText: [itemId: string, text: string]
  delete: [itemId: string]
  reorder: [items: ChecklistItem[]]
  applyTemplate: [items: Omit<ChecklistItem, 'id' | 'position'>[]]
  clearAll: []
}>()

// New item input
const newItemText = ref('')

// Template selector state
const showTemplateSelector = ref(false)

/**
 * Calculate completion percentage
 */
const completionPercentage = computed(() => {
  if (props.checklistProgress.total === 0) return 0
  return Math.round((props.checklistProgress.completed / props.checklistProgress.total) * 100)
})

/**
 * Progress bar color based on completion
 */
const progressColor = computed(() => {
  const percentage = completionPercentage.value
  if (percentage === 0) return 'bg-[#d4d4d4]'
  if (percentage < 50) return 'bg-[#ef4444]'
  if (percentage < 75) return 'bg-[#f59e0b]'
  if (percentage < 100) return 'bg-[#3b82f6]'
  return 'bg-[#10b981]'
})

/**
 * Handle add new checklist item
 */
const handleAddItem = () => {
  const text = newItemText.value.trim()
  if (!text) return

  emit('add', text)
  newItemText.value = ''
}

/**
 * Handle toggle checklist item
 */
const handleToggle = (itemId: string, completed: boolean) => {
  emit('update', itemId, completed)
}

/**
 * Handle update item text
 */
const handleUpdateText = (itemId: string, text: string) => {
  emit('updateText', itemId, text)
}

/**
 * Handle delete item
 */
const handleDelete = (itemId: string) => {
  emit('delete', itemId)
}

/**
 * Handle apply template
 */
const handleApplyTemplate = (items: Omit<ChecklistItem, 'id' | 'position'>[]) => {
  emit('applyTemplate', items)
  showTemplateSelector.value = false
}

/**
 * Handle clear all checklist
 */
const handleClearAll = () => {
  if (props.checklist.length === 0) return

  const confirmed = confirm(
    `Hapus semua ${props.checklist.length} checklist items? Action ini tidak bisa di-undo.`
  )
  if (confirmed) {
    emit('clearAll')
  }
}
</script>

<template>
  <div class="checklist-section bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
    <!-- Section Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <h3 class="text-xl font-bold uppercase text-[#0a0a0a] tracking-wide">
          ✅ Pre-Market Checklist
        </h3>
        <p class="text-xs font-mono text-[#525252] mt-1">
          {{ checklistProgress.completed }}/{{ checklistProgress.total }} completed ({{ completionPercentage }}%)
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2">
        <button
          v-if="checklist.length > 0"
          class="bg-[#fafafa] border-[3px] border-black px-3 py-2 font-bold uppercase text-xs tracking-wide text-[#0a0a0a] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
          @click="handleClearAll"
          title="Clear all items"
        >
          Clear All
        </button>
        <button
          class="bg-[#3b82f6] border-[3px] border-black px-3 py-2 font-bold uppercase text-xs tracking-wide text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
          @click="showTemplateSelector = true"
        >
          Use Template
        </button>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-4">
      <div class="w-full h-6 bg-[#fafafa] border-[3px] border-black overflow-hidden">
        <div
          :class="['h-full transition-all duration-300', progressColor]"
          :style="{ width: `${completionPercentage}%` }"
        >
          <div class="h-full flex items-center justify-center">
            <span v-if="completionPercentage > 10" class="text-xs font-bold text-white">
              {{ completionPercentage }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Checklist Items -->
    <div class="space-y-2 mb-4">
      <!-- Empty State -->
      <div
        v-if="!isLoading && (!checklist || checklist.length === 0)"
        class="bg-[#fafafa] border-[3px] border-black p-8 text-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-12 h-12 mx-auto text-[#a3a3a3] mb-3"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <h4 class="text-sm font-bold uppercase text-[#0a0a0a] mb-1 tracking-wide">
          Checklist Kosong
        </h4>
        <p class="text-xs font-mono text-[#525252]">
          Tambahkan item atau gunakan template untuk mulai.
        </p>
      </div>

      <!-- Checklist Items List -->
      <ChecklistItemComponent
        v-for="item in checklist"
        :key="item.id"
        :item="item"
        @toggle="handleToggle"
        @update-text="handleUpdateText"
        @delete="handleDelete"
      />
    </div>

    <!-- Add New Item Input -->
    <div class="border-t-[3px] border-black pt-4">
      <form @submit.prevent="handleAddItem" class="flex gap-2">
        <input
          v-model="newItemText"
          type="text"
          placeholder="Add new checklist item..."
          class="flex-1 border-[3px] border-black p-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#3b82f6] transition-all"
          maxlength="200"
        />
        <button
          type="submit"
          :disabled="!newItemText.trim()"
          class="bg-[#10b981] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </form>
      <p class="text-xs font-mono text-[#525252] mt-1">
        {{ newItemText.length }}/200 characters
      </p>
    </div>

    <!-- Template Selector Modal -->
    <ChecklistTemplateSelector
      :show="showTemplateSelector"
      @close="showTemplateSelector = false"
      @apply="handleApplyTemplate"
    />
  </div>
</template>
