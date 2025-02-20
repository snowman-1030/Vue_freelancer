<script setup lang="ts">
// 1. Vue imports
import { ref, onMounted, computed } from 'vue'

// 2. Component imports
import Button from '@/components/ui/button/Button.vue'
import Switch from '@/components/ui/switch/index.vue'
import { PlayCircle, PauseCircle, Activity, ChevronDown } from 'lucide-vue-next'
import axios from '@/lib/axios'

// 3. Type definitions
interface ScraperConfig {
  id: number
  source: string
  frequency: string
  is_enabled: boolean
  next_run: string | null
}

// 4. Props and emits
const props = defineProps<{
  source: string
  config: ScraperConfig
}>()

// 5. State management
const config = ref<ScraperConfig>(props.config)
const isRunning = ref(false)

const intervals = [
  { value: 'hourly_4', label: 'Every 4 Hours' },
  { value: 'hourly_6', label: 'Every 6 Hours' },
  { value: 'hourly_12', label: 'Every 12 Hours' },
  { value: 'daily', label: 'Every 24 Hours' }
]

// Format next run time
const formatNextRun = computed(() => {
  if (!config.value.next_run) return 'Not scheduled'
  
  const nextRun = new Date(config.value.next_run)
  const now = new Date()
  const diffHours = Math.round((nextRun.getTime() - now.getTime()) / (1000 * 60 * 60))
  
  if (diffHours === 0) return 'Next run: < 1 hour'
  return `Next run: ${diffHours} hour${diffHours === 1 ? '' : 's'}`
})

// 6. Methods
const updateConfig = async () => {
  try {
    const response = await axios.patch(`/scraper/${config.value.id}/`, {
      source: config.value.source,
      frequency: config.value.frequency,
      is_enabled: config.value.is_enabled
    })
    config.value = response.data
  } catch (error) {
    console.error('Failed to update scraper config:', error)
  }
}

const runNow = async () => {
  try {
    isRunning.value = true
    const response = await axios.post(`/scraper/${config.value.id}/run/`)
    if (response.data.next_run) {
      config.value.next_run = response.data.next_run
    }
  } catch (error) {
    console.error('Failed to trigger scraper:', error)
  } finally {
    isRunning.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg p-3 flex items-center justify-between border border-gray-200">
    <div class="flex items-center space-x-4">
      <Switch
        v-model="config.is_enabled"
        @update:model-value="updateConfig"
      />
      <span class="font-medium text-gray-700 min-w-[100px]">{{ source }}</span>
    </div>

    <div class="flex items-center space-x-4">
      <!-- Frequency Selector -->
      <div class="relative w-36">
        <select
          v-model="config.frequency"
          class="w-full appearance-none bg-white text-gray-600 pl-2 pr-7 py-1 rounded-md border border-gray-200 text-sm cursor-pointer"
          @change="updateConfig"
        >
          <option
            v-for="interval in intervals"
            :key="interval.value"
            :value="interval.value"
          >
            {{ interval.label }}
          </option>
        </select>
        <ChevronDown class="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>

      <!-- Next Run Time -->
      <div class="bg-white px-2 py-0.5 rounded-md border border-gray-200 w-36">
        <span class="text-sm text-gray-600 truncate block leading-6">
          {{ formatNextRun }}
        </span>
      </div>

      <!-- Run Now Button -->
      <Button
        variant="ghost"
        class="text-emerald-600 hover:text-emerald-700 p-1 rounded hover:bg-emerald-50 transition-colors"
        size="sm"
        :disabled="!config.is_enabled"
        @click="runNow"
        :title="isRunning ? 'Running...' : 'Run Now'"
      >
        <PlayCircle v-if="!isRunning" class="w-6 h-6" />
        <PauseCircle v-else class="w-6 h-6" />
      </Button>
    </div>
  </div>
</template>