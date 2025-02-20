<script setup lang="ts">
// Script section remains the same until chartOption
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { LineSeriesOption } from 'echarts/charts'

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent
])

const props = defineProps<{
  data: Array<{
    date: string
    positive: number
    neutral: number
    negative: number
  }>
  visibleLines: {
    positive: boolean
    neutral: boolean
    negative: boolean
  }
  title?: string
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggleLine', line: 'positive' | 'neutral' | 'negative'): void
}>()

type SeriesName = 'Positive' | 'Neutral' | 'Negative'

const createSeries = (
  name: SeriesName,
  data: number[],
  color: string
): LineSeriesOption => ({
  name,
  type: 'line',
  data,
  symbol: 'circle',
  symbolSize: 6,
  itemStyle: {
    color,
    borderWidth: 2,
    borderColor: '#fff'
  },
  lineStyle: {
    width: 3
  },
  showSymbol: true,
  smooth: true,
  emphasis: {
    focus: 'series'
  },
  animation: true,
  animationDuration: 1000,
  animationEasing: 'cubicOut'
})

const chartOption = computed(() => {
  const series: LineSeriesOption[] = [
    createSeries('Positive', props.data.map(item => item.positive), '#86efac'),
    createSeries('Neutral', props.data.map(item => item.neutral), '#fde68a'),
    createSeries('Negative', props.data.map(item => item.negative), '#fca5a5')
  ].filter((series) => {
    const name = series.name as SeriesName
    return props.visibleLines[name.toLowerCase() as keyof typeof props.visibleLines]
  })

  return {
    grid: {
      top: '10%',
      right: '2%',
      bottom: '15%',
      left: '2%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'white',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 16,
      textStyle: {
        color: '#374151'
      },
      formatter: (params: any) => {
        let result = `<div class="font-semibold mb-2">Date: ${params[0].axisValue}</div>`
        params.forEach((param: any) => {
          const bgColor = param.seriesName === 'Positive' ? '#dcfce7' :
                         param.seriesName === 'Negative' ? '#fee2e2' : '#fef9c3'
          result += `
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 4px 8px;
              margin: 2px 0;
              background-color: ${bgColor};
              border-radius: 4px;
              font-size: 12px;
            ">
              <span>${param.seriesName}</span>
              <span style="font-weight: 600">${param.value}</span>
            </div>
          `
        })
        return result
      }
    },
    xAxis: {
      type: 'category',
      data: props.data.map(item => item.date),
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#6b7280',
        padding: [8, 0]
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#e5e7eb',
          width: 1,
          dashOffset: 3
        }
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#6b7280',
        padding: [0, 8]
      },
      splitNumber: 6
    },
    series
  }
})
</script>

<template>
  <div class="w-full h-[450px] bg-white border border-gray-200 rounded-lg p-6 flex flex-col">
    <div class="text-center">
      <h3 class="text-lg font-medium text-green-800">{{ title || 'Mention Trends' }}</h3>
    </div>
    <div class="flex-1 min-h-0 w-full relative">
      <!-- Loading Skeleton -->
      <div v-if="props.isLoading" class="absolute inset-0 flex items-center justify-center">
        <div class="w-full h-full p-4 flex flex-col">
          <div class="flex-1 mb-12 relative border border-gray-200 rounded-lg">
            <!-- Y-axis ticks -->
            <div class="absolute left-0 top-0 h-full w-16 flex flex-col justify-between py-4">
              <div class="h-4 w-10 bg-gray-100 rounded animate-pulse"></div>
              <div class="h-4 w-8 bg-gray-100 rounded animate-pulse"></div>
              <div class="h-4 w-12 bg-gray-100 rounded animate-pulse"></div>
              <div class="h-4 w-10 bg-gray-100 rounded animate-pulse"></div>
            </div>
            
            <!-- Chart area with line hints -->
            <div class="absolute inset-0 ml-16 flex items-center">
              <div class="w-full h-40 relative">
                <div class="absolute inset-x-0 top-1/4 h-[2px] bg-gray-100 rounded animate-pulse"></div>
                <div class="absolute inset-x-0 top-2/4 h-[2px] bg-gray-100 rounded animate-pulse"></div>
                <div class="absolute inset-x-0 top-3/4 h-[2px] bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
            
            <!-- X-axis labels -->
            <div class="absolute bottom-0 left-16 right-0 h-8 flex justify-between items-center px-4">
              <div class="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
              <div class="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
              <div class="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
              <div class="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Chart -->
      <v-chart
        v-show="!props.isLoading"
        class="w-full h-full"
        :option="chartOption"
        :autoresize="true"
      />
    </div>
    <div class="flex justify-center space-x-4">
      <button
        @click="emit('toggleLine', 'positive')"
        :class="[
          'px-4 py-2 text-sm font-normal rounded-md transition-colors duration-300',
          visibleLines.positive
            ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15'
            : 'text-emerald-600 hover:bg-emerald-50'
        ]"
      >
        Positive
      </button>
      <button
        @click="emit('toggleLine', 'neutral')"
        :class="[
          'px-4 py-2 text-sm font-normal rounded-md transition-colors duration-300',
          visibleLines.neutral
            ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-700 hover:from-amber-500/20 hover:to-amber-500/15'
            : 'text-amber-600 hover:bg-amber-50'
        ]"
      >
        Neutral
      </button>
      <button
        @click="emit('toggleLine', 'negative')"
        :class="[
          'px-4 py-2 text-sm font-normal rounded-md transition-colors duration-300',
          visibleLines.negative
            ? 'bg-gradient-to-r from-rose-500/10 to-rose-500/5 text-rose-700 hover:from-rose-500/20 hover:to-rose-500/15'
            : 'text-rose-600 hover:bg-rose-50'
        ]"
      >
        Negative
      </button>
    </div>
  </div>
</template>

<style scoped>
.echarts {
  width: 100% !important;
  height: 100% !important;
}
</style>
