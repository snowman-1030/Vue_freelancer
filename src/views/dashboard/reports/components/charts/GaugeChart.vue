<script setup lang="ts">
// 1. Vue imports
import { computed, ref } from 'vue'

// 2. Component imports
import { use } from 'echarts/core'
import type { ECharts } from 'echarts/core'
import { GaugeChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import InsightPanel from '@/components/insights/InsightPanel.vue'
import { insightService } from '@/services/InsightService'

// 3. Type definitions
interface ExportOptions {
  pixelRatio?: number
  backgroundColor?: string
  excludeComponents?: string[]
}

// 4. Props and emits
const props = defineProps<{
  score: number
  total: number
  previousScore?: number
  previousTotal?: number
  title?: string
  description?: string
}>()

// Register necessary ECharts components
use([
  GaugeChart,
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

// 5. State management
const chartRef = ref<ECharts>()

// 6. Computed properties
const gaugeValue = computed(() => ((props.score + 1) / 2) * 100)

const insights = computed(() => {
  const current = {
    value: props.score,
    total: props.total
  }

  if (typeof props.previousScore === 'undefined' || typeof props.previousTotal === 'undefined') {
    return insightService.analyzeSentimentGauge(current)
  }
  
  const previous = {
    value: props.previousScore,
    total: props.previousTotal
  }
  
  return insightService.analyzeSentimentGauge(current, previous)
})

const option = computed<EChartsOption>(() => ({
  series: [{
    type: 'gauge',
    startAngle: 180,
    endAngle: 0,
    min: 0,
    max: 100,
    splitNumber: 10,
    axisLine: {
      lineStyle: {
        width: 30,
        color: [
          [0.3, '#fca5a5'],  // Light red for negative
          [0.7, '#fde68a'],  // Light yellow for neutral
          [1, '#86efac']     // Light green for positive
        ]
      }
    },
    pointer: {
      itemStyle: {
        color: 'auto'
      }
    },
    axisTick: {
      distance: -30,
      length: 8,
      lineStyle: {
        color: '#fff',
        width: 2
      }
    },
    splitLine: {
      distance: -30,
      length: 30,
      lineStyle: {
        color: '#fff',
        width: 4
      }
    },
    axisLabel: {
      color: 'inherit',
      distance: -40,
      fontSize: 12,
      formatter: function(value: number) {
        if (value === 0) return 'Negative'
        if (value === 50) return 'Neutral'
        if (value === 100) return 'Positive'
        return ''
      }
    },
    detail: {
      valueAnimation: true,
      formatter: '{value}',
      color: 'inherit',
      fontSize: 24,
      offsetCenter: [0, '20%']
    },
    data: [{
      value: Number(gaugeValue.value.toFixed(1)),
      name: `Based on ${props.total} mentions`
    }],
    title: {
      fontSize: 14,
      offsetCenter: [0, '60%']
    }
  }]
}))

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
    console.error('Failed to export gauge chart:', error)
    throw new Error('Failed to export gauge chart')
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
      <h3 class="text-xl font-semibold text-green-800 mb-2">
        {{ title || 'Overall Sentiment Score' }}
      </h3>
      <p class="text-gray-600 mb-4">
        {{ description || 'Aggregate sentiment score based on all analyzed content' }}
      </p>
      <v-chart
        ref="chartRef"
        class="h-[300px]"
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