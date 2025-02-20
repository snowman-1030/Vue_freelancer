<script setup lang="ts">
// 1. Vue imports
import { computed, ref } from 'vue'

// 2. Component imports
import { use } from 'echarts/core'
import type { ECharts } from 'echarts/core'
import { PieChart } from 'echarts/charts'
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
  PieChart,
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

// 5. State management
const chartRef = ref<ECharts>()

// 6. Computed properties
const sentimentValue = computed(() => ((props.score + 1) / 2) * 100)

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

const option = computed<EChartsOption>(() => {
  const gaugeValue = ((props.score + 1) / 2) * 100;
  
  // Calculate data based on gauge value
  let chartData;
  if (gaugeValue <= 30) {
    chartData = [
      { value: 100 - gaugeValue, name: 'Negative', itemStyle: { color: '#fca5a5' } },
      { value: gaugeValue, name: 'Neutral', itemStyle: { color: '#fde68a' } },
      { value: 0, name: 'Positive', itemStyle: { color: '#86efac' } }
    ];
  } else if (gaugeValue >= 70) {
    chartData = [
      { value: 0, name: 'Negative', itemStyle: { color: '#fca5a5' } },
      { value: 100 - gaugeValue, name: 'Neutral', itemStyle: { color: '#fde68a' } },
      { value: gaugeValue, name: 'Positive', itemStyle: { color: '#86efac' } }
    ];
  } else {
    chartData = [
      { value: (100 - gaugeValue) / 2, name: 'Negative', itemStyle: { color: '#fca5a5' } },
      { value: gaugeValue, name: 'Neutral', itemStyle: { color: '#fde68a' } },
      { value: (100 - gaugeValue) / 2, name: 'Positive', itemStyle: { color: '#86efac' } }
    ];
  }

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}: ${params.value.toFixed(1)}%`
      }
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
        color: '#4b5563'
      },
      labelLine: {
        show: true,
        length: 10,
        length2: 10,
        smooth: true
      },
      itemStyle: {
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#fff'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      data: [
        ...chartData,
        {
          name: '',
          value: 0,
          label: {
            show: true,
            position: 'center',
            formatter: () => {
              return [
                `{value|${gaugeValue.toFixed(1)}%}`,
                `{subtitle|Based on ${props.total} mentions}`
              ].join('\n')
            },
            rich: {
              value: {
                fontSize: 24,
                fontWeight: 'bold',
                color: '#2d3748'
              },
              subtitle: {
                fontSize: 14,
                color: '#718096',
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
  };
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
    console.error('Failed to export donut chart:', error)
    throw new Error('Failed to export donut chart')
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