<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AddTradeModal from '@/components/trade/AddTradeModal.vue'
import EditTradeModal from '@/components/trade/EditTradeModal.vue'
import DeleteTradeConfirmation from '@/components/trade/DeleteTradeConfirmation.vue'
import { useTradesStore, usePortfoliosStore } from '@/stores'
import type { Trade } from '@/types'

const route = useRoute()
const router = useRouter()
const tradesStore = useTradesStore()
const portfoliosStore = usePortfoliosStore()

// Modal state
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedTradeId = ref<string | null>(null)

// Prefill data from query params (for quick trade creation from planner)
const prefillData = ref<{
  symbol?: string
  strategyId?: string
  strategyName?: string
  notes?: string
  targetEntry?: number
  targetExit?: number
  planId?: string
  watchlistItemId?: string
} | undefined>(undefined)

/**
 * Get selected trade object
 */
const selectedTrade = computed(() => {
  if (!selectedTradeId.value) return null
  return tradesStore.getTradeById(selectedTradeId.value) || null
})

/**
 * Handle add trade
 */
const handleAddTrade = () => {
  showAddModal.value = true
}

/**
 * Handle add trade success
 */
const handleAddTradeSuccess = async (tradeId: string) => {
  console.log('Trade created successfully:', tradeId)

  // If created from planner watchlist, link the trade
  if (prefillData.value?.planId && prefillData.value?.watchlistItemId) {
    try {
      // Import dynamic to avoid circular dependency
      const { useDailyPlansStore } = await import('@/stores')
      const dailyPlansStore = useDailyPlansStore()

      await dailyPlansStore.linkTradeToWatchlist(
        prefillData.value.planId,
        prefillData.value.watchlistItemId,
        tradeId
      )

      console.log('Trade linked to watchlist item successfully')

      // Navigate back to planner
      router.push('/planner')
    } catch (error) {
      console.error('Failed to link trade to watchlist:', error)
      // Still consider it a success, just log the error
    }
  }

  // Clear prefill data
  prefillData.value = undefined
}

/**
 * Handle edit trade
 */
const handleEditTrade = (tradeId: string) => {
  selectedTradeId.value = tradeId
  showEditModal.value = true
}

/**
 * Handle edit trade success
 */
const handleEditTradeSuccess = () => {
  console.log('Trade updated successfully')
  selectedTradeId.value = null
}

/**
 * Handle delete trade
 */
const handleDeleteTrade = (tradeId: string) => {
  selectedTradeId.value = tradeId
  showDeleteModal.value = true
}

/**
 * Handle delete trade success
 */
