<script setup lang="ts">
import { onMounted, computed } from 'vue'
import {
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  HeartPulse,
  Timer,
  ArrowRight,
  Trophy,
  Hash,
  Layout,
  Link2,
  Network
} from 'lucide-vue-next'
import { useAnalyticsStore } from '@/stores/analytics'
import { useAuthStore } from '@/stores/auth'
import type { StatCard } from '@/types/analytics'
import SentimentChart from './components/SentimentChart.vue'
import KeywordAnalysis from './components/KeywordAnalysis.vue'
import PlatformSummary from './components/PlatformSummary.vue'
import KeywordCorrelation from './components/KeywordCorrelation.vue'
import FilterPanel from './components/FilterPanel.vue'
import analyticsImage from '@/assets/images/analytics/analytics-green.png'

const analytics = useAnalyticsStore()
const auth = useAuthStore()

// Fetch data on component mount
onMounted(() => {
  analytics.fetchAnalyticsData()
})

// Computed stat cards based on real data
const statCards = computed((): StatCard[] => {
  const stats = analytics.overallStats
  if (!stats) return []

  return [
    { 
      title: "Total Mentions",
      value: stats.totalMentions,
      change: "+15%", // TODO: Calculate actual change
      icon: MessageCircle,
      color: "text-blue-700",
      bgColor: "from-blue-100/60 to-indigo-100/60",
      borderColor: "border-blue-500/10"
    },
    {
      title: "Positive Sentiment",
      value: `${stats.positiveSentiment}%`,
      change: "+5%", // TODO: Calculate actual change
      icon: TrendingUp,
      color: "text-emerald-700",
      bgColor: "from-emerald-100/60 to-green-100/60",
      borderColor: "border-emerald-500/10"
    },
    {
      title: "Negative Sentiment",
      value: `${stats.negativeSentiment}%`,
      change: "-3%", // TODO: Calculate actual change
      icon: TrendingDown,
      color: "text-rose-700",
      bgColor: "from-rose-100/60 to-red-100/60",
      borderColor: "border-rose-500/10"
    },
    {
      title: "Neutral Sentiment",
      value: `${stats.neutralSentiment}%`,
      change: "-2%", // TODO: Calculate actual change
      icon: Minus,
      color: "text-amber-700",
      bgColor: "from-amber-100/60 to-yellow-100/60",
      borderColor: "border-amber-500/10"
    },
  ]
})
</script>

