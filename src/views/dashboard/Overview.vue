<script setup lang="ts">
// 1. Vue imports
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'

// 2. Component imports
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MessageCircle,
  Star,
  Loader2,
  History,
  Activity,
  BarChart2,
  Award
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// 3. Asset imports
import analyticsImage from '@/assets/images/analytics/analytics-green.png'

// 4. Service imports
import { BrandRatingService } from '@/services/brandRating'

// 5. Store imports
import { useAnalyticsStore } from '@/stores/analytics'
import { useAuthStore } from '@/stores/auth'
import { useTracking } from '@/views/dashboard/tracking/composables/useTracking'

// 6. Type imports
import type { KeywordDataPoint } from '@/types/analytics'

// 7. State management
interface PollState {
  intervalId: ReturnType<typeof setInterval> | null
  startTime: number
}

const analyticsStore = useAnalyticsStore()
const authStore = useAuthStore()
const trackingStore = useTracking()
const brandRatingService = new BrandRatingService()

const pollState = ref<PollState>({
  intervalId: null,
  startTime: 0
})

// 8. Computed properties
const isCalculating = computed(() => analyticsStore.brandRatingStatus === 'calculating')
const isLoading = computed(() => analyticsStore.brandRatingStatus === 'loading')
const hasError = computed(() => analyticsStore.brandRatingStatus === 'error')
const reputationScore = computed(() => analyticsStore.brandRating?.total_score || 0)

// Format date range for display
const dateRangeDisplay = computed(() => {
  const start = analyticsStore.filters.dateRange.start
  const end = analyticsStore.filters.dateRange.end
  return `${start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })} - ${end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })}`
})

// Memoize the sentiment totals
const sentimentTotals = computed(() => {
  const timeSeriesData = analyticsStore.sentimentOverTime
  if (!timeSeriesData || timeSeriesData.length < 2) return null

  const latest = timeSeriesData[timeSeriesData.length - 1]
  const oldest = timeSeriesData[0]

  return {
    latest: {
      total: latest.positive + latest.neutral + latest.negative,
      date: latest.date,
      negative: latest.negative
    },
    oldest: {
      total: oldest.positive + oldest.neutral + oldest.negative,
      date: oldest.date,
      negative: oldest.negative
    }
  }
})

// Pre-calculate percentages once
const sentimentPercentages = computed(() => {
  const totals = sentimentTotals.value
  if (!totals) return null

  return {
    latest: totals.latest.total > 0
      ? (totals.latest.negative / totals.latest.total) * 100
      : 0,
    oldest: totals.oldest.total > 0
      ? (totals.oldest.negative / totals.oldest.total) * 100
      : 0,
    dates: {
      latest: totals.latest.date,
      oldest: totals.oldest.date
    }
  }
})

// Use pre-calculated percentages
const sentimentChange = computed(() => {
  const percentages = sentimentPercentages.value
  if (!percentages) return null

  const change = percentages.latest - percentages.oldest

  return {
    value: Math.abs(Math.round(change)),
    direction: change > 0 ? 'increased' : 'decreased',
    latest: percentages.dates.latest,
    oldest: percentages.dates.oldest
  }
})

// 9. Methods
async function startRatingCalculation(keywordId: number) {
  // Only start calculation if we don't have a current rating
  if (!analyticsStore.brandRating) {
    const status = await brandRatingService.calculateRating(keywordId)

    if (status?.status === 'calculating') {
      startPolling(keywordId)
    }
  }
}

function startPolling(keywordId: number) {
  // Clear any existing poll
  stopPolling()

  pollState.value.startTime = Date.now()
  pollState.value.intervalId = setInterval(async () => {
    // Check max duration (3 minutes)
    if (Date.now() - pollState.value.startTime > 180000) {
      stopPolling()
      return
    }

    const status = await analyticsStore.fetchBrandRating(keywordId)
    if (status?.status === 'completed') {
      stopPolling()
    }
  }, 2000)
}

function stopPolling() {
  if (pollState.value.intervalId) {
    clearInterval(pollState.value.intervalId)
    pollState.value.intervalId = null
  }
}

// 10. Watchers
watch(() => analyticsStore.keywordAnalysis, async (keywords) => {
  if (!keywords.length || !keywords[0]?.id) return

  // Always check rating when keywords change or if current rating doesn't match keyword
  if (!analyticsStore.brandRating || analyticsStore.brandRating.id !== keywords[0].id) {
    await startRatingCalculation(keywords[0].id)
  }
}, { immediate: true })

