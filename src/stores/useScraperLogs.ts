import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from '@/lib/axios'

interface ScraperLog {
  id: number
  keyword_term: string
  source: string
  status: string
  started_at: string
  completed_at: string | null
  posts_found: number
  error_message: string | null
}

interface ScraperStats {
  total_posts: number
  posts_by_sentiment: Record<string, number>
  posts_by_source: Record<string, number>
}

export const useScraperLogs = defineStore('scraper-logs', () => {
  // State
  const logs = ref<ScraperLog[]>([])
  const stats = ref<ScraperStats>({
    total_posts: 0,
    posts_by_sentiment: {},
    posts_by_source: {}
  })
  const isLoading = ref(false)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)

  // Computed
  const totalPages = computed(() => Math.ceil(logs.value.length / itemsPerPage.value))
  
  const paginatedLogs = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return logs.value.slice(start, end)
  })

  // Methods
  const fetchStats = async () => {
    try {
      isLoading.value = true
      const response = await axios.get('/logs/status/')
      stats.value = {
        total_posts: response.data.total_posts,
        posts_by_sentiment: response.data.posts_by_sentiment,
        posts_by_source: response.data.posts_by_source
      }
      logs.value = response.data.recent_logs
    } catch (error) {
      console.error('Failed to fetch scraper stats:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Initialize
  fetchStats()

  return {
    // State
    logs,
    stats,
    isLoading,
    currentPage,
    itemsPerPage,
    
    // Computed
    totalPages,
    paginatedLogs,
    
    // Methods
    fetchStats
  }
})