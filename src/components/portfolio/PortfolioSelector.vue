<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { usePortfoliosStore } from '@/stores'

const router = useRouter()
const portfoliosStore = usePortfoliosStore()

// Dropdown state
const isDropdownOpen = ref(false)

/**
 * Toggle dropdown
 */
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

/**
 * Close dropdown
 */
const closeDropdown = () => {
  isDropdownOpen.value = false
}

/**
 * Get active portfolio data
 */
const activePortfolio = computed(() => {
  if (!portfoliosStore.activePortfolioId) return null
  return portfoliosStore.getPortfolioById(portfoliosStore.activePortfolioId) || null
})

/**
 * Handle portfolio selection
 */
const handleSelectPortfolio = (portfolioId: string) => {
  portfoliosStore.setActivePortfolio(portfolioId)
  closeDropdown()
}

/**
 * Navigate to portfolios page
 */
const handleManagePortfolios = () => {
  router.push('/portfolios')
  closeDropdown()
}

/**
 * Close dropdown when clicking outside
 */
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const dropdown = document.getElementById('portfolio-selector-dropdown')
  if (dropdown && !dropdown.contains(target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

/**
 * Get market type label
 */
const getMarketTypeLabel = (marketType: string) => {
  const labels: Record<string, string> = {
    IDX: 'IDX',
    US_STOCKS: 'US',
    CRYPTO: 'Crypto',
    FOREX: 'Forex',
  }
  return labels[marketType] || marketType
}
</script>

<template>
  <div id="portfolio-selector-dropdown" class="relative">
    <!-- Selector Button -->
    <button
      v-if="activePortfolio"
      @click.stop="toggleDropdown"
      class="flex items-center gap-2 bg-white border-[3px] border-black px-4 py-2 font-bold text-sm text-[#0a0a0a] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
    >
      <!-- Portfolio Icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2.5"
        stroke="currentColor"
        class="w-5 h-5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>

      <!-- Portfolio Name & Market Type -->
      <div class="hidden sm:flex flex-col items-start min-w-[120px]">
        <span class="font-bold uppercase tracking-wide text-xs leading-tight">
          {{ activePortfolio.name }}
        </span>
        <span class="text-[10px] font-mono text-[#525252] leading-tight">
          {{ getMarketTypeLabel(activePortfolio.marketType) }} • {{ activePortfolio.baseCurrency }}
        </span>
      </div>

      <!-- Mobile: Show only icon and arrow -->
      <span class="sm:hidden font-bold uppercase tracking-wide text-xs">
        Portfolio
      </span>

      <!-- Dropdown Arrow -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="3"
        stroke="currentColor"
        class="w-4 h-4 transition-transform duration-200"
        :class="{ 'rotate-180': isDropdownOpen }"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </button>

    <!-- No Portfolio Button -->
    <button
      v-else
      @click="handleManagePortfolios"
      class="flex items-center gap-2 bg-[#f59e0b] border-[3px] border-black px-4 py-2 font-bold uppercase text-xs tracking-wide text-[#0a0a0a] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2.5"
        stroke="currentColor"
        class="w-5 h-5"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      <span class="hidden sm:inline">Create Portfolio</span>
      <span class="sm:hidden">Portfolio</span>
    </button>

    <!-- Dropdown Menu -->
    <Transition name="dropdown">
      <div
        v-if="isDropdownOpen && portfoliosStore.portfolios.length > 0"
        class="absolute right-0 mt-2 w-72 bg-white border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-50"
      >
        <!-- Dropdown Header -->
        <div class="bg-[#fafafa] border-b-[3px] border-black p-3">
          <h3 class="font-bold uppercase text-xs tracking-wide text-[#0a0a0a]">
            Select Portfolio
          </h3>
          <p class="text-[10px] font-mono text-[#525252] mt-1">
            {{ portfoliosStore.portfoliosCount }} portfolio{{ portfoliosStore.portfoliosCount > 1 ? 's' : '' }} available
          </p>
        </div>

        <!-- Portfolio List -->
        <div class="max-h-64 overflow-y-auto">
          <button
            v-for="portfolio in portfoliosStore.portfolios"
            :key="portfolio.id"
            @click="handleSelectPortfolio(portfolio.id)"
            class="w-full text-left p-3 border-b-[2px] border-black hover:bg-[#fafafa] transition-colors flex items-center justify-between group"
            :class="{
              'bg-[#fef3c7]': portfolio.id === portfoliosStore.activePortfolioId,
            }"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <p class="font-bold text-sm text-[#0a0a0a] truncate">
                  {{ portfolio.name }}
                </p>
                <!-- Active Badge -->
                <span
                  v-if="portfolio.id === portfoliosStore.activePortfolioId"
                  class="bg-[#f59e0b] border-[2px] border-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#0a0a0a] flex-shrink-0"
                >
                  Active
                </span>
              </div>
              <p class="text-xs font-mono text-[#525252]">
                {{ getMarketTypeLabel(portfolio.marketType) }} • {{ portfolio.baseCurrency }}
              </p>
            </div>

            <!-- Checkmark for active portfolio -->
            <svg
              v-if="portfolio.id === portfoliosStore.activePortfolioId"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke="currentColor"
              class="w-5 h-5 text-[#f59e0b] flex-shrink-0 ml-2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </button>
        </div>

        <!-- Dropdown Footer -->
        <div class="bg-[#fafafa] border-t-[3px] border-black p-3">
          <button
            @click="handleManagePortfolios"
            class="w-full bg-[#3b82f6] border-[3px] border-black px-4 py-2 font-bold uppercase text-xs tracking-wide text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
              />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Manage Portfolios
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
