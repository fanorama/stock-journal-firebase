<script setup lang="ts">
import { ref } from 'vue'
import type { Strategy } from '@/types'
import StrategyRulesList from './StrategyRulesList.vue'

interface Props {
  strategy: Strategy
  mode?: 'full' | 'compact' | 'inline'
  showLink?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'inline',
  showLink: false,
})

// Section collapse state
const sections = ref({
  entry: props.mode !== 'compact', // Entry rules expanded by default (except compact mode)
  exit: props.mode === 'full',     // Exit rules expanded only in full mode
})

/**
 * Toggle section expansion
 */
const toggleSection = (section: 'entry' | 'exit') => {
  sections.value[section] = !sections.value[section]
}
</script>

<template>
  <div
    class="strategy-preview-panel"
    :class="{
      'border-[3px] border-black p-4 bg-[#fafafa]': mode === 'inline' || mode === 'compact',
      'border-[5px] border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]': mode === 'full',
    }"
  >
    <!-- Header -->
    <div class="preview-header mb-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <h4 class="text-lg font-bold uppercase text-[#0a0a0a] tracking-wide break-words">
            {{ strategy.name }}
          </h4>
          <p
            v-if="strategy.description && mode !== 'compact'"
            class="text-sm font-mono text-[#525252] mt-1 break-words"
          >
            {{ strategy.description }}
          </p>
          <!-- Tags (only in full mode) -->
          <div v-if="strategy.tags && strategy.tags.length > 0 && mode === 'full'" class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="tag in strategy.tags"
              :key="tag"
              class="inline-block px-2 py-1 bg-[#dbeafe] border-[2px] border-black text-xs font-mono text-[#0a0a0a]"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- View Full Strategy Link -->
        <a
          v-if="showLink"
          :href="`/strategies?highlight=${strategy.id}`"
          target="_blank"
          class="flex-shrink-0 text-xs font-bold uppercase text-[#3b82f6] hover:underline whitespace-nowrap"
          title="View full strategy"
        >
          View Full →
        </a>
      </div>
    </div>

    <!-- Entry Rules Section -->
    <div class="rules-section mb-3">
      <button
        class="w-full flex items-center justify-between bg-[#10b981] border-[3px] border-black px-3 py-2 font-bold uppercase text-sm tracking-wide text-white hover:bg-[#059669] transition-colors"
        @click="toggleSection('entry')"
      >
        <span>📈 Entry Rules ({{ strategy.entryRules.length }})</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4 transition-transform"
          :class="{ 'rotate-180': sections.entry }"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      <!-- Entry Rules Content (Collapsible) -->
      <div
        v-show="sections.entry"
        class="border-x-[3px] border-b-[3px] border-black bg-white p-3"
      >
        <StrategyRulesList :rules="strategy.entryRules" type="entry" />
      </div>
    </div>

    <!-- Exit Rules Section -->
    <div class="rules-section">
      <button
        class="w-full flex items-center justify-between bg-[#ef4444] border-[3px] border-black px-3 py-2 font-bold uppercase text-sm tracking-wide text-white hover:bg-[#dc2626] transition-colors"
        @click="toggleSection('exit')"
      >
        <span>📉 Exit Rules ({{ strategy.exitRules.length }})</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4 transition-transform"
          :class="{ 'rotate-180': sections.exit }"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      <!-- Exit Rules Content (Collapsible) -->
      <div
        v-show="sections.exit"
        class="border-x-[3px] border-b-[3px] border-black bg-white p-3"
      >
        <StrategyRulesList :rules="strategy.exitRules" type="exit" />
      </div>
    </div>

    <!-- Metadata (only in full mode) -->
    <div v-if="mode === 'full'" class="mt-4 pt-4 border-t-[3px] border-black">
      <div class="text-xs font-mono text-[#525252] space-y-1">
        <p>
          <span class="font-bold">Created:</span>
          {{ new Date(strategy.createdAt.toDate()).toLocaleDateString('id-ID') }}
        </p>
        <p>
          <span class="font-bold">Last Updated:</span>
          {{ new Date(strategy.updatedAt.toDate()).toLocaleDateString('id-ID') }}
        </p>
      </div>
    </div>
  </div>
</template>