// 11. Lifecycle hooks
onMounted(async () => {
  await analyticsStore.fetchAnalyticsData()
  await trackingStore.initialize()
})

onBeforeUnmount(() => {
  stopPolling()
})

const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative'): string => {
  switch (sentiment) {
    case 'positive': return 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15 transition-colors duration-300'
    case 'neutral': return 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-700 hover:from-amber-500/20 hover:to-amber-500/15 transition-colors duration-300'
    case 'negative': return 'bg-gradient-to-r from-rose-500/10 to-rose-500/5 text-rose-700 hover:from-rose-500/20 hover:to-rose-500/15 transition-colors duration-300'
  }
}

const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up': return TrendingUp
    case 'down': return TrendingDown
    case 'stable': return ArrowRight
  }
}

// Calculate dominant sentiment for a keyword using ratios and relative thresholds
const getDominantSentiment = (keyword: KeywordDataPoint): 'positive' | 'neutral' | 'negative' => {
  const { positive, negative, mentions } = keyword

  // Calculate ratios
  const positiveRatio = positive / mentions
  const negativeRatio = negative / mentions

  // Use lower thresholds based on observed data distribution
  const POSITIVE_THRESHOLD = 0.20  // 20% threshold for positive
  const NEGATIVE_THRESHOLD = 0.10  // 10% threshold for negative

  // Determine dominant sentiment using relative comparison
  if (positiveRatio >= POSITIVE_THRESHOLD && positiveRatio > negativeRatio) {
    return 'positive'
  }
  if (negativeRatio >= NEGATIVE_THRESHOLD && negativeRatio > positiveRatio) {
    return 'negative'
  }

  return 'neutral'
}

// Calculate trend based on percentage of max mentions
const getKeywordTrend = (keyword: KeywordDataPoint): 'up' | 'down' | 'stable' => {
  const allKeywords = analyticsStore.keywordAnalysis
  if (!allKeywords || allKeywords.length === 0) return 'stable'

  // Find the highest mention count
  const maxMentions = Math.max(...allKeywords.map(k => k.mentions))

  // Calculate percentage of max mentions
  const percentage = (keyword.mentions / maxMentions) * 100

  // Define thresholds as percentages of max mentions
  if (percentage >= 70) return 'up'        // Above 70% of max = up trend
  if (percentage <= 25) return 'down'      // Below 25% of max = down trend
  return 'stable'                          // Between 25-70% = stable
}
</script>

