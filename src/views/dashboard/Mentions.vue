<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Card } from '@/components/ui/card'
import {
  Search,
  ArrowUpDown,
  ExternalLink,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Globe,
  Hash,
  ThumbsUp,
  LineChart,
  Clock
} from 'lucide-vue-next'
import Pagination from '@/components/common/Pagination.vue'
import analyticsImage from '@/assets/images/analytics/analytics-green.png'
import MentionsChart from './mentions/components/MentionsChart.vue'
import { useMentions } from '@/composables/useMentions'

// Initialize mentions composable
const {
  mentions,
  isLoading,
  error,
  totalMentions,
  positiveMentions,
  negativeMentions,
  neutralMentions,
  totalPages,
  fetchMentions,
  retrySentiment,
  graphData,
  availableKeywords
} = useMentions()

// Date input refs
const startDateRef = ref<HTMLInputElement | null>(null)
const endDateRef = ref<HTMLInputElement | null>(null)

// Track which mentions are being retried
const retryingMentions = ref<Set<number>>(new Set())

// Handle retry sentiment
const handleRetrySentiment = async (mentionId: number) => {
  retryingMentions.value.add(mentionId)
  try {
    await retrySentiment(mentionId)
  } catch (err) {
    console.error('Failed to retry sentiment analysis:', err)
  } finally {
    retryingMentions.value.delete(mentionId)
  }
}

// Pagination and filtering
const currentPage = ref(1)
const selectedSentiment = ref('all')
const selectedPlatform = ref('all-platforms')
const selectedKeyword = ref('all-keywords')
const searchQuery = ref('')
const sortDirection = ref<'asc' | 'desc'>('desc')
const visibleLines = ref({
  positive: true,
  neutral: true,
  negative: true
})

// Date range filters with proper initialization
const initializeDates = () => {
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)

  console.log('Initializing dates:', {
    today: today.toISOString(),
    thirtyDaysAgo: thirtyDaysAgo.toISOString(),
    startDate: thirtyDaysAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0]
  })
  startDate.value = thirtyDaysAgo.toISOString().split('T')[0]
  endDate.value = today.toISOString().split('T')[0]
}

const startDate = ref('')
const endDate = ref('')

// Reset filters and initialize
const resetFilters = () => {
  currentPage.value = 1
  selectedSentiment.value = 'all'
  selectedPlatform.value = 'all-platforms'
  selectedKeyword.value = 'all-keywords'
  searchQuery.value = ''
  sortDirection.value = 'desc'
  initializeDates()
}

// Initialize dates and fetch data
onMounted(() => {
  resetFilters()
  fetchMentions(createFilters(1))
})


// Compute chart title based on date range
const chartTitle = computed(() => {
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return `Mention Trends (${diffDays} Days)`
})

interface GraphPoint {
  date: string
  positive: number
  negative: number
  neutral: number
}

// Transform API graph data into chart format
const chartData = computed(() => {
  if (!graphData.value) return []

  return graphData.value.map((point: GraphPoint) => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    positive: point.positive,
    neutral: point.neutral,
    negative: point.negative
  }))
})

