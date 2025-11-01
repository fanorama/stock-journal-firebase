<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import PortfolioCard from '@/components/portfolio/PortfolioCard.vue'
import AddPortfolioModal from '@/components/portfolio/AddPortfolioModal.vue'
import EditPortfolioModal from '@/components/portfolio/EditPortfolioModal.vue'
import DeletePortfolioConfirmation from '@/components/portfolio/DeletePortfolioConfirmation.vue'
import { usePortfoliosStore } from '@/stores'

const router = useRouter()
const portfoliosStore = usePortfoliosStore()

// State for modals
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedPortfolioId = ref<string | null>(null)

/**
 * Initialize portfolios on mount
 */
onMounted(() => {
  portfoliosStore.initPortfolios()
})

/**
 * Handle portfolio selection
 */
const handleSelectPortfolio = (portfolioId: string) => {
  portfoliosStore.setActivePortfolio(portfolioId)
  // Optional: Navigate to dashboard after selecting
  // router.push('/dashboard')
}

/**
 * Handle add portfolio
 */
const handleAddPortfolio = () => {
  showAddModal.value = true
}

/**
 * Handle add portfolio success
 */
const handleAddPortfolioSuccess = (portfolioId: string) => {
  console.log('Portfolio created successfully:', portfolioId)
  // Optional: Show success notification
  // Optional: Navigate to new portfolio details
}

/**
 * Get selected portfolio object
 */
const selectedPortfolio = computed(() => {
  if (!selectedPortfolioId.value) return null
  return portfoliosStore.getPortfolioById(selectedPortfolioId.value) || null
})

/**
 * Handle edit portfolio
 */
const handleEditPortfolio = (portfolioId: string) => {
  selectedPortfolioId.value = portfolioId
  showEditModal.value = true
}

/**
 * Handle edit portfolio success
 */
const handleEditPortfolioSuccess = () => {
  console.log('Portfolio updated successfully')
  // Optional: Show success notification
}

/**
 * Handle delete portfolio
 */
const handleDeletePortfolio = (portfolioId: string) => {
  selectedPortfolioId.value = portfolioId
  showDeleteModal.value = true
}

/**
 * Handle delete portfolio success
 */
const handleDeletePortfolioSuccess = () => {
  console.log('Portfolio deleted successfully')
  // Optional: Show success notification
}
</script>

<template>
  <MainLayout>
    <template #header-title>Portfolios</template>

    <template #header-actions>
      <button
        class="bg-[#f59e0b] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
        @click="handleAddPortfolio"
      >
        + New Portfolio
      </button>
    </template>

    <div class="space-y-6">
      <!-- Page Header -->
      <div class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 class="text-2xl font-bold uppercase text-[#0a0a0a] mb-2 tracking-wide">
          Manage Your Portfolios
        </h2>
        <p class="text-[#525252] font-mono text-sm">
          Create and manage multiple trading portfolios for different strategies and markets.
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="portfoliosStore.isLoading"
        class="bg-white border-[5px] border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center"
      >
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-[4px] border-black border-t-transparent"></div>
        <p class="mt-4 text-[#525252] font-mono font-bold uppercase tracking-wide">
          Loading Portfolios...
        </p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="portfoliosStore.error"
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
            <p class="text-white font-mono text-sm">{{ portfoliosStore.error }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!portfoliosStore.hasPortfolios"
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
                d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
              />
            </svg>
          </div>

          <h3 class="text-2xl font-bold uppercase text-[#0a0a0a] mb-3 tracking-wide">
            No Portfolios Yet
          </h3>
          <p class="text-[#525252] font-mono mb-6">
            Get started by creating your first portfolio to track your trades and analyze your performance.
          </p>
          <button
            class="bg-[#f59e0b] border-[3px] border-black px-8 py-4 font-bold uppercase tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
            @click="handleAddPortfolio"
          >
            Create Your First Portfolio
          </button>
        </div>
      </div>

      <!-- Portfolios Grid -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <PortfolioCard
          v-for="portfolio in portfoliosStore.portfolios"
          :key="portfolio.id"
          :portfolio="portfolio"
          :is-active="portfolio.id === portfoliosStore.activePortfolioId"
          @select="handleSelectPortfolio"
          @edit="handleEditPortfolio"
          @delete="handleDeletePortfolio"
        />
      </div>

      <!-- Portfolio Count Summary -->
      <div
        v-if="portfoliosStore.hasPortfolios"
        class="bg-[#fafafa] border-[5px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center"
      >
        <p class="font-mono text-sm text-[#525252]">
          Total Portfolios:
          <span class="font-bold text-[#0a0a0a]">{{ portfoliosStore.portfoliosCount }}</span>
        </p>
      </div>
    </div>

    <!-- Add Portfolio Modal -->
    <AddPortfolioModal
      :show="showAddModal"
      @close="showAddModal = false"
      @success="handleAddPortfolioSuccess"
    />

    <!-- Edit Portfolio Modal -->
    <EditPortfolioModal
      :show="showEditModal"
      :portfolio="selectedPortfolio"
      @close="showEditModal = false"
      @success="handleEditPortfolioSuccess"
    />

    <!-- Delete Confirmation Modal -->
    <DeletePortfolioConfirmation
      :show="showDeleteModal"
      :portfolio="selectedPortfolio"
      @close="showDeleteModal = false"
      @success="handleDeletePortfolioSuccess"
    />
  </MainLayout>
</template>
