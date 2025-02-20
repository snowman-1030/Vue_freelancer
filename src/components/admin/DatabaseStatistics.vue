<template>
  <div class="bg-white rounded-lg shadow-sm overflow-hidden">
    <div class="p-6 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-semibold text-green-800">Database Statistics</h2>
          <p class="text-sm text-gray-500 mt-1">Showing tables with active records only</p>
        </div>
        <button
          @click="fetchTableStats"
          class="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
          :disabled="loading"
        >
          <RefreshCw class="h-4 w-4 mr-1.5" :class="{ 'animate-spin': loading }" />
          Refresh
        </button>
      </div>
    </div>

    <div class="p-6">
      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {{ error }}
      </div>

      <!-- Loading State -->
      <div v-if="loading && !tableStats.length" class="py-12 text-center text-gray-500">
        Loading database statistics...
      </div>

      <!-- No Data State -->
      <div v-else-if="!loading && !tableStats.length" class="py-12 text-center text-gray-500">
        No tables with active records found
      </div>

      <!-- Data Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Table Name
              </th>
              <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Live Rows
              </th>
              <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dead Rows
              </th>
              <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dead Row %
              </th>
              <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="stat in tableStats" :key="stat.table_name" :class="{
              'bg-red-100': stat.dead_tuple_percentage > 100,
              'bg-red-50': stat.dead_tuple_percentage > 20 && stat.dead_tuple_percentage <= 100,
              'bg-yellow-50': stat.dead_tuple_percentage > 10 && stat.dead_tuple_percentage <= 20
            }">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ stat.table_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                {{ formatNumber(stat.live_tuples) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                {{ formatNumber(stat.dead_tuples) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right" :class="getSeverityClass(stat.dead_tuple_percentage)">
                {{ stat.dead_tuple_percentage.toFixed(1) }}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
                <button
                  v-if="stat.dead_tuple_percentage > 10"
                  @click="vacuumTable(stat.table_name)"
                  :disabled="vacuumingTables.has(stat.table_name)"
                  class="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Loader2 v-if="vacuumingTables.has(stat.table_name)" class="h-3 w-3 mr-1 animate-spin" />
                  {{ vacuumingTables.has(stat.table_name) ? 'Cleaning...' : 'Clean Up' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 p-4 bg-gray-50 rounded-lg space-y-4">
        <div>
          <h3 class="text-sm font-medium text-gray-900 mb-2">Understanding the Statistics</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li><span class="font-medium">Live Rows:</span> Number of active records in the table</li>
            <li><span class="font-medium">Dead Rows:</span> Number of deleted or outdated records that need cleanup</li>
            <li><span class="font-medium">Dead Row %:</span> Percentage of dead rows relative to live rows</li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-900 mb-2">Color Coding</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>Red background (dark): >100% dead rows (critical cleanup needed)</li>
            <li>Red background (light): >20% dead rows (cleanup needed)</li>
            <li>Yellow background: 10-20% dead rows (consider cleanup)</li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-900 mb-2">Clean Up Process</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>Runs VACUUM ANALYZE on the table to remove dead rows</li>
            <li>Updates table statistics for more accurate row counts</li>
            <li>Live row counts may change if statistics were outdated</li>
            <li>A change in live rows after cleanup is normal and indicates more accurate counting</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RefreshCw, Loader2 } from 'lucide-vue-next'
import axios from '@/lib/axios'

interface TableStats {
  table_name: string
  live_tuples: number
  dead_tuples: number
  dead_tuple_percentage: number
}

const tableStats = ref<TableStats[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const vacuumingTables = ref<Set<string>>(new Set())

const fetchTableStats = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get('/settings/')
    tableStats.value = response.data
  } catch (err: any) {
    console.error('API Error:', err)
    error.value = err.response?.data?.error || err.response?.data?.detail || 'Failed to load database statistics'
  } finally {
    loading.value = false
  }
}

const vacuumTable = async (tableName: string) => {
  vacuumingTables.value.add(tableName)
  error.value = null
  
  try {
    const response = await axios.post('/settings/vacuum_table/', {
      table_name: tableName
    })
    
    // Update the stats for this table
    const index = tableStats.value.findIndex(t => t.table_name === tableName)
    if (index !== -1) {
      tableStats.value[index] = response.data
    }
  } catch (err: any) {
    console.error('Vacuum Error:', err)
    error.value = `Failed to vacuum table ${tableName}: ${err.response?.data?.error || err.message}`
  } finally {
    vacuumingTables.value.delete(tableName)
  }
}

// Helper function to determine severity class
const getSeverityClass = (percentage: number) => {
  if (percentage > 100) return 'bg-red-100 text-red-800'  // Critical
  if (percentage > 20) return 'bg-red-50 text-red-600'    // High
  if (percentage > 10) return 'bg-yellow-50 text-yellow-600'  // Medium
  return 'text-gray-500'  // Normal
}

// Helper function to format numbers
const formatNumber = (num: number) => num.toLocaleString()

onMounted(() => {
  fetchTableStats()
})
</script>