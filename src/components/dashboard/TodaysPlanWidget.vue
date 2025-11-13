<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDailyPlansStore } from '@/stores'

const router = useRouter()
const dailyPlansStore = useDailyPlansStore()

/**
 * Today's plan data
 */
const todaysPlan = computed(() => dailyPlansStore.todaysPlan)

/**
 * Loading state
 */
const isLoading = computed(() => dailyPlansStore.isLoading)

/**
 * Watchlist stats
 */
const watchlistStats = computed(() => {
  if (!todaysPlan.value) {
    return { total: 0, executed: 0, planned: 0, skipped: 0, missed: 0 }
  }

  const watchlist = todaysPlan.value.watchlist || []
  return {
    total: watchlist.length,
    executed: watchlist.filter((item) => item.status === 'executed').length,
    planned: watchlist.filter((item) => item.status === 'planned').length,
    skipped: watchlist.filter((item) => item.status === 'skipped').length,
    missed: watchlist.filter((item) => item.status === 'missed').length,
  }
})

/**
 * Checklist stats
 */
const checklistStats = computed(() => {
  if (!todaysPlan.value) {
    return { total: 0, completed: 0 }
  }

  const checklist = todaysPlan.value.checklist || []
  return {
    total: checklist.length,
    completed: checklist.filter((item) => item.completed).length,
  }
})

/**
 * Has active plan
 */
const hasActivePlan = computed(() => {
  return !!todaysPlan.value && (watchlistStats.value.total > 0 || checklistStats.value.total > 0)
})

/**
 * Navigate to planner
 */
const navigateToPlanner = () => {
  router.push('/planner')
}
</script>

