<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'

interface SentimentData {
  date: string
  positive: number
  neutral: number
  negative: number
}

interface SentimentVisibility {
  positive: boolean
  neutral: boolean
  negative: boolean
}

const props = defineProps<{
  data: SentimentData[]
  visibleSentiments: SentimentVisibility
}>()

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      const date = params[0].axisValue
      let html = `<div class="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p class="text-gray-700 font-semibold mb-2">Date: ${date}</p>`
      
      params.forEach((param: any) => {
        const color = param.seriesName === 'Positive' ? '#86efac' : 
                     param.seriesName === 'Neutral' ? '#fde68a' : '#fca5a5'
        html += `<p style="color: ${color}">
          ${param.seriesName}: ${param.value}
        </p>`
      })
      
      html += '</div>'
      return html
    }
  },
  legend: {
    data: ['Positive', 'Neutral', 'Negative'].filter(sentiment => 
      props.visibleSentiments[sentiment.toLowerCase() as keyof SentimentVisibility]
    ),
    bottom: 0
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    top: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.data?.map(item => item.date) || [],
    axisLabel: {
      rotate: 45,
      formatter: (value: string) => {
        const date = new Date(value)
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }
    }
  },
  yAxis: {
    type: 'value'
  },
  series: [
    props.visibleSentiments.positive && {
      name: 'Positive',
      type: 'line',
      stack: 'Total',
      areaStyle: {
        color: '#86efac',
        opacity: 0.3
      },
      lineStyle: {
        color: '#86efac',
        width: 3
      },
      itemStyle: {
        color: '#86efac'
      },
      data: props.data?.map(item => item.positive) || []
    },
    props.visibleSentiments.neutral && {
      name: 'Neutral',
      type: 'line',
      stack: 'Total',
      areaStyle: {
        color: '#fde68a',
        opacity: 0.3
      },
      lineStyle: {
        color: '#fde68a',
        width: 3
      },
      itemStyle: {
        color: '#fde68a'
      },
      data: props.data?.map(item => item.neutral) || []
    },
    props.visibleSentiments.negative && {
      name: 'Negative',
      type: 'line',
      stack: 'Total',
      areaStyle: {
        color: '#fca5a5',
        opacity: 0.3
      },
      lineStyle: {
        color: '#fca5a5',
        width: 3
      },
      itemStyle: {
        color: '#fca5a5'
      },
      data: props.data?.map(item => item.negative) || []
    }
  ].filter(Boolean)
}))
</script>

<template>
  <div class="space-y-4">
    <div class="w-full h-[450px]">
      <v-chart class="w-full h-full" :option="chartOption" autoresize />
    </div>

    <!-- Explainer Text -->
    <div class="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
      <p class="text-sm text-gray-700 font-medium">
        See how your brand sentiment changes over time. The colored areas show the mix of positive (green), neutral (yellow), and negative (pink) mentions each day - giving you a clear picture of your brand's perception trends. Track these patterns to understand how community discussions and events influence your brand's reputation in the growing community.
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
