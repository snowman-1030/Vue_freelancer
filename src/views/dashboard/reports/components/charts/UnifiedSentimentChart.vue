<script setup lang="ts">
// 1. Vue imports
import { computed, ref } from 'vue'

// 2. Component imports
import { use } from 'echarts/core'
import type { ECharts, ComposeOption } from 'echarts/core'
import type { TooltipComponentOption } from 'echarts/components'
import type { LegendComponentOption } from 'echarts/components'
import type { TitleComponentOption } from 'echarts/components'
import { PieChart } from 'echarts/charts'
import type { PieSeriesOption } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import InsightPanel from '@/components/insights/InsightPanel.vue'
import { InsightService } from '@/services/InsightService'

// Color constants
const COLORS = {
  positive: '#86efac',
  neutral: '#fde68a',
  negative: '#fca5a5',
  text: {
    primary: '#2d3748',
    secondary: '#718096'
  }
} as const

// Initialize services
const insightService = new InsightService()

// 3. Type definitions
type ECOption = ComposeOption<
  TooltipComponentOption | 
  LegendComponentOption | 
  TitleComponentOption | 
  PieSeriesOption
>

interface SentimentData {
  sentiment: string
  count: number
  confidence: number
}

interface ExportOptions {
  pixelRatio?: number
  backgroundColor?: string
  excludeComponents?: string[]
}

type SentimentCounts = {
  positive: number
  negative: number
  neutral: number
}

// 4. Props and emits
const props = defineProps<{
  /** The overall sentiment score (-1 to 1) */
  score: number
  /** Total number of mentions analyzed */
  total: number
  /** Array of sentiment data points */
  data: SentimentData[]
  /** Optional custom title */
  title?: string
  /** Optional custom description */
  description?: string
}>()

// Register necessary ECharts components
use([
  PieChart,
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

// 5. State management
const chartRef = ref<ECharts>()

// 6. Computed properties
/** Converts sentiment score (-1 to 1) to percentage (0 to 100) */
const gaugeValue = computed(() => ((props.score + 1) / 2) * 100)

/** Computes insights based on current sentiment data */
const insights = computed(() => {
  const current = {
    value: props.score,
    total: props.total
  }
  return insightService.analyzeSentimentGauge(current)
})

/** Aggregates sentiment counts from raw data */
const sentimentCounts = computed<SentimentCounts>(() => {
  const counts: SentimentCounts = {
    positive: 0,
    negative: 0,
    neutral: 0
  }
  
  props.data.forEach(item => {
    const sentiment = (item.sentiment || 'neutral').toLowerCase() as keyof SentimentCounts
    counts[sentiment] += item.count
  })

  return counts
})

/** ECharts configuration for the donut chart */
const option = computed<ECOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {d}%'
  },
  grid: {
    containLabel: true,
    bottom: '20%'
  },
  legend: {
    orient: 'horizontal',
    bottom: '2%',
    selectedMode: false  // Prevent toggling segments on/off
  },
  series: [{
    type: 'pie',
    radius: ['60%', '80%'],
    avoidLabelOverlap: true,
    label: {
      show: true,
      position: 'outside',
      formatter: '{b}: {d}%',
      fontSize: 12,
      color: COLORS.text.primary
    },
    labelLine: {
      show: true,
      length: 10,
      length2: 10,
      smooth: true
    },
    emphasis: {
      label: {
        show: true,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    data: [
      {
        name: 'Negative',
        value: sentimentCounts.value.negative,
        itemStyle: { color: COLORS.negative }
      },
      {
        name: 'Neutral',
        value: sentimentCounts.value.neutral,
        itemStyle: { color: COLORS.neutral }
      },
      {
        name: 'Positive',
        value: sentimentCounts.value.positive,
        itemStyle: { color: COLORS.positive }
      },
      {
        name: '',
        value: 0,
        label: {
          show: true,
          position: 'center',
          formatter: () => {
            return [
              `{value|${gaugeValue.value.toFixed(1)}%}`,
              `{subtitle|Based on ${props.total} mentions}`
            ].join('\n')
          },
          rich: {
            value: {
              fontSize: 24,
              fontWeight: 'bold',
              color: COLORS.text.primary
            },
            subtitle: {
              fontSize: 14,
              color: COLORS.text.secondary,
              padding: [4, 0]
            }
          }
        },
        itemStyle: {
          color: 'none',
          borderWidth: 0
        }
      }
    ]
  }]
}))

// 7. Methods
/** Exports the chart as an image data URL */
const exportToImage = async (options: ExportOptions = {}): Promise<string> => {
  if (!chartRef.value) {
    throw new Error('Chart instance not found')
  }

  return chartRef.value.getDataURL({
    pixelRatio: options.pixelRatio || 2,
    backgroundColor: options.backgroundColor || '#ffffff',
    excludeComponents: options.excludeComponents || ['toolbox']
  })
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
      <h3 class="text-xl font-semibold text-green-800 mb-2">
        {{ title || 'Overall Sentiment Score' }}
      </h3>
      <p class="text-gray-600 mb-4">
        {{ description || 'Aggregate sentiment score based on all analyzed content' }}
      </p>
      <v-chart
        ref="chartRef"
        class="h-[400px]"
        :option="option"
        :autoresize="true"
      />
    </div>

    <!-- Insights section -->
    <InsightPanel
      :insights="insights"
      class="border-t border-gray-100"
    />
  </div>
</template>