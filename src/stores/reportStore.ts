import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ReportFilter, ReportResponse } from '@/types/reports'
import { useLogger } from '@/composables/useLogger'
import { useAnalyticsStore } from '@/stores/analytics'
import axios from '@/lib/axios'

export const useReportStore = defineStore('report', () => {
  const logger = useLogger()
  const analyticsStore = useAnalyticsStore()
  
  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const sentimentData = ref<ReportResponse | null>(null)
  const sourceData = ref<ReportResponse | null>(null)
  const keywordData = ref<ReportResponse | null>(null)
  const activeFilters = ref<ReportFilter>({
    startDate: '',
    endDate: ''
  })

  // Getters
  const hasData = computed(() => !!(sentimentData.value || sourceData.value || keywordData.value))
  const availableSources = computed(() =>
    sourceData.value?.data.sourceCounts?.map(s => s.source) ?? []
  )

  // Actions
  async function fetchSentimentReport(filters: ReportFilter) {
    const requestId = logger.request('/reports/sentiment/', 'GET', filters)
    isLoading.value = true
    try {
      const params = {
        start_date: filters.startDate,
        end_date: filters.endDate,
        ...(filters.platform && filters.platform !== 'all-platforms' && { platform: filters.platform }),
        ...(filters.keyword && { keyword: filters.keyword }),
        ...(filters.sentiment && { sentiment: filters.sentiment })
      }
      const response = await axios.get<ReportResponse>('/reports/sentiment/', {
        params
      })

      // Update the response with the correct total mentions from analytics store
      if (response.data?.data?.sentimentScore) {
        response.data.data.sentimentScore.total = analyticsStore.overallStats?.totalMentions ?? 0
      }

      sentimentData.value = response.data
      activeFilters.value = filters
      
      // Ensure analytics data is up to date
      await analyticsStore.fetchAnalyticsData()
    } catch (err: any) {
      const errorMessage = 'Failed to fetch sentiment report'
      error.value = errorMessage
      logger.error(requestId, errorMessage, err, {
        method: 'GET',
        endpoint: '/reports/sentiment/',
        params: filters
      })
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSourceBreakdown(filters: ReportFilter) {
    const requestId = logger.request('/reports/source_breakdown/', 'GET', filters)
    isLoading.value = true
    try {
      const params = {
        start_date: filters.startDate,
        end_date: filters.endDate,
        ...(filters.platform && filters.platform !== 'all-platforms' && { platform: filters.platform }),
        ...(filters.keyword && { keyword: filters.keyword }),
        ...(filters.sentiment && { sentiment: filters.sentiment })
      }
      const response = await axios.get<ReportResponse>('/reports/source_breakdown/', {
        params
      })
      sourceData.value = response.data
      activeFilters.value = filters
    } catch (err: any) {
      const errorMessage = 'Failed to fetch source breakdown'
      error.value = errorMessage
      logger.error(requestId, errorMessage, err, {
        method: 'GET',
        endpoint: '/reports/source_breakdown/',
        params: filters
      })
    } finally {
      isLoading.value = false
    }
  }

  async function fetchKeywordMentions(filters: ReportFilter) {
    const requestId = logger.request('/reports/keyword_mentions/', 'GET', filters)
    isLoading.value = true
    try {
      const params = {
        start_date: filters.startDate,
        end_date: filters.endDate,
        ...(filters.platform && filters.platform !== 'all-platforms' && { platform: filters.platform }),
        ...(filters.keyword && { keyword: filters.keyword }),
        ...(filters.sentiment && { sentiment: filters.sentiment })
      }
      const response = await axios.get<ReportResponse>('/reports/keyword_mentions/', {
        params
      })
      keywordData.value = response.data
      activeFilters.value = filters
    } catch (err: any) {
      const errorMessage = 'Failed to fetch keyword mentions'
      error.value = errorMessage
      logger.error(requestId, errorMessage, err, {
        method: 'GET',
        endpoint: '/reports/keyword_mentions/',
        params: filters
      })
    } finally {
      isLoading.value = false
    }
  }

  async function exportReport(format: 'csv' | 'pdf') {
    if (!sentimentData.value) return

    const endpoint = `/reports/export/${format}/`
    const requestId = logger.request(endpoint, 'GET', activeFilters.value)
    try {
      const params = {
        ...activeFilters.value,
        start_date: activeFilters.value.startDate,
        end_date: activeFilters.value.endDate
      }
      const response = await axios.get(endpoint, {
        params,
        responseType: 'blob'
      })
      
      // Handle file download
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `report-${format}-${new Date().toISOString()}.${format}`
      link.click()
    } catch (err: any) {
      const errorMessage = `Failed to export report as ${format}`
      error.value = errorMessage
      logger.error(requestId, errorMessage, err, {
        method: 'GET',
        endpoint,
        params: activeFilters.value
      })
    }
  }

  return {
    // State
    isLoading,
    error,
    sentimentData,
    sourceData,
    keywordData,
    activeFilters,

    // Getters
    hasData,
    availableSources,

    // Actions
    fetchSentimentReport,
    fetchSourceBreakdown,
    fetchKeywordMentions,
    exportReport
  }
})