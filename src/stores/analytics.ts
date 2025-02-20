import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  ScrapedPost, 
  ScraperStatus, 
  SentimentDataPoint,
  KeywordDataPoint,
  PlatformDataPoint,
  BrandRating,
  BrandRatingStatus,
  AnalyticsFilters
} from '@/types/analytics'
import axios from '@/lib/axios'

export const useAnalyticsStore = defineStore('analytics', () => {
  // State
  const posts = ref<ScrapedPost[]>([])
  const allPosts = ref<ScrapedPost[]>([]) // Full dataset for calculations
  const scraperStatus = ref<ScraperStatus | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const brandRating = ref<BrandRating | null>(null)
  const brandRatingStatus = ref<'idle' | 'loading' | 'calculating' | 'error'>('idle')
  const brandRatingError = ref<string | null>(null)

  // Filter State
  const filters = ref<AnalyticsFilters>({
    dateRange: {
      // Use UTC-aligned dates to match backend
      start: new Date(new Date().setUTCHours(0, 0, 0, 0) - 30 * 24 * 60 * 60 * 1000),
      end: new Date(new Date().setUTCHours(23, 59, 59, 999))
    },
    platforms: [],
    visibleSentiments: {
      positive: true,
      neutral: true,
      negative: true
    },
    timeFrame: '30d', // Default to 30d view
    minMentions: 0,
    sortBy: 'mentions'
  })

  // Getters
  const filteredPosts = computed(() => {
    if (!posts.value) return []

    return posts.value.filter(post => {
      // Date range filter
      const postDate = new Date(post.post_date)
      if (postDate < filters.value.dateRange.start || postDate > filters.value.dateRange.end) {
        return false
      }

      // Platform filter
      if (filters.value.platforms.length > 0 && !filters.value.platforms.includes(post.source)) {
        return false
      }

      return true
    })
  })

  // Graph data from API
  const graphData = ref<SentimentDataPoint[]>([])

  const sentimentOverTime = computed((): SentimentDataPoint[] => {
    return graphData.value
  })

  // Server-provided stats
  const keywordStats = ref<KeywordDataPoint[]>([])
  const platformStats = ref<PlatformDataPoint[]>([])

  const keywordAnalysis = computed((): KeywordDataPoint[] => {
    if (!allPosts.value || allPosts.value.length === 0) return []

    const keywordSourceStats = allPosts.value.reduce((acc, post) => {
      if (!post.keyword_term || !post.source) return acc
      
      // Apply date filter
      const postDate = new Date(post.post_date)
      if (postDate < filters.value.dateRange.start || postDate > filters.value.dateRange.end) {
        return acc
      }

      const key = `${post.keyword_term}|${post.source}`
      if (!acc[key]) {
        acc[key] = {
          id: post.keyword_id,
          keyword: post.keyword_term,
          source: post.source,
          mentions: 0,
          positive: 0,
          neutral: 0,
          negative: 0
        }
      }

      const stats = acc[key]
      stats.mentions++
      if (post.sentiment) {
        stats[post.sentiment]++
      }

      return acc
    }, {} as Record<string, KeywordDataPoint>)

    let keywordStats = Object.values(keywordSourceStats)
      .filter(stat => stat.mentions >= filters.value.minMentions)

    if (filters.value.platforms.length === 0) {
      const aggregatedStats = keywordStats.reduce((acc, stat) => {
        if (!acc[stat.keyword]) {
          acc[stat.keyword] = {
            id: stat.id,
            keyword: stat.keyword,
            mentions: 0,
            positive: 0,
            neutral: 0,
            negative: 0,
            source: 'all'
          }
        }

        const aggregate = acc[stat.keyword]
        aggregate.mentions += stat.mentions
        aggregate.positive += stat.positive
        aggregate.neutral += stat.neutral
        aggregate.negative += stat.negative

        return acc
      }, {} as Record<string, KeywordDataPoint>)

      keywordStats = Object.values(aggregatedStats)
    } else {
      keywordStats = keywordStats.filter(stat =>
        filters.value.platforms.includes(stat.source)
      )
    }

    return keywordStats.sort((a, b) => {
      if (filters.value.sortBy === 'mentions') {
        return b.mentions - a.mentions
      } else if (filters.value.sortBy === 'sentiment') {
        const aPositiveRate = a.mentions > 0 ? a.positive / a.mentions : 0
        const bPositiveRate = b.mentions > 0 ? b.positive / b.mentions : 0
        return bPositiveRate - aPositiveRate
      } else { // growth
        return b.mentions - a.mentions
      }
    })
  })

  const platformSummary = computed((): PlatformDataPoint[] => platformStats.value)

  const keywordCorrelation = computed(() => {
    const stats = keywordAnalysis.value
    return stats.map(stat => ({
      keyword: stat.keyword,
      positive: stat.mentions > 0 ? stat.positive / stat.mentions : 0,
      neutral: stat.mentions > 0 ? stat.neutral / stat.mentions : 0,
      negative: stat.mentions > 0 ? stat.negative / stat.mentions : 0
    }))
  })

  // Memoize filtered posts
  const filteredDatePosts = computed(() => {
    if (!allPosts.value) return []
    return allPosts.value.filter(post => {
      const postDate = new Date(post.post_date)
      return postDate >= filters.value.dateRange.start && postDate <= filters.value.dateRange.end
    })
  })

  // Memoize sentiment counts
  const sentimentCounts = computed(() => {
    const counts = {
      positive: 0,
      negative: 0,
      neutral: 0,
      total: 0
    }
    
    filteredDatePosts.value.forEach(post => {
      counts.total++
      if (post.sentiment) {
        counts[post.sentiment]++
      } else {
        counts.neutral++
      }
    })
    
    return counts
  })

  // Use memoized values for stats
  const overallStats = computed(() => {
    if (!allPosts.value) return null

    const counts = sentimentCounts.value
    const calculatePercentage = (value: number) =>
      counts.total > 0 ? Math.round((value / counts.total) * 100) : 0

    return {
      totalMentions: counts.total,
      positiveSentiment: calculatePercentage(counts.positive),
      negativeSentiment: calculatePercentage(counts.negative),
      neutralSentiment: calculatePercentage(counts.neutral)
    }
  })

  // Cache constants
  const CACHE_KEY = 'vueleaf_analytics_data'
  const CACHE_DURATION = 900000 // 15 minutes
  const REFRESH_THRESHOLD = 60000 // 1 minute

  function updateStoreData(data: any, status: any) {
    posts.value = data.results || []
    allPosts.value = data.all_posts || []
    scraperStatus.value = status || null
    graphData.value = data.graph_data || []
    keywordStats.value = data.keyword_stats || []
    platformStats.value = data.platform_stats || []
    // Active keywords count is now managed by tracking store
  }

  async function fetchFreshData(params: any) {
    const [postsResponse, statusResponse] = await Promise.all([
      axios.get('/posts/', { params }),
      axios.get('/logs/status/')
    ])

    // Save to cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: postsResponse.data,
      status: statusResponse.data,
      timestamp: Date.now(),
      params: params // Store params to validate cache
    }))

    return { postsResponse, statusResponse }
  }

  // Actions
  async function fetchAnalyticsData() {
    error.value = null

    // Format dates for API
    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const params = {
      start_date: formatDate(filters.value.dateRange.start),
      end_date: formatDate(filters.value.dateRange.end),
      platforms: filters.value.platforms,
      min_mentions: filters.value.minMentions
    }

    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { data, status, timestamp, params: cachedParams } = JSON.parse(cached)
      const isRecent = Date.now() - timestamp < CACHE_DURATION
      const paramsMatch = JSON.stringify(params) === JSON.stringify(cachedParams)
      
      if (isRecent && paramsMatch) {
        // Use cached data immediately
        updateStoreData(data, status)
        
        // Refresh in background if needed
        if (Date.now() - timestamp > REFRESH_THRESHOLD) {
          fetchFreshData(params).then(({ postsResponse, statusResponse }) => {
            updateStoreData(postsResponse.data, statusResponse.data)
          }).catch(console.error)
        }
        
        return
      }
    }

    // No cache or expired or params changed, fetch fresh
    isLoading.value = true
    try {
      const { postsResponse, statusResponse } = await fetchFreshData(params)
      updateStoreData(postsResponse.data, statusResponse.data)
    } catch (e) {
      console.error('Error fetching analytics data:', e)
      error.value = 'Failed to fetch analytics data'
      posts.value = []
      scraperStatus.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBrandRating(keywordId: number): Promise<BrandRatingStatus | null> {
    try {
      const timestamp = new Date().getTime()
      const response = await axios.get(`/brand-ratings/${keywordId}/status/?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      const data: BrandRatingStatus = response.data

      switch (data.status) {
        case 'error':
          brandRatingStatus.value = 'error'
          brandRatingError.value = data.message || 'Failed to fetch brand rating'
          return data

        case 'calculating':
          brandRatingStatus.value = 'calculating'
          if (data.result) {
            brandRating.value = data.result
          }
          return data

        case 'completed':
          if (data.result) {
            brandRatingStatus.value = 'idle'
            brandRating.value = data.result
          }
          return data

        default:
          // Not calculated or invalid status, start calculation
          return calculateBrandRating(keywordId)
      }
    } catch (e) {
      console.error('Error fetching brand rating:', e)
      brandRatingStatus.value = 'error'
      brandRatingError.value = 'Failed to fetch brand rating'
      return null
    }
  }

  async function calculateBrandRating(keywordId: number): Promise<BrandRatingStatus | null> {
    brandRatingStatus.value = 'calculating'
    brandRatingError.value = null
    
    try {
      const response = await axios.post(`/brand-ratings/${keywordId}/calculate/`, null, {
        params: { return_status: true }
      })
      
      const data: BrandRatingStatus = response.data

      switch (data.status) {
        case 'error':
          brandRatingStatus.value = 'error'
          brandRatingError.value = data.message || 'Failed to calculate brand rating'
          break

        case 'completed':
          if (data.result) {
            brandRatingStatus.value = 'idle'
            brandRating.value = data.result
          }
          break

        case 'calculating':
          brandRatingStatus.value = 'calculating'
          if (data.result) {
            brandRating.value = data.result
          }
          break
      }
      
      return data
    } catch (e) {
      console.error('Error calculating brand rating:', e)
      brandRatingStatus.value = 'error'
      brandRatingError.value = 'Failed to calculate brand rating'
      return null
    }
  }

  // Filter Actions
  function updateFilters(newFilters: Partial<AnalyticsFilters>) {
    filters.value = {
      ...filters.value,
      ...newFilters
    }
    fetchAnalyticsData()
  }

  function resetFilters() {
    filters.value = {
      dateRange: {
        // Use UTC-aligned dates to match backend
        start: new Date(new Date().setUTCHours(0, 0, 0, 0) - 30 * 24 * 60 * 60 * 1000),
        end: new Date(new Date().setUTCHours(23, 59, 59, 999))
      },
      platforms: [],
      visibleSentiments: {
        positive: true,
        neutral: true,
        negative: true
      },
      timeFrame: '90d', // Reset to 90d view
      minMentions: 0,
      sortBy: 'mentions'
    }
    fetchAnalyticsData()
  }

  return {
    // State
    posts,
    scraperStatus,
    isLoading,
    error,
    filters,
    brandRating,
    brandRatingStatus,
    brandRatingError,
    graphData,

    // Getters
    sentimentOverTime,
    keywordAnalysis,
    platformSummary,
    keywordCorrelation,
    overallStats,

    // Actions
    fetchAnalyticsData,
    fetchBrandRating,
    calculateBrandRating,
    updateFilters,
    resetFilters
  }
})
