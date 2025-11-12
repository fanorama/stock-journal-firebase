<script setup lang="ts">
import type { Strategy } from '@/types'
import { computed } from 'vue'

interface Props {
  strategy: Strategy
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [strategyId: string]
  delete: [strategyId: string]
}>()

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
 * Get entry rules count
 */
const entryRulesCount = computed(() => {
  return props.strategy.entryRules?.length || 0
})

/**
 * Get exit rules count
 */
const exitRulesCount = computed(() => {
  return props.strategy.exitRules?.length || 0
})

/**
 * Get total rules count
 */
const totalRulesCount = computed(() => {
  return entryRulesCount.value + exitRulesCount.value
})

/**
 * Get accent color based on tags or random
 */
const accentColor = computed(() => {
  const colors = [
    'bg-[#3b82f6]', // blue
    'bg-[#a855f7]', // purple
    'bg-[#f59e0b]', // orange
    'bg-[#10b981]', // green
    'bg-[#ef4444]', // red
  ]
  // Simple hash based on strategy id
  const hash = props.strategy.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
})
</script>

<template>
  <div
    class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-100 relative overflow-hidden"
  >
    <!-- Accent bar -->
    <div class="absolute top-0 left-0 w-2 h-full" :class="accentColor"></div>

    <!-- Header -->
    <div class="flex items-start justify-between mb-4 pl-3">
      <div class="flex-1 pr-2">
        <h3 class="text-xl font-bold uppercase text-[#0a0a0a] tracking-wide mb-1">
          {{ strategy.name }}
        </h3>
        <p v-if="strategy.description" class="text-sm text-[#525252] font-mono">
          {{ strategy.description }}
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-2 ml-4 flex-shrink-0">
        <button
          class="bg-[#3b82f6] border-[3px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
          title="Edit Strategy"
          @click="emit('edit', strategy.id)"
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
          title="Delete Strategy"
          @click="emit('delete', strategy.id)"
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
      <!-- Entry Rules -->
      <div class="bg-[#fafafa] border-[3px] border-black p-3">
        <div class="text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
          Entry Rules
        </div>
        <div class="text-2xl font-mono font-bold text-[#10b981]">
          {{ entryRulesCount }}
        </div>
      </div>

      <!-- Exit Rules -->
      <div class="bg-[#fafafa] border-[3px] border-black p-3">
        <div class="text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
          Exit Rules
        </div>
        <div class="text-2xl font-mono font-bold text-[#ef4444]">
          {{ exitRulesCount }}
        </div>
      </div>

      <!-- Tags -->
      <div v-if="strategy.tags && strategy.tags.length > 0" class="col-span-2 bg-[#fafafa] border-[3px] border-black p-3">
        <div class="text-xs font-bold uppercase tracking-wide text-[#525252] mb-2">
          Tags
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in strategy.tags"
            :key="tag"
            class="bg-[#3b82f6] border-[2px] border-black px-2 py-1 text-xs font-bold uppercase text-white"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Created Date -->
      <div class="bg-[#fafafa] border-[3px] border-black p-3 col-span-2">
        <div class="text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
          Created
        </div>
        <div class="text-sm font-mono text-[#0a0a0a]">
          {{ formatDate(strategy.createdAt) }}
        </div>
      </div>
    </div>
  </div>
</template>
