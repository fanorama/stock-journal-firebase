<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue'
// TODO: Implement Dashboard view (Task 14)
</script>

<template>
  <MainLayout>
    <template #header-title>Dashboard</template>

    <div class="space-y-6">
      <h1 class="text-3xl font-bold uppercase tracking-wide text-[#0a0a0a]">
        Welcome to Stock Journal
      </h1>
      <p class="text-[#525252] font-mono text-lg">
        Dashboard implementation coming soon...
      </p>

      <!-- Placeholder Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Placeholder Card -->
        <div class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 class="font-bold uppercase text-[#0a0a0a] mb-2">Total Portfolio Value</h3>
          <p class="text-3xl font-bold font-mono text-[#10b981]">Coming Soon</p>
        </div>

        <div class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 class="font-bold uppercase text-[#0a0a0a] mb-2">Total Trades</h3>
          <p class="text-3xl font-bold font-mono text-[#3b82f6]">Coming Soon</p>
        </div>

        <div class="bg-white border-[5px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 class="font-bold uppercase text-[#0a0a0a] mb-2">Win Rate</h3>
          <p class="text-3xl font-bold font-mono text-[#f59e0b]">Coming Soon</p>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
