import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Auth routes - accessible only when NOT authenticated
 */
const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/auth/ResetPasswordView.vue'),
    meta: { requiresGuest: true },
  },
]

/**
 * Protected routes - require authentication
 */
const protectedRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/portfolios',
    name: 'portfolios',
    component: () => import('@/views/PortfoliosView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/trades',
    name: 'trades',
    component: () => import('@/views/TradesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/journals',
    name: 'journals',
    component: () => import('@/views/JournalsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/strategies',
    name: 'strategies',
    component: () => import('@/views/StrategiesView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...authRoutes, ...protectedRoutes],
})

/**
 * Global navigation guard for authentication
 * - Redirects unauthenticated users to login
 * - Redirects authenticated users away from auth pages
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth to initialize on first load
  if (authStore.isLoading && !authStore.user) {
    await authStore.initAuth()
  }

  const requiresAuth = to.meta.requiresAuth
  const requiresGuest = to.meta.requiresGuest
  const isAuthenticated = authStore.isAuthenticated

  // Route requires authentication
  if (requiresAuth && !isAuthenticated) {
    next({
      name: 'login',
      query: { redirect: to.fullPath }, // Save intended destination
    })
    return
  }

  // Route requires guest (not authenticated)
  if (requiresGuest && isAuthenticated) {
    // Check if there's a redirect query param
    const redirect = from.query.redirect as string | undefined
    next(redirect || { name: 'dashboard' })
    return
  }

  // Allow navigation
  next()
})

export default router
