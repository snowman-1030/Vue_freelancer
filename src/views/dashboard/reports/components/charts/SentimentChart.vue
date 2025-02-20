<script setup lang="ts">
// 1. Vue imports
import { computed, ref, watch } from 'vue'

// 2. Component imports
import { use } from 'echarts/core'
import type { ECharts } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { SentimentData } from '@/types/reports'
import InsightPanel from '@/components/insights/InsightPanel.vue'
import { insightService } from '@/services/InsightService'

// 3. Type definitions
interface ExportOptions {
  pixelRatio?: number
  backgroundColor?: string
  excludeComponents?: string[]
}

interface PlatformSentimentData {
  source: string
  sentiment: string | null
  count: number
  confidence: number
}

interface AggregatedSentimentData {
  source: string
  sentiment: string // No null allowed in aggregated data
  count: number
  confidence: number
}

// 4. Props and emits
const props = defineProps<{
  data: Array<SentimentData | PlatformSentimentData>
  groupBy?: 'source'
  title?: string
  description?: string
}>()

// Register ECharts components
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent
])

// 5. State management
const chartRef = ref<ECharts>()

// Debug watcher
watch(() => props.data, (newData) => {
  console.log('SentimentChart data:', {
    groupBy: props.groupBy,
    rawData: newData,
    dataLength: newData.length
  })
}, { immediate: true })

// 6. Computed properties
const chartTitle = computed(() => 
  props.title || (props.groupBy ? 'Platform Sentiment Analysis' : 'Sentiment Distribution')
)

const chartDescription = computed(() =>
  props.description || (props.groupBy 
    ? 'Breakdown of sentiment across different platforms and sources'
    : 'Distribution of positive, neutral, and negative sentiments across all content')
)

// Helper function to normalize sentiment
function normalizeSentiment(sentiment: string | null): string {
  if (!sentiment || !['positive', 'negative', 'neutral'].includes(sentiment)) {
    return 'neutral'
  }
  return sentiment
}

// Helper function to aggregate platform sentiment data
function aggregatePlatformData(data: PlatformSentimentData[]): AggregatedSentimentData[] {
  const aggregated = new Map<string, Map<string, { count: number, confidence: number }>>()
  
  // Group by source and sentiment
  data.forEach(item => {
    if (!aggregated.has(item.source)) {
      aggregated.set(item.source, new Map())
    }
    const sourceMap = aggregated.get(item.source)!
    
    const sentiment = normalizeSentiment(item.sentiment)
    if (!sourceMap.has(sentiment)) {
      sourceMap.set(sentiment, { count: 0, confidence: 0 })
    }
    const current = sourceMap.get(sentiment)!
    current.count += item.count
    current.confidence = Math.max(current.confidence, item.confidence)
  })

  // Convert to array format with normalized sentiment values
  const result: AggregatedSentimentData[] = []
  aggregated.forEach((sentiments, source) => {
    sentiments.forEach((data, sentiment) => {
      result.push({
        source,
        sentiment, // Already normalized
        count: data.count,
        confidence: data.confidence
      })
    })
  })

  return result
}

const insights = computed(() => {
  if (props.groupBy === 'source') {
    // Filter and validate platform data
    const validData = props.data
      .filter((item): item is PlatformSentimentData => 
        'source' in item && 
        !!item.source
      )
      .map(item => ({
        source: item.source,
        sentiment: item.sentiment,
        count: item.count,
        confidence: 'confidence' in item ? item.confidence : 1
      }))

    // Aggregate the data
    const aggregatedData = aggregatePlatformData(validData)
    console.log('Aggregated Platform Data:', aggregatedData)
    
    return insightService.analyzePlatformSentiment(aggregatedData)
  }
  
  // For sentiment distribution
  const validData = props.data
    .filter((item): item is SentimentData => 
      'sentiment' in item && 
      !!item.sentiment && 
      ['positive', 'negative', 'neutral'].includes(item.sentiment)
    )

  return insightService.analyzeSentimentDistribution(validData)
})

// Helper function for sentiment colors
function getSentimentColor(sentiment: string, isBorder: boolean = false): string {
  switch (sentiment?.toLowerCase()) {
    case 'positive':
      return isBorder ? '#9de4b9' : '#b6ecc9' // Darker pastel green
    case 'negative':
      return isBorder ? '#ffb3b3' : '#ffc5c5' // Darker pastel red
    case 'neutral':
      return isBorder ? '#ffe484' : '#ffecaa' // Darker pastel yellow
    default:
      return '#ddd6fe' // Light purple
  }
}

// Helper function to group data by source and sentiment
const groupedData = computed(() => {
  if (!props.groupBy) {
    return props.data
      .filter((item): item is SentimentData => 
        'sentiment' in item && 
        !!item.sentiment && 
        ['positive', 'negative', 'neutral'].includes(item.sentiment)
      )
      .map(item => ({
        name: item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1),
        value: item.count,
        itemStyle: {
          color: getSentimentColor(item.sentiment)
        }
      }))
  }

  // Group by source and aggregate counts
  const sourceGroups = new Map<string, { [key: string]: number }>()
  props.data.forEach(item => {
    if ('source' in item && item.source) {
      if (!sourceGroups.has(item.source)) {
        sourceGroups.set(item.source, {
          positive: 0,
          negative: 0,
          neutral: 0
        })
      }
      const group = sourceGroups.get(item.source)!
      const sentiment = normalizeSentiment(
        'sentiment' in item ? item.sentiment : null
      )
      group[sentiment] = (group[sentiment] || 0) + item.count
    }
  })

  const sentiments = ['Positive', 'Negative', 'Neutral']
  return sentiments.map(sentiment => {
    const fillColor = getSentimentColor(sentiment)
    const borderColor = getSentimentColor(sentiment, true)
    return {
      name: sentiment,
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: fillColor,
        borderWidth: 1,
        borderColor: borderColor,
        borderType: 'solid'
      },
      emphasis: {
        itemStyle: {
          borderWidth: 1,
          borderColor: borderColor
        }
      },
      data: Array.from(sourceGroups.entries()).map(([_, counts]) => ({
        value: counts[sentiment.toLowerCase()] || 0,
        itemStyle: {
          color: fillColor,
          borderWidth: 1,
          borderColor: borderColor,
          borderType: 'solid'
        }
      }))
    }
  })
})

// Chart options
const chartOption = computed(() => {
  if (!props.groupBy) {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 'bottom'
      },
      series: [
        {
          type: 'pie',
          radius: ['35%', '65%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {d}%',
            fontSize: 14,
            color: '#374151'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: groupedData.value
        }
      ]
    }
  }

  // Get valid sources (filtering out null values)
  const validSources = Array.from(new Set(
    props.data
      .filter((item): item is PlatformSentimentData => 
        'source' in item && 
        !!item.source
      )
      .map(item => item.source)
  ))

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Positive', 'Negative', 'Neutral'],
      bottom: 'bottom'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    barCategoryGap: '20%',
    barGap: '5%',
    xAxis: {
      type: 'category',
      data: validSources
    },
    yAxis: {
      type: 'value'
    },
    series: groupedData.value
  }
})

// 7. Methods
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
    console.error('Failed to export sentiment chart:', error)
    throw new Error('Failed to export sentiment chart')
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
      <div class="h-[300px]">
        <v-chart
          ref="chartRef"
          :option="chartOption"
          :autoresize="true"
          style="width: 100%; height: 100%;"
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