// Methods
// Process and highlight content
const processContent = (content: string, keyword: string): string => {
  // Escape HTML to prevent XSS
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Create a completely stripped version for matching
  const stripText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove everything except letters and numbers
  }

  // Find all possible matches in the original text
  const findMatches = (content: string, keyword: string) => {
    const strippedKeyword = stripText(keyword)
    const matches: { start: number, end: number, text: string }[] = []
    const matchedRanges = new Set<number>() // Track matched positions

    // Sliding window approach to find matches
    for (let i = 0; i < content.length; i++) {
      // Skip if this position is already part of a match
      if (matchedRanges.has(i)) continue

      // Look ahead up to 2x the keyword length to account for extra spaces/punctuation
      const windowSize = keyword.length * 2
      const chunk = content.slice(i, i + windowSize)

      if (stripText(chunk).includes(strippedKeyword)) {
        // Find the exact boundaries of the match in the original text
        let start = i
        let end = i
        let found = false

        // Expand the end position until we no longer match
        while (end <= i + windowSize && !found) {
          const current = content.slice(start, end)
          const stripped = stripText(current)

          if (stripped === strippedKeyword) {
            // Verify word boundaries
            const beforeChar = start > 0 ? content[start - 1] : ' '
            const afterChar = end < content.length ? content[end] : ' '
            const isWordBoundary = /[^a-zA-Z0-9]/.test(beforeChar) && /[^a-zA-Z0-9]/.test(afterChar)

            if (isWordBoundary) {
              // Trim whitespace from match boundaries
              let trimStart = start
              let trimEnd = end

              // Trim leading whitespace
              while (trimStart < trimEnd && /\s/.test(content[trimStart])) {
                trimStart++
              }

              // Trim trailing whitespace
              while (trimEnd > trimStart && /\s/.test(content[trimEnd - 1])) {
                trimEnd--
              }

              // Add trimmed match and mark its range as matched
              matches.push({
                start: trimStart,
                end: trimEnd,
                text: content.slice(trimStart, trimEnd)
              })

              for (let pos = trimStart; pos < trimEnd; pos++) {
                matchedRanges.add(pos)
              }
              found = true
            }
          }
          end++
        }
      }
    }

    return matches
  }

  const escapedContent = escapeHtml(content)
  const matches = findMatches(escapedContent, keyword)

  if (matches.length === 0) {
    // If no matches found, just truncate
    return escapedContent.length > 800
      ? escapedContent.slice(0, 797) + '...'
      : escapedContent
  }

  // Use the first match for centering
  const firstMatch = matches[0]
  let start = Math.max(0, firstMatch.start - 400)
  let end = Math.min(escapedContent.length, firstMatch.end + 400)

  // Adjust if content is less than 800 characters
  if (end - start < 800) {
    start = Math.max(0, start - (800 - (end - start)))
    end = Math.min(escapedContent.length, end + (800 - (end - start)))
  }

  // Add ellipsis if truncated
  const prefix = start > 0 ? '...' : ''
  const suffix = end < escapedContent.length ? '...' : ''

  // Build the highlighted content with all matches within the window
  let result = ''
  let lastIndex = start

  matches.forEach(match => {
    if (match.start >= start && match.end <= end) {
      result += escapedContent.slice(lastIndex, match.start)
      result += `<span class="bg-green-100 text-green-800">${escapedContent.slice(match.start, match.end)
        }</span>`
      lastIndex = match.end
    }
  })

  result += escapedContent.slice(lastIndex, end)
  return `${prefix}${result}${suffix}`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

const getSourceColor = (source: string) => {
  switch (source.toLowerCase()) {
    case 'rollitup.org':
      return 'bg-gradient-to-r from-green-500/10 to-green-500/5 text-green-700 hover:from-green-500/20 hover:to-green-500/15'
    case 'thcfarmer':
      return 'bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-700 hover:from-blue-500/20 hover:to-blue-500/15'
    case 'icmag.com':
      return 'bg-gradient-to-r from-purple-500/10 to-purple-500/5 text-purple-700 hover:from-purple-500/20 hover:to-purple-500/15'
    case '420magazine.com':
      return 'bg-gradient-to-r from-orange-500/10 to-orange-500/5 text-orange-700 hover:from-orange-500/20 hover:to-orange-500/15'
    case 'overgrow.com':
      return 'bg-gradient-to-r from-pink-500/10 to-pink-500/5 text-pink-700 hover:from-pink-500/20 hover:to-pink-500/15'
    case 'ilgmforum.com':
      return 'bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 text-indigo-700 hover:from-indigo-500/20 hover:to-indigo-500/15'
    case 'homegrowncannabisco.community':
      return 'bg-gradient-to-r from-teal-500/10 to-teal-500/5 text-teal-700 hover:from-teal-500/20 hover:to-teal-500/15'
    case 'growersnetwork.org':
      return 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-700 hover:from-amber-500/20 hover:to-amber-500/15'
    case 'reddit.com':
      return 'bg-gradient-to-r from-orange-500/10 to-orange-500/5 text-orange-700 hover:from-orange-500/20 hover:to-orange-500/15'
    case 'marijuanapassion.com':
      return 'bg-gradient-to-r from-lime-500/10 to-lime-500/5 text-lime-700 hover:from-lime-500/20 hover:to-lime-500/15'
    case 'growweedeasy.com':
      return 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15'
    case 'beanbasement.nl':
      return 'bg-gradient-to-r from-violet-500/10 to-violet-500/5 text-violet-700 hover:from-violet-500/20 hover:to-violet-500/15'
    case 'phenohunter.org':
      return 'bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 text-cyan-700 hover:from-cyan-500/20 hover:to-cyan-500/15'
    case 'uk420.com':
      return 'bg-gradient-to-r from-fuchsia-500/10 to-fuchsia-500/5 text-fuchsia-700 hover:from-fuchsia-500/20 hover:to-fuchsia-500/15'
    case 'percysgrowroom.com':
      return 'bg-gradient-to-r from-rose-500/10 to-rose-500/5 text-rose-700 hover:from-rose-500/20 hover:to-rose-500/15'
    case '420sa.co.za':
      return 'bg-gradient-to-r from-sky-500/10 to-sky-500/5 text-sky-700 hover:from-sky-500/20 hover:to-sky-500/15'
    default:
      return 'bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-700 hover:from-gray-500/20 hover:to-gray-500/15'
  }
}

