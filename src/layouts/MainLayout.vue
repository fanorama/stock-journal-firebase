<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Sidebar state
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

// Navigation items
const navigationItems = [
  {
    name: 'Dashboard',
    path: '/',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    name: 'Portfolios',
    path: '/portfolios',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
  {
    name: 'Trades',
    path: '/trades',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    name: 'Journals',
    path: '/journals',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
]

// Handle logout
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Check if route is active
const isActiveRoute = (path: string) => {
  return router.currentRoute.value.path === path
}
</script>

<template>
  <div class="main-layout min-h-screen bg-[#fafafa]">
    <!-- Mobile Sidebar Overlay -->
    <div v-if="isSidebarOpen" @click="closeSidebar"
      class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity"></div>

    <!-- Sidebar -->
    <aside :class="[
      'fixed top-0 left-0 h-full w-64 bg-white border-r-[5px] border-black z-30 transition-transform duration-300',
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]">
      <!-- Logo/Brand -->
      <div class="p-6 border-b-[3px] border-black">
        <h1 class="text-2xl font-bold uppercase tracking-wide text-[#0a0a0a]">
          Stock Journal
        </h1>
        <p class="text-xs font-mono text-[#525252] mt-1">Trading Analytics</p>
      </div>

      <!-- Navigation -->
      <nav class="p-4">
        <ul class="space-y-2">
          <li v-for="item in navigationItems" :key="item.path">
            <router-link :to="item.path" @click="closeSidebar" :class="[
              'flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm tracking-wide transition-all duration-100',
              'border-[3px] border-black',
              isActiveRoute(item.path)
                ? 'bg-[#f59e0b] text-[#0a0a0a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-[#0a0a0a] hover:bg-[#fafafa] hover:translate-x-1 hover:translate-y-1',
            ]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
              </svg>
              <span>{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- User Section (Bottom) -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t-[3px] border-black bg-white">
        <div class="mb-3 p-3 bg-[#fafafa] border-[3px] border-black">
          <p class="font-bold text-sm text-[#0a0a0a] truncate">
            {{ authStore.userDisplayName }}
          </p>
          <p class="text-xs font-mono text-[#525252] truncate">
            {{ authStore.userEmail }}
          </p>
        </div>
        <button @click="handleLogout"
          class="w-full bg-[#ef4444] border-[3px] border-black px-4 py-2 font-bold uppercase text-sm tracking-wide text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100">
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="lg:ml-64">
      <!-- Header -->
      <header class="bg-white border-b-[5px] border-black sticky top-0 z-10">
        <div class="flex items-center justify-between px-4 py-4 lg:px-6">
          <!-- Mobile Menu Button -->
          <button @click="toggleSidebar" class="lg:hidden p-2 border-[3px] border-black bg-[#f59e0b] hover:bg-[#d97706] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#0a0a0a]" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Page Title (Hidden on mobile when sidebar button is shown) -->
          <div class="hidden lg:block">
            <h2 class="text-xl font-bold uppercase tracking-wide text-[#0a0a0a]">
              <!-- This will be filled by individual pages -->
              <slot name="header-title">Dashboard</slot>
            </h2>
          </div>

          <!-- Header Actions Slot -->
          <div class="flex items-center gap-3">
            <slot name="header-actions"></slot>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
}
</style>
