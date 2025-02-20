import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/lib/axios'

// Types
interface ScraperSchedule {
  source: string
  next_run: string | null
}

interface SourceMapping {
  [key: string]: string
}

// Store definition
export const useScraperScheduleStore = defineStore('scraperSchedule', () => {
  // State
  const schedules = ref<ScraperSchedule[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Source mapping
  const sourceMapping: SourceMapping = {
    'rollitup.org': 'rollitup',
    'thcfarmer.com': 'thcfarmer',
    'icmag.com': 'icmag',
    '420magazine.com': 'magazine420',
    'overgrow.com': 'overgrow',
    'ilgmforum.com': 'ilgm',
    'homegrowncannabisco.community': 'homegrown',
    'growersnetwork.org': 'growersnetwork',
    'reddit.com': 'reddit',
    'autoflower.org': 'autoflower',
    'growweedeasy.com': 'growweedeasy',
    'marijuanapassion.com': 'marijuanapassion',
    'beanbasement.nl': 'beanbasement',
    'phenohunter.org': 'phenohunter',
    'uk420.com': 'uk420',
    'percysgrowroom.com': 'percysgrowroom',
    '420sa.co.za': 'sa420'
  }

  // Getters
  const getNextRun = computed(() => {
    return (source: string): string | null => {
      const shortSource = sourceMapping[source] || source
      const schedule = schedules.value.find(s => s.source === shortSource)
      return schedule?.next_run || null
    }
  })

  // Actions
  async function fetchSchedules(): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      const response = await axios.get<ScraperSchedule[]>('/scraper/schedules/')
      schedules.value = response.data
    } catch (err: unknown) {
      console.error('Error fetching scraper schedules:', err)
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Failed to load scraper schedules'
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    schedules,
    isLoading,
    error,
    // Getters
    getNextRun,
    // Actions
    fetchSchedules
  }
})