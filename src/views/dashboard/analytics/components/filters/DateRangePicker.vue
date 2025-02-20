<script setup lang="ts">
// 1. Vue imports
import { ref, watch } from 'vue'
import { Calendar } from 'lucide-vue-next'

// 2. Component imports
// None needed

// 3. Type definitions
interface DateRange {
  start: Date
  end: Date
}

// 4. Props and emits
const props = defineProps<{
  modelValue: DateRange
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateRange): void
}>()

// 5. State management
const dateRange = ref<DateRange>({
  start: props.modelValue.start,
  end: props.modelValue.end
})

const isOpen = ref(false)

// Format date for input value
function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Parse date from input value
function parseDateFromInput(value: string): Date {
  const date = new Date(value)
  // Set time to midnight UTC to avoid timezone issues
  date.setUTCHours(0, 0, 0, 0)
  return date
}

// 6. Methods
function setPresetRange(days: number) {
  const end = new Date()
  end.setUTCHours(23, 59, 59, 999)
  
  const start = new Date()
  start.setDate(start.getDate() - days)
  start.setUTCHours(0, 0, 0, 0)
  
  dateRange.value = { start, end }
  updateDateRange()
}

function updateDateRange() {
  emit('update:modelValue', {
    start: dateRange.value.start,
    end: dateRange.value.end
  })
  isOpen.value = false
}

function handleStartDateChange(event: Event) {
  const input = event.target as HTMLInputElement
  dateRange.value.start = parseDateFromInput(input.value)
}

function handleEndDateChange(event: Event) {
  const input = event.target as HTMLInputElement
  dateRange.value.end = parseDateFromInput(input.value)
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  dateRange.value = {
    start: newValue.start,
    end: newValue.end
  }
}, { deep: true })
</script>

<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
    >
      <Calendar class="h-4 w-4 text-gray-500" />
      <span class="text-sm text-gray-700">
        {{ dateRange.start.toLocaleDateString() }} - {{ dateRange.end.toLocaleDateString() }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <div
      v-if="isOpen"
      class="absolute z-10 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg w-[calc(100%-16px)] right-2"
    >
      <div class="space-y-4">
        <!-- Quick Presets -->
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700">Quick Select</h3>
          <div class="flex gap-2">
            <button
              v-for="(days, label) in { '7d': 7, '30d': 30, '90d': 90 }"
              :key="label"
              @click="setPresetRange(days)"
              class="px-3 py-1 text-sm rounded-md border border-gray-300 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Last {{ label }}
            </button>
          </div>
        </div>

        <!-- Custom Range -->
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700">Custom Range</h3>
          <div class="flex flex-col gap-2">
            <div class="w-full">
              <label class="block text-xs text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                :value="formatDateForInput(dateRange.start)"
                @change="handleStartDateChange"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div class="w-full">
              <label class="block text-xs text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                :value="formatDateForInput(dateRange.end)"
                @change="handleEndDateChange"
                class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2">
          <button
            @click="isOpen = false"
            class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            @click="updateDateRange"
            class="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  </div>
</template>