<template>
  <div class="todays-plan-widget">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="bg-white border-[5px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      <div class="flex items-center justify-center">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-[4px] border-black border-t-transparent"
        ></div>
        <p class="ml-4 text-[#525252] font-mono font-bold uppercase tracking-wide text-sm">
          Loading Today's Plan...
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!hasActivePlan"
      class="bg-[#fef3c7] border-[5px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      <div class="flex flex-col items-center text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-16 h-16 text-[#f59e0b] mb-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
          />
        </svg>
        <h3 class="text-xl font-bold uppercase text-[#0a0a0a] mb-2 tracking-wide">
          No Plan for Today
        </h3>
        <p class="text-sm font-mono text-[#525252] mb-6 max-w-md">
          Belum ada rencana trading untuk hari ini. Mulai dengan buat daily plan untuk track
          watchlist dan checklist kamu.
        </p>
        <button
          class="bg-[#f59e0b] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
          @click="navigateToPlanner"
        >
          📋 Go to Planner
        </button>
      </div>
    </div>

    <!-- Active Plan Widget -->
    <div
      v-else
      class="bg-white border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
    >
      <!-- Widget Header -->
      <div class="bg-[#3b82f6] border-b-[5px] border-black p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold uppercase text-white tracking-wide mb-1">
              📋 Today's Plan
            </h2>
            <p class="text-sm font-mono text-white opacity-90">
              {{ new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
            </p>
          </div>
          <button
            class="bg-white border-[3px] border-black px-4 py-2 font-bold uppercase text-sm tracking-wide text-[#0a0a0a] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
            @click="navigateToPlanner"
          >
            Open Full Plan →
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 divide-y-[5px] md:divide-y-0 md:divide-x-[5px] divide-black">
        <!-- Watchlist Stats -->
        <div class="p-6 bg-[#fafafa]">
          <div class="flex items-center gap-3 mb-4">
            <div class="bg-[#10b981] border-[3px] border-black p-2">
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
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                />
              </svg>
            </div>
            <div>
              <h3 class="font-bold uppercase text-[#0a0a0a] text-sm tracking-wide">Watchlist</h3>
              <p class="text-xs font-mono text-[#525252]">Stocks planned</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-3xl font-bold font-mono text-[#0a0a0a]">
                {{ watchlistStats.total }}
              </p>
              <span class="text-xs font-mono text-[#525252]">Total</span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs font-mono">
              <div class="bg-[#34d399] border-[2px] border-black px-2 py-1">
                <span class="text-white font-bold">{{ watchlistStats.executed }}</span>
                <span class="text-white ml-1">Executed</span>
              </div>
              <div class="bg-[#fbbf24] border-[2px] border-black px-2 py-1">
                <span class="text-[#0a0a0a] font-bold">{{ watchlistStats.planned }}</span>
                <span class="text-[#0a0a0a] ml-1">Planned</span>
              </div>
              <div class="bg-[#a3a3a3] border-[2px] border-black px-2 py-1">
                <span class="text-white font-bold">{{ watchlistStats.skipped }}</span>
                <span class="text-white ml-1">Skipped</span>
              </div>
              <div class="bg-[#f87171] border-[2px] border-black px-2 py-1">
                <span class="text-white font-bold">{{ watchlistStats.missed }}</span>
                <span class="text-white ml-1">Missed</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Execution Rate -->
        <div class="p-6 bg-white">
          <div class="flex items-center gap-3 mb-4">
            <div class="bg-[#34d399] border-[3px] border-black p-2">
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
            <div>
              <h3 class="font-bold uppercase text-[#0a0a0a] text-sm tracking-wide">Execution</h3>
              <p class="text-xs font-mono text-[#525252]">Trade rate</p>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <div class="flex items-baseline gap-2 mb-2">
                <p class="text-4xl font-bold font-mono text-[#0a0a0a]">
                  {{ watchlistStats.executed }}
                </p>
                <span class="text-lg font-bold font-mono text-[#525252]">/</span>
                <p class="text-2xl font-bold font-mono text-[#525252]">
                  {{ watchlistStats.total }}
                </p>
              </div>
              <p class="text-xs font-mono text-[#525252]">Stocks executed</p>
            </div>

            <!-- Progress Bar -->
            <div v-if="watchlistStats.total > 0" class="space-y-1">
              <div class="bg-[#e5e5e5] border-[3px] border-black h-4 overflow-hidden">
                <div
                  class="bg-[#10b981] h-full transition-all duration-300"
                  :style="{
                    width: `${(watchlistStats.executed / watchlistStats.total) * 100}%`,
                  }"
                ></div>
              </div>
              <p class="text-xs font-mono text-[#525252] text-right">
                {{ Math.round((watchlistStats.executed / watchlistStats.total) * 100) }}% execution
                rate
              </p>
            </div>
          </div>
        </div>

        <!-- Checklist Progress -->
        <div class="p-6 bg-[#fafafa]">
          <div class="flex items-center gap-3 mb-4">
            <div class="bg-[#a855f7] border-[3px] border-black p-2">
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
                  d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                />
              </svg>
            </div>
            <div>
              <h3 class="font-bold uppercase text-[#0a0a0a] text-sm tracking-wide">Checklist</h3>
              <p class="text-xs font-mono text-[#525252]">Pre-market prep</p>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <div class="flex items-baseline gap-2 mb-2">
                <p class="text-4xl font-bold font-mono text-[#0a0a0a]">
                  {{ checklistStats.completed }}
                </p>
                <span class="text-lg font-bold font-mono text-[#525252]">/</span>
                <p class="text-2xl font-bold font-mono text-[#525252]">
                  {{ checklistStats.total }}
                </p>
              </div>
              <p class="text-xs font-mono text-[#525252]">Items completed</p>
            </div>

            <!-- Progress Bar -->
            <div v-if="checklistStats.total > 0" class="space-y-1">
              <div class="bg-[#e5e5e5] border-[3px] border-black h-4 overflow-hidden">
                <div
                  class="bg-[#a855f7] h-full transition-all duration-300"
                  :style="{
                    width: `${(checklistStats.completed / checklistStats.total) * 100}%`,
                  }"
                ></div>
              </div>
              <p class="text-xs font-mono text-[#525252] text-right">
                {{ Math.round((checklistStats.completed / checklistStats.total) * 100) }}%
                completed
              </p>
            </div>

            <!-- Empty Checklist Message -->
            <div v-else class="text-center py-2">
              <p class="text-xs font-mono text-[#a3a3a3]">No checklist items</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