const handleDeleteTradeSuccess = () => {
  console.log('Trade deleted successfully')
  selectedTradeId.value = null
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
 * Calculate trade total
 */
const calculateTradeTotal = (trade: Trade): number => {
  const subtotal = trade.quantity * trade.price
  const fees = trade.fees || 0

  if (trade.type === 'BUY') {
    return subtotal + fees
  } else {
    return subtotal - fees
  }
}

/**
 * On mounted: check for prefill query params from planner
 */
onMounted(() => {
  const { symbol, strategyId, strategyName, notes, targetEntry, targetExit, planId, watchlistItemId } = route.query

  if (symbol) {
    prefillData.value = {
      symbol: String(symbol),
      strategyId: strategyId ? String(strategyId) : undefined,
      strategyName: strategyName ? String(strategyName) : undefined,
      notes: notes ? String(notes) : undefined,
      targetEntry: targetEntry ? Number(targetEntry) : undefined,
      targetExit: targetExit ? Number(targetExit) : undefined,
      planId: planId ? String(planId) : undefined,
      watchlistItemId: watchlistItemId ? String(watchlistItemId) : undefined,
    }

    // Auto-open add modal when prefill data exists
    showAddModal.value = true

    // Clean up URL (remove query params)
    router.replace({ query: {} })
  }
})
</script>

<template>
  <div class="space-y-6">
      <!-- Page Header -->
      <div class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 class="text-2xl font-bold uppercase text-[#0a0a0a] mb-2 tracking-wide">
          Trade History
        </h2>
        <p class="text-[#525252] font-mono text-sm">
          Track and manage all your buy and sell transactions.
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
              Please select or create a portfolio first to manage trades.
            </p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-else-if="tradesStore.isLoading"
        class="bg-white border-[5px] border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center"
      >
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-[4px] border-black border-t-transparent"></div>
        <p class="mt-4 text-[#525252] font-mono font-bold uppercase tracking-wide">
          Loading Trades...
        </p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="tradesStore.error"
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
            <p class="text-white font-mono text-sm">{{ tradesStore.error }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!tradesStore.hasTrades"
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
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
          </div>

          <h3 class="text-2xl font-bold uppercase text-[#0a0a0a] mb-3 tracking-wide">
            No Trades Yet
          </h3>
          <p class="text-[#525252] font-mono mb-6">
            Start tracking your trading activity by recording your first buy or sell transaction.
          </p>
          <button
            class="bg-[#10b981] border-[3px] border-black px-8 py-4 font-bold uppercase tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
            @click="handleAddTrade"
          >
            Record Your First Trade
          </button>
        </div>
      </div>

      <!-- Trades Table -->
      <div v-else class="bg-white border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-[#fafafa] border-b-[3px] border-black">
                <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#0a0a0a]">
                  Tanggal
                </th>
                <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#0a0a0a]">
                  Symbol
                </th>
                <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#0a0a0a]">
                  Type
                </th>
                <th class="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-[#0a0a0a]">
                  Qty
                </th>
                <th class="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-[#0a0a0a]">
                  Price
                </th>
                <th class="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-[#0a0a0a]">
                  Fees
                </th>
                <th class="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-[#0a0a0a]">
                  Total
                </th>
                <th class="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-[#0a0a0a]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="trade in tradesStore.trades"
                :key="trade.id"
                class="border-b-[2px] border-[#e5e5e5] hover:bg-[#fafafa] transition-colors"
              >
                <td class="px-4 py-3 text-sm font-mono text-[#525252]">
                  {{ formatDate(trade.date) }}
                </td>
                <td class="px-4 py-3">
                  <span class="text-sm font-bold font-mono text-[#0a0a0a]">
                    {{ trade.symbol }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide border-[2px] border-black"
                    :class="trade.type === 'BUY' ? 'bg-[#10b981] text-white' : 'bg-[#ef4444] text-white'"
                  >
                    {{ trade.type }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right text-sm font-mono text-[#0a0a0a]">
                  {{ trade.quantity.toLocaleString('id-ID') }}
                </td>
                <td class="px-4 py-3 text-right text-sm font-mono text-[#0a0a0a]">
                  {{ formatCurrency(trade.price) }}
                </td>
                <td class="px-4 py-3 text-right text-sm font-mono text-[#525252]">
                  {{ formatCurrency(trade.fees || 0) }}
                </td>
                <td class="px-4 py-3 text-right text-sm font-bold font-mono text-[#0a0a0a]">
                  {{ formatCurrency(calculateTradeTotal(trade)) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      class="bg-[#3b82f6] border-[2px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
                      title="Edit"
                      @click="handleEditTrade(trade.id)"
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
                      @click="handleDeleteTrade(trade.id)"
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Trade Count Summary -->
        <div class="bg-[#fafafa] border-t-[3px] border-black p-4 text-center">
          <p class="font-mono text-sm text-[#525252]">
            Total Trades:
            <span class="font-bold text-[#0a0a0a]">{{ tradesStore.tradesCount }}</span>
            <span class="mx-2">|</span>
            Buy: <span class="font-bold text-[#10b981]">{{ tradesStore.buyTrades.length }}</span>
            <span class="mx-2">|</span>
            Sell: <span class="font-bold text-[#ef4444]">{{ tradesStore.sellTrades.length }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Add Trade Modal -->
    <AddTradeModal
      :show="showAddModal"
      :prefill-data="prefillData"
      @close="showAddModal = false"
      @success="handleAddTradeSuccess"
    />

    <!-- Edit Trade Modal -->
    <EditTradeModal
      :show="showEditModal"
      :trade="selectedTrade"
      @close="showEditModal = false"
      @success="handleEditTradeSuccess"
    />

    <!-- Delete Trade Confirmation -->
    <DeleteTradeConfirmation
      :show="showDeleteModal"
      :trade="selectedTrade"
      @close="showDeleteModal = false"
      @success="handleDeleteTradeSuccess"
    />
</template>
