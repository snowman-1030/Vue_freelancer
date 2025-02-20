<script setup lang="ts">
import { MessageSquare, TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ForumActivity } from '@/services/competitors'

interface Props {
  forum: ForumActivity
}

const props = defineProps<Props>()

// Log the forum data when it's received
console.log('ForumMetricRow - Received forum data:', props.forum)

const getTrendIcon = (trend: string) => {
  console.log('ForumMetricRow - Getting trend icon for:', trend)
  switch (trend) {
    case 'up':
      return TrendingUp
    case 'down':
      return TrendingDown
    default:
      return Minus
  }
}

const getTrendClass = (trend: string) => {
  console.log('ForumMetricRow - Getting trend class for:', trend)
  switch (trend) {
    case 'up':
      return '!bg-gradient-to-r !from-emerald-500/10 !to-emerald-500/5 !text-emerald-700 hover:!from-emerald-500/20 hover:!to-emerald-500/15 transition-colors duration-300'
    case 'down':
      return '!bg-gradient-to-r !from-rose-500/10 !to-rose-500/5 !text-rose-700 hover:!from-rose-500/20 hover:!to-rose-500/15 transition-colors duration-300'
    default:
      return '!bg-gradient-to-r !from-amber-500/10 !to-amber-500/5 !text-amber-700 hover:!from-amber-500/20 hover:!to-amber-500/15 transition-colors duration-300'
  }
}

const formatTrendPercentage = (trend: string, percentage: number) => {
  console.log('ForumMetricRow - Formatting trend percentage:', { trend, percentage })
  // Handle neutral trend or very small percentages (less than 0.01)
  if (trend === 'neutral' || Math.abs(percentage) < 0.01) {
    console.log('ForumMetricRow - Returning 0% for neutral/negligible trend')
    return '0%'
  }
  // Round to 2 decimal places to avoid floating point issues
  const roundedPercentage = Math.round(percentage * 100) / 100
  const formattedValue = `${roundedPercentage > 0 ? '+' : ''}${roundedPercentage}%`
  console.log('ForumMetricRow - Formatted trend value:', formattedValue)
  return formattedValue
}
</script>

<template>
  <div class="flex items-center justify-between p-2">
    <div class="flex items-center space-x-2">
      <div class="bg-green-100 p-1.5 rounded-full">
        <component :is="forum.icon || MessageSquare" class="h-5 w-5 text-green-600" />
      </div>
      <div class="flex-1 px-4">
        <div class="font-semibold">{{ forum.name }}</div>
        <div class="text-sm text-gray-600">
          {{ forum.mentions.toLocaleString() }} mentions
        </div>
      </div>
    </div>
    
    <div class="flex-1 mr-4">
      <div class="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          class="absolute left-0 top-0 h-full bg-green-600 transition-all duration-200 ease-in-out"
          :style="{ width: `${forum.percentage}%` }"
        />
      </div>
      <p class="text-right text-xs text-gray-600 mt-0.5">{{ forum.percentage }}% of total</p>
    </div>
    
    <div class="flex items-center">
      <Badge variant="outline" :class="cn('!border-0 !bg-transparent inline-flex items-center rounded-md px-2 py-1', getTrendClass(forum.trend))">
        <component
          :is="getTrendIcon(forum.trend)"
          class="h-3 w-3 mr-1 inline"
        />
        {{ formatTrendPercentage(forum.trend, forum.trendPercentage) }}
      </Badge>
    </div>
  </div>
</template>
