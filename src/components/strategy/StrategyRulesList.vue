<script setup lang="ts">
import type { StrategyRule } from '@/types'

interface Props {
  rules: StrategyRule[]
  type: 'entry' | 'exit'
}

const props = defineProps<Props>()

/**
 * Format rule display based on type
 */
const formatRuleDisplay = (rule: StrategyRule): string => {
  switch (rule.type) {
    case 'CONDITION':
      return `${rule.field} ${rule.operator} ${rule.value}`
    case 'CHECKLIST':
      return rule.description
    case 'TEMPLATE':
      return rule.description || `Template: ${rule.category}`
    default:
      return rule.description
  }
}

/**
 * Get badge info for rule type
 */
const getRuleBadge = (rule: StrategyRule) => {
  switch (rule.type) {
    case 'CONDITION':
      return {
        text: 'Auto-verify',
        bg: 'bg-[#34d399]',
        border: 'border-[#10b981]',
      }
    case 'CHECKLIST':
      return {
        text: 'Manual Check',
        bg: 'bg-[#fbbf24]',
        border: 'border-[#f59e0b]',
      }
    case 'TEMPLATE':
      return {
        text: 'Template',
        bg: 'bg-[#60a5fa]',
        border: 'border-[#3b82f6]',
      }
    default:
      return {
        text: 'Rule',
        bg: 'bg-[#a3a3a3]',
        border: 'border-[#737373]',
      }
  }
}
</script>

<template>
  <div class="strategy-rules-list">
    <!-- Empty State -->
    <div
      v-if="!rules || rules.length === 0"
      class="text-xs font-mono text-[#a3a3a3] italic py-2"
    >
      No {{ type }} rules defined
    </div>

    <!-- Rules List -->
    <ul v-else class="space-y-2">
      <li
        v-for="rule in rules"
        :key="rule.id"
        class="flex items-start gap-2 bg-[#fafafa] border-[2px] border-black p-2"
      >
        <!-- Rule Badge -->
        <span
          :class="[
            'inline-block px-2 py-1 border-[2px] font-bold text-xs uppercase tracking-wide text-[#0a0a0a] whitespace-nowrap flex-shrink-0',
            getRuleBadge(rule).bg,
            getRuleBadge(rule).border,
          ]"
        >
          {{ getRuleBadge(rule).text }}
        </span>

        <!-- Rule Content -->
        <div class="flex-1 min-w-0">
          <!-- CONDITION Type -->
          <template v-if="rule.type === 'CONDITION'">
            <p class="text-sm font-mono text-[#0a0a0a] break-words">
              <span class="font-bold">{{ rule.field }}</span>
              <span class="text-[#525252] mx-1">{{ rule.operator }}</span>
              <span class="font-bold text-[#3b82f6]">{{ rule.value }}</span>
            </p>
            <p
              v-if="rule.logicalOp"
              class="text-xs font-mono text-[#a3a3a3] mt-1"
            >
              Chained with: {{ rule.logicalOp }}
            </p>
          </template>

          <!-- CHECKLIST Type -->
          <template v-else-if="rule.type === 'CHECKLIST'">
            <div class="flex items-start gap-2">
              <!-- Checkbox Icon -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <p class="text-sm font-mono text-[#0a0a0a] break-words">
                {{ rule.description }}
              </p>
            </div>
          </template>

          <!-- TEMPLATE Type -->
          <template v-else-if="rule.type === 'TEMPLATE'">
            <p class="text-sm font-mono text-[#0a0a0a] break-words">
              {{ rule.description }}
            </p>
            <p
              v-if="rule.category"
              class="text-xs font-mono text-[#525252] mt-1"
            >
              Category: {{ rule.category }}
            </p>
          </template>

          <!-- Other Types -->
          <template v-else>
            <p class="text-sm font-mono text-[#0a0a0a] break-words">
              {{ rule.description }}
            </p>
          </template>
        </div>
      </li>
    </ul>
  </div>
</template>
