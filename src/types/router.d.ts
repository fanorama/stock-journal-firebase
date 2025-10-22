/**
 * Type declarations for Vue Router meta fields
 * Extends the default RouteMeta interface with custom properties
 */

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * Indicates that the route requires authentication
     * Unauthenticated users will be redirected to login
     */
    requiresAuth?: boolean

    /**
     * Indicates that the route is only accessible to guests (not authenticated)
     * Authenticated users will be redirected to dashboard
     */
    requiresGuest?: boolean

    /**
     * Optional page title for the route
     */
    title?: string

    /**
     * Optional icon for the route (used in navigation)
     */
    icon?: string

    /**
     * Hide route from navigation menu
     */
    hideInMenu?: boolean
  }
}
