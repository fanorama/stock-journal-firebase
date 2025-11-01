<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJournalsStore, usePortfoliosStore } from '@/stores'
import type { Journal } from '@/types'

/**
 * Props
 */
interface Props {
  show: boolean
  journal: Journal | null
}

const props = defineProps<Props>()

/**
 * Emits
 */
const emit = defineEmits<{
  close: []
  success: []
}>()

// Stores
const journalsStore = useJournalsStore()
const portfoliosStore = usePortfoliosStore()

const isDeleting = ref(false)
const error = ref<string | null>(null)

/**
 * Format date to readable format
 */
const formatDate = computed(() => {
  if (!props.journal?.createdAt) return '-'
  const timestamp = props.journal.createdAt as any
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
})

/**
 * Check if journal has content
 */
const hasContent = computed(() => {
  if (!props.journal) return false
  return (
    props.journal.entryReason ||
    props.journal.exitStrategy ||
    props.journal.emotions ||
    props.journal.lessonsLearned
  )
})

/**
 * Handle delete
 */
const handleDelete = async () => {
  if (!props.journal) {
    error.value = 'Journal tidak ditemukan'
    return
  }

  if (!portfoliosStore.activePortfolioId) {
    error.value = 'Portfolio harus dipilih terlebih dahulu'
    return
  }

  isDeleting.value = true
  error.value = null

  try {
    await journalsStore.deleteJournal(props.journal.id)
    emit('success')
    emit('close')
  } catch (err: any) {
    error.value = err.message || 'Gagal menghapus journal entry'
  } finally {
    isDeleting.value = false
  }
}

/**
 * Handle close
 */
const handleClose = () => {
  if (!isDeleting.value) {
    emit('close')
    error.value = null
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show && journal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="handleClose"
      >
        <div
          class="bg-white border-[5px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg"
        >
          <!-- Modal Header -->
          <div class="bg-[#ef4444] border-b-[5px] border-black p-6 flex items-center justify-between">
            <h2 class="text-2xl font-bold uppercase text-white tracking-wide">
              ⚠️ Delete Journal Entry
            </h2>
            <button
              class="bg-white border-[3px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
              @click="handleClose"
              :disabled="isDeleting"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4">
            <!-- Error Message -->
            <div
              v-if="error"
              class="bg-[#ef4444] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <p class="text-white font-mono text-sm">{{ error }}</p>
            </div>

            <!-- Warning Message -->
            <div class="bg-[#fef3c7] border-[3px] border-black p-4">
              <p class="font-bold text-[#0a0a0a] mb-2">
                Are you sure you want to delete this journal entry?
              </p>
              <p class="text-sm font-mono text-[#525252]">
                This action cannot be undone. All your reflections and insights will be permanently removed.
              </p>
            </div>

            <!-- Journal Preview -->
            <div class="bg-[#fafafa] border-[3px] border-black p-4 space-y-3">
              <div>
                <p class="text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
                  Created Date
                </p>
                <p class="font-mono text-sm text-[#0a0a0a]">{{ formatDate }}</p>
              </div>

              <div v-if="journal.tradeId">
                <p class="text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
                  Linked to Trade
                </p>
                <p class="font-mono text-sm text-[#0a0a0a]">Yes (Trade ID: {{ journal.tradeId.substring(0, 8) }}...)</p>
              </div>

              <div v-if="hasContent">
                <p class="text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
                  Content Summary
                </p>
                <ul class="font-mono text-sm text-[#0a0a0a] space-y-1">
                  <li v-if="journal.entryReason" class="flex items-center gap-2">
                    <span>📌</span>
                    <span>Entry Reason</span>
                  </li>
                  <li v-if="journal.exitStrategy" class="flex items-center gap-2">
                    <span>🎯</span>
                    <span>Exit Strategy</span>
                  </li>
                  <li v-if="journal.emotions" class="flex items-center gap-2">
                    <span>💭</span>
                    <span>Emotions & Mindset</span>
                  </li>
                  <li v-if="journal.lessonsLearned" class="flex items-center gap-2">
                    <span>📚</span>
                    <span>Lessons Learned</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="border-t-[5px] border-black p-6 bg-[#fafafa] flex gap-3 justify-end">
            <button
              type="button"
              class="bg-white border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-100"
              @click="handleClose"
              :disabled="isDeleting"
            >
              Cancel
            </button>
            <button
              type="button"
              class="bg-[#ef4444] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100"
              @click="handleDelete"
              :disabled="isDeleting"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete Permanently' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.2s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
