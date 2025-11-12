<script setup lang="ts">
import type { StrategyRule } from '@/types'
import { RULE_TYPES, COMPARISON_OPERATORS, LOGICAL_OPERATORS } from '@/types'
import { ref, computed } from 'vue'

interface Props {
  modelValue: StrategyRule[]
  label: string // "Entry Rules" or "Exit Rules"
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [rules: StrategyRule[]]
}>()

// Local rules state
const rules = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

/**
 * Generate unique ID for new rule
 */
const generateRuleId = (): string => {
  return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Add new rule
 */
const addRule = (type: keyof typeof RULE_TYPES = 'CHECKLIST') => {
  const newRule: StrategyRule = {
    id: generateRuleId(),
    type: RULE_TYPES[type],
    description: '',
  }

  // Set defaults based on type
  if (type === 'CHECKLIST') {
    newRule.checked = false
  } else if (type === 'CONDITION') {
    newRule.field = ''
    newRule.operator = COMPARISON_OPERATORS.GREATER_THAN
    newRule.value = ''
    newRule.logicalOp = LOGICAL_OPERATORS.AND
  } else if (type === 'TEMPLATE') {
    newRule.category = ''
    newRule.templateData = {}
  }

  rules.value = [...rules.value, newRule]
}

/**
 * Remove rule by ID
 */
const removeRule = (ruleId: string) => {
  rules.value = rules.value.filter((r) => r.id !== ruleId)
}

/**
 * Update rule
 */
const updateRule = (ruleId: string, updates: Partial<StrategyRule>) => {
  rules.value = rules.value.map((r) => (r.id === ruleId ? { ...r, ...updates } : r))
}

/**
 * Get rule type label
 */
const getRuleTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    CHECKLIST: 'Checklist',
    CONDITION: 'Condition',
    TEMPLATE: 'Template',
  }
  return labels[type] || type
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold uppercase text-[#0a0a0a] tracking-wide">{{ label }}</h3>

      <!-- Add Rule Buttons -->
      <div class="flex gap-2">
        <button
          type="button"
          class="bg-[#10b981] border-[3px] border-black px-3 py-1 text-sm font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
          @click="addRule('CHECKLIST')"
        >
          + Checklist
        </button>
        <button
          type="button"
          class="bg-[#3b82f6] border-[3px] border-black px-3 py-1 text-sm font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
          @click="addRule('CONDITION')"
        >
          + Condition
        </button>
      </div>
    </div>

    <!-- Rules List -->
    <div v-if="rules.length === 0" class="bg-[#fafafa] border-[3px] border-dashed border-[#d4d4d4] p-6 text-center">
      <p class="text-sm text-[#525252] font-mono">No rules added yet. Click the buttons above to add rules.</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(rule, index) in rules"
        :key="rule.id"
        class="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative"
      >
        <!-- Rule Type Badge -->
        <div class="flex items-start justify-between mb-3">
          <span
            class="bg-[#f59e0b] border-[2px] border-black px-2 py-1 text-xs font-bold uppercase text-[#0a0a0a]"
          >
            {{ getRuleTypeLabel(rule.type) }}
          </span>

          <!-- Remove Button -->
          <button
            type="button"
            class="bg-[#ef4444] border-[2px] border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
            title="Remove Rule"
            @click="removeRule(rule.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-4 h-4 text-white"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- CHECKLIST Type -->
        <div v-if="rule.type === 'CHECKLIST'" class="space-y-2">
          <label class="block text-xs font-bold uppercase tracking-wide text-[#525252]">
            Description
          </label>
          <input
            type="text"
            :value="rule.description"
            @input="updateRule(rule.id, { description: ($event.target as HTMLInputElement).value })"
            class="w-full border-[3px] border-black px-3 py-2 font-mono text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            placeholder="e.g., RSI below 30"
          />
        </div>

        <!-- CONDITION Type -->
        <div v-else-if="rule.type === 'CONDITION'" class="space-y-3">
          <!-- Description -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
              Description
            </label>
            <input
              type="text"
              :value="rule.description"
              @input="updateRule(rule.id, { description: ($event.target as HTMLInputElement).value })"
              class="w-full border-[3px] border-black px-3 py-2 font-mono text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              placeholder="e.g., RSI indicator check"
            />
          </div>

          <!-- Condition Fields -->
          <div class="grid grid-cols-3 gap-3">
            <!-- Field -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
                Field
              </label>
              <input
                type="text"
                :value="rule.field"
                @input="updateRule(rule.id, { field: ($event.target as HTMLInputElement).value })"
                class="w-full border-[3px] border-black px-3 py-2 font-mono text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                placeholder="RSI"
              />
            </div>

            <!-- Operator -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
                Operator
              </label>
              <select
                :value="rule.operator"
                @change="updateRule(rule.id, { operator: ($event.target as HTMLSelectElement).value as any })"
                class="w-full border-[3px] border-black px-3 py-2 font-mono text-sm text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] bg-white"
              >
                <option :value="COMPARISON_OPERATORS.LESS_THAN">&lt;</option>
                <option :value="COMPARISON_OPERATORS.GREATER_THAN">&gt;</option>
                <option :value="COMPARISON_OPERATORS.LESS_THAN_OR_EQUAL">&lt;=</option>
                <option :value="COMPARISON_OPERATORS.GREATER_THAN_OR_EQUAL">&gt;=</option>
                <option :value="COMPARISON_OPERATORS.EQUALS">==</option>
                <option :value="COMPARISON_OPERATORS.NOT_EQUALS">!=</option>
              </select>
            </div>

            <!-- Value -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
                Value
              </label>
              <input
                type="text"
                :value="rule.value"
                @input="updateRule(rule.id, { value: ($event.target as HTMLInputElement).value })"
                class="w-full border-[3px] border-black px-3 py-2 font-mono text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                placeholder="30"
              />
            </div>
          </div>

          <!-- Logical Operator (if not last rule) -->
          <div v-if="index < rules.length - 1">
            <label class="block text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
              Chain with next rule
            </label>
            <select
              :value="rule.logicalOp"
              @change="updateRule(rule.id, { logicalOp: ($event.target as HTMLSelectElement).value as any })"
              class="border-[3px] border-black px-3 py-2 font-mono text-sm text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] bg-white"
            >
              <option :value="LOGICAL_OPERATORS.AND">AND</option>
              <option :value="LOGICAL_OPERATORS.OR">OR</option>
            </select>
          </div>
        </div>

        <!-- TEMPLATE Type -->
        <div v-else-if="rule.type === 'TEMPLATE'" class="space-y-3">
          <!-- Description -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
              Description
            </label>
            <input
              type="text"
              :value="rule.description"
              @input="updateRule(rule.id, { description: ($event.target as HTMLInputElement).value })"
              class="w-full border-[3px] border-black px-3 py-2 font-mono text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              placeholder="e.g., Risk management rule"
            />
          </div>

          <!-- Category -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wide text-[#525252] mb-1">
              Category
            </label>
            <select
              :value="rule.category"
              @change="updateRule(rule.id, { category: ($event.target as HTMLSelectElement).value })"
              class="w-full border-[3px] border-black px-3 py-2 font-mono text-sm text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] bg-white"
            >
              <option value="">Select category</option>
              <option value="Technical">Technical</option>
              <option value="Fundamental">Fundamental</option>
              <option value="Risk Management">Risk Management</option>
              <option value="Position Sizing">Position Sizing</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
