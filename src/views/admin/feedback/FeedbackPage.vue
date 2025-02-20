<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useFeedbackStore } from '@/stores/feedback'
import { websocketService } from '@/services/websocket'
import FeedbackFilters from './components/FeedbackFilters.vue'
import FeedbackTable from './components/FeedbackTable.vue'
import FeedbackDialog from './components/FeedbackDialog.vue'

const store = useFeedbackStore()

onMounted(async () => {
  try {
    // Initialize feedback with WebSocket for admin
    await store.initializeFeedback(true)
  } catch (err) {
    console.error('Failed to initialize admin feedback page:', err)
  }
})

onUnmounted(() => {
  // Clean up WebSocket connection
  websocketService.disconnect()
})
</script>

<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="flex-1">
            <h1 class="text-xl md:text-2xl font-medium text-green-800 mb-2">
              Feedback Management
            </h1>
            <p class="text-gray-600 text-lg">
              Review and manage user feedback, bug reports, and feature requests. Update statuses and track feedback trends to improve the user experience.
            </p>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-4">Filters</h2>
          <FeedbackFilters />
        </div>
      </div>

      <!-- Table Section -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="overflow-hidden">
          <FeedbackTable />
        </div>
      </div>

      <!-- Dialog -->
      <FeedbackDialog />
    </div>
  </div>
</template>

<route lang="json">
{
  "name": "admin-feedback",
  "path": "/admin/feedback"
}
</route>