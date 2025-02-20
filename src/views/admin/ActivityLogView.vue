<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { RefreshCw, Filter, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import axios from '@/lib/axios'

interface Activity {
  id: number
  action_time: string
  user: string
  change_message: string
}

// Activity data
const activities = ref<Activity[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const itemsPerPage = 10

// Filter state
const filters = ref({
  method: '',
  actionType: '',
  username: '',
  dateRange: {
    start: '',
    end: ''
  }
})

// Computed total items
const totalItems = computed(() => {
  return activities.value?.length || 0
})

// Filter options
const methodOptions = [
  { value: '', label: 'All Methods' },
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' }
]

const actionTypeOptions = [
  { value: '', label: 'All Actions' },
  { value: 'keyword', label: 'Keyword Operations' },
  { value: 'profile', label: 'Profile Updates' },
  { value: 'auth', label: 'Authentication' },
  { value: 'system', label: 'System Access' }
]

function clearFilters() {
  filters.value = {
    method: '',
    actionType: '',
    username: '',
    dateRange: {
      start: '',
      end: ''
    }
  }
}

async function fetchActivities(page = 1) {
  loading.value = true
  try {
    const response = await axios.get('/admin/log', {
      params: {
        page,
        page_size: itemsPerPage,
        method: filters.value.method,
        action_type: filters.value.actionType,
        username: filters.value.username,
        date_start: filters.value.dateRange.start,
        date_end: filters.value.dateRange.end
      }
    })
    activities.value = response.data.results
    totalPages.value = Math.ceil(response.data.count / itemsPerPage)
    currentPage.value = page
  } catch (error) {
    console.error('Failed to fetch activities:', error)
  } finally {
    loading.value = false
  }
}

// Watch filters for changes
watch(filters, () => {
  fetchActivities(1) // Reset to first page when filters change
}, { deep: true })

function getMethodDetails(message: string): { method: string; details: string } {
  // Extract action type and details
  const actionTypes = {
    'Password change': 'PASSWORD',
    'Profile update': 'PROFILE',
    'Login': 'LOGIN',
    'Logout': 'LOGOUT',
    'Token refresh': 'TOKEN'
  }

  // Check for specific actions first
  for (const [actionText, actionType] of Object.entries(actionTypes)) {
    if (message.toLowerCase().includes(actionText.toLowerCase())) {
      return {
        method: actionType,
        details: message
      }
    }
  }

  // If no specific action found, extract HTTP method if present
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  for (const m of methods) {
    if (message.includes(m)) {
      return {
        method: m,
        details: message.replace(new RegExp(`^${m}\\s+`), '')
      }
    }
  }

  // Default case
  return {
    method: 'ACTION',
    details: message
  }
}

function getMethodColor(method: string): string {
  const colors = {
    'GET': 'bg-blue-100 text-blue-800',
    'POST': 'bg-green-100 text-green-800',
    'PUT': 'bg-yellow-100 text-yellow-800',
    'PATCH': 'bg-yellow-100 text-yellow-800',
    'DELETE': 'bg-red-100 text-red-800',
    'PASSWORD': 'bg-purple-100 text-purple-800',
    'PROFILE': 'bg-indigo-100 text-indigo-800',
    'LOGIN': 'bg-teal-100 text-teal-800',
    'LOGOUT': 'bg-orange-100 text-orange-800',
    'TOKEN': 'bg-cyan-100 text-cyan-800'
  }
  
  return colors[method] || 'bg-gray-100 text-gray-800'
}

function formatDetails(details: string): string {
  // Split by the separator for user agent and IP
  const mainPart = details.split(' | ')[0]
  
  // Clean up API paths
  if (mainPart.startsWith('/api/')) {
    const parts = mainPart.split('/')
    // Convert /api/logs/available-sources/ to "Get Available Sources"
    return parts
      .filter(p => p && p !== 'api')
      .map(p => p.replace(/-/g, ' '))
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' - ')
  }
  
  return mainPart
}

function extractUserAgent(message: string): string {
  const match = message.match(/User Agent: ([^|]+)/)
  return match ? match[1].trim() : 'Unknown'
}

function extractIP(message: string): string {
  const match = message.match(/IP: ([^|]+)/)
  return match ? match[1].trim() : 'Unknown'
}

onMounted(() => {
  fetchActivities()
})
</script>

<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-xl md:text-2xl font-medium text-grey-700">User Activity Log</h1>
        <button
          @click="fetchActivities(currentPage)"
          class="inline-flex items-center px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          :disabled="loading"
        >
          <RefreshCw
            class="w-5 h-5 mr-2"
            :class="{ 'animate-spin': loading }"
          />
          Refresh
        </button>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-lg shadow-sm mb-8">
        <div class="p-4 space-y-4">
          <div>
            <h2 class="text-lg font-medium text-gray-700">Activity Filters</h2>
            <p class="text-base text-gray-500">
              Filter activities by date range, method, and action type to focus your analysis.
            </p>
          </div>
          <div class="grid grid-cols-5 gap-4">
            <!-- Date Range Start -->
            <div class="relative">
              <input
                v-model="filters.dateRange.start"
                type="date"
                class="w-full pl-3 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <!-- Date Range End -->
            <div class="relative">
              <input
                v-model="filters.dateRange.end"
                type="date"
                class="w-full pl-3 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <!-- Username Filter -->
            <div class="relative">
              <Filter class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
              <input
                v-model="filters.username"
                type="text"
                placeholder="Filter by username..."
                class="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <!-- Method Filter -->
            <div class="relative">
              <Filter class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
              <select
                v-model="filters.method"
                class="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
              >
                <option
                  v-for="option in methodOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- Action Type Filter -->
            <div class="relative">
              <Filter class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
              <select
                v-model="filters.actionType"
                class="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
              >
                <option
                  v-for="option in actionTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Clear Filters -->
          <div class="flex justify-end">
            <button
              @click="clearFilters"
              class="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    
      <!-- Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="w-48 px-8 py-4 text-left text-base font-medium text-gray-700 uppercase tracking-wider">Time</th>
                <th class="w-40 px-8 py-4 text-left text-base font-medium text-gray-700 uppercase tracking-wider">User</th>
                <th class="w-32 px-8 py-4 text-left text-base font-medium text-gray-700 uppercase tracking-wider">Method</th>
                <th class="px-8 py-4 text-left text-base font-medium text-gray-700 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <template v-if="loading && !activities.length">
                <tr>
                  <td colspan="4" class="px-6 py-4 text-center text-base text-gray-600">
                    <div class="flex items-center justify-center space-x-2">
                      <RefreshCw class="w-5 h-5 animate-spin" />
                      <span>Loading activities...</span>
                    </div>
                  </td>
                </tr>
              </template>
              <template v-else-if="!activities.length">
                <tr>
                  <td colspan="4" class="px-6 py-4 text-center text-base text-gray-600">
                    No activities found
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr v-for="activity in activities" :key="activity.id" class="hover:bg-gray-50">
                  <td class="w-48 px-8 py-4 whitespace-nowrap text-base text-gray-600">
                    {{ new Date(activity.action_time).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    }).replace(',', ' -') }}
                  </td>
                  <td class="w-40 px-8 py-4 whitespace-nowrap">
                    <div class="text-base font-medium text-gray-700">
                      {{ activity.user }}
                    </div>
                  </td>
                  <td class="w-32 px-8 py-4 whitespace-nowrap">
                    <span
                      class="px-3 py-1 inline-flex text-sm font-normal rounded-md"
                      :class="getMethodColor(getMethodDetails(activity.change_message).method)"
                    >
                      {{ getMethodDetails(activity.change_message).method }}
                    </span>
                  </td>
                  <td class="px-8 py-4">
                    <div class="group relative">
                      <div class="text-base text-gray-600">
                        {{ formatDetails(getMethodDetails(activity.change_message).details) }}
                      </div>
                      <div class="hidden group-hover:block absolute left-0 top-full mt-2 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-10 w-96">
                        <div class="space-y-1">
                          <div><span class="font-medium">User Agent:</span> {{ extractUserAgent(activity.change_message) }}</div>
                          <div><span class="font-medium">IP:</span> {{ extractIP(activity.change_message) }}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <span class="text-sm text-gray-500">
            Showing {{ activities.length }} of {{ totalItems }} activities
          </span>
          <div class="flex items-center gap-2">
            <button
              class="p-1 rounded"
              :disabled="currentPage === 1"
              @click="fetchActivities(currentPage - 1)"
            >
              <ChevronLeft
                class="w-5 h-5"
                :class="currentPage === 1 ? 'text-gray-400' : 'text-gray-600'"
              />
            </button>
            <span class="text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
            <button
              class="p-1 rounded"
              :disabled="currentPage === totalPages"
              @click="fetchActivities(currentPage + 1)"
            >
              <ChevronRight
                class="w-5 h-5"
                :class="currentPage === totalPages ? 'text-gray-400' : 'text-gray-600'"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>