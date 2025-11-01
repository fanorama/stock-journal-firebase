<script setup lang="ts">
import type { Portfolio } from '@/types'
import { computed } from 'vue'

interface Props {
  portfolio: Portfolio
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
})

const emit = defineEmits<{
  select: [portfolioId: string]
  edit: [portfolioId: string]
  delete: [portfolioId: string]
}>()

/**
 * Format currency to IDR format
 */
const formatCurrency = (amount: number, currency: string = 'IDR'): string => {
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Format date to readable format
 */
const formatDate = (timestamp: any): string => {
  if (!timestamp) return '-'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/**
 * Get market type label
 */
const marketTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    IDX: 'IDX (BEI)',
    US_STOCKS: 'US Stocks',
    CRYPTO: 'Crypto',
    FOREX: 'Forex',
  }
  return labels[props.portfolio.marketType] || props.portfolio.marketType
})

/**
 * Get accent color based on market type
 */
const accentColor = computed(() => {
  const colors: Record<string, string> = {
    IDX: 'bg-[#3b82f6]', // blue
    US_STOCKS: 'bg-[#a855f7]', // purple
    CRYPTO: 'bg-[#f59e0b]', // orange
    FOREX: 'bg-[#10b981]', // green
  }
  return colors[props.portfolio.marketType] || 'bg-[#3b82f6]'
})
</script>

<template>
  <div
    class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-100 cursor-pointer relative overflow-hidden"
    :class="{ 'ring-4 ring-[#f59e0b]': isActive }"
    @click="emit('select', portfolio.id)"
  >
    <!-- Market type accent bar -->
    <div class="absolute top-0 left-0 w-2 h-full" :class="accentColor"></div>

    <!-- Header -->
    <div class="flex items-start justify-between mb-4 pl-3">
      <div class="flex-1 pr-2">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="text-xl font-bold uppercase text-[#0a0a0a] tracking-wide">
            {{ portfolio.name }}
          </h3>
          <!-- Active indicator badge - inline with title -->
          <span
            v-if="isActive"
            class="bg-[#f59e0b] border-[2px] border-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0a0a0a]"
          >
            Active
          </span>
        </div>
        <p v-if="portfolio.description" class="text-sm text-[#525252] font-mono">
          {{ portfolio.description }}
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-2 ml-4 flex-shrink-0">
        <button
          class="bg-[#3b82f6] border-[3px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
          title="Edit Portfolio"
          @click.stop="emit('edit', portfolio.id)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5 text-white"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </button>
        <button
          class="bg-[#ef4444] border-[3px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
          title="Delete Portfolio"
          @click.stop="emit('delete', portfolio.id)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5 text-white"
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

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-4 pl-3">
      <!-- Initial Capital -->
      <div class="bg-[#fafafa] border-[3px] border-black p-3">
        <div class="text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
          Initial Capital
        </div>
        <div class="text-lg font-mono font-bold text-[#0a0a0a]">
          {{ formatCurrency(portfolio.initialCapital, portfolio.baseCurrency) }}
        </div>
      </div>

      <!-- Currency & Market -->
      <div class="bg-[#fafafa] border-[3px] border-black p-3">
        <div class="text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
          Market
        </div>
        <div class="text-sm font-bold text-[#0a0a0a]">{{ marketTypeLabel }}</div>
        <div class="text-xs font-mono text-[#525252] mt-1">{{ portfolio.baseCurrency }}</div>
      </div>

      <!-- Created Date -->
      <div class="bg-[#fafafa] border-[3px] border-black p-3 col-span-2">
        <div class="text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
          Created
        </div>
        <div class="text-sm font-mono text-[#0a0a0a]">
          {{ formatDate(portfolio.createdAt) }}
        </div>
      </div>
    </div>

    <!-- TODO: Add portfolio stats when trade data is available -->
    <!-- Future: Current Value, Total Return, P&L, etc. -->
  </div>
</template>
