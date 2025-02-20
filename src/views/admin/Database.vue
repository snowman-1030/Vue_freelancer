<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { databaseService, type BackupInfo, type DatabaseHealth } from '@/services/database'
import DatabaseOperationList from '@/components/admin/DatabaseOperationList.vue'
import DatabaseStatistics from '@/components/admin/DatabaseStatistics.vue'
import { Database, Timer, Files, History } from 'lucide-vue-next'

// State
const backups = ref<BackupInfo[]>([])
const isBackingUp = ref(false)
const isRestoring = ref(false)
const isDeleting = ref(false)
const currentOperation = ref<string>('')
const errorMessage = ref<string>('')
const successMessage = ref<string>('')
const health = ref<DatabaseHealth | null>(null)
const healthCheckInterval = ref<number | null>(null)

// Methods
async function checkDatabaseHealth() {
  try {
    health.value = await databaseService.checkHealth()
  } catch (error) {
    console.error('Health check error:', error)
  }
}

async function initiateBackup() {
  isBackingUp.value = true
  errorMessage.value = ''
  currentOperation.value = 'Initializing backup'
  
  try {
    const response = await databaseService.createBackup()
    if (response.status === 'success') {
      successMessage.value = response.message || 'Backup completed successfully'
      // Refresh backup list
      await fetchBackups()
    } else {
      throw new Error(response.message || 'Backup failed')
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to create backup'
    console.error('Backup error:', error)
  } finally {
    isBackingUp.value = false
    currentOperation.value = ''
  }
}

async function initiateRestore(backup: BackupInfo) {
  if (!confirm(`Are you sure you want to restore from backup: ${backup.filename}? This will overwrite the current database.`)) {
    return
  }

  isRestoring.value = true
  errorMessage.value = ''
  currentOperation.value = 'Validating backup file'

  try {
    const response = await databaseService.restoreBackup(backup.filename)
    if (response.status === 'success') {
      successMessage.value = response.message || 'Database restored successfully'
    } else {
      throw new Error(response.message || 'Restore failed')
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to restore backup'
    console.error('Restore error:', error)
  } finally {
    isRestoring.value = false
    currentOperation.value = ''
  }
}

async function initiateDelete(backup: BackupInfo) {
  if (!confirm(`Are you sure you want to delete backup: ${backup.filename}? This action cannot be undone.`)) {
    return
  }

  isDeleting.value = true
  errorMessage.value = ''
  currentOperation.value = 'Deleting backup file'

  try {
    const response = await databaseService.deleteBackup(backup.filename)
    if (response.status === 'success') {
      successMessage.value = response.message || 'Backup deleted successfully'
      // Refresh backup list
      await fetchBackups()
    } else {
      throw new Error(response.message || 'Delete failed')
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to delete backup'
    console.error('Delete error:', error)
  } finally {
    isDeleting.value = false
    currentOperation.value = ''
  }
}

async function fetchBackups() {
  try {
    const response = await databaseService.listBackups()
    if (response.status === 'success') {
      backups.value = response.backups
    } else {
      throw new Error(response.message || 'Failed to fetch backups')
    }
  } catch (error) {
    console.error('Error fetching backups:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to fetch backups'
  }
}

// Clear messages after 5 seconds
function clearMessages() {
  if (successMessage.value || errorMessage.value) {
    setTimeout(() => {
      successMessage.value = ''
      errorMessage.value = ''
    }, 5000)
  }
}

// Watch for message changes
watch([successMessage, errorMessage], clearMessages)

onMounted(() => {
  fetchBackups()
  checkDatabaseHealth()
  // Poll health status every 30 seconds
  healthCheckInterval.value = window.setInterval(checkDatabaseHealth, 30000)
})

onUnmounted(() => {
  if (healthCheckInterval.value) {
    clearInterval(healthCheckInterval.value)
  }
})
</script>

<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-bold text-green-800 mb-2">
              Database Management
            </h1>
            <p class="text-gray-600 text-lg">
              Manage database backups and operations. Create, restore, and monitor database activities to ensure data integrity and safety.
            </p>
          </div>
          <div>
            <button
              @click="initiateBackup"
              :disabled="isBackingUp || isRestoring || isDeleting"
              class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isBackingUp">Backing up...</span>
              <span v-else>Create Backup</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Status Messages -->
      <div v-if="currentOperation || errorMessage || successMessage" class="mb-8">
        <div v-if="currentOperation" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p class="text-blue-700">{{ currentOperation }}</p>
        </div>
        
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p class="text-red-700">{{ errorMessage }}</p>
        </div>
        
        <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <p class="text-green-700">{{ successMessage }}</p>
        </div>
      </div>

      <!-- Database Health -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center gap-2 mb-1">
            <Database class="h-4 w-4 text-gray-500" />
            <h3 class="text-sm font-medium text-gray-500">Connection Status</h3>
          </div>
          <div class="flex items-center">
            <div :class="health?.status === 'connected' ? 'text-green-600' : 'text-red-600'" class="text-xl font-semibold flex items-center gap-2">
              {{ health?.status === 'connected' ? 'Connected' : 'Disconnected' }}
            </div>
            <div v-if="health?.status === 'connected'" class="ml-2 h-2 w-2 rounded-full bg-green-500"></div>
            <div v-else class="ml-2 h-2 w-2 rounded-full bg-red-500"></div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center gap-2 mb-1">
            <Timer class="h-4 w-4 text-gray-500" />
            <h3 class="text-sm font-medium text-gray-500">Connection Latency</h3>
          </div>
          <div class="text-xl font-semibold flex items-center gap-2" :class="{
            'text-green-600': health?.latency < 100,
            'text-yellow-600': health?.latency >= 100 && health?.latency < 300,
            'text-red-600': health?.latency >= 300
          }">
            {{ health?.status === 'connected' ? `${health.latency}ms` : 'N/A' }}
          </div>
        </div>
      </div>

      <!-- Backups List -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <Files class="h-5 w-5 text-green-800" />
            <h2 class="text-xl font-semibold text-green-800">Available Backups</h2>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filename
                </th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="backup in backups" :key="backup.filename">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ backup.filename }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ new Date(backup.created_at).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ backup.size }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex space-x-2">
                    <button
                      @click="initiateRestore(backup)"
                      :disabled="isBackingUp || isRestoring || isDeleting"
                      class="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <span v-if="isRestoring">Restoring...</span>
                      <span v-else>Restore</span>
                    </button>
                    <button
                      @click="initiateDelete(backup)"
                      :disabled="isBackingUp || isRestoring || isDeleting"
                      class="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <span v-if="isDeleting">Deleting...</span>
                      <span v-else>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="backups.length === 0">
                <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                  No backups available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Operation Logs -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <History class="h-5 w-5 text-green-800" />
            <h2 class="text-xl font-semibold text-green-800">Operation Logs</h2>
          </div>
        </div>
        <div class="p-6">
          <DatabaseOperationList />
        </div>
      </div>

      <!-- Database Statistics -->
      <DatabaseStatistics />
    </div>
  </div>
</template>