<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Error State -->
      <div v-if="analytics.error" class="text-center py-8">
        <p class="text-red-600">{{ analytics.error }}</p>
        <button
          @click="analytics.fetchAnalyticsData"
          class="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Retry
        </button>
      </div>

      <template v-else>
        <!-- Welcome Section -->
        <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div class="flex flex-col md:flex-row items-center gap-6">
            <div class="flex-1">
              <h1 class="text-xl md:text-2xl font-medium text-green-800 mb-2">
                <span v-if="analytics.isLoading" class="h-9 bg-gray-200 rounded animate-pulse block w-48"></span>
                <span v-else>Hey {{ auth.username || 'there' }}!</span>
              </h1>
              <div v-if="analytics.isLoading" class="space-y-2">
                <div class="h-5 bg-gray-200 rounded animate-pulse w-full"></div>
                <div class="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div class="h-5 bg-gray-200 rounded animate-pulse w-5/6"></div>
              </div>
              <p v-else class="text-gray-600 text-lg">
                Ready to explore your brand's impact? Here's a complete view of what people are saying about you across the growing community. Dive into your latest analytics to understand how your brand resonates with growers and identify opportunities for growth. We track and analyze conversations across all major growing platforms to give you comprehensive insights about your brand's presence and reputation in the community.
              </p>
            </div>
            <div class="w-48 h-48 flex-shrink-0 relative">
              <div v-if="analytics.isLoading" class="w-full h-full bg-gray-200 rounded animate-pulse"></div>
              <img
                v-else
                :src="analyticsImage"
                alt="Analytics illustration"
                class="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        <!-- Summary Section with Skeleton -->
        <div class="mb-8">
          <div class="flex gap-6">
            <div v-if="analytics.isLoading" v-for="i in 4" :key="i" class="bg-gray-50 rounded-lg border border-gray-200 shadow-sm p-4">
              <div class="flex items-center justify-between space-y-0 pb-2">
                <div class="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
                <div class="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div class="h-8 bg-gray-200 rounded animate-pulse w-16 mt-2"></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-32 mt-2"></div>
              </div>
            </div>
            <template v-else>
              <div
                v-for="(card, index) in statCards"
                :key="index"
                class="shadow-sm hover:shadow-md transition-all duration-200 rounded-lg p-6 flex-1 border"
                :class="[`bg-gradient-to-br ${card.bgColor}`, card.borderColor]"
              >
                <div class="flex items-center justify-between mb-4">
                  <h3 :class="[card.color, 'text-sm font-medium']">{{ card.title }}</h3>
                  <component :is="card.icon" :class="[card.color, 'h-4 w-4']" />
                </div>
                <div>
                  <div :class="[card.color, 'text-3xl font-bold']">{{ card.value }}</div>
                  <p :class="[card.color.replace('text-', 'text-opacity-80 text-'), 'text-sm mt-1']">
                    {{ card.change }} from last month
                  </p>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Sentiment Chart with Skeleton -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                <HeartPulse class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-700">Sentiment Over Time</h3>
                <p class="text-base text-gray-500">Trend of positive, negative and neutral mentions</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">
                {{ analytics.filters.dateRange.start.toLocaleDateString() }} - 
                {{ analytics.filters.dateRange.end.toLocaleDateString() }}
              </span>
            </div>
          </div>
          <div v-if="analytics.isLoading" class="h-[300px] bg-gray-50 rounded animate-pulse"></div>
          <div v-else-if="!analytics.sentimentOverTime?.length" class="flex flex-col items-center justify-center h-64 p-6 text-center">
            <div class="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-6">
              <HeartPulse class="w-8 h-8 text-pink-400" />
            </div>

            <!-- Text Content -->
            <h3 class="text-lg font-medium text-gray-700 mb-2">
              No Sentiment History
            </h3>
            <p class="text-gray-500 text-sm mb-5 max-w-[700px]">
              Track how brand sentiment evolves over time. Watch trends and respond to customer perceptions.
            </p>

          </div>
          <SentimentChart
            v-else
            :data="analytics.sentimentOverTime"
            :visible-sentiments="analytics.filters.visibleSentiments"
          />
        </div>

        <!-- Keyword Analysis with Skeleton -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                <Trophy class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-700">Top-Performing Keywords</h3>
                <p class="text-base text-gray-500">Analyze which keywords are getting the most traction and where.</p>
              </div>
            </div>
            <div v-if="analytics.filters.minMentions > 0" class="text-sm text-gray-600">
              Min. {{ analytics.filters.minMentions }} mentions
            </div>
          </div>
          <div v-if="analytics.isLoading" class="space-y-4">
            <div v-for="i in 5" :key="i" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-4">
                <div class="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                <div class="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
              <div class="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
            </div>
          </div>
          <div v-else-if="!analytics.keywordAnalysis?.length" class="flex flex-col items-center justify-center h-64 p-6 text-center">
            <div class="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-6">
              <Trophy class="w-8 h-8 text-purple-400" />
            </div>

            <!-- Text Content -->
            <h3 class="text-lg font-medium text-gray-700 mb-2">
              No Top Keywords Yet
            </h3>
            <p class="text-gray-500 text-sm mb-5 max-w-[700px]">
              Discover which keywords drive engagement. Track performance metrics and optimize brand monitoring.
            </p>

          </div>
          <KeywordAnalysis v-else :data="analytics.keywordAnalysis" />
        </div>

        <!-- Platform Summary with Skeleton -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                <Layout class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-700">Platform Summary</h3>
                <p class="text-base text-gray-500">A visualization of mentions by platform.</p>
              </div>
            </div>
            <div class="text-sm text-gray-600">
              Sorted by {{ analytics.filters.sortBy }}
            </div>
          </div>
          <div v-if="analytics.isLoading" class="h-[300px] bg-gray-50 rounded animate-pulse"></div>
          <div v-else-if="!analytics.platformSummary?.length" class="flex flex-col items-center justify-center h-64 p-6 text-center">
            <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Layout class="w-8 h-8 text-blue-400" />
            </div>

            <!-- Text Content -->
            <h3 class="text-lg font-medium text-gray-700 mb-2">
              No Platform Data
            </h3>
            <p class="text-gray-500 text-sm mb-5 max-w-[700px]">
              Get insights across cannabis community platforms. Connect your first platform to track performance.
            </p>

          </div>
          <PlatformSummary v-else :data="analytics.platformSummary" />
        </div>

        <!-- Keyword Correlation with Skeleton -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                <Network class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-700">Keyword Correlation</h3>
                <p class="text-base text-gray-500">Analyze how keywords correlate with sentiment.</p>
              </div>
            </div>
            <div class="text-sm text-gray-600">
              {{ analytics.filters.platforms.length ? analytics.filters.platforms.join(', ') : 'All Platforms' }}
            </div>
          </div>
          <div v-if="analytics.isLoading" class="h-[300px] bg-gray-50 rounded animate-pulse"></div>
          <div v-else-if="!analytics.keywordCorrelation?.length" class="flex flex-col items-center justify-center h-64 p-6 text-center">
            <div class="w-16 h-16 bg-lime-50 rounded-full flex items-center justify-center mb-6">
              <Network class="w-8 h-8 text-lime-500" />
            </div>

            <!-- Text Content -->
            <h3 class="text-lg font-medium text-gray-700 mb-2">
              No Correlations Found
            </h3>
            <p class="text-gray-500 text-sm mb-5 max-w-[700px]">
              Discover relationships between keywords and topics. Add keywords to reveal brand patterns.
            </p>

          </div>
          <KeywordCorrelation v-else :data="analytics.keywordCorrelation" />
        </div>
      </template>
    </div>

    <!-- Filter Panel -->
    <FilterPanel />
  </div>
</template>
