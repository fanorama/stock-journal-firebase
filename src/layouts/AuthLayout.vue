<script setup lang="ts">
/**
 * Auth Layout Component
 *
 * Simple layout for authentication pages (Login, Register, Reset Password)
 * Features:
 * - No sidebar or header navigation
 * - Centered content with background
 * - Neobrutalism design
 */
</script>

<template>
  <div class="auth-layout min-h-screen bg-[#fafafa]">
    <!-- Background Pattern (Optional) -->
    <div class="absolute inset-0 opacity-5 pointer-events-none">
      <div class="absolute inset-0"
        style="background-image: repeating-linear-gradient(
          45deg,
          #0a0a0a 0,
          #0a0a0a 1px,
          transparent 0,
          transparent 50%
        );
        background-size: 20px 20px;">
      </div>
    </div>

    <!-- Main Content -->
    <main class="relative z-10">
      <slot />
    </main>

    <!-- Footer (Optional) -->
    <footer class="relative z-10 py-6 text-center">
      <p class="text-[#525252] font-mono text-sm">
        © 2025 Stock Journal. Built with
        <span class="text-[#f59e0b] font-bold">❤️</span>
        for Traders
      </p>
    </footer>
  </div>
</template>

<style scoped>
.auth-layout {
  /* Ensure minimum height fills viewport */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
