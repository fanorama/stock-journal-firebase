<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  total: number
  executed: number
  skipped: number
  missed: number
  planned: number
  adherenceRate: number
}

const props = defineProps<Props>()

/**
 * Get adherence rate color based on percentage
 */
const adherenceColor = computed(() => {
  const rate = props.adherenceRate
  if (rate === 0) return { bg: 'bg-[#d4d4d4]', text: 'text-[#0a0a0a]', label: 'No Data' }
  if (rate < 50) return { bg: 'bg-[#ef4444]', text: 'text-white', label: 'Poor' }
  if (rate < 70) return { bg: 'bg-[#f59e0b]', text: 'text-white', label: 'Fair' }
  if (rate < 85) return { bg: 'bg-[#3b82f6]', text: 'text-white', label: 'Good' }
  return { bg: 'bg-[#10b981]', text: 'text-white', label: 'Excellent' }
})

/**
 * Progress bar width
 */
const progressWidth = computed(() => {
  return `${props.adherenceRate}%`
})
</script>

<template>
  <div class="adherence-metrics mb-6">
    <!-- Main Adherence Rate Display -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-bold uppercase text-[#0a0a0a] tracking-wide">
          Adherence Rate
        </h4>
        <span class="text-xs font-mono text-[#525252]">
          {{ executed }}/{{ total - planned }} executed ({{ planned }} still planned)
        </span>
      </div>

      <!-- Progress Bar -->
      <div class="relative">
        <div class="w-full h-12 bg-[#fafafa] border-[3px] border-black overflow-hidden">
          <div
            :class="['h-full transition-all duration-500', adherenceColor.bg]"
            :style="{ width: progressWidth }"
          >
            <div class="h-full flex items-center justify-center px-3">
              <span :class="['text-lg font-bold', adherenceColor.text]">
                {{ adherenceRate }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Adherence Label Badge -->
        <div
          v-if="adherenceRate > 0"
          class="absolute top-1/2 right-3 transform -translate-y-1/2"
        >
          <span
            :class="[
              'inline-block px-3 py-1 border-[3px] border-black font-bold text-xs uppercase tracking-wide',
              adherenceColor.bg,
              adherenceColor.text,
            ]"
          >
            {{ adherenceColor.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- Detailed Metrics Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <!-- Executed -->
      <div class="bg-[#d1fae5] border-[3px] border-black p-3">
        <div class="flex items-center justify-between">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-6 h-6 text-[#10b981]"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <span class="text-2xl font-bold text-[#10b981]">{{ executed }}</span>
        </div>
        <p class="text-xs font-bold uppercase text-[#0a0a0a] mt-2 tracking-wide">
          Executed
        </p>
      </div>

      <!-- Skipped -->
      <div class="bg-[#fafafa] border-[3px] border-black p-3">
        <div class="flex items-center justify-between">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-6 h-6 text-[#737373]"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
            />
          </svg>
          <span class="text-2xl font-bold text-[#737373]">{{ skipped }}</span>
        </div>
        <p class="text-xs font-bold uppercase text-[#0a0a0a] mt-2 tracking-wide">
          Skipped
        </p>
      </div>

      <!-- Missed -->
      <div class="bg-[#fee2e2] border-[3px] border-black p-3">
        <div class="flex items-center justify-between">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-6 h-6 text-[#ef4444]"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <span class="text-2xl font-bold text-[#ef4444]">{{ missed }}</span>
        </div>
        <p class="text-xs font-bold uppercase text-[#0a0a0a] mt-2 tracking-wide">
          Missed
        </p>
      </div>

      <!-- Planned (Still Open) -->
      <div class="bg-[#fef3c7] border-[3px] border-black p-3">
        <div class="flex items-center justify-between">
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
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <span class="text-2xl font-bold text-[#f59e0b]">{{ planned }}</span>
        </div>
        <p class="text-xs font-bold uppercase text-[#0a0a0a] mt-2 tracking-wide">
          Planned
        </p>
      </div>
    </div>

    <!-- Explanation Text -->
    <div class="mt-4 bg-[#dbeafe] border-[2px] border-black p-3 flex gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-4 h-4 text-[#3b82f6] flex-shrink-0"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
        />
      </svg>
      <p class="text-xs font-mono text-[#0a0a0a]">
        Adherence rate = Executed / (Executed + Skipped). "Planned" items belum di-hitung karena belum decided.
        Mark items as skipped/missed di end of day untuk accurate tracking.
      </p>
    </div>
  </div>
</template>
