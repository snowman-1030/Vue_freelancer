<script setup lang="ts">
// 1. Vue imports
import { computed, ref } from 'vue'

// 2. Component imports
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import type { ECharts } from 'echarts/core'
import type { TrendData } from '@/types/reports'
import InsightPanel from '@/components/insights/InsightPanel.vue'
import { insightService } from '@/services/InsightService'

// Define pastel colors array
const COLORS = [
  '#86efac',  // Light green
  '#fde68a',  // Light yellow
  '#fca5a5',  // Light red
  '#bae6fd',  // Light blue
  '#ddd6fe'   // Light purple
]

// 3. Type definitions
interface ExportOptions {
  pixelRatio?: number
  backgroundColor?: string
  excludeComponents?: string[]
}

// 4. Props and emits
const props = defineProps<{
  data: TrendData[]
  title?: string
  startDate?: string
  endDate?: string
}>()

// 5. State management
const chartRef = ref<ECharts>()

// 6. Computed properties
const chartTitle = computed(() =>
  props.title || (props.data[0]?.sentiment !== undefined ? 'Sentiment Trends' : 'Source Trends')
)

const chartDescription = computed(() =>
  props.data[0]?.sentiment !== undefined
    ? 'Historical trend of sentiment distribution'
    : 'Historical trend of mentions by source'
)

const insights = computed(() => 
  insightService.analyzeTrends(
    props.data,
    props.data[0]?.sentiment !== undefined ? 'sentiment' : 'source'
  )
)

// Filter and sort data by date
const sortedData = computed(() => {
  // Filter by date range if provided
  const filteredData = props.data.filter(item => {
    if (!props.startDate || !props.endDate) return true
    const itemDate = new Date(item.date)
    const start = new Date(props.startDate)
    const end = new Date(props.endDate)
    return itemDate >= start && itemDate <= end
  })

  // Sort by date
  return filteredData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

// Generate complete date range
const dates = computed(() => {
  if (sortedData.value.length === 0) return []
  
  const dateRange: string[] = []
  if (props.startDate && props.endDate) {
    // Use provided date range
    const startDate = new Date(props.startDate)
    const endDate = new Date(props.endDate)
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      dateRange.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }
  } else {
    // Fallback to data's date range
    const dates = sortedData.value.map(item => new Date(item.date))
    const startDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const endDate = new Date(Math.max(...dates.map(d => d.getTime())))
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      dateRange.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }
  return dateRange
})

const series = computed(() => {
  if (sortedData.value[0]?.sentiment !== undefined) {
    return ['positive', 'negative', 'neutral'].map(sentiment => ({
      name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 3
      },
      data: dates.value.map(date => {
        const point = sortedData.value.find(
          item => item.date === date && item.sentiment === sentiment
        )
        return point?.value || 0
      }),
      itemStyle: {
        color: getSentimentColor(sentiment)
      }
    }))
  } else {
    const sources = [...new Set(sortedData.value.map(item => item.source).filter(Boolean))]
    return sources.map((source, index) => ({
      name: source || 'Unknown',
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 3
      },
      itemStyle: {
        color: COLORS[index % COLORS.length]
      },
      data: dates.value.map(date => {
        const point = sortedData.value.find(
          item => item.date === date && item.source === source
        )
        return point?.value || 0
      })
    }))
  }
})

// Computed chart options
const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: series.value.map(s => s.name),
    bottom: 'bottom'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: dates.value,
    axisLabel: {
      rotate: 45,
      interval: dates.value.length <= 7 ? 0 : Math.floor(dates.value.length / 6),
      formatter: (value: string) => {
        const date = new Date(value)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
    }
  },
  yAxis: {
    type: 'value',
    name: 'Mentions'
  },
  series: series.value
}))

// 7. Methods
function getSentimentColor(sentiment: string): string {
  switch (sentiment.toLowerCase()) {
    case 'positive':
      return '#86efac' // Light green
    case 'negative':
      return '#fca5a5' // Light red
    case 'neutral':
      return '#fde68a' // Light yellow
    default:
      return '#ddd6fe' // Light purple
  }
}

const exportToImage = async (options: ExportOptions = {}): Promise<string> => {
  try {
    if (!chartRef.value) {
      throw new Error('Chart instance not found')
    }

    return chartRef.value.getDataURL({
      pixelRatio: options.pixelRatio || 2,
      backgroundColor: options.backgroundColor || '#ffffff',
      excludeComponents: options.excludeComponents || ['toolbox']
    })
  } catch (error) {
    console.error('Failed to export trend chart:', error)
    throw new Error('Failed to export trend chart')
  }
}

// Expose methods for parent component
defineExpose({
  exportToImage
})
</script>

<template>
  <div class="flex flex-col bg-white rounded-lg shadow-sm">
    <!-- Chart section -->
    <div class="p-6">
      <h3 class="text-xl font-semibold text-green-800 mb-2">{{ chartTitle }}</h3>
      <p class="text-gray-600 mb-4">{{ chartDescription }}</p>
      <div class="h-[350px]">
        <v-chart
          ref="chartRef"
          class="w-full h-full"
          :option="chartOption"
          :autoresize="true"
        />
      </div>
    </div>

    <!-- Insights section -->
    <InsightPanel
      :insights="insights"
      class="border-t border-gray-100"
    />
  </div>
</template>