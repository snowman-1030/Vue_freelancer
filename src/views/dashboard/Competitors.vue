<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Shield, TrendingUp, AlertTriangle, ExternalLink, ThumbsUp, ThumbsDown, Meh, MessagesSquare, Loader2, Plus, Trash, Bell, BarChart2, MessageCircle } from 'lucide-vue-next'
import analyticsImage from '@/assets/images/analytics/analytics-green.png'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import LoadingDialog from '@/components/ui/loading-dialog.vue'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import { competitorService } from '@/services/competitors'
import ForumMetrics from '@/components/dashboard/ForumMetrics.vue'
import { useCompetitorStore } from '@/stores/competitors'

use([GridComponent, TooltipComponent, LegendComponent, BarChart, CanvasRenderer])

// Store
const competitorStore = useCompetitorStore()

// Polling state
const pollingInterval = ref<number | null>(null)

// Discussion Filters
const activeTab = ref('')
const activeSentiment = ref<string | null>(null)

// Computed tabs based on competitors, excluding logged-in user
const discussionTabs = computed(() => {
  return competitorStore.competitors
    .filter(competitor => !competitor.isMain)
    .map(competitor => ({
      id: competitor.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      label: competitor.name
    }))
})

// Start polling if needed
const startPolling = () => {
  if (!pollingInterval.value && competitorStore.scrapersRunning) {
    pollingInterval.value = window.setInterval(() => {
      competitorStore.loadCompetitorData()
    }, 10000)
  }
}

// Stop polling
const stopPolling = () => {
  if (pollingInterval.value) {
    window.clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

// Filtered discussions based on active tab and sentiment
const filteredDiscussions = computed(() => {
  if (!activeTab.value) {
    return []
  }
  return competitorStore.recentDiscussions.filter(discussion => {
    const matchesCompetitor = discussion.competitor.toLowerCase().replace(/[^a-z0-9]/g, '') === activeTab.value
    const matchesSentiment = !activeSentiment.value || discussion.sentiment === activeSentiment.value
    return matchesCompetitor && matchesSentiment
  })
})

// Add Competitor State
const showAddPopover = ref(false)
const newCompetitorName = ref('')
const addingCompetitor = ref(false)
const addError = ref<string | null>(null)
const showLoadingDialog = ref(false)

// We already have polling logic in the store, so we'll use that instead
// of managing our own interval

// Delete Competitor State
const deletingCompetitor = ref<string | null>(null)

// Add competitor
const addCompetitor = async () => {
  if (!newCompetitorName.value.trim()) {
    addError.value = 'Please enter a competitor name'
    return
  }

  try {
    addingCompetitor.value = true
    addError.value = null
    showLoadingDialog.value = true
    
    // Create competitor (which will also trigger scraping)
    const term = newCompetitorName.value.trim()
    const result = await competitorService.createCompetitor(term)
    
    // Initial data load
    await competitorStore.loadCompetitorData()
    
    // Keep dialog open if scrapers are running
    if (result.scrapersRunning) {
      // Start store's polling mechanism
      startPolling()
      
      // Keep polling until we have actual data
      showLoadingDialog.value = true
      const term = newCompetitorName.value.trim()
      
      // Start polling for data
      const checkData = async () => {
        await competitorStore.loadCompetitorData()
        const competitor = competitorStore.competitors.find(c => c.name === term)
        
        // Keep polling until we have mentions data for the new competitor
        if (!competitor?.mentions) {
          setTimeout(checkData, 5000)
        } else {
          showLoadingDialog.value = false
          showAddPopover.value = false
          newCompetitorName.value = ''
        }
      }
      
      // Clear form immediately and start polling
      showAddPopover.value = false
      newCompetitorName.value = ''
      checkData()
    } else {
      showLoadingDialog.value = false
    }
  } catch (e) {
    addError.value = e instanceof Error ? e.message : 'Failed to add competitor. Please try again.'
    console.error('Error adding competitor:', e)
    showLoadingDialog.value = false
  } finally {
    addingCompetitor.value = false
  }
}

// Delete competitor
const deleteCompetitor = async (term: string) => {
  if (!confirm(`Are you sure you want to delete "${term}" from your competitors? This action cannot be undone.`)) {
    return
  }

  try {
    deletingCompetitor.value = term
    await competitorService.deleteCompetitor(term)
    await competitorStore.loadCompetitorData() // Use store method
  } catch (e) {
    competitorStore.error = e instanceof Error ? e.message : 'Failed to delete competitor. Please try again.'
    console.error('Error deleting competitor:', e)
  } finally {
    deletingCompetitor.value = null
  }
}

// Load data when component mounts and clean up on unmount
onMounted(() => {
  // Load initial data
  competitorStore.loadCompetitorData().then(() => {
    // Set initial active tab
    const firstCompetitor = competitorStore.competitors.find(c => !c.isMain)
    if (firstCompetitor) {
      activeTab.value = firstCompetitor.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    }
    // Start polling if needed
    if (competitorStore.scrapersRunning) {
      startPolling()
    }
  })
})

onUnmounted(() => {
  stopPolling()
})

// Methods
const getCompetitorColor = (competitorName: string) => {
  const competitor = competitorStore.competitors.find(c => c.name === competitorName)
  return competitor ? competitor.color : 'gray'
}

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return ThumbsUp
    case 'negative':
      return ThumbsDown
    default:
      return Meh
  }
}

