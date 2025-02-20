<script setup lang="ts">
import { computed } from 'vue'

interface CorrelationData {
  keyword: string
  positive: number
  neutral: number
  negative: number
}

const props = defineProps<{
  data: CorrelationData[]
}>()

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      const value = (params.value[2] * 100).toFixed(1)
      return `
        <div class="bg-white p-2 border border-gray-200 rounded shadow-md">
          <p class="font-semibold">${params.value[0]}</p>
          <p>${params.seriesName}: ${value}%</p>
        </div>
      `
    }
  },
  legend: {
    data: ['Positive', 'Neutral', 'Negative'],
    bottom: 0
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: props.data?.map(item => item.keyword) || [],
    axisLabel: {
      interval: 0,
      rotate: 45
    }
  },
  yAxis: {
    type: 'category',
    data: ['Negative', 'Neutral', 'Positive']
  },
  series: [
    {
      name: 'Positive',
      type: 'scatter',
      data: props.data?.map(item => [item.keyword, 'Positive', item.positive]) || [],
      symbolSize: (value: any) => value[2] * 100,
      itemStyle: {
        color: '#86efac'
      }
    },
    {
      name: 'Neutral',
      type: 'scatter',
      data: props.data?.map(item => [item.keyword, 'Neutral', item.neutral]) || [],
      symbolSize: (value: any) => value[2] * 100,
      itemStyle: {
        color: '#fde68a'
      }
    },
    {
      name: 'Negative',
      type: 'scatter',
      data: props.data?.map(item => [item.keyword, 'Negative', item.negative]) || [],
      symbolSize: (value: any) => value[2] * 200,
      itemStyle: {
        color: '#fca5a5'
      }
    }
  ]
}))
</script>

<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="!data" class="h-[400px] flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading correlation data...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="data.length === 0" class="h-[400px] flex items-center justify-center">
      <p class="text-gray-600">No correlation data available</p>
    </div>

    <!-- Scatter Plot -->
    <div v-else class="h-[400px]">
      <v-chart class="w-full h-full" :option="chartOption" autoresize />
    </div>

    <!-- Explainer Text -->
    <div class="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
      <p class="text-sm text-gray-700 font-medium">
        This chart shows how people talk about your brand online. Bigger circles mean more people are discussing it that way. Green shows positive comments, yellow shows neutral mentions, and pink shows negative feedback. Track these sentiment patterns to understand your brand's reputation and performance in the growing community.
      </p>
    </div>
  </div>
</template>

<style scoped>
.echarts {
  width: 100%;
  height: 100%;
}
</style>
