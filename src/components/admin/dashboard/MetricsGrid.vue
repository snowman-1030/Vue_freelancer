<script setup lang="ts">
import { computed } from 'vue'
import { Card } from '@/components/ui/card'
import { useAdminDashboardStore } from '@/stores/adminDashboard'
import type { DashboardMetric } from '@/types/admin'

const store = useAdminDashboardStore()
const metrics = computed(() => store.metrics)

// Cache trend calculations to avoid multiple processing
const metricTrends = computed(() => {
  const trends = new Map<string, {
    direction: 'up' | 'down',
    value: number,
    class: string
  } | null>()
  
  metrics.value.forEach(metric => {
    if (typeof metric.trend !== 'number') {
      trends.set(metric.id, null)
      return
    }
    
    trends.set(metric.id, {
      direction: metric.trend >= 0 ? 'up' : 'down',
      value: Math.abs(metric.trend),
      class: metric.trend >= 0 ? 'text-green-600' : 'text-red-600'
    })
  })
  
  return trends
})

const getMetricTrend = (metric: DashboardMetric) => {
  return metricTrends.value.get(metric.id)
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <Card
      v-for="(metric, index) in metrics"
      :key="metric.id"
      :class="{
        'bg-blue-50 border border-blue-200': metric.id === 'users',
        'bg-purple-50 border border-purple-200': metric.id === 'sentiment',
        'bg-green-50 border border-green-200': metric.id === 'keywords',
        'bg-yellow-50 border border-yellow-200': metric.id === 'posts'
      }"
    >
      <div class="p-6">
        <h3 :class="{
          'text-sm font-medium text-blue-700': metric.id === 'users',
          'text-sm font-medium text-purple-700': metric.id === 'sentiment',
          'text-sm font-medium text-green-700': metric.id === 'keywords',
          'text-sm font-medium text-yellow-700': metric.id === 'posts'
        }">{{ metric.label }}</h3>
        <div v-if="metric.loading" class="mt-2">
          <div class="h-8 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div v-else-if="metric.error" class="mt-2">
          <p class="text-sm text-red-600">{{ metric.error }}</p>
        </div>
        <template v-else>
          <div class="mt-2">
            <p :class="{
              'text-3xl font-semibold text-blue-800': metric.id === 'users',
              'text-3xl font-semibold text-purple-800': metric.id === 'sentiment',
              'text-3xl font-semibold text-green-800': metric.id === 'keywords',
              'text-3xl font-semibold text-yellow-800': metric.id === 'posts'
            }">{{ metric.value }}</p>
            <div v-if="getMetricTrend(metric)" class="mt-1 flex items-center">
              <span
                class="text-sm font-medium flex items-center"
                :class="getMetricTrend(metric)?.class"
              >
                <svg v-if="getMetricTrend(metric)?.direction === 'up'" class="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
                {{ getMetricTrend(metric)?.direction === 'up' ? '+' : '' }}{{ getMetricTrend(metric)?.value }}%
              </span>
              <span :class="{
                'text-sm text-blue-600 ml-1': metric.id === 'users',
                'text-sm text-purple-600 ml-1': metric.id === 'sentiment',
                'text-sm text-green-600 ml-1': metric.id === 'keywords',
                'text-sm text-yellow-600 ml-1': metric.id === 'posts'
              }">vs last {{ metric.period }}</span>
            </div>
            <div v-else-if="metric.period" class="mt-1">
              <span :class="{
                'text-sm text-blue-600': metric.id === 'users',
                'text-sm text-purple-600': metric.id === 'sentiment',
                'text-sm text-green-600': metric.id === 'keywords',
                'text-sm text-yellow-600': metric.id === 'posts'
              }">Building trend data...</span>
            </div>
          </div>
        </template>
      </div>
    </Card>
  </div>
</template>