<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  notes: string
  isReadonly?: boolean
  isSaving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isReadonly: false,
  isSaving: false,
})

const emit = defineEmits<{
  update: [notes: string]
}>()

// Local notes state
const localNotes = ref(props.notes)

// Character limit
const MAX_CHARS = 2000

// Debounce timer for auto-save
let saveTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Watch local notes changes and emit with debounce
 */
watch(localNotes, (newNotes) => {
  if (props.isReadonly) return

  // Clear previous timer
  if (saveTimer) {
    clearTimeout(saveTimer)
  }

  // Set new timer for auto-save (500ms debounce)
  saveTimer = setTimeout(() => {
    emit('update', newNotes)
  }, 500)
})

/**
 * Watch props.notes changes (from external updates)
 */
watch(
  () => props.notes,
  (newNotes) => {
    localNotes.value = newNotes
  }
)

/**
 * Get character count color
 */
const getCharCountColor = () => {
  const remaining = MAX_CHARS - localNotes.value.length
  if (remaining < 100) return 'text-[#ef4444]' // Red when close to limit
  if (remaining < 300) return 'text-[#f59e0b]' // Orange when getting close
  return 'text-[#525252]' // Default gray
}
</script>

<template>
  <div class="review-notes-editor">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <label class="text-sm font-bold uppercase text-[#0a0a0a] tracking-wide">
          Review Notes
        </label>
        <!-- Saving Spinner -->
        <div v-if="isSaving" class="flex items-center gap-1.5">
          <svg
            class="animate-spin h-3.5 w-3.5 text-[#3b82f6]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span class="text-xs font-mono text-[#3b82f6]">Saving...</span>
        </div>
      </div>
      <span :class="['text-xs font-mono font-bold', getCharCountColor()]">
        {{ localNotes.length }} / {{ MAX_CHARS }}
      </span>
    </div>

    <!-- Textarea -->
    <textarea
      v-model="localNotes"
      :readonly="isReadonly"
      :maxlength="MAX_CHARS"
      class="w-full min-h-[200px] p-4 border-[3px] border-black font-mono text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-4 focus:ring-[#3b82f6] resize-y transition-colors"
      :class="{
        'bg-white': !isReadonly,
        'bg-[#fafafa] cursor-not-allowed': isReadonly,
      }"
      placeholder="Tulis reflection kamu tentang hari trading ini...&#10;&#10;Pertanyaan yang bisa membantu:&#10;• Apa yang berjalan sesuai rencana?&#10;• Apa yang tidak sesuai rencana? Kenapa?&#10;• Apa lessons learned hari ini?&#10;• Apa yang perlu diperbaiki untuk besok?&#10;• Apakah saya mengikuti strategy dengan disiplin?"
    />

    <!-- Helper Text / Auto-save Indicator -->
    <div class="mt-2 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4 text-[#3b82f6]"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>
        <p v-if="!isReadonly" class="text-xs font-mono text-[#525252]">
          Auto-saved setiap kamu berhenti mengetik
        </p>
        <p v-else class="text-xs font-mono text-[#525252]">Read-only mode (plan completed)</p>
      </div>

      <!-- Warning when approaching character limit -->
      <div
        v-if="!isReadonly && localNotes.length > MAX_CHARS - 200"
        class="flex items-center gap-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          :class="[
            'w-4 h-4',
            localNotes.length > MAX_CHARS - 100 ? 'text-[#ef4444]' : 'text-[#f59e0b]',
          ]"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <span
          :class="[
            'text-xs font-mono font-bold',
            localNotes.length > MAX_CHARS - 100 ? 'text-[#ef4444]' : 'text-[#f59e0b]',
          ]"
        >
          {{ MAX_CHARS - localNotes.length }} chars remaining
        </span>
      </div>
    </div>

    <!-- Review Prompts (collapsible) -->
    <details class="mt-4 bg-[#dbeafe] border-[2px] border-black">
      <summary
        class="px-4 py-3 font-bold text-sm uppercase text-[#0a0a0a] cursor-pointer hover:bg-[#bfdbfe] transition-colors select-none"
      >
        💡 Review Prompts (click to expand)
      </summary>
      <div class="px-4 pb-4 pt-2 space-y-2">
        <div class="space-y-1">
          <p class="text-xs font-bold uppercase text-[#0a0a0a]">Execution & Discipline:</p>
          <ul class="text-xs font-mono text-[#0a0a0a] space-y-1 pl-4">
            <li>• Apakah saya masuk/keluar sesuai dengan strategy rules?</li>
            <li>• Apakah ada deviation dari plan? Kenapa?</li>
            <li>• Apakah saya manage risk sesuai plan (position size, stop loss)?</li>
          </ul>
        </div>

        <div class="space-y-1">
          <p class="text-xs font-bold uppercase text-[#0a0a0a]">Emotional Management:</p>
          <ul class="text-xs font-mono text-[#0a0a0a] space-y-1 pl-4">
            <li>• Apakah saya trading dengan emosi yang stabil?</li>
            <li>• Apakah ada moment FOMO, revenge trading, atau overconfidence?</li>
            <li>• Bagaimana saya handle winning/losing streak?</li>
          </ul>
        </div>

        <div class="space-y-1">
          <p class="text-xs font-bold uppercase text-[#0a0a0a]">Lessons & Improvements:</p>
          <ul class="text-xs font-mono text-[#0a0a0a] space-y-1 pl-4">
            <li>• Apa 1-2 hal yang paling baik hari ini?</li>
            <li>• Apa 1-2 hal yang perlu diperbaiki?</li>
            <li>• Apa action items untuk besok?</li>
          </ul>
        </div>
      </div>
    </details>
  </div>
</template>
