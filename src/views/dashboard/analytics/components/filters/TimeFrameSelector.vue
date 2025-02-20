<script setup lang="ts">
// 1. Vue imports
import { ref, watch } from 'vue'
import { Clock } from 'lucide-vue-next'
import { useAnalyticsStore } from '@/stores/analytics'

// 2. Component imports
// None needed

// 3. Type definitions
type TimeFrame = '7d' | '30d' | '90d'

interface TimeFrameOption {
  value: TimeFrame
  label: string
  description: string
  days: number
}

// 4. Props and emits
const props = defineProps<{
  modelValue: TimeFrame
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TimeFrame): void
}>()

// 5. State management
const selectedTimeFrame = ref<TimeFrame>(props.modelValue)
const analytics = useAnalyticsStore()

const timeFrameOptions: TimeFrameOption[] = [
  {
    value: '7d',
    label: '7 Days',
    description: 'View data from the past week',
    days: 7
  },
  {
    value: '30d',
    label: '30 Days',
    description: 'View data from the past month',
    days: 30
  },
  {
    value: '90d',
    label: '90 Days',
    description: 'View data from the past quarter',
    days: 90
  }
]

// 6. Methods
function selectTimeFrame(timeFrame: TimeFrame) {
  selectedTimeFrame.value = timeFrame
  
  // Update both the timeFrame and dateRange in the store
  const option = timeFrameOptions.find(opt => opt.value === timeFrame)
  if (option) {
    const end = new Date()
    end.setUTCHours(23, 59, 59, 999)
    
    const start = new Date()
    start.setDate(start.getDate() - option.days)
    start.setUTCHours(0, 0, 0, 0)
    
    // Update both timeFrame and dateRange together
    analytics.updateFilters({
      timeFrame,
      dateRange: { start, end }
    })
  }
  
  emit('update:modelValue', timeFrame)
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  selectedTimeFrame.value = newValue
})
</script>

<template>
  <div class="relative inline-block">
    <div class="flex gap-2">
      <button
        v-for="option in timeFrameOptions"
        :key="option.value"
        @click="selectTimeFrame(option.value)"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500',
          selectedTimeFrame === option.value
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'border border-gray-300 text-gray-700 hover:border-green-500'
        ]"
        :title="option.description"
      >
        <Clock
          v-if="selectedTimeFrame === option.value"
          class="h-4 w-4"
        />
        {{ option.label }}
      </button>
    </div>
  </div>
</template>