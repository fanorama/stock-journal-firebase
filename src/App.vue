<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
</script>

<template>
  <RouterView />
  <Toaster
    position="bottom-right"
    :richColors="false"
    :duration="3000"
    :closeButton="true"
  />
</template>
