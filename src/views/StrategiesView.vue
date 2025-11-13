<script setup lang="ts">
import { ref, computed } from 'vue'
import StrategyCard from '@/components/strategy/StrategyCard.vue'
import AddStrategyModal from '@/components/strategy/AddStrategyModal.vue'
import EditStrategyModal from '@/components/strategy/EditStrategyModal.vue'
import DeleteStrategyConfirmation from '@/components/strategy/DeleteStrategyConfirmation.vue'
import { useStrategiesStore } from '@/stores'

const strategiesStore = useStrategiesStore()

// State for modals
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedStrategyId = ref<string | null>(null)

/**
 * Handle add strategy
 */
const handleAddStrategy = () => {
  showAddModal.value = true
}

/**
 * Handle add strategy success
 */
const handleAddStrategySuccess = (strategyId: string) => {
  console.log('Strategy created successfully:', strategyId)
  // Optional: Show success notification
}

/**
 * Get selected strategy object
 */
const selectedStrategy = computed(() => {
  if (!selectedStrategyId.value) return null
  return strategiesStore.getStrategyById(selectedStrategyId.value) || null
})

/**
 * Handle edit strategy
 */
const handleEditStrategy = (strategyId: string) => {
  selectedStrategyId.value = strategyId
  showEditModal.value = true
}

/**
 * Handle edit strategy success
 */
const handleEditStrategySuccess = () => {
  console.log('Strategy updated successfully')
  // Optional: Show success notification
}

/**
 * Handle delete strategy
 */
const handleDeleteStrategy = (strategyId: string) => {
  selectedStrategyId.value = strategyId
  showDeleteModal.value = true
}

/**
 * Handle delete strategy success
 */
const handleDeleteStrategySuccess = () => {
  console.log('Strategy deleted successfully')
  // Optional: Show success notification
}
</script>

<template>
  <div class="space-y-6">
      <!-- Page Header -->
      <div class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 class="text-2xl font-bold uppercase text-[#0a0a0a] mb-2 tracking-wide">
          Manage Your Trading Strategies
        </h2>
        <p class="text-[#525252] font-mono text-sm">
          Create and document your trading strategies with entry/exit rules. Link trades to strategies for performance tracking.
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="strategiesStore.isLoading"
        class="bg-white border-[5px] border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center"
      >
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-[4px] border-black border-t-transparent"></div>
        <p class="mt-4 text-[#525252] font-mono font-bold uppercase tracking-wide">
          Loading Strategies...
        </p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="strategiesStore.error"
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
            <p class="text-white font-mono text-sm">{{ strategiesStore.error }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!strategiesStore.hasStrategies"
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
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
              />
            </svg>
          </div>

          <h3 class="text-2xl font-bold uppercase text-[#0a0a0a] mb-3 tracking-wide">
            No Strategies Yet
          </h3>
          <p class="text-[#525252] font-mono mb-6">
            Get started by creating your first trading strategy with entry and exit rules to improve your trading discipline.
          </p>
          <button
            class="bg-[#f59e0b] border-[3px] border-black px-8 py-4 font-bold uppercase tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
            @click="handleAddStrategy"
          >
            Create Your First Strategy
          </button>
        </div>
      </div>

      <!-- Strategies Grid -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <StrategyCard
          v-for="strategy in strategiesStore.strategies"
          :key="strategy.id"
          :strategy="strategy"
          @edit="handleEditStrategy"
          @delete="handleDeleteStrategy"
        />
      </div>

      <!-- Strategy Count Summary -->
      <div
        v-if="strategiesStore.hasStrategies"
        class="bg-[#fafafa] border-[5px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center"
      >
        <p class="font-mono text-sm text-[#525252]">
          Total Strategies:
          <span class="font-bold text-[#0a0a0a]">{{ strategiesStore.strategiesCount }}</span>
        </p>
      </div>
    </div>

    <!-- Add Strategy Modal -->
    <AddStrategyModal
      :show="showAddModal"
      @close="showAddModal = false"
      @success="handleAddStrategySuccess"
    />

    <!-- Edit Strategy Modal -->
    <EditStrategyModal
      :show="showEditModal"
      :strategy="selectedStrategy"
      @close="showEditModal = false"
      @success="handleEditStrategySuccess"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteStrategyConfirmation
      :show="showDeleteModal"
      :strategy="selectedStrategy"
      @close="showDeleteModal = false"
      @success="handleDeleteStrategySuccess"
    />
</template>