const toggleLine = (line: 'positive' | 'neutral' | 'negative') => {
  visibleLines.value[line] = !visibleLines.value[line]
}

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}


// Platform mapping for consistent comparison
const platformMapping: Record<string, string[]> = {
  'rollitup.org': ['rollitup.org', 'rollitup'],
  'thcfarmer': ['thcfarmer', 'THCFarmer', 'thc farmer'],
  'icmag.com': ['icmag.com', 'icmag', 'ic mag'],
  '420magazine.com': ['420magazine.com', '420magazine', '420 magazine'],
  'overgrow.com': ['overgrow.com', 'overgrow', 'over grow'],
  'ilgmforum.com': ['ilgmforum.com', 'ilgm forum', 'ilgm'],
  'homegrowncannabisco.community': ['homegrowncannabisco.community', 'homegrown cannabis co', 'homegrown'],
  'growersnetwork.org': ['growersnetwork.org', 'growers network', 'growersnetwork'],
  'reddit.com': ['reddit.com', 'reddit', 'r/'],
  'autoflower.org': ['autoflower.org', 'autoflower', 'auto flower'],
  'marijuanapassion.com': ['marijuanapassion.com', 'marijuana passion', 'marijuanapassion'],
  'growweedeasy.com': ['growweedeasy.com', 'grow weed easy', 'growweedeasy'],
  'beanbasement.nl': ['beanbasement.nl', 'bean basement', 'beanbasement'],
  'phenohunter.org': ['phenohunter.org', 'pheno hunter', 'phenohunter'],
  'uk420.com': ['uk420.com', 'uk420', 'uk 420'],
  'percysgrowroom.com': ['percysgrowroom.com', 'percys grow room', 'percysgrowroom'],
  '420sa.co.za': ['420sa.co.za', '420sa', '420 sa']
}

// Debounce utility
const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Debounced fetch function that includes all filters
const debouncedFetch = debounce((query: string) => {
  const filters = {
    page: 1, // Reset to page 1 for new searches
    start_date: startDate.value,
    end_date: endDate.value,
    sentiment: selectedSentiment.value === 'all' ? undefined : selectedSentiment.value,
    platforms: selectedPlatform.value === 'all-platforms' ? undefined : selectedPlatform.value,
    keyword: selectedKeyword.value === 'all-keywords' ? undefined : selectedKeyword.value,
    search: query,
    ordering: sortDirection.value === 'asc' ? 'post_date' : '-post_date'
  }
  fetchMentions(filters)
}, 1000) // Use 1 second delay like Reviews.vue

// Watch search query changes
watch(searchQuery, (newValue) => {
  debouncedFetch(newValue)
})

// Function to create filters object
const createFilters = (page = 1) => ({
  page,
  start_date: startDate.value,
  end_date: endDate.value,
  sentiment: selectedSentiment.value === 'all' ? undefined : selectedSentiment.value,
  platforms: selectedPlatform.value === 'all-platforms' ? undefined : selectedPlatform.value,
  keyword: selectedKeyword.value === 'all-keywords' ? undefined : selectedKeyword.value,
  search: searchQuery.value,
  ordering: sortDirection.value === 'asc' ? 'post_date' : '-post_date'
})

// Watch other filters
watch([selectedSentiment, selectedPlatform, selectedKeyword, sortDirection], () => {
  fetchMentions(createFilters(1))
})

// Watch date changes
watch([startDate, endDate], () => {
  fetchMentions(createFilters(1))
})

