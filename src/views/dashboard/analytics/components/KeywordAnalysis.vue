<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from 'lucide-vue-next'
import { useAnalyticsStore } from '@/stores/analytics'

interface KeywordData {
  keyword: string
  mentions: number
  positive: number
  neutral: number
  negative: number
  source: string
}

const props = defineProps<{
  data: KeywordData[]
}>()

const searchQuery = ref('')
const analytics = useAnalyticsStore()

const filteredData = computed(() => {
  if (!props.data) return []
  return props.data
    .filter(item => item.keyword.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const chartData = computed(() => {
  // Use the same filtered and sorted data as the list
  const data = filteredData.value.slice(0, 10) // Show only top 10 for better visualization
  if (!data.length) return { keywords: [], mentions: [], colors: [] }

  return {
    keywords: data.map(item => item.keyword),
    mentions: data.map(item => ({
      value: analytics.filters.sortBy === 'mentions' ? 
        item.mentions : 
        item.mentions > 0 ? Math.round((item.positive / item.mentions) * 100) : 0,
      itemStyle: {
        color: [
          '#a7f3d0',
          '#bae6fd',
          '#fde68a',
          '#fecaca',
          '#ddd6fe'
        ][data.indexOf(item) % 5]
      }
    }))
  }
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: (params: any) => {
      const data = params[0]
      const item = filteredData.value.find(i => i.keyword === data.name)
      if (!item) return ''

      return `
        <div class="bg-white p-2 border border-gray-200 rounded shadow-md">
          <p class="font-semibold">${data.name}</p>
          <p>${analytics.filters.sortBy === 'mentions' ? 
            `${data.value} mentions` : 
            `${data.value}% positive sentiment`
          }</p>
        </div>
      `
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    axisLabel: {
      formatter: (value: number) => 
        analytics.filters.sortBy === 'mentions' ? 
          value : 
          value + '%'
    }
  },
  yAxis: {
    type: 'category',
    data: chartData.value.keywords
  },
  series: [
    {
      type: 'bar',
      data: chartData.value.mentions
    }
  ]
}))

const calculatePercentage = (value: number, total: number) => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="!data" class="h-[300px] flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading keyword analysis...</p>
      </div>
    </div>

    <template v-else>
      <!-- Search -->
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search keywords..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-0"
        />
      </div>

      <!-- Empty State -->
      <div v-if="filteredData.length === 0" class="h-[300px] flex items-center justify-center">
        <p class="text-gray-600">No keyword data available</p>
      </div>

      <template v-else>
        <!-- Chart -->
        <div class="h-[300px]">
          <v-chart class="w-full h-full" :option="chartOption" autoresize />
        </div>

        <!-- Keyword List -->
        <div class="space-y-4">
          <div
            v-for="(item, index) in filteredData"
            :key="index"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <h3 class="font-semibold text-gray-800">{{ item.keyword }}</h3>
              <p class="text-sm text-gray-600">
                {{ item.mentions }} mentions
              </p>
            </div>
            <div class="flex space-x-2">
              <span class="px-2 py-1 text-sm rounded-md bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15 transition-colors duration-300">
                {{ calculatePercentage(item.positive, item.mentions) }}% Positive
              </span>
              <span class="px-2 py-1 text-sm rounded-md bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-700 hover:from-amber-500/20 hover:to-amber-500/15 transition-colors duration-300">
                {{ calculatePercentage(item.neutral, item.mentions) }}% Neutral
              </span>
              <span class="px-2 py-1 text-sm rounded-md bg-gradient-to-r from-rose-500/10 to-rose-500/5 text-rose-700 hover:from-rose-500/20 hover:to-rose-500/15 transition-colors duration-300">
                {{ calculatePercentage(item.negative, item.mentions) }}% Negative
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Explainer Text -->
      <div class="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
        <p class="text-sm text-gray-700 font-medium">
          See which keywords are driving conversations about your brand. Each bar shows {{ analytics.filters.sortBy === 'mentions' ? 'total mentions' : 'positive sentiment percentage' }} across all platforms, with sentiment breakdowns showing positive (green), neutral (yellow), and negative (red) percentages. Use the platform filter to focus on specific communities.
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.echarts {
  width: 100%;
  height: 100%;
}
</style>
