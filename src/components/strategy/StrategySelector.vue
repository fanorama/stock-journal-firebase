<script setup lang="ts">
import { computed } from 'vue'
import { useStrategiesStore } from '@/stores'

interface Props {
  modelValue: string | undefined
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const strategiesStore = useStrategiesStore()

// Local value synced with v-model
const selectedStrategyId = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

/**
 * Get strategy name by ID
 */
const getStrategyName = (strategyId: string | undefined): string => {
  if (!strategyId) return 'Pilih Strategy (Opsional)'
  const strategy = strategiesStore.getStrategyById(strategyId)
  return strategy ? strategy.name : 'Unknown Strategy'
}
</script>

<template>
  <div>
    <label class="block text-sm font-bold uppercase tracking-wide text-[#0a0a0a] mb-2">
      Link ke Strategy (Opsional)
    </label>

    <select
      v-model="selectedStrategyId"
      class="w-full border-[3px] border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[#3b82f6] transition-all bg-white"
    >
      <option :value="undefined">Tidak ada strategy</option>
      <option
        v-for="strategy in strategiesStore.strategies"
        :key="strategy.id"
        :value="strategy.id"
      >
        {{ strategy.name }}
      </option>
    </select>

    <!-- Info when no strategies available -->
    <div
      v-if="!strategiesStore.hasStrategies"
      class="mt-2 bg-[#fef3c7] border-[2px] border-black p-3 flex gap-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-4 h-4 text-[#f59e0b] flex-shrink-0"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
        />
      </svg>
      <p class="text-xs text-[#0a0a0a] font-mono">
        Belum ada strategy. Buat strategy terlebih dahulu di halaman Strategies untuk tracking performa.
      </p>
    </div>

    <!-- Info about selected strategy -->
    <div
      v-else-if="selectedStrategyId"
      class="mt-2 bg-[#dbeafe] border-[2px] border-black p-3 flex gap-2"
    >
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
      <p class="text-xs text-[#0a0a0a] font-mono">
        Trade ini akan di-link ke strategy <strong>"{{ getStrategyName(selectedStrategyId) }}"</strong> untuk tracking performa.
      </p>
    </div>
  </div>
</template>

<style scoped>
select {
  color: #0a0a0a;
}

select option {
  color: #0a0a0a;
  background: white;
}
</style>
