<template>
  <div class="space-y-4">
    <!-- Bulk Actions -->
    <div v-if="selectedOperations.length > 0" class="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
      <span class="text-sm text-gray-600">{{ selectedOperations.length }} items selected</span>
      <button
        @click="confirmBulkDelete"
        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
      >
        Delete Selected
      </button>
    </div>

    <!-- Operations Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="rounded border-gray-300 text-green-600 focus:ring-green-500"
              >
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="operation in operations" :key="operation.operation_id">
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                :value="operation.operation_id"
                v-model="selectedOperations"
                class="rounded border-gray-300 text-green-600 focus:ring-green-500"
              >
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="capitalize">{{ operation.operation_type }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(operation.status)">
                {{ operation.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ formatDate(operation.started_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ operation.status === 'in_progress' ? 'In Progress' : formatDuration(operation.duration) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-if="operation.file_name">
                {{ operation.file_name }}
                <span v-if="operation.formatted_size" class="text-gray-500">
                  ({{ operation.formatted_size }})
                </span>
              </span>
              <span v-else>-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap space-x-2">
              <button
                @click="showDetails(operation)"
                class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm"
              >
                View
              </button>
              <button
                @click="confirmDelete(operation.operation_id)"
                class="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div class="flex flex-1 justify-between sm:hidden">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= Math.ceil(totalItems / itemsPerPage)"
          class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            {{ totalItems === 0 ? 'No results' :
              `Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} results`
            }}
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Previous</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
              </svg>
            </button>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage >= Math.ceil(totalItems / itemsPerPage)"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">Next</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedOperation" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">Operation Details</h3>
          <button @click="selectedOperation = null" class="text-gray-500 hover:text-gray-700">
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Operation Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-gray-500">Operation Type</p>
              <p class="mt-1 capitalize">{{ selectedOperation.operation_type }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Status</p>
              <p class="mt-1">
                <span :class="getStatusClass(selectedOperation.status)">
                  {{ selectedOperation.status }}
                </span>
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Started At</p>
              <p class="mt-1">{{ formatDate(selectedOperation.started_at) }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Duration</p>
              <p class="mt-1">
                {{ selectedOperation.status === 'in_progress' ? 'In Progress' : formatDuration(selectedOperation.duration) }}
              </p>
            </div>
            <div v-if="selectedOperation.file_name">
              <p class="text-sm font-medium text-gray-500">File</p>
              <p class="mt-1">
                {{ selectedOperation.file_name }}
                <span v-if="selectedOperation.formatted_size" class="text-gray-500">
                  ({{ selectedOperation.formatted_size }})
                </span>
              </p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="selectedOperation.error_message" class="mt-4">
            <p class="text-sm font-medium text-red-500">Error</p>
            <p class="mt-1 text-red-600">{{ selectedOperation.error_message }}</p>
          </div>

          <!-- Operation Stages -->
          <div class="mt-6">
            <h4 class="text-lg font-medium mb-4">Operation Stages</h4>
            <div class="space-y-4">
              <div v-for="stage in selectedOperation.stages" :key="stage.timestamp" class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="h-4 w-4 rounded-full bg-blue-500 mt-1"></div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium">{{ stage.stage }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(stage.timestamp) }}</p>
                  <p v-if="stage.details" class="mt-1 text-sm text-gray-600">{{ stage.details }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Operation Log</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Are you sure you want to delete this operation log? This action cannot be undone.
            </p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              @click="deleteOperation(operationToDelete)"
              :disabled="isDeleting"
              class="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
            <button
              @click="showDeleteConfirm = false"
              :disabled="isDeleting"
              class="px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Delete Confirmation Modal -->
    <div v-if="showBulkDeleteConfirm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Multiple Operation Logs</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Are you sure you want to delete {{ selectedOperations.length }} operation logs? This action cannot be undone.
            </p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              @click="bulkDelete"
              :disabled="isDeleting"
              class="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete All Selected' }}
            </button>
            <button
              @click="showBulkDeleteConfirm = false"
              :disabled="isDeleting"
              class="px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { databaseService, type DatabaseOperation } from '@/services/database'

const operations = ref<DatabaseOperation[]>([])
const selectedOperation = ref<DatabaseOperation | null>(null)
const selectedOperations = ref<string[]>([])
const currentPage = ref(1)
const totalItems = ref(0)
const itemsPerPage = 5
const showDeleteConfirm = ref(false)
const operationToDelete = ref<string | null>(null)
const showBulkDeleteConfirm = ref(false)
const isDeleting = ref(false)

const isAllSelected = computed(() => {
  return operations.value.length > 0 && selectedOperations.value.length === operations.value.length
})

// Load operations on mount and when page changes
async function loadOperations(page: number = 1) {
  try {
    const response = await databaseService.listOperations(page, itemsPerPage)
    if (Array.isArray(response)) {
      operations.value = response.slice((page - 1) * itemsPerPage, page * itemsPerPage)
      totalItems.value = response.length
    } else {
      operations.value = response.operations
      totalItems.value = response.total
    }
  } catch (error) {
    console.error('Failed to load operations:', error)
  }
}

// Toggle select all operations
function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedOperations.value = []
  } else {
    selectedOperations.value = operations.value.map((op: DatabaseOperation) => op.operation_id)
  }
}

// Delete single operation
async function deleteOperation(operationId: string | null) {
  if (!operationId) return

  try {
    isDeleting.value = true
    await databaseService.deleteOperation(operationId)
    await loadOperations(currentPage.value)
    showDeleteConfirm.value = false
    operationToDelete.value = null
  } catch (error) {
    console.error('Failed to delete operation:', error)
  } finally {
    isDeleting.value = false
  }
}

// Confirm single operation deletion
function confirmDelete(operationId: string) {
  operationToDelete.value = operationId
  showDeleteConfirm.value = true
}

// Delete multiple operations
async function bulkDelete() {
  try {
    isDeleting.value = true
    await databaseService.bulkDeleteOperations(selectedOperations.value)
    selectedOperations.value = []
    await loadOperations(currentPage.value)
    showBulkDeleteConfirm.value = false
  } catch (error) {
    console.error('Failed to delete operations:', error)
  } finally {
    isDeleting.value = false
  }
}

// Confirm bulk deletion
function confirmBulkDelete() {
  showBulkDeleteConfirm.value = true
}

// Handle page change
function changePage(page: number) {
  currentPage.value = page
  loadOperations(page)
}

// Format date for display
function formatDate(date: string): string {
  return new Date(date).toLocaleString()
}

// Format duration in milliseconds to human readable format
function formatDuration(milliseconds: number | undefined | null): string {
  if (!milliseconds) return '-'
  
  const seconds = milliseconds / 1000
  if (seconds < 1) {
    return `${seconds.toFixed(2)}s`
  }
  
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

// Get CSS classes for status display
function getStatusClass(status: string): string {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full'
  switch (status) {
    case 'completed':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'failed':
      return `${baseClasses} bg-red-100 text-red-800`
    case 'in_progress':
      return `${baseClasses} bg-blue-100 text-blue-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
}

// Show operation details
function showDetails(operation: DatabaseOperation): void {
  selectedOperation.value = operation
}

onMounted(() => {
  loadOperations()
})
</script>
