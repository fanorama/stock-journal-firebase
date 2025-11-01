<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { usePortfoliosStore, useTradesStore, useJournalsStore } from '@/stores'

const router = useRouter()
const portfoliosStore = usePortfoliosStore()
const tradesStore = useTradesStore()
const journalsStore = useJournalsStore()

/**
 * Format currency
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Quick stats
 */
const stats = computed(() => {
  return {
    portfolios: portfoliosStore.portfoliosCount,
    trades: tradesStore.tradesCount,
    buyTrades: tradesStore.buyTrades.length,
    sellTrades: tradesStore.sellTrades.length,
    journals: journalsStore.journalsCount,
  }
})

/**
 * Navigate to page
 */
const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <MainLayout>
    <template #header-title>Dashboard</template>

    <div class="space-y-6">
      <!-- Welcome Header -->
      <div class="bg-white border-[5px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 class="text-3xl font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
          📊 Trading Dashboard
        </h1>
        <p class="text-[#525252] font-mono text-lg">
          Track your trading performance and improve your strategy
        </p>
      </div>

      <!-- No Active Portfolio Warning -->
      <div
        v-if="!portfoliosStore.activePortfolioId"
        class="bg-[#fef3c7] border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <div class="flex items-center gap-3 mb-4">
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
            <h3 class="font-bold uppercase text-[#0a0a0a] tracking-wide">Get Started</h3>
            <p class="text-[#525252] font-mono text-sm">
              Create your first portfolio to start tracking your trades
            </p>
          </div>
        </div>
        <button
          class="bg-[#f59e0b] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-100"
          @click="navigateTo('/portfolios')"
        >
          Create Portfolio
        </button>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Portfolios -->
        <div
          class="bg-[#f59e0b] border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-100 cursor-pointer"
          @click="navigateTo('/portfolios')"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold uppercase text-[#0a0a0a] text-sm tracking-wide">Portfolios</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-6 h-6 text-[#0a0a0a]"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
              />
            </svg>
          </div>
          <p class="text-4xl font-bold font-mono text-[#0a0a0a]">{{ stats.portfolios }}</p>
          <p class="text-xs font-mono text-[#0a0a0a] mt-1 opacity-80">Active portfolios</p>
        </div>

        <!-- Total Trades -->
        <div
          class="bg-[#10b981] border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-100 cursor-pointer"
          @click="navigateTo('/trades')"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold uppercase text-white text-sm tracking-wide">Total Trades</h3>
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
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
          </div>
          <p class="text-4xl font-bold font-mono text-white">{{ stats.trades }}</p>
          <p class="text-xs font-mono text-white mt-1 opacity-80">
            {{ stats.buyTrades }} buys / {{ stats.sellTrades }} sells
          </p>
        </div>

        <!-- Journal Entries -->
        <div
          class="bg-[#a855f7] border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-100 cursor-pointer"
          @click="navigateTo('/journals')"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold uppercase text-white text-sm tracking-wide">Journal Entries</h3>
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
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
          <p class="text-4xl font-bold font-mono text-white">{{ stats.journals }}</p>
          <p class="text-xs font-mono text-white mt-1 opacity-80">Documented insights</p>
        </div>

        <!-- Active Portfolio Card -->
        <div class="bg-[#3b82f6] border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold uppercase text-white text-sm tracking-wide">Active Portfolio</h3>
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
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <p class="text-lg font-bold font-mono text-white truncate">
            {{ portfoliosStore.activePortfolio?.name || 'None' }}
          </p>
          <p class="text-xs font-mono text-white mt-1 opacity-80">Selected portfolio</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 class="text-xl font-bold uppercase text-[#0a0a0a] mb-4 tracking-wide">
          ⚡ Quick Actions
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            class="bg-[#10b981] border-[3px] border-black px-6 py-4 font-bold uppercase tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-100"
            @click="navigateTo('/trades')"
          >
            📈 Record New Trade
          </button>
          <button
            class="bg-[#a855f7] border-[3px] border-black px-6 py-4 font-bold uppercase tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-100"
            @click="navigateTo('/journals')"
          >
            📝 Write Journal Entry
          </button>
          <button
            class="bg-[#f59e0b] border-[3px] border-black px-6 py-4 font-bold uppercase tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-100"
            @click="navigateTo('/portfolios')"
          >
            💼 Manage Portfolios
          </button>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="bg-[#fef3c7] border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div class="flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-6 h-6 text-[#f59e0b] flex-shrink-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
            />
          </svg>
          <div>
            <h3 class="font-bold uppercase text-[#0a0a0a] tracking-wide mb-1">💡 Pro Tip</h3>
            <p class="text-sm font-mono text-[#525252]">
              Consistently documenting your trades and maintaining a journal will help you identify patterns
              and improve your trading strategy over time. Track every trade, reflect on your decisions,
              and learn from both wins and losses.
            </p>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
