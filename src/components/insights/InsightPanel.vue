<script setup lang="ts">
// 1. Vue imports
import { ref } from 'vue'

// 2. Component imports
import { LoadingSpinner } from '../ui/loading'
import {
  LightbulbIcon,
  ChevronDownIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  InfoIcon
} from 'lucide-vue-next'

// 3. Type definitions
interface InsightResult {
  type: 'positive' | 'neutral' | 'negative' | 'info'
  title: string
  description: string
  metric?: string
  change?: number
  significance: 'high' | 'medium' | 'low'
}

// 4. Props and emits
const props = withDefaults(defineProps<{
  insights: InsightResult[]
  loading?: boolean
  collapsible?: boolean
  initiallyExpanded?: boolean
}>(), {
  loading: false,
  collapsible: true,
  initiallyExpanded: true
})

// 5. State management
const isExpanded = ref(props.initiallyExpanded)

// 6. Methods
function toggleExpanded(): void {
  if (props.collapsible) {
    isExpanded.value = !isExpanded.value
  }
}

function getMetricColor(insight: InsightResult): string {
  switch (insight.type) {
    case 'positive':
      return 'text-green-600'
    case 'negative':
      return 'text-red-600'
    case 'neutral':
      return 'text-yellow-600'
    default:
      return 'text-blue-600'
  }
}

function getChangeColor(change: number): string {
  if (change > 0) return 'text-green-600'
  if (change < 0) return 'text-red-600'
  return 'text-yellow-600'
}

function formatChange(change: number): string {
  const prefix = change > 0 ? '+' : ''
  return `${prefix}${change.toFixed(1)}%`
}

function getSignificanceClass(significance: string): string {
  switch (significance) {
    case 'high':
      return 'bg-red-50 text-red-700'
    case 'medium':
      return 'bg-yellow-50 text-yellow-700'
    case 'low':
      return 'bg-green-50 text-green-700'
    default:
      return 'bg-gray-50 text-gray-700'
  }
}
</script>

<template>
  <!-- Container: layout → spacing → visual styles -->
  <div 
    class="flex flex-col mt-4 rounded-lg border overflow-hidden transition-all duration-200
           bg-gray-50 border-gray-100"
    :class="{ 'cursor-pointer': collapsible }"
  >
    <!-- Header: layout → alignment → spacing → visual styles -->
    <div 
      class="flex items-center justify-between p-4 bg-white"
      @click="toggleExpanded"
    >
      <div class="flex items-center gap-2">
        <LightbulbIcon class="h-5 w-5 text-yellow-500" />
        <h3 class="font-medium text-gray-900">Insights</h3>
      </div>
      <ChevronDownIcon 
        v-if="collapsible"
        class="h-5 w-5 text-gray-500 transition-transform duration-200"
        :class="{ 'rotate-180': isExpanded }"
      />
    </div>

    <!-- Content -->
    <div 
      v-show="isExpanded"
      class="divide-y divide-gray-100"
    >
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center p-4">
        <LoadingSpinner size="sm" />
      </div>
      
      <!-- Empty state -->
      <div v-else-if="!insights.length" class="p-4 text-center text-gray-500">
        No insights available for the current data
      </div>

      <!-- Insights list -->
      <template v-else>
        <div 
          v-for="(insight, index) in insights" 
          :key="index"
          class="flex flex-col p-4 transition hover:bg-gray-50"
        >
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <div class="mt-0.5">
              <TrendingUpIcon
                v-if="insight.type === 'positive'"
                class="h-5 w-5 text-green-500"
              />
              <MinusIcon
                v-else-if="insight.type === 'neutral'"
                class="h-5 w-5 text-yellow-500"
              />
              <TrendingDownIcon
                v-else-if="insight.type === 'negative'"
                class="h-5 w-5 text-red-500"
              />
              <InfoIcon
                v-else
                class="h-5 w-5 text-blue-500"
              />
            </div>

            <!-- Content -->
            <div class="flex-1">
              <h4 class="text-base font-medium text-gray-900">
                {{ insight.title }}
              </h4>
              <p class="mt-1 text-base text-gray-600">
                {{ insight.description }}
              </p>

              <!-- Metric -->
              <div 
                v-if="insight.metric"
                class="mt-2 inline-flex items-center gap-1 text-sm"
              >
                <span class="font-medium" :class="getMetricColor(insight)">
                  {{ insight.metric }}
                </span>
                <span 
                  v-if="insight.change"
                  class="text-xs"
                  :class="getChangeColor(insight.change)"
                >
                  {{ formatChange(insight.change) }}
                </span>
              </div>

              <!-- Significance -->
              <div 
                class="mt-2 inline-flex items-center rounded-full px-2 py-1 text-xs"
                :class="getSignificanceClass(insight.significance)"
              >
                {{ insight.significance }} significance
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>