<template>
  <div class="flex-1 md:p-6 p-2">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <!-- Text Content -->
          <div class="flex-1 text-center md:text-start">
            <h1 class="text-lg sm:text-xl md:text-2xl font-medium text-green-800 mb-2 text-center md:text-left">
              Hey {{ authStore.username }}
            </h1>
            <p class="text-gray-600 text-sm sm:text-md md:text-lg leading-relaxed">
              Welcome to your dashboard! Get ready to dive into your brand's impact and presence across the growing
              community.
              We've gathered insights from top cannabis platforms to show you what people are saying about your brand.
              Explore
              your sentiment trends, engagement stats, and opportunities to strengthen your reputation. Every insight
              here is
              designed to help you connect with your audience and grow your brand's story. Ready to see what's driving
              the buzz?
              Let's get started!
            </p>
          </div>

          <!-- Image -->
          <div class="w-full max-w-xs sm:max-w-sm md:w-48 md:h-48 flex-shrink-0 relative">
            <img :src="analyticsImage" alt="Dashboard illustration" class="w-full h-full object-contain" />
          </div>
        </div>
      </div>


      <!-- Brand Overview -->
      <div class="mb-8">
        <!-- Brand Overview Card -->
        <Card class="border-0 bg-white mb-4">
          <div class="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 class="text-md md:text-lg font-medium text-gray-700">Brand Overview</h2>
            <div class="bg-gray-100 text-sm font-medium text-gray-600 px-3 py-1 rounded-full">
              {{ dateRangeDisplay }}
            </div>
          </div>
        </Card>

        <!-- Responsive Grid Container -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Sentiment Card -->
          <Card
            class="shadow-sm hover:shadow-md transition-all duration-200 border border-blue-500/10 bg-gradient-to-br from-blue-100/60 to-indigo-100/60">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <p class="text-sm font-medium text-blue-700">Overall Sentiment</p>
                <TrendingUp class="h-4 w-4 text-blue-700" />
              </div>
              <div v-if="analyticsStore.scraperStatus" class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-blue-700">{{ analyticsStore.overallStats?.positiveSentiment
                }}%</span>
                <span class="text-sm font-medium text-blue-700">Positive</span>
              </div>
              <div v-else class="text-3xl font-bold text-blue-700 animate-pulse">Loading...</div>
              <p class="mt-2 text-sm text-blue-700/80">Based on all mentions</p>
            </div>
          </Card>

          <!-- Total Mentions Card -->
          <Card
            class="shadow-sm hover:shadow-md transition-all duration-200 border border-teal-500/10 bg-gradient-to-br from-cyan-100/60 to-teal-100/60">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <p class="text-sm font-medium text-teal-700">Total Mentions</p>
                <MessageCircle class="h-4 w-4 text-teal-700" />
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-teal-700">{{
                  analyticsStore.overallStats?.totalMentions.toLocaleString() }}</span>
              </div>
              <p class="mt-2 text-sm text-teal-700/80">Across all platforms</p>
            </div>
          </Card>

          <!-- Active Keywords Card -->
          <Card
            class="shadow-sm hover:shadow-md transition-all duration-200 border border-yellow-500/10 bg-gradient-to-br from-yellow-100/60 to-orange-100/60">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <p class="text-sm font-medium text-yellow-700">Active Keywords</p>
                <Star class="h-4 w-4 text-yellow-700" />
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-bold text-yellow-700">{{ trackingStore.activeKeywords }}</span>
              </div>
              <p class="mt-2 text-sm text-yellow-700/80">Being tracked</p>
            </div>
          </Card>

          <!-- Reputation Score Card -->
          <Card
            class="shadow-sm hover:shadow-md transition-all duration-200 border border-purple-500/10 bg-gradient-to-br from-purple-100/60 to-fuchsia-100/60">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <p class="text-sm font-medium text-purple-700">Reputation Score</p>
                <Award class="h-4 w-4 text-purple-700" />
              </div>
              <div class="relative">
                <div v-if="isCalculating || isLoading"
                  class="absolute inset-0 flex items-center justify-center bg-purple-100/75">
                  <Loader2 class="h-6 w-6 text-purple-700 animate-spin" />
                </div>
                <div v-else-if="hasError" class="text-red-700 text-sm">Failed to load score</div>
                <template v-else>
                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-bold text-purple-700">{{ Math.round(reputationScore) }}</span>
                    <span class="text-sm font-medium text-purple-700">/100</span>
                  </div>
                  <div class="mt-2 h-2 w-full rounded-full bg-purple-200">
                    <div class="h-2 rounded-full bg-purple-700" :style="{ width: `${reputationScore}%` }" />
                  </div>
                </template>
              </div>
            </div>
          </Card>
        </div>
      </div>


      <!-- Loading State - Skeleton -->
      <div v-if="analyticsStore.isLoading" class="mb-8 rounded-lg p-6 animate-pulse" :class="{
        'bg-emerald-50 border border-emerald-200': sentimentChange?.direction === 'decreased',
        'bg-yellow-50 border border-yellow-200': !sentimentChange || sentimentChange.direction === 'increased'
      }">
        <div class="flex space-x-4">
          <div class="w-12 h-12 rounded-full" :class="{
            'bg-emerald-200/70': sentimentChange?.direction === 'decreased',
            'bg-yellow-200/70': !sentimentChange || sentimentChange.direction === 'increased'
          }"></div>
          <div class="flex-1 space-y-4 py-1">
            <div class="h-4 rounded w-3/4" :class="{
              'bg-emerald-200/70': sentimentChange?.direction === 'decreased',
              'bg-yellow-200/70': !sentimentChange || sentimentChange.direction === 'increased'
            }"></div>
            <div class="space-y-2">
              <div class="h-4 rounded" :class="{
                'bg-emerald-200/70': sentimentChange?.direction === 'decreased',
                'bg-yellow-200/70': !sentimentChange || sentimentChange.direction === 'increased'
              }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <Alert v-else-if="analyticsStore.error"
        class="mb-8 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-3">
        <div
          class="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-red-100/60 to-rose-100/60 border border-red-500/10">
          <AlertTriangle class="h-5 w-10 text-red-700" />
        </div>
        <div class="flex flex-col">
          <AlertTitle class="text-red-800 font-semibold text-sm sm:text-md">Error Loading Data</AlertTitle>
          <AlertDescription class="text-red-700 text-sm sm:text-md text-start">
            Unable to load sentiment data. Please try again later.
          </AlertDescription>
        </div>
      </Alert>

      <!-- Sentiment Alert -->
      <!-- <Card class="mb-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"> -->
      <Alert v-else-if="sentimentChange"
        :variant="sentimentChange.direction === 'increased' ? 'destructive' : 'default'" :class="{
          'mb-8 shadow-sm hover:shadow-md transition-all duration-200 border border-yellow-500/10 bg-gradient-to-br from-yellow-50/60 to-amber-50/60 rounded-lg flex items-center gap-3': sentimentChange.direction === 'increased',
          'mb-8 shadow-sm hover:shadow-md transition-all duration-200 border border-emerald-500/10 bg-gradient-to-br from-emerald-50/60 to-green-50/60 rounded-lg flex items-center gap-3': sentimentChange.direction === 'decreased'
        }">
        <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-100/60 to-yellow-100/60 border border-amber-500/10" :class="sentimentChange.direction === 'increased'
          ? 'bg-gradient-to-br from-yellow-100/60 to-amber-100/60 border border-yellow-500/10'
          : 'bg-gradient-to-br from-emerald-100/60 to-green-100/60 border border-emerald-500/10'">
          <component :is="sentimentChange.direction === 'increased' ? AlertTriangle : TrendingUp" :class="[
            'h-5 md:w-5 w-10 text-amber-600',
            sentimentChange.direction === 'increased' ? 'text-yellow-800' : 'text-green-800'
          ]" />
        </div>
        <div class="flex flex-col">
          <AlertTitle class="font-semibold text-sm sm:text-md" :class="{
            'text-yellow-600': sentimentChange.direction === 'increased',
            'text-emerald-600': sentimentChange.direction === 'decreased'
          }">
            {{ sentimentChange.direction === 'increased' ? 'Attention Required' : 'Sentiment Improving' }}
          </AlertTitle>
          <AlertDescription :class="{
            'text-yellow-600/80 text-sm sm:text-md -mt-1': sentimentChange.direction === 'increased',
            'text-emerald-600/80 text-sm sm:text-md -mt-1': sentimentChange.direction === 'decreased'
          }">
            Negative sentiment {{ sentimentChange.direction }} by {{ sentimentChange.value }}% in the last 7 days.
            <router-link to="/dashboard/analytics" class="font-medium underline" :class="{
              'hover:text-yellow-700': sentimentChange.direction === 'increased',
              'hover:text-emerald-700': sentimentChange.direction === 'decreased'
            }">
              View details
            </router-link>
          </AlertDescription>
        </div>
      </Alert>
    <!-- </Card> -->

      <!-- No Significant Change -->
      <!-- <Card class="mb-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"> -->
      <Alert v-else
        class="mb-8 shadow-sm hover:shadow-md transition-all duration-200 border border-amber-500/10 bg-gradient-to-br from-amber-50/60 to-yellow-50/60 rounded-lg flex items-center gap-3">
        <div
          class="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-100/60 to-yellow-100/60 border border-amber-500/10">
          <ArrowRight class="h-5 md:w-5 w-10 text-amber-600" />
        </div>
        <div class="flex flex-col">
          <AlertTitle class="text-amber-600 font-semibold text-sm sm:text-md">Sentiment Stable</AlertTitle>
          <AlertDescription class="text-amber-600/80 text-sm sm:text-md -mt-1">
            No significant sentiment changes in the last 7 days.
            <router-link to="/dashboard/analytics" class="font-medium underline hover:text-amber-700">
              View details
            </router-link>
          </AlertDescription>
        </div>
      </Alert>
    <!-- </Card> -->

      <!-- Recent Activity -->
      <Card class="mb-8 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 w-10 h-10">
              <Activity class="md:w-5 h-5 text-gray-500 w-10" />
            </div>
            <div class="">
              <CardTitle class="md:text-lg font-medium text-gray-700 text-md">Recent Activity</CardTitle>
              <p class="text-sm sm:text-md text-gray-500 ">Latest updates from monitored sources</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="overflow-hidden rounded-lg">
            <Table class="w-full text-sm sm:text-md border-collapse">
              <TableHeader v-if="analyticsStore.posts.length > 0" class="bg-gray-50/50">
                <TableRow>
                  <TableHead
                    class="w-[180px] text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-y border-gray-200/50">
                    Source</TableHead>
                  <TableHead
                    class="w-[100px] text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-y border-gray-200/50">
                    Date</TableHead>
                  <TableHead
                    class="w-[120px] text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-y border-gray-200/50">
                    Sentiment</TableHead>
                  <TableHead
                    class="w-[300px] max-w-[300px] text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-y border-gray-200/50">
                    Preview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody class="divide-y divide-gray-200/50">
                <template v-if="analyticsStore.posts.length === 0">
                  <TableRow >
                    <TableCell colspan="4" class="p-0">
                      <div class="flex flex-col items-center justify-center h-64 bg-white rounded-lg p-6 text-center">
                        <div class="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                          <History class="w-8 h-8 text-rose-400" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-700 mb-2">
                          No Recent Activity
                        </h3>
                        <p class="text-gray-500 text-sm mb-5 max-w-[700px]">
                          Activity will appear here once you start tracking keywords and monitoring brand mentions.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                  <!-- <TableRow class="text-sm sm:text-md group hover:bg-gray-50/50 transition-all duration-200">
                    
                    <TableCell class="w-[180px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-700">Static Source</span>
                    </TableCell>

                    
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-600">02/19/2025</span>
                    </TableCell>

                    
                    <TableCell class="w-[120px] py-4 px-6 border-b border-gray-200/50">
                      <span
                        class="inline-flex items-center justify-center w-20 px-3 py-1 rounded-md text-sm font-medium
      bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15 transition-colors duration-300">
                        Positive
                      </span>
                    </TableCell>

                    
                    <TableCell class="w-[300px] max-w-[300px] py-4 px-6 border-b border-gray-200/50">
                      <div class="max-w-full">
                        <p class="text-sm sm:text-md text-gray-600 truncate">This is a static post content for display
                          purposes.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow class="text-sm sm:text-md group hover:bg-gray-50/50 transition-all duration-200">
                    
                    <TableCell class="w-[180px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-700">Static Source</span>
                    </TableCell>

                    
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-600">02/19/2025</span>
                    </TableCell>

                    
                    <TableCell class="w-[120px] py-4 px-6 border-b border-gray-200/50">
                      <span
                        class="inline-flex items-center justify-center w-20 px-3 py-1 rounded-md text-sm font-medium
      bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15 transition-colors duration-300">
                        Positive
                      </span>
                    </TableCell>

                    
                    <TableCell class="w-[300px] max-w-[300px] py-4 px-6 border-b border-gray-200/50">
                      <div class="max-w-full">
                        <p class="text-sm sm:text-md text-gray-600 truncate">This is a static post content for display
                          purposes.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow class="text-sm sm:text-md group hover:bg-gray-50/50 transition-all duration-200">
                    
                    <TableCell class="w-[180px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-700">Static Source</span>
                    </TableCell>

                    
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-600">02/19/2025</span>
                    </TableCell>

                    
                    <TableCell class="w-[120px] py-4 px-6 border-b border-gray-200/50">
                      <span
                        class="inline-flex items-center justify-center w-20 px-3 py-1 rounded-md text-sm font-medium
      bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15 transition-colors duration-300">
                        Positive
                      </span>
                    </TableCell>

                    
                    <TableCell class="w-[300px] max-w-[300px] py-4 px-6 border-b border-gray-200/50">
                      <div class="max-w-full">
                        <p class="text-sm sm:text-md text-gray-600 truncate">This is a static post content for display
                          purposes.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow class="text-sm sm:text-md group hover:bg-gray-50/50 transition-all duration-200">
                    
                    <TableCell class="w-[180px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-700">Static Source</span>
                    </TableCell>

                    
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-600">02/19/2025</span>
                    </TableCell>

                    
                    <TableCell class="w-[120px] py-4 px-6 border-b border-gray-200/50">
                      <span
                        class="inline-flex items-center justify-center w-20 px-3 py-1 rounded-md text-sm font-medium
      bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15 transition-colors duration-300">
                        Positive
                      </span>
                    </TableCell>

                    
                    <TableCell class="w-[300px] max-w-[300px] py-4 px-6 border-b border-gray-200/50">
                      <div class="max-w-full">
                        <p class="text-sm sm:text-md text-gray-600 truncate">This is a static post content for display
                          purposes.</p>
                      </div>
                    </TableCell>
                  </TableRow> -->

                </template>
                <template v-else-if="analyticsStore.error">
                  <TableRow>
                    <TableCell colspan="4" class="text-center text-red-600 py-4">
                      Failed to load recent activity
                    </TableCell>
                  </TableRow>
                </template>
                <template v-else>
                  <TableRow v-for="post in analyticsStore.posts.slice(0, 5)" :key="post.id"
                    class="text-sm sm:text-md group hover:bg-gray-50/50 transition-all duration-200">
                    <TableCell class="w-[180px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-700">{{ post.source }}</span>
                    </TableCell>
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-600">{{ new Date(post.post_date).toLocaleDateString()
                      }}</span>
                    </TableCell>
                    <TableCell class="w-[120px] py-4 px-6 border-b border-gray-200/50">
                      <span
                        class="inline-flex items-center justify-center w-20 px-3 py-1 rounded-md text-sm font-medium"
                        :class="{
                          'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15 transition-colors duration-300': post.sentiment === 'positive',
                          'bg-gradient-to-r from-rose-500/10 to-rose-500/5 text-rose-700 hover:from-rose-500/20 hover:to-rose-500/15 transition-colors duration-300': post.sentiment === 'negative',
                          'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-700 hover:from-amber-500/20 hover:to-amber-500/15 transition-colors duration-300': post.sentiment === 'neutral'
                        }">
                        {{ post.sentiment ? post.sentiment.charAt(0).toUpperCase() + post.sentiment.slice(1) : 'Unknown'
                        }}
                      </span>
                    </TableCell>
                    <TableCell class="w-[300px] max-w-[300px] py-4 px-6 border-b border-gray-200/50">
                      <div class="max-w-full">
                        <p class="text-sm sm:text-md text-gray-600 truncate">{{ post.content }}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <!-- Top Keywords -->
      <Card class="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
              <BarChart2 class="h-5 md:w-5 w-10 text-gray-500" />
            </div>
            <div>
              <CardTitle class="md:text-lg font-medium text-gray-700 text-md">Top Keywords</CardTitle>
              <p class="text-sm sm:text-md text-gray-500">Most frequently mentioned terms and phrases</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="overflow-hidden rounded-lg">
            <Table class="w-full text-sm sm:text-md border-collapse">
              <TableHeader v-if="analyticsStore.keywordAnalysis.length > 0" class="bg-gray-50/50">
                <TableRow>
                  <TableHead
                    class="w-[180px] text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-y border-gray-200/50">
                    Keyword</TableHead>
                  <TableHead
                    class="w-[100px] text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-y border-gray-200/50">
                    Mentions</TableHead>
                  <TableHead
                    class="w-[120px] text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-y border-gray-200/50">
                    Sentiment</TableHead>
                  <TableHead
                    class="w-[100px] text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-y border-gray-200/50">
                    Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template v-if="analyticsStore.keywordAnalysis.length === 0">
                  <TableRow>
                    <TableCell colspan="4" class="p-0">
                      <div class="flex flex-col items-center justify-center h-64 bg-white rounded-lg p-6 text-center">
                        <div class="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mb-6">
                          <TrendingUp class="w-8 h-12 text-sky-400" />
                        </div>
                        <h3 class="md:text-lg font-medium text-gray-700 mb-2 text-md">
                          No Top Keywords Yet
                        </h3>
                        <p class="text-gray-500 text-sm mb-5 max-w-[700px]">
                          Start tracking keywords to see which terms are trending and gaining traction.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                  <!-- <TableRow class="group hover:bg-gray-50/50 transition-all duration-200">
                    
                    <TableCell class="w-[180px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-700">Static Keyword</span>
                    </TableCell>

                    
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-600">150</span>
                    </TableCell>

                    
                    <TableCell class="w-[120px] py-4 px-6 border-b border-gray-200/50">
                      <span
                        class="inline-flex items-center justify-center w-20 px-3 py-1 rounded-md text-sm font-medium
      bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15 transition-colors duration-300">
                        Positive
                      </span>
                    </TableCell>

                    
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <ArrowUp class="h-4 w-4 text-green-500" />
                    </TableCell>
                  </TableRow>
                  <TableRow class="group hover:bg-gray-50/50 transition-all duration-200">
                    
                    <TableCell class="w-[180px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-700">Static Keyword</span>
                    </TableCell>

                    
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-600">150</span>
                    </TableCell>

                    
                    <TableCell class="w-[120px] py-4 px-6 border-b border-gray-200/50">
                      <span
                        class="inline-flex items-center justify-center w-20 px-3 py-1 rounded-md text-sm font-medium
      bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15 transition-colors duration-300">
                        Positive
                      </span>
                    </TableCell>

                    
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <ArrowUp class="h-4 w-4 text-green-500" />
                    </TableCell>
                  </TableRow>
                  <TableRow class="group hover:bg-gray-50/50 transition-all duration-200">
                    
                    <TableCell class="w-[180px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-700">Static Keyword</span>
                    </TableCell>

                    
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-600">150</span>
                    </TableCell>

                    
                    <TableCell class="w-[120px] py-4 px-6 border-b border-gray-200/50">
                      <span
                        class="inline-flex items-center justify-center w-20 px-3 py-1 rounded-md text-sm font-medium
      bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15 transition-colors duration-300">
                        Positive
                      </span>
                    </TableCell>

                    
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <ArrowUp class="h-4 w-4 text-green-500" />
                    </TableCell>
                  </TableRow>
                  <TableRow class="group hover:bg-gray-50/50 transition-all duration-200">
                    
                    <TableCell class="w-[180px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-700">Static Keyword</span>
                    </TableCell>

                    
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-600">150</span>
                    </TableCell>

                    
                    <TableCell class="w-[120px] py-4 px-6 border-b border-gray-200/50">
                      <span
                        class="inline-flex items-center justify-center w-20 px-3 py-1 rounded-md text-sm font-medium
      bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15 transition-colors duration-300">
                        Positive
                      </span>
                    </TableCell>

                    
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <ArrowUp class="h-4 w-4 text-green-500" />
                    </TableCell>
                  </TableRow>
                  <TableRow class="group hover:bg-gray-50/50 transition-all duration-200">
                    
                    <TableCell class="w-[180px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-700">Static Keyword</span>
                    </TableCell>

                    
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-600">150</span>
                    </TableCell>

                    
                    <TableCell class="w-[120px] py-4 px-6 border-b border-gray-200/50">
                      <span
                        class="inline-flex items-center justify-center w-20 px-3 py-1 rounded-md text-sm font-medium
      bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15 transition-colors duration-300">
                        Positive
                      </span>
                    </TableCell>

                    
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <ArrowUp class="h-4 w-4 text-green-500" />
                    </TableCell>
                  </TableRow> -->

                </template>
                <template v-else>
                  <TableRow v-for="keyword in analyticsStore.keywordAnalysis.slice(0, 5)" :key="keyword.keyword"
                    class="group hover:bg-gray-50/50 transition-all duration-200">
                    <TableCell class="w-[180px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-700">{{ keyword.keyword }}</span>
                    </TableCell>
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <span class="text-sm sm:text-md text-gray-600">{{ keyword.mentions }}</span>
                    </TableCell>
                    <TableCell class="w-[120px] py-4 px-6 border-b border-gray-200/50">
                      <span
                        class="inline-flex items-center justify-center w-20 px-3 py-1 rounded-md text-sm font-medium"
                        :class="getSentimentColor(getDominantSentiment(keyword))">
                        {{ getDominantSentiment(keyword).charAt(0).toUpperCase() +
                          getDominantSentiment(keyword).slice(1) }}
                      </span>
                    </TableCell>
                    <TableCell class="w-[100px] py-4 px-6 border-b border-gray-200/50">
                      <component :is="getTrendIcon(getKeywordTrend(keyword))" class="h-4 w-4" :class="{
                        'text-green-500': getKeywordTrend(keyword) === 'up',
                        'text-red-500': getKeywordTrend(keyword) === 'down',
                        'text-yellow-500': getKeywordTrend(keyword) === 'stable'
                      }" />
                    </TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
