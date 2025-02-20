<script setup lang="ts">
// 1. Vue imports
import { ref, computed } from 'vue'
import {
  SlidersHorizontal,
  X,
  Calendar,
  Globe,
  Clock,
  BarChart2,
  Hash,
  SlidersHorizontal as SortIcon
} from 'lucide-vue-next'

// 2. Component imports
import {
  DateRangePicker,
  TimeFrameSelector,
  PlatformSelector,
  SentimentToggle
} from './filters'
import { useAnalyticsStore } from '@/stores/analytics'

// 3. Type definitions
// Using types from @/types/analytics

// 4. Props and emits
// No props needed as we're using the store directly

// 5. State management
const isOpen = ref(false)
const analytics = useAnalyticsStore()

const activeFilterCount = computed(() => {
  let count = 0
  
  // Count active platforms
  if (analytics.filters.platforms.length > 0) count++
  
  // Count active sentiment toggles
  const sentiments = analytics.filters.visibleSentiments
  if (!sentiments.positive || !sentiments.neutral || !sentiments.negative) count++
  
  // Count if date range is not default (last 7 days)
  const defaultStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const defaultEnd = new Date()
  if (
    analytics.filters.dateRange.start.getTime() !== defaultStart.getTime() ||
    analytics.filters.dateRange.end.getTime() !== defaultEnd.getTime()
  ) count++
  
  // Count if min mentions is not 0
  if (analytics.filters.minMentions > 0) count++
  
  return count
})

// 6. Methods
function updateFilters(key: string, value: any) {
  analytics.updateFilters({ [key]: value })
}

function handleMinMentionsChange(event: Event) {
  const target = event.target as HTMLInputElement
  updateFilters('minMentions', parseInt(target.value))
}

function handleSortByChange(event: Event) {
  const target = event.target as HTMLSelectElement
  updateFilters('sortBy', target.value)
}
</script>

<template>
  <div>
    <!-- Filter Button -->
    <button
      @click="isOpen = true"
      class="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
    >
      <SlidersHorizontal class="h-5 w-5" />
      <span>Filters</span>
      <span
        v-if="activeFilterCount > 0"
        class="flex items-center justify-center w-5 h-5 text-xs bg-white text-green-600 rounded-full"
      >
        {{ activeFilterCount }}
      </span>
    </button>

    <!-- Overlay -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      @click="isOpen = false"
    />

    <!-- Panel -->
    <div
      v-if="isOpen"
      class="fixed inset-y-0 right-0 w-96 bg-[#fafafa] shadow-xl z-50 transform transition-transform duration-300"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
        <div class="flex items-center gap-2">
          <div class="w-1 h-6 bg-green-500 rounded-full shadow-sm"></div>
          <h2 class="text-lg font-semibold text-gray-800">Filters</h2>
        </div>
        <button
          @click="isOpen = false"
          class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Filter Sections -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-6 space-y-6">
          <!-- Date Range -->
          <div class="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center gap-2 text-gray-700">
              <Calendar class="w-4 h-4 text-green-600" />
              <h3 class="font-medium">Date Range</h3>
            </div>
            <DateRangePicker
              v-model="analytics.filters.dateRange"
              @update:modelValue="value => updateFilters('dateRange', value)"
              class="w-full"
            />
          </div>

          <!-- Platforms -->
          <div class="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center gap-2 text-gray-700">
              <Globe class="w-4 h-4 text-green-600" />
              <h3 class="font-medium">Platforms</h3>
            </div>
            <PlatformSelector
              v-model="analytics.filters.platforms"
              @update:modelValue="value => updateFilters('platforms', value)"
            />
          </div>

          <!-- Quick Timeframe -->
          <div class="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center gap-2 text-gray-700">
              <Clock class="w-4 h-4 text-green-600" />
              <h3 class="font-medium">Quick Timeframe</h3>
            </div>
            <TimeFrameSelector
              v-model="analytics.filters.timeFrame"
              @update:modelValue="value => updateFilters('timeFrame', value)"
            />
          </div>

          <!-- Sentiment Analysis -->
          <div class="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center gap-2 text-gray-700">
              <BarChart2 class="w-4 h-4 text-green-600" />
              <h3 class="font-medium">Sentiment Over Time</h3>
            </div>
            <SentimentToggle
              v-model="analytics.filters.visibleSentiments"
              @update:modelValue="value => updateFilters('visibleSentiments', value)"
            />
          </div>

          <!-- Minimum Mentions -->
          <div class="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-gray-700">
                <Hash class="w-4 h-4 text-green-600" />
                <h3 class="font-medium">Minimum Mentions</h3>
              </div>
              <span class="text-sm font-medium text-green-600">{{ analytics.filters.minMentions }}</span>
            </div>
            <div class="space-y-4">
              <input
                type="range"
                v-model="analytics.filters.minMentions"
                min="0"
                max="100"
                step="5"
                class="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-500"
                @change="handleMinMentionsChange"
              />
              <div class="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          </div>

          <!-- Sort By -->
          <div class="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center gap-2 text-gray-700">
              <SortIcon class="w-4 h-4 text-green-600" />
              <h3 class="font-medium">Sort By</h3>
            </div>
            <select
              v-model="analytics.filters.sortBy"
              class="w-full px-4 py-2.5 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer transition-colors"
              @change="handleSortByChange"
            >
              <option value="mentions">Mention Count</option>
              <option value="sentiment">Sentiment Ratio</option>
              <option value="growth">Growth Rate</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-200 bg-white">
        <button
          @click="analytics.resetFilters"
          class="w-full px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 hover:border-gray-300"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.h-\[calc\(100vh-10rem\)\] {
  height: calc(100vh - 10rem);
}
</style>