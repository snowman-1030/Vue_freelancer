import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  DashboardMetric, 
  DashboardBrandHealth, 
  ScraperStatus,
  DashboardResponse,
  UserData,
  FeedbackData
} from '@/types/admin'
import axios from '@/lib/axios'

export const useAdminDashboardStore = defineStore('adminDashboard', () => {
  // State
  const metrics = ref<DashboardMetric[]>([])
  const brandHealth = ref<DashboardBrandHealth | null>(null)
  const scraperStatus = ref<ScraperStatus[]>([])
  const latestUsers = ref<UserData[]>([])  // Initialize as empty array
  const latestFeedback = ref<FeedbackData[]>([])  // Initialize as empty array
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const lastUpdate = ref<string | null>(null)

  // Getters
  const totalUsers = computed(() => 
    metrics.value.find(m => m.id === 'users')?.value ?? 0
  )

  const activeKeywords = computed(() => 
    metrics.value.find(m => m.id === 'keywords')?.value ?? 0
  )

  const totalPosts = computed(() => 
    metrics.value.find(m => m.id === 'posts')?.value ?? 0
  )

  const averageSentiment = computed(() => 
    metrics.value.find(m => m.id === 'sentiment')?.value ?? 0
  )

  // Actions
  async function fetchDashboardData() {
    isLoading.value = true
    error.value = null // Reset error state
    
    try {
      const { data } = await axios.get<DashboardResponse>('/settings/dashboard/')
      metrics.value = data.metrics.map(metric => ({
        ...metric,
        trend: typeof metric.trend === 'number' ? metric.trend : undefined // Only keep numeric trends
      }))
      brandHealth.value = data.brandHealth
      scraperStatus.value = data.scraperStatus
      latestUsers.value = data.latestUsers || [] // Ensure array even if null/undefined
      latestFeedback.value = data.latestFeedback || [] // Ensure array even if null/undefined
      lastUpdate.value = data.metadata.generatedAt
      
      // Schedule next update if provided
      if (data.metadata.nextUpdate) {
        scheduleNextUpdate(new Date(data.metadata.nextUpdate))
      }
    } catch (err) {
      error.value = err as Error
      console.error('Failed to fetch dashboard data:', err)
      // Initialize empty arrays on error to prevent undefined props
      latestUsers.value = []
      latestFeedback.value = []
    } finally {
      isLoading.value = false
    }
  }

  function updateDashboardData(data: Partial<DashboardResponse>) {
    if (data.metrics) metrics.value = data.metrics
    if (data.brandHealth) brandHealth.value = data.brandHealth
    if (data.scraperStatus) scraperStatus.value = data.scraperStatus
    if (data.latestUsers) latestUsers.value = data.latestUsers
    if (data.latestFeedback) latestFeedback.value = data.latestFeedback
    if (data.metadata?.generatedAt) lastUpdate.value = data.metadata.generatedAt
  }

  function scheduleNextUpdate(nextUpdate: Date) {
    const now = new Date()
    const delay = nextUpdate.getTime() - now.getTime()
    
    if (delay > 0) {
      setTimeout(() => {
        fetchDashboardData()
      }, delay)
    }
  }

  return {
    // State
    metrics,
    brandHealth,
    scraperStatus,
    latestUsers,
    latestFeedback,
    isLoading,
    error,
    lastUpdate,
    
    // Getters
    totalUsers,
    activeKeywords,
    totalPosts,
    averageSentiment,
    
    // Actions
    fetchDashboardData,
    updateDashboardData
  }
})