// Watch page changes
watch(currentPage, (newPage) => {
  fetchMentions(createFilters(newPage))
})
</script>

<template>
  <div class="flex-1 p-2 md:p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-8">
      <!-- Welcome Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="flex-1 text-center md:text-left">
            <h1 class="text-lg md:text-2xl font-medium text-green-800 mb-2 text-center md:text-left">
              Brand Mentions
            </h1>
            <p class="text-gray-600 text-sm sm:text-md md:text-lg">
              Track every conversation about your brand across the growing community. We've gathered mentions from
              forums, social platforms, and industry sites to show you exactly where and how your brand is being
              discussed. Dive into real-time conversations, monitor sentiment shifts, and spot emerging trends as they
              happen. From casual discussions to detailed reviews, stay informed about what cultivators are saying about
              your products.
            </p>
          </div>
          <div class="w-full max-w-xs sm:max-w-sm md:w-48 md:h-48 flex-shrink-0 relative">
            <img :src="analyticsImage" alt="Brand Mentions illustration" class="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="mb-8">
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <!-- Total Mentions -->
          <Card
            class="flex-1 shadow-sm hover:shadow-md transition-all duration-200 border border-blue-500/10 bg-gradient-to-br from-blue-100/60 to-indigo-100/60">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <p class="text-sm font-medium text-blue-700">Total Mentions</p>
                <MessageCircle class="h-4 w-4 text-blue-700" />
              </div>
              <div class="flex flex-col">
                <div v-if="isLoading" class="space-y-2">
                  <div class="h-8 bg-blue-200/50 rounded animate-pulse w-16"></div>
                  <div class="h-4 bg-blue-200/50 rounded animate-pulse w-24"></div>
                </div>
                <template v-else>
                  <div class="text-3xl font-bold text-blue-700">{{ totalMentions }}</div>
                  <p class="mt-2 text-sm text-blue-700/80">Across all platforms</p>
                </template>
              </div>
            </div>
          </Card>

          <!-- Positive Mentions -->
          <Card
            class="flex-1 shadow-sm hover:shadow-md transition-all duration-200 border border-emerald-500/10 bg-gradient-to-br from-emerald-100/60 to-green-100/60">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <p class="text-sm font-medium text-emerald-700">Positive Mentions</p>
                <TrendingUp class="h-4 w-4 text-emerald-700" />
              </div>
              <div class="flex flex-col">
                <div v-if="isLoading" class="space-y-2">
                  <div class="h-8 bg-emerald-200/50 rounded animate-pulse w-16"></div>
                  <div class="h-4 bg-emerald-200/50 rounded animate-pulse w-24"></div>
                </div>
                <template v-else>
                  <div class="text-3xl font-bold text-emerald-700">{{ positiveMentions }}</div>
                  <p class="mt-2 text-sm text-emerald-700/80">
                    {{ ((positiveMentions / totalMentions) * 100).toFixed(1) }}% of total
                  </p>
                </template>
              </div>
            </div>
          </Card>

          <!-- Negative Mentions -->
          <Card
            class="flex-1 shadow-sm hover:shadow-md transition-all duration-200 border border-rose-500/10 bg-gradient-to-br from-rose-100/60 to-red-100/60">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <p class="text-sm font-medium text-rose-700">Negative Mentions</p>
                <TrendingDown class="h-4 w-4 text-rose-700" />
              </div>
              <div class="flex flex-col">
                <div v-if="isLoading" class="space-y-2">
                  <div class="h-8 bg-rose-200/50 rounded animate-pulse w-16"></div>
                  <div class="h-4 bg-rose-200/50 rounded animate-pulse w-24"></div>
                </div>
                <template v-else>
                  <div class="text-3xl font-bold text-rose-700">{{ negativeMentions }}</div>
                  <p class="mt-2 text-sm text-rose-700/80">
                    {{ ((negativeMentions / totalMentions) * 100).toFixed(1) }}% of total
                  </p>
                </template>
              </div>
            </div>
          </Card>

          <!-- Neutral Mentions -->
          <Card
            class="flex-1 shadow-sm hover:shadow-md transition-all duration-200 border border-amber-500/10 bg-gradient-to-br from-amber-100/60 to-yellow-100/60">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <p class="text-sm font-medium text-amber-700">Neutral Mentions</p>
                <Minus class="h-4 w-4 text-amber-700" />
              </div>
              <div class="flex flex-col">
                <div v-if="isLoading" class="space-y-2">
                  <div class="h-8 bg-amber-200/50 rounded animate-pulse w-16"></div>
                  <div class="h-4 bg-amber-200/50 rounded animate-pulse w-24"></div>
                </div>
                <template v-else>
                  <div class="text-3xl font-bold text-amber-700">{{ neutralMentions }}</div>
                  <p class="mt-2 text-sm text-amber-700/80">
                    {{ ((neutralMentions / totalMentions) * 100).toFixed(1) }}% of total
                  </p>
                </template>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <!-- Chart Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm">
        <template v-if="chartData.length === 0">
          <div class="flex flex-col items-center justify-center h-64 p-6 text-center">
            <div class="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mb-6 mt-5 md:mt-0">
              <LineChart class="w-8 md:h-8 h-16 text-violet-400" />
            </div>

            <!-- Text Content -->
            <h3 class="md:text-lg font-medium text-gray-700 mb-2 text-md">
              No Mention Trends Available
            </h3>
            <p class="text-gray-500 text-sm mb-5 max-w-[700px]">
              Track how your brand mentions change over time. Data will appear here after 30 days of monitoring.
            </p>

          </div>
        </template>
        <template v-else>
          <MentionsChart :data="chartData" :visible-lines="visibleLines" :title="chartTitle" :is-loading="isLoading"
            @toggle-line="toggleLine" />
        </template>
      </div>

      <!-- Filters Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm">
        <div class="p-6 space-y-4">
          <div class="text-center">
            <h2 class="text-center md:text-left md:text-lg font-medium text-gray-700 text-md">Mention Filters</h2>
            <p class="text-sm sm:text-md text-gray-500 text-sm sm:text-md">
              Filter mentions by platform, keyword, sentiment, and search terms to focus your analysis.
            </p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- Date Range -->
            <div class="flex flex-col space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="relative">
                  <label class="block relative cursor-pointer">
                    <input ref="startDateRef" v-model="startDate" type="date" placeholder="Start Date (YYYY-MM-DD)"
                      class="w-full pl-3 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 [direction:rtl] [text-align-last:left] [&::-webkit-calendar-picker-indicator]:ml-0" />
                    <div class="absolute inset-0" @click="startDateRef?.showPicker()"></div>
                  </label>
                </div>
                <div class="relative">
                  <label class="block relative cursor-pointer">
                    <input ref="endDateRef" v-model="endDate" type="date" placeholder="End Date (YYYY-MM-DD)"
                      class="w-full pl-3 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 [direction:rtl] [text-align-last:left] [&::-webkit-calendar-picker-indicator]:ml-0" />
                    <div class="absolute inset-0" @click="endDateRef?.showPicker()"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Keyword Filter -->
            <div class="flex flex-col space-y-4">
              <div class="relative">
                <Hash class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                <select v-model="selectedKeyword"
                  class="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none">
                  <option value="all-keywords">All Keywords</option>
                  <option v-for="keyword in availableKeywords" :key="keyword" :value="keyword">
                    {{ keyword }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Search Filter -->
            <div class="flex flex-col space-y-4">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                <input v-model="searchQuery" type="text" placeholder="Search mentions..." :disabled="isLoading"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed" />
              </div>
            </div>

            <!-- Platform Filter -->
            <div class="flex flex-col space-y-4">
              <div class="relative">
                <Globe class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                <select v-model="selectedPlatform"
                  class="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none">
                  <option value="all-platforms">All Platforms</option>
                  <option value="420magazine.com">420 Magazine</option>
                  <option value="420sa.co.za">420SA</option>
                  <option value="autoflower.org">Autoflower</option>
                  <option value="beanbasement.nl">Bean Basement</option>
                  <option value="growersnetwork.org">Growers Network</option>
                  <option value="growweedeasy.com">GrowWeedEasy</option>
                  <option value="homegrowncannabisco.community">Homegrown Cannabis Co</option>
                  <option value="icmag.com">ICMag</option>
                  <option value="ilgmforum.com">ILGM Forum</option>
                  <option value="marijuanapassion.com">Marijuana Passion</option>
                  <option value="overgrow.com">Overgrow</option>
                  <option value="percysgrowroom.com">Percy's Grow Room</option>
                  <option value="phenohunter.org">PhenoHunter</option>
                  <option value="reddit.com">Reddit</option>
                  <option value="rollitup.org">RollItUp</option>
                  <option value="thcfarmer.com">THCFarmer</option>
                  <option value="uk420.com">UK420</option>
                </select>
              </div>
            </div>

            <!-- Sentiment Filter -->
            <div class="flex flex-col space-y-4">
              <div class="relative">
                <ThumbsUp class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                <select v-model="selectedSentiment"
                  class="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none">
                  <option value="all">All Sentiments</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>
            </div>

            <!-- Sort Button -->
            <div class="flex flex-col space-y-4">
              <div class="relative">
                <ArrowUpDown
                  class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                <button @click="toggleSortDirection"
                  class="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500">
                  Sort by Date
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div v-for="i in 5" :key="i" class="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2 mb-2">
                  <div class="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div class="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
                <div class="h-7 bg-gray-200 rounded animate-pulse w-96"></div>
              </div>
              <div class="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
            <div class="flex items-center justify-between mt-4">
              <div class="flex items-center space-x-2">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
              <div class="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8 text-red-600">
        {{ error }}
        <!-- <div class="relative group mt-3">
          <div
            class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">

            <div class="flex  justify-between mb-4 flex-col sm:flex-row">
              <div class="flex space-x-3 mb-3 sm:mb-0">
                <div
                  class="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center text-green-600 font-bold">
                  J
                </div>
                <div>
                  <h3 class="text-gray-700 font-medium">John Doe</h3>
                  <p class="text-gray-500 text-sm flex items-center">
                    <Clock class="w-3 h-3 mr-1" />
                    Jan 20, 2025
                  </p>
                </div>
              </div>
              <div class="flex gap-3 flex-wrap sm:flex-nowrap">
                <span
                  class="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-normal bg-blue-100 text-blue-700">
                  Twitter
                </span>
                <span
                  class="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-normal bg-gradient-to-r from-sky-500/10 to-blue-500/5 text-blue-700 hover:from-sky-500/20 hover:to-blue-500/15 transition-colors duration-300">
                  Static Keyword
                </span>
                <span
                  class="inline-flex items-center space-x-1 w-24 px-2 py-1 rounded-md text-sm font-normal bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15 transition-colors duration-300">
                  <TrendingUp class="w-4 h-4 mr-1" />
                  <span class="text-sm font-normal">Positive</span>
                </span>
              </div>
            </div>

            <hr class="my-4 border-t border-gray-100" />

            <div>
              <h2 class="text-lg font-medium text-gray-700 mb-4">
                Static Title Example with Keyword Highlighted
              </h2>
              <p class="text-gray-600 leading-relaxed mb-4 text-center">
                This is a static content example where the keyword appears in the text. The content is purely for
                demonstration purposes.
              </p>
            </div>

            <div class="flex justify-end">
              <a href="https://example.com" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center px-3 py-1 rounded-md text-sm font-normal bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-700 hover:from-gray-500/20 hover:to-gray-500/10 transition-all duration-300">
                View
                <ExternalLink class="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
        <div class="relative group mt-3">
          <div
            class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">

            <div class="flex justify-between mb-4 flex-col sm:flex-row">
              <div class="flex items-center space-x-3 mb-3 sm:mb-0">
                <div
                  class="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center text-green-600 font-bold">
                  J
                </div>
                <div>
                  <h3 class="text-gray-700 font-medium">John Doe</h3>
                  <p class="text-gray-500 text-sm flex items-center">
                    <Clock class="w-3 h-3 mr-1" />
                    Jan 20, 2025
                  </p>
                </div>
              </div>
              <div class="flex gap-3 flex-wrap sm:flex-nowrap">
                <span
                  class="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-normal bg-blue-100 text-blue-700">
                  Twitter
                </span>
                <span
                  class="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-normal bg-gradient-to-r from-sky-500/10 to-blue-500/5 text-blue-700 hover:from-sky-500/20 hover:to-blue-500/15 transition-colors duration-300">
                  Static Keyword
                </span>
                <span
                  class="inline-flex items-center space-x-1 w-24 px-2 py-1 rounded-md text-sm font-normal bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15 transition-colors duration-300">
                  <TrendingUp class="w-4 h-4 mr-1" />
                  <span class="text-sm font-normal">Positive</span>
                </span>
              </div>
            </div>

            <hr class="my-4 border-t border-gray-100" />

            <div>
              <h2 class="text-lg font-medium text-gray-700 mb-4">
                Static Title Example with Keyword Highlighted
              </h2>
              <p class="text-gray-600 leading-relaxed mb-4 text-center">
                This is a static content example where the keyword appears in the text. The content is purely for
                demonstration purposes.
              </p>
            </div>

            <div class="flex justify-end">
              <a href="https://example.com" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center px-3 py-1 rounded-md text-sm font-normal bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-700 hover:from-gray-500/20 hover:to-gray-500/10 transition-all duration-300">
                View
                <ExternalLink class="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div> -->

      </div>

      <!-- Mentions List -->
      <div v-else class="space-y-6">
        <div v-for="mention in mentions" :key="mention.id" class="relative group">
          <div
            class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">

            <div class="flex justify-between mb-4 flex-col sm:flex-row">
              <div class="flex items-center space-x-3 mb-3 sm:mb-0">
                <div
                  class="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center text-green-600 font-bold">
                  {{ mention.author[0].toUpperCase() }}
                </div>
                <div>
                  <h3 class="text-gray-700 font-medium">{{ mention.author }}</h3>
                  <p class="text-gray-500 text-sm flex items-center">
                    <Clock class="w-3 h-3 mr-1" />
                    {{ formatDate(mention.post_date) }}
                  </p>
                </div>
              </div>
              <div class="flex gap-3 flex-wrap sm:flex-nowrap">
                <span
                  class="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-normal transition-colors duration-300"
                  :class="getSourceColor(mention.source)">
                  <span class="text-sm font-normal">{{ mention.source }}</span>
                </span>
                <span
                  class="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-normal bg-gradient-to-r from-sky-500/10 to-blue-500/5 text-blue-700 hover:from-sky-500/20 hover:to-blue-500/15 transition-colors duration-300">
                  <span class="text-sm font-normal">{{ mention.keyword_term }}</span>
                </span>
                <template v-if="mention.sentiment !== null">
                  <span
                    class="inline-flex items-center space-x-1 w-24 px-2 py-1 rounded-md text-sm font-normal transition-colors duration-300"
                    :class="{
                      'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15': mention.sentiment === 'positive',
                      'bg-gradient-to-r from-rose-500/10 to-rose-500/5 text-rose-700 hover:from-rose-500/20 hover:to-rose-500/15': mention.sentiment === 'negative',
                      'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-700 hover:from-amber-500/20 hover:to-amber-500/15': mention.sentiment === 'neutral'
                    }">
                    <TrendingUp v-if="mention.sentiment === 'positive'" class="w-4 h-4 mr-1" />
                    <TrendingDown v-if="mention.sentiment === 'negative'" class="w-4 h-4 mr-1" />
                    <Minus v-if="mention.sentiment === 'neutral'" class="w-4 h-4 mr-1" />
                    <span class="text-sm font-normal">
                      {{ mention.sentiment.charAt(0).toUpperCase() + mention.sentiment.slice(1) }}
                    </span>
                  </span>
                </template>
                <button v-else @click="handleRetrySentiment(mention.id)" :disabled="retryingMentions.has(mention.id)"
                  class="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <RefreshCw v-if="retryingMentions.has(mention.id)" class="w-3 h-3 mr-1 animate-spin" />
                  {{ retryingMentions.has(mention.id) ? 'Analyzing...' : 'Retry' }}
                </button>
              </div>
            </div>


            <hr class="my-4 border-t border-gray-100" />


            <div>
              <h2 class="text-lg font-medium text-gray-700 mb-4"
                v-html="processContent(mention.title, mention.keyword_term)">
              </h2>
              <p class="text-gray-600 leading-relaxed mb-4"
                v-html="processContent(mention.content, mention.keyword_term)"></p>
            </div>


            <div class="flex justify-end">
              <a :href="mention.url" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center px-3 py-1 rounded-md text-sm font-normal bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-700 hover:from-gray-500/20 hover:to-gray-500/10 transition-all duration-300">
                View
                <ExternalLink class="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>



      <!-- Pagination -->
      <div class="mt-8">
        <Pagination v-model:currentPage="currentPage" :totalPages="totalPages" />
      </div>
    </div>
  </div>
</template>
