<script setup lang="ts">
import { computed } from 'vue'

interface PlatformData {
  name: string
  value: number
}

const props = defineProps<{
  data: PlatformData[]
}>()

const COLORS = [
  // Each color is now more distinct while maintaining pastel quality
  '#B5EAD7',  // Soft mint (distinctly lighter)
  '#7DCEA0',  // Muted sage (darker green)
  '#9EDBF9',  // Sky blue
  '#B7C0EE',  // Periwinkle
  '#FFB7B2',  // Salmon pink
  '#E2B6CF',  // Dusty rose
  '#FFD3B5',  // Peach
  '#D4A5A5',  // Rosy brown
  '#A5DEE5',  // Turquoise
  '#957DAD',  // Muted purple
  '#FFC8A2',  // Light coral
  '#B5D8EB',  // Powder blue
  '#E6CBA8',  // Sand
  '#C3B1E1',  // Lavender
  '#F3B0C3',  // Pink
  '#89C2D9',  // Steel blue
  '#FFCB77',  // Pale orange
  '#C1E1C1',  // Pale green
  '#B5838D',  // Mauve
  '#A7C5EB',  // Light steel blue
  '#C6DEF1',  // Light sky blue
  '#DBCDF0',  // Light violet
  '#F7D9C4',  // Light peach
  '#E2CFC4',  // Pale taupe
  '#C9E4DE'   // Pale cyan
]

const totalMentions = computed(() => 
  props.data?.reduce((sum, platform) => sum + platform.value, 0) || 0
)

const chartOption = computed(() => ({
  tooltip: {
    formatter: (params: any) => {
      const percentage = ((params.value / totalMentions.value) * 100).toFixed(1)
      return `
        <div class="bg-white p-2 border border-gray-200 rounded shadow-md">
          <p class="font-semibold">${params.name}</p>
          <p>Mentions: ${params.value}</p>
          <p>${percentage}% of total</p>
        </div>
      `
    }
  },
  series: [{
    type: 'treemap',
    roam: false,
    data: props.data?.map((item, index) => ({
      name: item.name,
      value: item.value,
      itemStyle: {
        color: COLORS[index % COLORS.length]
      }
    })) || [],
    label: {
      show: true,
      formatter: '{b}',
      fontSize: 14,
      color: '#666'
    },
    breadcrumb: {
      show: false
    },
    itemStyle: {
      borderColor: '#fff',
      borderWidth: 3,
      gapWidth: 3
    }
  }]
}))
</script>

<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="!data" class="h-[300px] flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading platform data...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="data.length === 0" class="h-[300px] flex items-center justify-center">
      <p class="text-gray-600">No platform data available</p>
    </div>

    <template v-else>
      <!-- Treemap Chart -->
      <div class="h-[300px]">
        <v-chart class="w-full h-full" :option="chartOption" autoresize />
      </div>

      <!-- Platform Statistics -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div
          v-for="(platform, index) in data"
          :key="platform.name"
          class="flex items-center bg-gray-50 p-3 rounded-lg shadow-sm"
        >
          <div
            class="w-4 h-4 rounded-full mr-3 flex-shrink-0"
            :style="{ backgroundColor: COLORS[index % COLORS.length] }"
          />
          <div>
            <span class="text-sm font-medium text-gray-900">{{ platform.name }}</span>
            <p class="text-xs text-gray-700">
              {{ ((platform.value / totalMentions) * 100).toFixed(1) }}% of mentions
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Explainer Text -->
    <div class="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
      <p class="text-sm text-gray-700 font-medium">
        Want to know where your target audience hangs out online? This chart shows all the growing communities where your brand gets mentioned. The bigger the block, the more your brand gets discussed there. Track these platform trends to understand where your community is most active and identify the best places to engage with your audience.
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
