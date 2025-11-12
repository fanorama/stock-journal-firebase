<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ChecklistItem } from '@/types'

interface Props {
  item: ChecklistItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: [itemId: string, completed: boolean]
  updateText: [itemId: string, text: string]
  delete: [itemId: string]
}>()

// Editing state
const isEditing = ref(false)
const editText = ref(props.item.text)

// Delete confirmation state
const showDeleteConfirm = ref(false)

/**
 * Watch item text changes to update editText
 */
watch(
  () => props.item.text,
  (newText) => {
    editText.value = newText
  }
)

/**
 * Handle checkbox toggle
 */
const handleToggle = () => {
  emit('toggle', props.item.id, !props.item.completed)
}

/**
 * Start editing
 */
const startEditing = () => {
  if (props.item.completed) return // Cannot edit completed items
  isEditing.value = true
  editText.value = props.item.text
}

/**
 * Save edited text
 */
const saveEdit = () => {
  const trimmedText = editText.value.trim()
  if (!trimmedText) {
    // If empty, cancel edit
    cancelEdit()
    return
  }

  if (trimmedText !== props.item.text) {
    emit('updateText', props.item.id, trimmedText)
  }
  isEditing.value = false
}

/**
 * Cancel editing
 */
const cancelEdit = () => {
  editText.value = props.item.text
  isEditing.value = false
}

/**
 * Handle delete with confirmation
 */
const handleDelete = () => {
  showDeleteConfirm.value = true
}

/**
 * Confirm delete
 */
const confirmDelete = () => {
  emit('delete', props.item.id)
  showDeleteConfirm.value = false
}

/**
 * Handle key events in edit mode
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    saveEdit()
  } else if (event.key === 'Escape') {
    cancelEdit()
  }
}
</script>

<template>
  <div
    class="checklist-item flex items-start gap-3 bg-[#fafafa] border-[3px] border-black p-3 hover:bg-white transition-colors"
    :class="{ 'opacity-60': item.completed }"
  >
    <!-- Checkbox -->
    <button
      class="flex-shrink-0 w-6 h-6 border-[3px] border-black flex items-center justify-center transition-colors mt-0.5"
      :class="{
        'bg-[#10b981]': item.completed,
        'bg-white hover:bg-[#fafafa]': !item.completed,
      }"
      @click="handleToggle"
      :title="item.completed ? 'Mark as incomplete' : 'Mark as complete'"
    >
      <!-- Checkmark Icon -->
      <svg
        v-if="item.completed"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="3"
        stroke="currentColor"
        class="w-4 h-4 text-white"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    </button>

    <!-- Text Content / Edit Input -->
    <div class="flex-1 min-w-0">
      <!-- View Mode -->
      <div
        v-if="!isEditing"
        class="font-mono text-sm text-[#0a0a0a] break-words cursor-pointer"
        :class="{ 'line-through text-[#737373]': item.completed }"
        @dblclick="startEditing"
        :title="item.completed ? '' : 'Double-click to edit'"
      >
        {{ item.text }}
      </div>

      <!-- Edit Mode -->
      <input
        v-else
        ref="editInput"
        v-model="editText"
        type="text"
        class="w-full border-[2px] border-black p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
        maxlength="200"
        @blur="saveEdit"
        @keydown="handleKeydown"
        autofocus
      />

      <!-- Metadata -->
      <div v-if="item.completed && item.completedAt" class="text-xs font-mono text-[#a3a3a3] mt-1">
        Completed: {{ new Date(item.completedAt.toDate()).toLocaleString('id-ID') }}
      </div>

      <!-- Template Badge -->
      <div v-if="item.isTemplate" class="mt-1">
        <span
          class="inline-block px-2 py-1 bg-[#dbeafe] border-[2px] border-black text-xs font-bold uppercase tracking-wide text-[#0a0a0a]"
        >
          From Template
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-1 flex-shrink-0">
      <!-- Edit Button (only for non-completed items) -->
      <button
        v-if="!item.completed && !isEditing"
        class="p-1 border-[2px] border-black hover:bg-[#3b82f6] hover:text-white transition-colors"
        @click="startEditing"
        title="Edit"
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
        @click="handleDelete"
        title="Delete"
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

    <!-- Delete Confirmation Mini Dialog -->
    <Teleport to="body">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showDeleteConfirm = false"
      >
        <div class="bg-white border-[5px] border-black p-6 max-w-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h4 class="text-lg font-bold uppercase text-[#0a0a0a] mb-3 tracking-wide">
            Hapus Checklist Item?
          </h4>
          <p class="text-sm font-mono text-[#525252] mb-4 break-words">
            "{{ item.text }}"
          </p>

          <div class="flex gap-3 justify-end">
            <button
              class="bg-[#fafafa] border-[3px] border-black px-4 py-2 font-bold uppercase text-xs tracking-wide text-[#0a0a0a] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
              @click="showDeleteConfirm = false"
            >
              Batal
            </button>
            <button
              class="bg-[#ef4444] border-[3px] border-black px-4 py-2 font-bold uppercase text-xs tracking-wide text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
              @click="confirmDelete"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
