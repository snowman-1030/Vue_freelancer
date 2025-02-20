import { defineStore } from 'pinia'
import { ref } from 'vue'
import { competitorService } from '@/services/competitors'
import type { CompetitorAnalysis, CompetitorData, SentimentData, RecentDiscussion, PriorityAlert, ForumActivity } from '@/services/competitors'

const CACHE_KEY = 'vueleaf_competitor_data'
const CACHE_DURATION = 900000 // 15 minutes

export const useCompetitorStore = defineStore('competitors', () => {
  // State
  const competitors = ref<CompetitorData[]>([])
  const sentimentData = ref<SentimentData[]>([])
  const priorityAlerts = ref<PriorityAlert[]>([])
  const recentDiscussions = ref<RecentDiscussion[]>([])
  const forumActivities = ref<Record<string, ForumActivity[]>>({})
  const selectedCompetitor = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const scrapersRunning = ref(false)

  // Actions
  async function loadCompetitorData() {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      const isRecent = Date.now() - timestamp < CACHE_DURATION
      
      if (isRecent) {
        updateStoreData(data)
        // Refresh in background if older than 1 minute
        if (Date.now() - timestamp > 60000) {
          fetchFreshData().catch(console.error)
        }
        return
      }
    }

    isLoading.value = true
    error.value = null
    try {
      await fetchFreshData()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load competitor data'
      console.error('Error loading competitor data:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchFreshData() {
    const data = await competitorService.getAnalysis()
    
    // Cache the response
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }))

    updateStoreData(data)
  }

  function updateStoreData(data: CompetitorAnalysis) {
    competitors.value = data.competitors
    sentimentData.value = data.sentimentData
    priorityAlerts.value = data.priorityAlerts
    recentDiscussions.value = data.recentDiscussions
    forumActivities.value = data.forumActivities
    scrapersRunning.value = data.scrapersRunning

    // Set first competitor as selected if none selected
    if (!selectedCompetitor.value && data.competitors.length > 0) {
      selectedCompetitor.value = data.competitors[0].name
    }
  }

  function setSelectedCompetitor(competitor: string) {
    selectedCompetitor.value = competitor
  }

  return {
    // State
    competitors,
    sentimentData,
    priorityAlerts,
    recentDiscussions,
    forumActivities,
    selectedCompetitor,
    isLoading,
    error,
    scrapersRunning,

    // Actions
    loadCompetitorData,
    fetchFreshData,
    setSelectedCompetitor
  }
})