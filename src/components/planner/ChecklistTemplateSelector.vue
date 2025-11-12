<script setup lang="ts">
import { ref } from 'vue'
import type { ChecklistItem } from '@/types'

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  apply: [items: Omit<ChecklistItem, 'id' | 'position'>[]]
}>()

// Template definitions
const templates = {
  basic: {
    name: 'Basic Preparation',
    description: 'Essential pre-market checks untuk trader pemula',
    icon: '📋',
    color: 'bg-[#60a5fa]',
    items: [
      'Check market sentiment (bullish/bearish)',
      'Review economic calendar for today',
      'Set daily profit target dan max loss limit',
      'Verify trading capital available',
      'Ensure trading platform berfungsi normal',
    ],
  },
  technical: {
    name: 'Technical Analysis',
    description: 'Checklist untuk technical trader',
    icon: '📊',
    color: 'bg-[#f59e0b]',
    items: [
      'Review overnight price action & gaps',
      'Identify key support/resistance levels',
      'Check major indicators (RSI, MACD, MA)',
      'Analyze volume patterns dari pre-market',
      'Mark potential breakout/breakdown levels',
      'Set alerts untuk key price levels',
    ],
  },
  fundamental: {
    name: 'Fundamental Analysis',
    description: 'Checklist untuk fundamental trader',
    icon: '📈',
    color: 'bg-[#10b981]',
    items: [
      'Check latest company news & announcements',
      'Review sector performance trends',
      'Monitor currency exchange rates (if applicable)',
      'Check commodity prices (for related stocks)',
      'Review analyst recommendations & target prices',
      'Verify corporate actions (dividend, stock split)',
    ],
  },
}

type TemplateKey = keyof typeof templates

// Selected template
const selectedTemplate = ref<TemplateKey | null>(null)

/**
 * Select a template
 */
const selectTemplate = (key: TemplateKey) => {
  selectedTemplate.value = key
}

/**
 * Apply selected template
 */
const applyTemplate = () => {
  if (!selectedTemplate.value) return

  const template = templates[selectedTemplate.value]
  const items: Omit<ChecklistItem, 'id' | 'position'>[] = template.items.map((text) => ({
    text,
    completed: false,
    completedAt: undefined,
    isTemplate: true,
  }))

  emit('apply', items)
  handleClose()
}

/**
 * Handle close modal
 */
const handleClose = () => {
  selectedTemplate.value = null
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="handleClose"
    >
      <div
        class="bg-white border-[5px] border-black p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-2xl font-bold uppercase text-[#0a0a0a] tracking-wide">
              Choose Checklist Template
            </h3>
            <p class="text-sm font-mono text-[#525252] mt-1">
              Pilih template sesuai trading style kamu
            </p>
          </div>
          <button
            class="p-2 border-[3px] border-black hover:bg-[#fafafa] transition-colors"
            @click="handleClose"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Templates Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <!-- Basic Template -->
          <button
            class="text-left border-[5px] border-black p-4 transition-all duration-100 hover:translate-x-[2px] hover:translate-y-[2px]"
            :class="[
              templates.basic.color,
              selectedTemplate === 'basic'
                ? 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]'
                : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
            ]"
            @click="selectTemplate('basic')"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">{{ templates.basic.icon }}</span>
              <h4 class="text-lg font-bold uppercase text-[#0a0a0a] tracking-wide">
                {{ templates.basic.name }}
              </h4>
            </div>
            <p class="text-xs font-mono text-[#0a0a0a] mb-3">
              {{ templates.basic.description }}
            </p>
            <div class="space-y-1">
              <p class="text-xs font-bold uppercase text-[#0a0a0a]">
                {{ templates.basic.items.length }} Items:
              </p>
              <ul class="text-xs font-mono text-[#0a0a0a] space-y-1">
                <li v-for="(item, index) in templates.basic.items.slice(0, 3)" :key="index">
                  • {{ item }}
                </li>
                <li v-if="templates.basic.items.length > 3" class="italic">
                  ...+{{ templates.basic.items.length - 3 }} more
                </li>
              </ul>
            </div>
          </button>

          <!-- Technical Template -->
          <button
            class="text-left border-[5px] border-black p-4 transition-all duration-100 hover:translate-x-[2px] hover:translate-y-[2px]"
            :class="[
              templates.technical.color,
              selectedTemplate === 'technical'
                ? 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]'
                : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
            ]"
            @click="selectTemplate('technical')"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">{{ templates.technical.icon }}</span>
              <h4 class="text-lg font-bold uppercase text-[#0a0a0a] tracking-wide">
                {{ templates.technical.name }}
              </h4>
            </div>
            <p class="text-xs font-mono text-[#0a0a0a] mb-3">
              {{ templates.technical.description }}
            </p>
            <div class="space-y-1">
              <p class="text-xs font-bold uppercase text-[#0a0a0a]">
                {{ templates.technical.items.length }} Items:
              </p>
              <ul class="text-xs font-mono text-[#0a0a0a] space-y-1">
                <li v-for="(item, index) in templates.technical.items.slice(0, 3)" :key="index">
                  • {{ item }}
                </li>
                <li v-if="templates.technical.items.length > 3" class="italic">
                  ...+{{ templates.technical.items.length - 3 }} more
                </li>
              </ul>
            </div>
          </button>

          <!-- Fundamental Template -->
          <button
            class="text-left border-[5px] border-black p-4 transition-all duration-100 hover:translate-x-[2px] hover:translate-y-[2px]"
            :class="[
              templates.fundamental.color,
              selectedTemplate === 'fundamental'
                ? 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]'
                : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
            ]"
            @click="selectTemplate('fundamental')"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">{{ templates.fundamental.icon }}</span>
              <h4 class="text-lg font-bold uppercase text-[#0a0a0a] tracking-wide">
                {{ templates.fundamental.name }}
              </h4>
            </div>
            <p class="text-xs font-mono text-[#0a0a0a] mb-3">
              {{ templates.fundamental.description }}
            </p>
            <div class="space-y-1">
              <p class="text-xs font-bold uppercase text-[#0a0a0a]">
                {{ templates.fundamental.items.length }} Items:
              </p>
              <ul class="text-xs font-mono text-[#0a0a0a] space-y-1">
                <li v-for="(item, index) in templates.fundamental.items.slice(0, 3)" :key="index">
                  • {{ item }}
                </li>
                <li v-if="templates.fundamental.items.length > 3" class="italic">
                  ...+{{ templates.fundamental.items.length - 3 }} more
                </li>
              </ul>
            </div>
          </button>
        </div>

        <!-- Info Box -->
        <div
          v-if="selectedTemplate"
          class="bg-[#dbeafe] border-[3px] border-black p-4 mb-6 flex gap-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5 text-[#3b82f6] flex-shrink-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
            />
          </svg>
          <div>
            <p class="text-sm font-bold text-[#0a0a0a] uppercase mb-1">Template Selected</p>
            <p class="text-xs font-mono text-[#0a0a0a]">
              Kamu bisa edit atau hapus items setelah apply. Template items akan di-mark sebagai
              "From Template".
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 justify-end">
          <button
            class="bg-[#fafafa] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            :disabled="!selectedTemplate"
            class="bg-[#3b82f6] border-[3px] border-black px-6 py-3 font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="applyTemplate"
          >
            Apply Template
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
