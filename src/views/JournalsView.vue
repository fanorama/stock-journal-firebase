<script setup lang="ts">
import { ref, computed } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import AddJournalModal from '@/components/journal/AddJournalModal.vue'
import EditJournalModal from '@/components/journal/EditJournalModal.vue'
import DeleteJournalConfirmation from '@/components/journal/DeleteJournalConfirmation.vue'
import { useJournalsStore, usePortfoliosStore } from '@/stores'
import type { Journal } from '@/types'

const journalsStore = useJournalsStore()
const portfoliosStore = usePortfoliosStore()

// Modal state
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedJournalId = ref<string | null>(null)

/**
 * Get selected journal
 */
const selectedJournal = computed<Journal | null>(() => {
  if (!selectedJournalId.value) return null
  const getter = journalsStore.getJournalById
  return getter(selectedJournalId.value) || null
})

/**
 * Handle add journal
 */
const handleAddJournal = () => {
  showAddModal.value = true
}

/**
 * Handle add journal success
 */
const handleAddSuccess = () => {
  showAddModal.value = false
}

/**
 * Handle edit journal
 */
const handleEditJournal = (journal: Journal) => {
  selectedJournalId.value = journal.id
  showEditModal.value = true
}

/**
 * Handle edit journal success
 */
const handleEditSuccess = () => {
  showEditModal.value = false
  selectedJournalId.value = null
}

/**
 * Handle delete journal
 */
const handleDeleteJournal = (journal: Journal) => {
  selectedJournalId.value = journal.id
  showDeleteModal.value = true
}

/**
 * Handle delete journal success
 */
const handleDeleteSuccess = () => {
  showDeleteModal.value = false
  selectedJournalId.value = null
}

/**
 * Handle modal close
 */
const handleModalClose = () => {
  showAddModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  selectedJournalId.value = null
}

/**
 * Format date to readable format
 */
const formatDate = (timestamp: any): string => {
  if (!timestamp) return '-'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
</script>

<template>
  <MainLayout>
    <template #header-title>Trading Journal</template>

    <template #header-actions>
      <button
        class="bg-[#a855f7] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
        @click="handleAddJournal"
      >
        + New Journal Entry
      </button>
    </template>

    <div class="space-y-6">
      <!-- Page Header -->
      <div class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 class="text-2xl font-bold uppercase text-[#0a0a0a] mb-2 tracking-wide">
          Trading Journal & Reflections
        </h2>
        <p class="text-[#525252] font-mono text-sm">
          Document your trading thoughts, strategies, and lessons learned for continuous improvement.
        </p>
      </div>

      <!-- No Active Portfolio Warning -->
      <div
        v-if="!portfoliosStore.activePortfolioId"
        class="bg-[#fef3c7] border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <div class="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-6 h-6 text-[#f59e0b]"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <div>
            <h3 class="font-bold uppercase text-[#0a0a0a] tracking-wide">No Active Portfolio</h3>
            <p class="text-[#525252] font-mono text-sm">
              Please select or create a portfolio first to manage journal entries.
            </p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-else-if="journalsStore.isLoading"
        class="bg-white border-[5px] border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center"
      >
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-[4px] border-black border-t-transparent"></div>
        <p class="mt-4 text-[#525252] font-mono font-bold uppercase tracking-wide">
          Loading Journals...
        </p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="journalsStore.error"
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
            <p class="text-white font-mono text-sm">{{ journalsStore.error }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!journalsStore.hasJournals"
        class="bg-white border-[5px] border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center"
      >
        <div class="max-w-md mx-auto">
          <!-- Empty State Icon -->
          <div class="bg-[#fafafa] border-[5px] border-black p-8 inline-block mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-16 h-16 text-[#525252]"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>

          <h3 class="text-2xl font-bold uppercase text-[#0a0a0a] mb-3 tracking-wide">
            No Journal Entries Yet
          </h3>
          <p class="text-[#525252] font-mono mb-6">
            Start documenting your trading journey. Record your thoughts, strategies, and lessons learned.
          </p>
          <button
            class="bg-[#a855f7] border-[3px] border-black px-8 py-4 font-bold uppercase tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
            @click="handleAddJournal"
          >
            Write Your First Entry
          </button>
        </div>
      </div>

      <!-- Journals List -->
      <div v-else class="space-y-4">
        <div
          v-for="journal in journalsStore.journals"
          :key="journal.id"
          class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-100"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="bg-[#a855f7] text-white px-3 py-1 text-xs font-bold uppercase border-[2px] border-black">
                  Journal Entry
                </span>
                <span class="text-xs font-mono text-[#525252]">
                  {{ formatDate(journal.createdAt) }}
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                class="bg-[#3b82f6] border-[2px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
                title="Edit"
                @click="handleEditJournal(journal)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-4 h-4 text-white"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </button>
              <button
                class="bg-[#ef4444] border-[2px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
                title="Delete"
                @click="handleDeleteJournal(journal)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-4 h-4 text-white"
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

          <div class="space-y-4">
            <div v-if="journal.entryReason" class="bg-[#fafafa] border-[3px] border-black p-4">
              <h4 class="text-xs font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                📌 Entry Reason
              </h4>
              <p class="text-sm font-mono text-[#525252] whitespace-pre-wrap">{{ journal.entryReason }}</p>
            </div>

            <div v-if="journal.exitStrategy" class="bg-[#fafafa] border-[3px] border-black p-4">
              <h4 class="text-xs font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                🎯 Exit Strategy
              </h4>
              <p class="text-sm font-mono text-[#525252] whitespace-pre-wrap">{{ journal.exitStrategy }}</p>
            </div>

            <div v-if="journal.emotions" class="bg-[#fef3c7] border-[3px] border-black p-4">
              <h4 class="text-xs font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                💭 Emotions & Mindset
              </h4>
              <p class="text-sm font-mono text-[#525252] whitespace-pre-wrap">{{ journal.emotions }}</p>
            </div>

            <div v-if="journal.lessonsLearned" class="bg-[#fef3c7] border-[3px] border-black p-4">
              <h4 class="text-xs font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
                📚 Lessons Learned
              </h4>
              <p class="text-sm font-mono text-[#525252] whitespace-pre-wrap">{{ journal.lessonsLearned }}</p>
            </div>
          </div>
        </div>

        <!-- Journal Count Summary -->
        <div class="bg-[#fafafa] border-[5px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
          <p class="font-mono text-sm text-[#525252]">
            Total Journal Entries:
            <span class="font-bold text-[#0a0a0a]">{{ journalsStore.journalsCount }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Add Journal Modal -->
    <AddJournalModal
      :show="showAddModal"
      @close="handleModalClose"
      @success="handleAddSuccess"
    />

    <!-- Edit Journal Modal -->
    <EditJournalModal
      :show="showEditModal"
      :journal="selectedJournal"
      @close="handleModalClose"
      @success="handleEditSuccess"
    />

    <!-- Delete Journal Confirmation -->
    <DeleteJournalConfirmation
      :show="showDeleteModal"
      :journal="selectedJournal"
      @close="handleModalClose"
      @success="handleDeleteSuccess"
    />
  </MainLayout>
</template>
