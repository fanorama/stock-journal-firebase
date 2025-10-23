<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue'
// TODO: Implement Journals view (Task 12)
</script>

<template>
  <MainLayout>
    <template #header-title>Journals</template>

    <template #header-actions>
      <button
        class="bg-[#a855f7] border-[3px] border-black px-4 py-2 font-bold uppercase text-sm tracking-wide text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-100">
        + New Entry
      </button>
    </template>

    <div class="space-y-6">
      <div class="bg-white border-[5px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
        <h2 class="text-2xl font-bold uppercase text-[#0a0a0a] mb-4">
          Journal Entries
        </h2>
        <p class="text-[#525252] font-mono">
          Implementation coming soon...
        </p>
      </div>
    </div>
  </MainLayout>
</template>
