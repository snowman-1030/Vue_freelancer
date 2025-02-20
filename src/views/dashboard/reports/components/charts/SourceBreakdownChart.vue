<script setup lang="ts">
// 1. Vue imports
import { computed, ref } from 'vue'

// 2. Component imports
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import type { ECharts } from 'echarts/core'
import type { SourceData } from '@/types/reports'
import InsightPanel from '@/components/insights/InsightPanel.vue'
import { insightService } from '@/services/InsightService'

// Define pastel colors array
const COLORS = [
  '#B5EAD7',  // Soft mint
  '#7DCEA0',  // Muted sage
  '#9EDBF9',  // Sky blue
  '#B7C0EE',  // Periwinkle
  '#FFB7B2',  // Salmon pink
  '#E2B6CF',  // Dusty rose
  '#FFD3B5',  // Peach
  '#D4A5A5',  // Rosy brown
  '#A5DEE5',  // Turquoise
  '#957DAD'   // Muted purple
]

// 3. Type definitions
interface ExportOptions {
  pixelRatio?: number
  backgroundColor?: string
  excludeComponents?: string[]
}

// 4. Props and emits
const props = defineProps<{
  data: SourceData[]
  title?: string
  description?: string
}>()

// 5. State management
const chartRef = ref<ECharts>()

// 6. Computed properties
const chartTitle = computed(() => 
  props.title || 'Source Breakdown'
)

const chartDescription = computed(() =>
  props.description || 'Distribution of mentions across platforms'
)

const insights = computed(() => 
  insightService.analyzeSourceBreakdown(props.data)
)

// Filter and sort data by count descending
const sortedData = computed(() =>
  [...props.data]
    .filter(item => item.source) // Filter out null sources
    .sort((a, b) => b.count - a.count)
)

// Computed chart options
const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: sortedData.value.map(item => item.source),
    axisLabel: {
      rotate: 45,
      interval: 0
    }
  },
  yAxis: {
    type: 'value',
    name: 'Mentions'
  },
  series: [
    {
      type: 'bar',
      data: sortedData.value.map((item, index) => ({
        value: item.count,
        itemStyle: {
          color: COLORS[index % COLORS.length]
        }
      })),
      barWidth: '60%',
      itemStyle: {
        borderRadius: [8, 8, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}'
      }
    }
  ]
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
    console.error('Failed to export source breakdown chart:', error)
    throw new Error('Failed to export source breakdown chart')
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