// Chart options
const chartOption = computed(() => ({
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value'
  },
  yAxis: {
    type: 'category',
    data: competitorStore.sentimentData.map(item => item.name)
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['Positive', 'Neutral', 'Negative']
  },
  series: [
    {
      name: 'Positive',
      type: 'bar',
      stack: 'total',
      data: competitorStore.sentimentData.map(item => item.positive),
      itemStyle: { color: '#86efac' }
    },
    {
      name: 'Neutral',
      type: 'bar',
      stack: 'total',
      data: competitorStore.sentimentData.map(item => item.neutral),
      itemStyle: { color: '#fde68a' }
    },
    {
      name: 'Negative',
      type: 'bar',
      stack: 'total',
      data: competitorStore.sentimentData.map(item => item.negative),
      itemStyle: { color: '#fca5a5' }
    }
  ]
}))
</script>

<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Welcome Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-bold text-green-800 mb-2">
              Competitor Monitoring
            </h1>
            <p class="text-gray-600 text-lg">
              Keep your finger on the pulse of the market. Track how your competitors are performing across the growing community and understand where your brand stands. We analyze discussions, sentiment, and trends across all major growing platforms to give you real-time insights into market dynamics.
            </p>
          </div>
          <div class="w-48 h-48 flex-shrink-0 relative">
            <img
              :src="analyticsImage"
              alt="Competitor Monitoring illustration"
              class="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      <!-- Add Competitor Button -->
      <div class="flex justify-end mb-6">
        <Popover v-model:open="showAddPopover">
          <PopoverTrigger>
            <Button class="bg-green-600 hover:bg-green-700 text-white">
              <Plus class="h-4 w-4 mr-2" />
              Add Competitor
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-80">
            <div class="space-y-4">
              <h3 class="font-semibold">Add New Competitor</h3>
              <div>
                <Input
                  v-model="newCompetitorName"
                  placeholder="Enter competitor name"
                  :disabled="addingCompetitor"
                  @keyup.enter="addCompetitor"
                />
                <p v-if="addError" class="mt-2 text-sm text-red-600">{{ addError }}</p>
              </div>
              <div class="flex justify-end gap-2">
                <Button
                  variant="outline"
                  @click="showAddPopover = false"
                  :disabled="addingCompetitor"
                >
                  Cancel
                </Button>
                <Button
                  @click="addCompetitor"
                  :disabled="addingCompetitor"
                  class="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Loader2 v-if="addingCompetitor" class="h-4 w-4 mr-2 animate-spin" />
                  <Plus v-else class="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <!-- Empty State -->
      <div v-if="!competitorStore.competitors.length && !competitorStore.isLoading" class="text-center p-12 bg-white rounded-lg shadow-sm">
        <Shield class="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No competitors added yet</h3>
        <p class="text-gray-500 mb-4">Add your first competitor to start monitoring their presence across growing communities.</p>
        <Button class="bg-green-600 hover:bg-green-700 text-white" @click="showAddPopover = true">
          <Plus class="h-4 w-4 mr-2" />
          Add Your First Competitor
        </Button>
      </div>

      <!-- Loading State -->
      <template v-else-if="competitorStore.isLoading">
        <!-- Competitor Cards Skeleton -->
        <Card>
          <CardHeader class="bg-gray-50">
            <CardTitle class="text-green-800">Competitor Overview</CardTitle>
          </CardHeader>
          <CardContent class="pt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div v-for="i in 4" :key="i" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <div class="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div class="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div class="space-y-2">
                  <div class="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Priority Alerts Skeleton -->
        <Card class="mt-6">
          <CardHeader class="bg-gray-50">
            <CardTitle class="text-green-800">Priority Alerts</CardTitle>
          </CardHeader>
          <CardContent class="pt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="i in 3" :key="i" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="flex items-start space-x-4">
                  <div class="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div class="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div class="flex items-center gap-2">
                      <div class="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div class="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Sentiment Chart Skeleton -->
        <Card class="mt-6">
          <CardHeader class="bg-gray-50">
            <CardTitle class="text-green-800">Sentiment Comparison</CardTitle>
          </CardHeader>
          <CardContent class="pt-6">
            <div class="h-[400px] bg-gray-50 rounded-lg border border-gray-200 animate-pulse"></div>
          </CardContent>
        </Card>

        <!-- Recent Discussions Skeleton -->
        <Card class="mt-6">
          <CardHeader class="bg-gray-50">
            <CardTitle class="text-green-800">Recent Discussions</CardTitle>
          </CardHeader>
          <CardContent class="pt-6">
            <div class="flex gap-2 mb-4">
              <div v-for="i in 3" :key="i" class="h-9 bg-gray-200 rounded animate-pulse w-24"></div>
            </div>
            <div class="space-y-4">
              <div v-for="i in 3" :key="i" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div class="space-y-2">
                      <div class="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                      <div class="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    </div>
                  </div>
                  <div class="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
                <div class="space-y-2">
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </template>

      <!-- Error State -->
      <div v-else-if="competitorStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <AlertTriangle class="h-5 w-5 text-red-500 mr-2" />
          <p class="text-red-700">{{ competitorStore.error }}</p>
        </div>
        <Button class="mt-2" variant="outline" @click="competitorStore.loadCompetitorData">
          Retry
        </Button>
      </div>

      <!-- Data View -->
      <template v-else>
        <!-- Competitor Cards -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                <Shield class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <CardTitle class="text-lg font-medium text-gray-700">Competitor Overview</CardTitle>
                <p class="text-base text-gray-500">Track and analyze competitor performance</p>
              </div>
            </div>
          </CardHeader>
          <CardContent class="pt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card
                v-for="(competitor, index) in competitorStore.competitors"
                :key="index"
                :class="cn(`bg-${competitor.color}-50 border-${competitor.color}-200`)"
              >
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle class="text-sm font-medium">
                    {{ competitor.name }}
                    <Badge
                      v-if="competitor.isMain"
                      :class="cn(`ml-2 bg-${competitor.color}-100 text-${competitor.color}-800`)"
                    >
                      Main
                    </Badge>
                    <Badge
                      v-if="competitor.name === 'Your Brand'"
                      class="ml-2 bg-green-100 text-green-800"
                    >
                      Primary
                    </Badge>
                  </CardTitle>
                  <div class="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      class="text-red-600 hover:text-red-800 hover:bg-red-100"
                      @click="deleteCompetitor(competitor.name)"
                      :disabled="deletingCompetitor === competitor.name || competitor.updating"
                    >
                      <Loader2 v-if="deletingCompetitor === competitor.name" class="h-4 w-4 animate-spin" />
                      <Trash v-else class="h-4 w-4" />
                    </Button>
                    <Shield :class="cn(`h-4 w-4 text-${competitor.color}-500`)" />
                  </div>
                </CardHeader>
                <CardContent>
                  <!-- Show loading spinner when updating -->
                  <div v-if="competitor.updating" class="flex flex-col items-center justify-center py-4">
                    <Loader2 class="h-8 w-8 animate-spin text-green-600 mb-2" />
                    <p class="text-sm text-gray-600">Collecting data...</p>
                  </div>
                  <template v-else>
                    <div class="text-2xl font-bold">{{ competitor.mentions.toLocaleString() }}</div>
                    <p class="text-xs text-muted-foreground">
                      Total Mentions
                    </p>
                    <div class="mt-4 flex items-center">
                      <TrendingUp :class="cn(`h-4 w-4 text-${competitor.color}-500 mr-2`)" />
                      <span :class="cn(`text-sm font-medium text-${competitor.color}-600`)">
                        {{ competitor.sentiment }}% Positive Sentiment
                      </span>
                    </div>
                  </template>
                </CardContent>
              </Card>
            </div>
            <div class="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
              <p class="text-sm text-gray-700 font-medium">
                Monitor how your brand and competitors perform across growing communities. Each card shows total mentions and overall sentiment trends, helping you track relative market presence and community perception. This snapshot gives you quick insights into how your brand stands against key players in the market.
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Sentiment Comparison Chart -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                <BarChart2 class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <CardTitle class="text-lg font-medium text-gray-700">Sentiment Comparison</CardTitle>
                <p class="text-base text-gray-500">Compare sentiment across competitors</p>
              </div>
            </div>
          </CardHeader>
          <CardContent class="pt-6">
            <template v-if="!competitorStore.isLoading && !competitorStore.error && (!competitorStore.sentimentData.length || competitorStore.sentimentData.every(item => !item.positive && !item.neutral && !item.negative))">
              <div class="flex flex-col items-center justify-center h-64 p-6 text-center">
                <div class="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-6">
                  <BarChart2 class="w-8 h-8 text-teal-400" />
                </div>

                <!-- Text Content -->
                <h3 class="text-lg font-medium text-gray-700 mb-2">
                  No Sentiment Data Yet
                </h3>
                <p class="text-gray-500 text-sm mb-5 max-w-[700px]">
                  Track sentiment trends and compare brand performance across different competitor mentions.
                </p>

              </div>
            </template>
            <template v-else>
              <div class="h-[400px]">
                <VChart :option="chartOption" autoresize />
              </div>
            </template>
            <div class="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
              <p class="text-sm text-gray-700 font-medium">
                Compare how different brands are perceived in growing community discussions. The bars show the proportion of positive (green), neutral (yellow), and negative (red) mentions for each brand, letting you benchmark your reputation against competitors. This comparison helps identify where your brand stands out and where there might be opportunities to improve relative to other players in the market.
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Priority Alerts -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                <Bell class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <CardTitle class="text-lg font-medium text-gray-700">Priority Alerts</CardTitle>
                <p class="text-base text-gray-500">Important updates and notifications</p>
              </div>
            </div>
          </CardHeader>
          <CardContent class="pt-6">
            <div v-if="!competitorStore.isLoading && !competitorStore.error && !competitorStore.priorityAlerts.length" class="flex flex-col items-center justify-center h-64 p-6 text-center">
              <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <Bell class="w-8 h-8 text-red-400" />
              </div>

              <!-- Text Content -->
              <h3 class="text-lg font-medium text-gray-700 mb-2">
                No Priority Alerts
              </h3>
              <p class="text-gray-500 text-sm mb-5 max-w-[700px]">
                Configure your alert preferences to get notified about important brand mentions and market changes.
              </p>

            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="(alert, index) in competitorStore.priorityAlerts"
                :key="index"
                :class="cn(`p-4 rounded-lg flex items-start space-x-4 bg-${getCompetitorColor(alert.competitor)}-50 border border-${getCompetitorColor(alert.competitor)}-200`)"
              >
                <AlertTriangle :class="cn(`h-5 w-5 text-${getCompetitorColor(alert.competitor)}-500`)" />
                <div class="flex-1">
                  <h3 :class="cn(`font-semibold text-${getCompetitorColor(alert.competitor)}-800`)">
                    {{ alert.competitor }}
                  </h3>
                  <p class="text-sm text-gray-600">{{ alert.description }}</p>
                  <div class="flex items-center mt-2">
                    <Badge
                      :class="cn(`mr-2 ${
                        alert.importance === 'urgent' ? 'bg-red-100 text-red-800' :
                        alert.importance === 'important' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`)"
                    >
                      {{ alert.importance }}
                    </Badge>
                    <span class="text-xs text-gray-500">{{ alert.time }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
              <p class="text-sm text-gray-700 font-medium">
                Stay ahead of significant market developments. These alerts highlight important changes in competitor activities, from notable sentiment shifts to new product discussions and emerging trends. Real-time notifications ensure you never miss crucial developments that could impact your market position in the growing community.
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Forum Activity -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                <MessagesSquare class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <CardTitle class="text-lg font-medium text-gray-700">Forum Activity</CardTitle>
                <p class="text-base text-gray-500">Track engagement across platforms</p>
              </div>
            </div>
          </CardHeader>
          <CardContent class="pt-6">
            <template v-if="!competitorStore.isLoading && !competitorStore.error && !competitorStore.forumActivities">
              <div class="flex flex-col items-center justify-center h-64 p-6 text-center">
                <div class="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                  <MessagesSquare class="w-8 h-8 text-indigo-400" />
                </div>

                <!-- Text Content -->
                <h3 class="text-lg font-medium text-gray-700 mb-2">
                  No Forum Activity Yet
                </h3>
                <p class="text-gray-500 text-sm mb-5 max-w-[700px]">
                  Monitor brand discussions and engagement metrics across cannabis community forums.
                </p>

              </div>
            </template>
            <template v-else>
              <ForumMetrics :competitors="competitorStore.competitors" />
            </template>
            <div class="mt-4 p-3 bg-gray-100 border border-gray-200 rounded-lg">
              <p class="text-xs text-gray-700 font-medium">
                Track brand mentions across key cannabis forums. Monitor trends and engagement levels to understand where your audience is most active and how discussions are evolving. This data helps you focus your efforts on the most impactful platforms.
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Recent Discussions -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                <MessageCircle class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <CardTitle class="text-lg font-medium text-gray-700">Recent Discussions</CardTitle>
                <p class="text-base text-gray-500">Latest conversations and mentions</p>
              </div>
            </div>
          </CardHeader>
          <CardContent class="pt-6">
            <!-- Discussion Tabs -->
            <div class="flex flex-wrap gap-2 mb-4">
              <Button
                v-for="tab in discussionTabs"
                :key="tab.id"
                :variant="activeTab === tab.id ? 'default' : 'outline'"
                :class="activeTab === tab.id ? 'bg-green-600 text-white hover:bg-green-700 px-4 py-2' : 'hover:bg-gray-100 px-4 py-2'"
                @click="activeTab = tab.id"
              >
                {{ tab.label }}
              </Button>
            </div>

            <!-- Sentiment Filter Buttons -->
            <div class="flex flex-wrap gap-2 mb-4">
              <Button
                variant="outline"
                :class="cn(
                  'hover:bg-green-100',
                  activeSentiment === 'positive' ? 'bg-green-100 text-green-800 border-green-600' : 'text-gray-600'
                )"
                @click="activeSentiment = activeSentiment === 'positive' ? null : 'positive'"
              >
                <ThumbsUp class="h-4 w-4 mr-2" />
                Positive
              </Button>
              <Button
                variant="outline"
                :class="cn(
                  'hover:bg-yellow-100',
                  activeSentiment === 'neutral' ? 'bg-yellow-100 text-yellow-800 border-yellow-600' : 'text-gray-600'
                )"
                @click="activeSentiment = activeSentiment === 'neutral' ? null : 'neutral'"
              >
                <Meh class="h-4 w-4 mr-2" />
                Neutral
              </Button>
              <Button
                variant="outline"
                :class="cn(
                  'hover:bg-red-100',
                  activeSentiment === 'negative' ? 'bg-red-100 text-red-800 border-red-600' : 'text-gray-600'
                )"
                @click="activeSentiment = activeSentiment === 'negative' ? null : 'negative'"
              >
                <ThumbsDown class="h-4 w-4 mr-2" />
                Negative
              </Button>
            </div>

            <div v-if="!competitorStore.isLoading && !competitorStore.error && !filteredDiscussions.length" class="flex flex-col items-center justify-center h-64 p-6 text-center">
              <div class="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mb-6">
                <MessageCircle class="w-8 h-8 text-cyan-400" />
              </div>

              <!-- Text Content -->
              <h3 class="text-lg font-medium text-gray-700 mb-2">
                No Recent Discussions
              </h3>
              <p class="text-gray-500 text-sm mb-5 max-w-[700px]">
                Track real-time brand discussions and competitor mentions across the community.
              </p>

            </div>
            <div v-else-if="filteredDiscussions.length > 0" class="space-y-4">
              <Card
                v-for="(discussion, index) in filteredDiscussions"
                :key="index"
                :class="cn(`bg-${getCompetitorColor(discussion.competitor)}-50 border-${getCompetitorColor(discussion.competitor)}-200 overflow-hidden`)"
              >
                <CardContent class="p-4">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <Avatar :class="cn(`bg-${getCompetitorColor(discussion.competitor)}-200`)">
                        <AvatarFallback>{{ discussion.competitor[0] }}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 :class="cn(`font-semibold text-${getCompetitorColor(discussion.competitor)}-800`)">
                          {{ discussion.competitor }}
                        </h4>
                        <p class="text-xs text-gray-500">{{ discussion.forum }} • {{ discussion.time }}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      :class="cn(
                        discussion.sentiment === 'positive' && 'border-green-500 bg-green-50 text-green-700',
                        discussion.sentiment === 'negative' && 'border-red-500 bg-red-50 text-red-700',
                        discussion.sentiment === 'neutral' && 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      )"
                    >
                      <component 
                        :is="getSentimentIcon(discussion.sentiment)" 
                        :class="cn(
                          'mr-1 h-4 w-4',
                          discussion.sentiment === 'positive' && 'text-green-700',
                          discussion.sentiment === 'negative' && 'text-red-700',
                          discussion.sentiment === 'neutral' && 'text-yellow-700'
                        )"
                      />
                      {{ discussion.sentiment }}
                    </Badge>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">{{ discussion.content }}</p>
                  <div class="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      :class="cn(`text-${getCompetitorColor(discussion.competitor)}-600 hover:text-${getCompetitorColor(discussion.competitor)}-800`)"
                    >
                      <ExternalLink class="h-4 w-4 mr-1" />
                      View Thread
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div class="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
              <p class="text-sm text-gray-700 font-medium">
                Stay informed with real-time discussions about your brand and competitors. Quickly gauge sentiment and identify emerging topics or concerns in the community.
              </p>
            </div>
          </CardContent>
        </Card>
      </template>
    </div>
  </div>
  <LoadingDialog v-model:open="showLoadingDialog" />
</template>
