<script setup lang="ts">
import { ref } from 'vue'
import { useStrategiesStore } from '@/stores'
import StrategyPreviewPanel from '../strategy/StrategyPreviewPanel.vue'

interface Props {
  strategyId: string
  strategyName: string
}

const props = defineProps<Props>()

const strategiesStore = useStrategiesStore()

// Popover state
const showPopover = ref(false)

/**
 * Get strategy from store
 * Uses the getter which returns the strategy or undefined
 */
const strategy = () => strategiesStore.getStrategyById(props.strategyId)

/**
 * Toggle popover visibility
 */
const togglePopover = () => {
  showPopover.value = !showPopover.value
}

/**
 * Close popover
 */
const closePopover = () => {
  showPopover.value = false
}
</script>

<template>
  <div class="strategy-badge-popover relative inline-block">
    <!-- Strategy Badge (Trigger) -->
    <button
      class="inline-flex items-center gap-1 px-3 py-1 bg-[#dbeafe] border-[2px] border-black font-bold text-sm text-[#0a0a0a] hover:bg-[#bfdbfe] transition-colors"
      @click="togglePopover"
      :title="`Click to view ${strategyName} details`"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-4 h-4 text-[#3b82f6]"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
        />
      </svg>
      <span>{{ strategyName }}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-3 h-3"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m19.5 8.25-7.5 7.5-7.5-7.5"
        />
      </svg>
    </button>

    <!-- Popover Content (Teleported to body for better positioning) -->
    <Teleport to="body">
      <div
        v-if="showPopover"
        class="fixed inset-0 z-40"
        @click="closePopover"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black bg-opacity-30"></div>

        <!-- Popover Panel -->
        <div class="relative z-50 flex items-start justify-center pt-20 px-4">
          <div
            class="max-w-2xl w-full"
            @click.stop
          >
            <!-- Loading State -->
            <div
              v-if="!strategy()"
              class="bg-white border-[5px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center"
            >
              <div
                class="inline-block animate-spin rounded-full h-8 w-8 border-[4px] border-black border-t-transparent"
              ></div>
              <p class="mt-4 text-[#525252] font-mono font-bold uppercase tracking-wide text-sm">
                Loading Strategy...
              </p>
            </div>

            <!-- Strategy Preview -->
            <div v-else class="relative">
              <!-- Close Button -->
              <button
                class="absolute -top-2 -right-2 z-10 p-2 bg-[#ef4444] border-[3px] border-black text-white hover:bg-[#dc2626] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                @click="closePopover"
                title="Close"
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

              <!-- Strategy Preview Panel -->
              <StrategyPreviewPanel
                :strategy="strategy()!"
                mode="compact"
                :show-link="true"
              />
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
