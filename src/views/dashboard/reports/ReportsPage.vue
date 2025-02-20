<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col space-y-6">
        <!-- Welcome Section -->
        <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div class="flex flex-col md:flex-row items-center gap-6">
            <div class="flex-1">
              <h1 class="text-xl md:text-2xl font-medium text-green-800 mb-2">
                Brand Reports
              </h1>
              <p class="text-gray-600 text-lg">
                Export detailed reports to gain valuable insights into your brand's online presence and performance. Generate custom reports covering sentiment analysis, engagement metrics, competitor data, and market trends. These reports help you track growth, identify opportunities, and make data-driven decisions. Select your preferred format and date range to create reports that serve your specific business needs.
              </p>
            </div>
            <div class="w-48 h-48 flex-shrink-0 relative">
              <img
                src="/src/assets/images/dashboard/task-management.png"
                alt="Team analyzing reports and data"
                class="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="reportStore.error" class="mb-4">
          <Alert variant="destructive">
            {{ reportStore.error }}
          </Alert>
        </div>

        <!-- Report Content -->
        <div v-else class="space-y-6">
          <!-- Filters Card -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg font-medium text-gray-700">Report Filters</CardTitle>
              <CardDescription class="text-base">
                Customize your report by selecting specific date ranges, platforms, and sentiment types to focus your analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Date Range -->
                <div class="flex flex-col space-y-4 mb-4 md:mb-0">
                  <div class="flex items-center space-x-2">
                    <div class="p-2 bg-gray-100 rounded-md">
                      <Calendar class="h-5 w-5 text-gray-500" />
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                      <Input
                        v-model="filters.startDate"
                        type="date"
                        placeholder="Start Date (YYYY-MM-DD)"
                        class="w-full"
                        @change="handleFilterUpdate"
                      />
                      <Input
                        v-model="filters.endDate"
                        type="date"
                        placeholder="End Date (YYYY-MM-DD)"
                        class="w-full"
                        @change="handleFilterUpdate"
                      />
                    </div>
                  </div>
                </div>

                <!-- Platform Filter -->
                <div class="flex flex-col space-y-4">
                  <div class="flex items-center space-x-2">
                    <div class="p-2 bg-gray-100 rounded-md">
                      <Globe class="h-5 w-5 text-gray-500" />
                    </div>
                    <Select v-model="filters.platform" @update:modelValue="handleFilterUpdate">
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-platforms">All Platforms</SelectItem>
                        <SelectItem
                          v-for="source in reportStore.availableSources"
                          :key="source"
                          :value="source"
                        >
                          {{ source.replace(/\.com$/, '').replace(/\./g, ' ') }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <!-- Keyword Filter -->
                <div class="flex flex-col space-y-4">
                  <div class="flex items-center space-x-2">
                    <div class="p-2 bg-gray-100 rounded-md">
                      <Search class="h-5 w-5 text-gray-500" />
                    </div>
                    <Input
                      v-model="filters.keyword"
                      type="text"
                      placeholder="Filter by keyword"
                      class="w-full"
                      @input="handleFilterUpdate"
                    />
                  </div>
                </div>

                <!-- Sentiment Filter -->
                <div class="flex flex-col space-y-4">
                  <div class="flex items-center space-x-2">
                    <div class="p-2 bg-gray-100 rounded-md">
                      <ThumbsUp class="h-5 w-5 text-gray-500" />
                    </div>
                    <Select v-model="filters.sentiment" @update:modelValue="handleFilterUpdate">
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a sentiment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-sentiments">All Sentiments</SelectItem>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <!-- Report Content Card -->
          <Card>
            <CardHeader class="flex flex-row justify-between items-center px-6">
              <div class="flex items-center gap-3">
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50">
                  <FileText class="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle class="text-lg font-medium text-gray-700">Report</CardTitle>
                  <p class="text-base text-gray-500 mt-1">
                    View and analyze sentiment data across different cannabis community platforms for your brand.
                  </p>
                </div>
              </div>
              <div class="flex space-x-4">
                <Button
                  class="bg-yellow-200 text-yellow-800 hover:bg-yellow-300 relative"
                  @click="handleExport('pdf')"
                  :disabled="isExporting"
                >
                  <LoadingSpinner v-if="isExporting" size="sm" class="absolute left-2" />
                  <span :class="{ 'pl-6': isExporting }">
                    Export as PDF
                  </span>
                </Button>
                <Button
                  class="bg-green-200 text-green-800 hover:bg-green-300 relative"
                  @click="handleExport('csv')"
                  :disabled="isExporting"
                >
                  <LoadingSpinner v-if="isExporting" size="sm" class="absolute left-2" />
                  <span :class="{ 'pl-6': isExporting }">
                    Export as CSV
                  </span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs v-model="selectedTab">
                <TabsList class="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-6">
                  <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
                  <TabsTrigger value="sentiment-by-platform">Sentiment by Platform</TabsTrigger>
                  <TabsTrigger value="source-breakdown">Source Breakdown</TabsTrigger>
                  <TabsTrigger value="sentiment-trends">Sentiment Trends</TabsTrigger>
                  <TabsTrigger value="source-distribution">Source Distribution</TabsTrigger>
                  <TabsTrigger value="keyword-analysis">Keyword Analysis</TabsTrigger>
                </TabsList>

                <!-- Tab Content -->
                <TabsContent value="sentiment">
                  <Card>
                    <CardContent class="pt-6">
                      <div v-if="reportStore.isLoading" class="h-[300px] flex items-center justify-center">
                        <LoadingSpinner size="lg" />
                      </div>
                      <UnifiedSentimentChart
                        ref="sentimentChartRef"
                        v-else-if="reportStore.sentimentData?.data.sentimentScore"
                        :score="reportStore.sentimentData.data.sentimentScore.value"
                        :total="analyticsStore.overallStats?.totalMentions ?? 0"
                        :data="reportStore.sentimentData.data.sentimentCounts ?? []"
                      />
                      <div v-else class="h-[300px] flex items-center justify-center text-gray-500">
                        No sentiment data available
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sentiment-by-platform">
                  <Card>
                    <CardContent class="pt-6">
                      <div v-if="reportStore.isLoading" class="h-[300px] flex items-center justify-center">
                        <LoadingSpinner size="lg" />
                      </div>
                      <SentimentChart
                        ref="platformSentimentChartRef"
                        v-else-if="reportStore.sentimentData?.data.platformSentiment"
                        :data="reportStore.sentimentData.data.platformSentiment"
                        :group-by="'source'"
                        title="Platform Sentiment Analysis"
                        description="Breakdown of sentiment across different platforms and sources"
                      />
                      <div v-else class="h-[300px] flex items-center justify-center text-gray-500">
                        No platform sentiment data available
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="source-breakdown">
                  <Card>
                    <CardContent class="pt-6">
                      <div v-if="reportStore.isLoading" class="h-[300px] flex items-center justify-center">
                        <LoadingSpinner size="lg" />
                      </div>
                      <SourceBreakdownChart
                        ref="sourceBreakdownChartRef"
                        v-else-if="reportStore.sourceData?.data.sourceCounts"
                        :data="reportStore.sourceData.data.sourceCounts"
                        title="Content Source Distribution"
                        description="Distribution of content across different platforms and sources"
                      />
                      <div v-else class="h-[300px] flex items-center justify-center text-gray-500">
                        No source data available
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sentiment-trends">
                  <Card>
                    <CardContent class="pt-6">
                      <div v-if="reportStore.isLoading" class="h-[300px] flex items-center justify-center">
                        <LoadingSpinner size="lg" />
                      </div>
                      <TrendChart
                        ref="sentimentTrendChartRef"
                        v-else-if="reportStore.sentimentData?.data.sentimentTrends"
                        :data="reportStore.sentimentData.data.sentimentTrends"
                        :start-date="filters.startDate"
                        :end-date="filters.endDate"
                        title="Sentiment Trends Over Time"
                      />
                      <div v-else class="h-[300px] flex items-center justify-center text-gray-500">
                        No trend data available
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="source-distribution">
                  <Card>
                    <CardContent class="pt-6">
                      <div v-if="reportStore.isLoading" class="h-[300px] flex items-center justify-center">
                        <LoadingSpinner size="lg" />
                      </div>
                      <TrendChart
                        ref="sourceTrendChartRef"
                        v-else-if="reportStore.sourceData?.data.sourceTrends"
                        :data="reportStore.sourceData.data.sourceTrends"
                        :start-date="filters.startDate"
                        :end-date="filters.endDate"
                        title="Source Distribution Over Time"
                      />
                      <div v-else class="h-[300px] flex items-center justify-center text-gray-500">
                        No trend data available
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="keyword-analysis">
                  <Card>
                    <CardContent class="pt-6">
                      <div v-if="reportStore.isLoading" class="h-[300px] flex items-center justify-center">
                        <LoadingSpinner size="lg" />
                      </div>
                      <div v-else-if="reportStore.keywordData?.data.keywords">
                        <div class="flex flex-col bg-white rounded-lg shadow-sm">
                          <div class="p-6">
                            <h3 class="text-xl font-semibold text-green-800 mb-2">Keyword Analysis</h3>
                            <p class="text-gray-600 mb-4">Analysis of keyword mentions with sentiment breakdown</p>
                            <KeywordAnalysisGrid :keywords="reportStore.keywordData.data.keywords" />
                          </div>
                        </div>

                        <!-- Insights Panel -->
                        <InsightPanel
                          :insights="insightService.analyzeKeywords(reportStore.keywordData.data.keywords)"
                          class="mt-4"
                        />
                      </div>
                      <div v-else class="h-[300px] flex items-center justify-center text-gray-500">
                        No keyword data available
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue imports
import { ref, onMounted } from 'vue'

// Services
import { ExportService } from '../../../services/ExportService'
import type { ChartExport } from '../../../services/ExportService'
import { InsightService } from '../../../services/InsightService'
import { saveAs } from 'file-saver'

// Component imports
import { Button } from '../../../components/ui/button'
import { Alert } from '../../../components/ui/alert'
import { LoadingSpinner } from '../../../components/ui/loading'
import UnifiedSentimentChart from './components/charts/UnifiedSentimentChart.vue'
import SentimentChart from './components/charts/SentimentChart.vue'
import SourceBreakdownChart from './components/charts/SourceBreakdownChart.vue'
import TrendChart from './components/charts/TrendChart.vue'
import KeywordAnalysisGrid from './components/charts/KeywordAnalysisGrid.vue'
import InsightPanel from '../../../components/insights/InsightPanel.vue'
// Additional UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'

// Icons
import { Calendar, Globe, Search, ThumbsUp, FileText } from 'lucide-vue-next'

// Store imports
import { useReportStore } from '../../../stores/reportStore'
import { useAuthStore } from '../../../stores/auth'
import { useAnalyticsStore } from '../../../stores/analytics'

// Type imports
import type { ReportFilter } from '../../../types/reports'

// Props and emits
const props = defineProps<{
  initialFilters?: Partial<ReportFilter>
}>()

// Store setup
const reportStore = useReportStore()
const authStore = useAuthStore()
const analyticsStore = useAnalyticsStore()

// Services
const insightService = new InsightService()

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Get default date range (last 30 days)
const today = new Date()
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(today.getDate() - 30)

// Services
const exportService = new ExportService()

// Chart refs
const sentimentChartRef = ref<InstanceType<typeof UnifiedSentimentChart> | null>(null)
const platformSentimentChartRef = ref<InstanceType<typeof SentimentChart> | null>(null)
const sourceBreakdownChartRef = ref<InstanceType<typeof SourceBreakdownChart> | null>(null)
const sentimentTrendChartRef = ref<InstanceType<typeof TrendChart> | null>(null)
const sourceTrendChartRef = ref<InstanceType<typeof TrendChart> | null>(null)

// Local state
const selectedTab = ref('sentiment')
const isExporting = ref(false)
const filters = ref<ReportFilter>({
  startDate: props.initialFilters?.startDate ?? '',
  endDate: props.initialFilters?.endDate ?? '',
  platform: props.initialFilters?.platform ?? 'all-platforms',
  keyword: props.initialFilters?.keyword ?? '',
  sentiment: props.initialFilters?.sentiment ?? 'all-sentiments'
})

// Methods
async function handleFilterUpdate() {
  // Ensure analytics data is fetched first
  await analyticsStore.fetchAnalyticsData()
  
  await Promise.all([
    reportStore.fetchSentimentReport(filters.value),
    reportStore.fetchSourceBreakdown(filters.value),
    reportStore.fetchKeywordMentions(filters.value)
  ])
}

async function handleExport(format: 'csv' | 'pdf') {
  try {
    isExporting.value = true
    
    // Collect chart images for PDF export
    const chartImages = new Map<string, ChartExport>()
    if (format === 'pdf') {
      const charts = {
        'Sentiment Analysis': sentimentChartRef.value,
        'Platform Sentiment': platformSentimentChartRef.value,
        'Source Breakdown': sourceBreakdownChartRef.value,
        'Sentiment Trends': sentimentTrendChartRef.value,
        'Source Distribution': sourceTrendChartRef.value
      }

      for (const [name, chart] of Object.entries(charts)) {
        if (chart) {
          const dataUrl = await chart.exportToImage({
            pixelRatio: 3,
            backgroundColor: '#ffffff'
          })
          chartImages.set(name, {
            name,
            dataUrl,
            description: getChartDescription(name)
          })
        }
      }
    }

    // Get the appropriate data based on selected tab
    const getReportData = () => {
      const baseData = {
        startDate: filters.value.startDate,
        endDate: filters.value.endDate,
        filters: filters.value,
        metadata: {
          totalRecords: analyticsStore.overallStats?.totalMentions ?? 0,
          generatedAt: new Date().toISOString()
        }
      }

      switch (selectedTab.value) {
        case 'source-breakdown':
        case 'source-distribution':
          return {
            ...baseData,
            data: reportStore.sourceData?.data ?? {}
          }
        case 'sentiment-by-platform':
          return {
            ...baseData,
            data: { platformSentiment: reportStore.sentimentData?.data.platformSentiment }
          }
        case 'keyword-analysis':
          return {
            ...baseData,
            data: reportStore.keywordData?.data ?? {}
          }
        default:
          return {
            ...baseData,
            data: reportStore.sentimentData?.data ?? {}
          }
      }
    }

    // Generate and download the report
    if (format === 'pdf') {
      const reportData = getReportData()
      // Add user info to report data
      const userInfo = {
        username: authStore.username || 'User',
        avatar: authStore.avatar || '/vueleaf-logo.png'
      }
      const pdf = await exportService.generatePDF(reportData, chartImages, userInfo)
      saveAs(pdf, `vueleaf-report-${new Date().toISOString().split('T')[0]}.pdf`)
    } else {
      const csv = exportService.generateCSV(getReportData())
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      saveAs(blob, `vueleaf-report-${new Date().toISOString().split('T')[0]}.csv`)
    }
  } catch (error) {
    console.error('Export failed:', error)
    reportStore.error = `Failed to export report: ${error instanceof Error ? error.message : 'Unknown error'}`
  } finally {
    isExporting.value = false
  }
}

function getChartDescription(chartName: string): string {
  switch (chartName) {
    case 'Overall Sentiment':
      return 'Aggregate sentiment score based on all analyzed content'
    case 'Sentiment Distribution':
      return 'Distribution of positive, neutral, and negative sentiments across all content'
    case 'Platform Sentiment':
      return 'Breakdown of sentiment across different platforms and sources'
    case 'Source Breakdown':
      return 'Distribution of content across different platforms and sources'
    case 'Sentiment Trends':
      return 'Historical trend of sentiment distribution'
    case 'Source Distribution':
      return 'Historical trend of mentions by source'
    case 'Keyword Analysis':
      return 'Analysis of keyword mentions with sentiment breakdown'
    default:
      return ''
  }
}

// Lifecycle
onMounted(async () => {
  // Set default date range (last 30 days)
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)

  filters.value.startDate = thirtyDaysAgo.toISOString().split('T')[0]
  filters.value.endDate = today.toISOString().split('T')[0]

  // Ensure analytics data is fetched before initial data load
  await analyticsStore.fetchAnalyticsData()
  
  // Fetch initial data
  await handleFilterUpdate()
})
</script>