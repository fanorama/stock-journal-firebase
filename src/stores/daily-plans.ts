import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCollection } from 'vuefire'
import type {
  DailyPlan,
  DailyPlanInput,
  WatchlistItem,
  WatchlistItemInput,
  ChecklistItem,
  ChecklistItemInput,
  ReviewData,
  WATCHLIST_STATUS,
  DAILY_PLAN_STATUS,
} from '@/types'
import {
  getDailyPlansCollection,
  getDailyPlanDoc,
  createDailyPlan as createDailyPlanFirestore,
  updateDailyPlan as updateDailyPlanFirestore,
  deleteDailyPlan as deleteDailyPlanFirestore,
  formatDateToId,
} from '@/firebase/firestore'
import { serverTimestamp, Timestamp } from 'firebase/firestore'
import { useAuthStore } from './auth'
import { toast } from 'vue-sonner'

/**
 * Daily Plans store for managing daily trading plans with Firestore integration
 * Uses VueFire for real-time synchronization with Firestore
 */
export const useDailyPlansStore = defineStore('daily-plans', () => {
  // Get auth store to access current user
  const authStore = useAuthStore()

  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Reactive Firestore collection binding
  const dailyPlansCollection = computed(() => {
    if (!authStore.user?.uid) return null
    return getDailyPlansCollection(authStore.user.uid)
  })

  // Use VueFire to bind daily plans collection
  const {
    data: dailyPlans,
    pending: dailyPlansPending,
    error: dailyPlansError,
  } = useCollection<DailyPlan>(dailyPlansCollection)

  // Getters

  /**
   * Get today's plan
   * Returns null if no plan exists for today
   */
  const todaysPlan = computed(() => {
    const today = formatDateToId(new Date())
    return dailyPlans.value?.find((plan) => plan.planDate === today) || null
  })

  /**
   * Get plan by date
   */
  const getPlanByDate = computed(() => {
    return (date: Date | string): DailyPlan | null => {
      const dateId = typeof date === 'string' ? date : formatDateToId(date)
      return dailyPlans.value?.find((plan) => plan.planDate === dateId) || null
    }
  })

  /**
   * Get plans list sorted by date descending
   */
  const plansList = computed(() => {
    return (
      dailyPlans.value?.sort(
        (a, b) => new Date(b.planDate).getTime() - new Date(a.planDate).getTime()
      ) || []
    )
  })

  /**
   * Check if plan exists for a specific date
   */
  const hasPlanForDate = computed(() => {
    return (date: Date | string): boolean => {
      const dateId = typeof date === 'string' ? date : formatDateToId(date)
      return dailyPlans.value?.some((plan) => plan.planDate === dateId) || false
    }
  })

  // Actions

  /**
   * Create a new daily plan
   */
  const createPlan = async (date: Date | string): Promise<string> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login untuk membuat plan')
    }

    const planDate = typeof date === 'string' ? date : formatDateToId(date)

    // Check if plan already exists
    if (hasPlanForDate.value(planDate)) {
      throw new Error('Plan sudah ada untuk tanggal ini')
    }

    isLoading.value = true
    error.value = null

    try {
      const planInput: DailyPlanInput = {
        planDate,
        watchlist: [],
        checklist: [],
      }

      const planId = await createDailyPlanFirestore(authStore.user.uid, planInput)
      return planId
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal membuat plan'
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Add item to watchlist
   */
  const addWatchlistItem = async (
    planId: string,
    item: WatchlistItemInput
  ): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login')
    }

    const plan = getPlanByDate.value(planId)
    if (!plan) {
      throw new Error('Plan tidak ditemukan')
    }

    isLoading.value = true
    error.value = null

    try {
      const newItem: WatchlistItem = {
        id: crypto.randomUUID(),
        ...item,
        status: 'planned',
        addedAt: Timestamp.now(),
        position: plan.watchlist.length,
      }

      const updatedWatchlist = [...plan.watchlist, newItem]

      await updateDailyPlanFirestore(authStore.user.uid, planId, {
        watchlist: updatedWatchlist,
      })

      toast.success('Saham berhasil ditambahkan ke watchlist')
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal menambah item ke watchlist'
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update watchlist item
   */
  const updateWatchlistItem = async (
    planId: string,
    itemId: string,
    updates: Partial<WatchlistItemInput>
  ): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login')
    }

    const plan = getPlanByDate.value(planId)
    if (!plan) {
      throw new Error('Plan tidak ditemukan')
    }

    isLoading.value = true
    error.value = null

    try {
      const updatedWatchlist = plan.watchlist.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      )

      await updateDailyPlanFirestore(authStore.user.uid, planId, {
        watchlist: updatedWatchlist,
      })

      toast.success('Watchlist item berhasil diupdate')
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal update watchlist item'
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete watchlist item
   */
  const deleteWatchlistItem = async (
    planId: string,
    itemId: string
  ): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login')
    }

    const plan = getPlanByDate.value(planId)
    if (!plan) {
      throw new Error('Plan tidak ditemukan')
    }

    isLoading.value = true
    error.value = null

    try {
      const updatedWatchlist = plan.watchlist.filter((item) => item.id !== itemId)

      await updateDailyPlanFirestore(authStore.user.uid, planId, {
        watchlist: updatedWatchlist,
      })

      toast.success('Watchlist item berhasil dihapus')
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal delete watchlist item'
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Link trade to watchlist item
   */
  const linkTradeToWatchlist = async (
    planId: string,
    itemId: string,
    tradeId: string
  ): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login')
    }

    const plan = getPlanByDate.value(planId)
    if (!plan) {
      throw new Error('Plan tidak ditemukan')
    }

    isLoading.value = true
    error.value = null

    try {
      const updatedWatchlist = plan.watchlist.map((item) =>
        item.id === itemId
          ? {
              ...item,
              tradeId,
              status: 'executed' as const,
            }
          : item
      )

      await updateDailyPlanFirestore(authStore.user.uid, planId, {
        watchlist: updatedWatchlist,
      })
    } catch (err: any) {
      error.value = err.message || 'Gagal link trade'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Add checklist item
   */
  const addChecklistItem = async (
    planId: string,
    item: ChecklistItemInput
  ): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login')
    }

    const plan = getPlanByDate.value(planId)
    if (!plan) {
      throw new Error('Plan tidak ditemukan')
    }

    isLoading.value = true
    error.value = null

    try {
      const newItem: ChecklistItem = {
        id: crypto.randomUUID(),
        text: item.text,
        completed: false,
        position: plan.checklist.length,
        isTemplate: item.isTemplate || false,
      }

      const updatedChecklist = [...plan.checklist, newItem]
      const completedCount = updatedChecklist.filter((i) => i.completed).length

      await updateDailyPlanFirestore(authStore.user.uid, planId, {
        checklist: updatedChecklist,
        checklistProgress: {
          completed: completedCount,
          total: updatedChecklist.length,
        },
      })

      toast.success('Checklist item berhasil ditambahkan')
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal menambah checklist item'
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update checklist item completion
   */
  const updateChecklistItem = async (
    planId: string,
    itemId: string,
    completed: boolean
  ): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login')
    }

    const plan = getPlanByDate.value(planId)
    if (!plan) {
      throw new Error('Plan tidak ditemukan')
    }

    isLoading.value = true
    error.value = null

    try {
      const updatedChecklist = plan.checklist.map((item) =>
        item.id === itemId
          ? {
              ...item,
              completed,
              completedAt: completed ? Timestamp.now() : undefined,
            }
          : item
      )

      const completedCount = updatedChecklist.filter((i) => i.completed).length

      await updateDailyPlanFirestore(authStore.user.uid, planId, {
        checklist: updatedChecklist,
        checklistProgress: {
          completed: completedCount,
          total: updatedChecklist.length,
        },
      })

      toast.success(completed ? 'Checklist item diselesaikan' : 'Checklist item dibatalkan')
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal update checklist item'
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete checklist item
   */
  const deleteChecklistItem = async (
    planId: string,
    itemId: string
  ): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login')
    }

    const plan = getPlanByDate.value(planId)
    if (!plan) {
      throw new Error('Plan tidak ditemukan')
    }

    isLoading.value = true
    error.value = null

    try {
      const updatedChecklist = plan.checklist.filter((item) => item.id !== itemId)
      const completedCount = updatedChecklist.filter((i) => i.completed).length

      await updateDailyPlanFirestore(authStore.user.uid, planId, {
        checklist: updatedChecklist,
        checklistProgress: {
          completed: completedCount,
          total: updatedChecklist.length,
        },
      })

      toast.success('Checklist item berhasil dihapus')
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal delete checklist item'
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Complete plan with review
   */
  const completePlan = async (
    planId: string,
    reviewNotes: string
  ): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login')
    }

    const plan = getPlanByDate.value(planId)
    if (!plan) {
      throw new Error('Plan tidak ditemukan')
    }

    isLoading.value = true
    error.value = null

    try {
      // Calculate adherence rate
      const executedCount = plan.watchlist.filter(
        (item) => item.status === 'executed'
      ).length
      const totalDecided = plan.watchlist.filter(
        (item) => item.status !== 'planned'
      ).length
      const adherenceRate =
        totalDecided > 0 ? (executedCount / totalDecided) * 100 : 0

      const review: ReviewData = {
        notes: reviewNotes,
        adherenceRate,
        completedAt: Timestamp.now(),
      }

      await updateDailyPlanFirestore(authStore.user.uid, planId, {
        review,
        status: 'completed',
      })

      toast.success('Plan berhasil diselesaikan dan direview')
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal complete plan'
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update review notes
   */
  const updateReviewNotes = async (
    planId: string,
    notes: string
  ): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login')
    }

    const plan = getPlanByDate.value(planId)
    if (!plan) {
      throw new Error('Plan tidak ditemukan')
    }

    isLoading.value = true
    error.value = null

    try {
      await updateDailyPlanFirestore(authStore.user.uid, planId, {
        review: {
          notes,
          adherenceRate: plan.review?.adherenceRate ?? 0,
          completedAt: plan.review?.completedAt,
        },
      })

      toast.success('Review notes berhasil diupdate')
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal update review notes'
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a daily plan
   */
  const deletePlan = async (planId: string): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login')
    }

    isLoading.value = true
    error.value = null

    try {
      await deleteDailyPlanFirestore(authStore.user.uid, planId)

      toast.success('Plan berhasil dihapus')
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal delete plan'
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    dailyPlans: plansList,
    dailyPlansPending,
    isLoading: computed(() => isLoading.value || dailyPlansPending.value),
    error: computed(() => error.value || dailyPlansError.value?.message || null),

    // Getters
    todaysPlan,
    getPlanByDate,
    hasPlanForDate,

    // Actions
    createPlan,
    addWatchlistItem,
    updateWatchlistItem,
    deleteWatchlistItem,
    linkTradeToWatchlist,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    completePlan,
    updateReviewNotes,
    deletePlan,
    clearError,
  }
})
