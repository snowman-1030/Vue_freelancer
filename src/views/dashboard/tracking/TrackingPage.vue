<template>
  <div class="flex-1 p-2 md:p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-8">
      <!-- Welcome Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div class="flex flex-col md:flex-row justify-between items-start">
          <div class="flex-1 text-center md:text-left">
            <h1 class="text-lg md:text-2xl font-medium text-green-800 mb-2 text-center md:textr-left">
              Keyword Tracking
            </h1>
            <p class="text-gray-600 text-sm sm:text-md md:text-lg">
              Monitor specific terms and topics that matter to your brand across the growing community. Our tracking system captures every mention of your chosen keywords, helping you stay ahead of industry trends and consumer preferences. From strain names to product features, understand how your key terms resonate in real-time discussions. Keep pulse on what matters most to your brand's growth and reputation.
												</p>
          </div>
          <div class="w-full max-w-xs sm:max-w-sm md:w-48 md:h-48 flex-shrink-0 relative">
            <img
              :src="analyticsImage"
              alt="Keyword Tracking illustration"
              class="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <TrackingStats />

      <!-- Alert Banner -->
      <Alert class="mb-8 shadow-sm hover:shadow-md transition-all duration-200 border border-red-500/10 bg-gradient-to-br from-red-100/60 to-rose-100/60 rounded-lg flex items-center gap-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-red-100/60 to-rose-100/60 border border-red-500/10">
          <AlertTriangle class="h-5 w-10 text-red-700" />
        </div>
        <div class="flex flex-col">
          <AlertTitle class="text-sm sm:text-base font-semibold text-red-700">Attention</AlertTitle>
          <AlertDescription class="text-sm sm:text-md text-red-700/80 text-left">
            You've reached {{ store.totalKeywords }} of {{ store.keywordLimit }} keywords.
            <a href="#" class="font-medium underline hover:text-red-800 transition-colors">Upgrade to track more</a>
          </AlertDescription>
        </div>
      </Alert>

      <!-- Keyword Form -->
      <KeywordForm />

      <!-- Keywords Table -->
      <KeywordTable />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useTracking } from './composables/useTracking'
import { useAnalyticsStore } from '@/stores/analytics'
import TrackingStats from './components/TrackingStats.vue'
import KeywordForm from './components/KeywordForm.vue'
import KeywordTable from './components/KeywordTable.vue'
import analyticsImage from '@/assets/images/analytics/analytics-green.png'

const store = useTracking()
const analyticsStore = useAnalyticsStore()

onMounted(async () => {
  await Promise.all([
    store.initialize(),
    analyticsStore.fetchAnalyticsData()
  ])
})
</script>
