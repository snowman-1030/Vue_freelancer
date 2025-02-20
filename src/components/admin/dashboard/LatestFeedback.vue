<script setup lang="ts">
// 1. Vue imports
import { ref, onMounted, computed } from 'vue'

// 2. Component imports
import { useAdminDashboardStore } from '@/stores/adminDashboard'
import { LoadingSpinner } from '@/components/ui/loading'
import { Clock, MessageSquare, CheckCircle } from 'lucide-vue-next'
import type { FeedbackData, FeedbackStatus } from '@/types/admin'

// 3. Type definitions
// Using imported FeedbackData type

// 4. Props and emits
const props = defineProps<{
  feedback: FeedbackData[]
  isLoading: boolean
}>()

// 5. State management
const store = useAdminDashboardStore()

// 6. Methods
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}

const displayStatus = computed(() => (status: string) => {
  console.log('Status value:', status) // Debug log
  switch (status.toLowerCase()) {
    case 'pending':
      return 'Pending'
    case 'reviewed':
      return 'Under Review'
    case 'resolved':
      return 'Resolved'
    default:
      return status
  }
})

type StatusIcon = typeof Clock | typeof MessageSquare | typeof CheckCircle | null

const getStatusIcon = (status: FeedbackStatus): StatusIcon => {
  const normalizedStatus = status.toLowerCase() as FeedbackStatus
  switch (normalizedStatus) {
    case 'pending':
      return Clock
    case 'reviewed':
      return MessageSquare
    case 'resolved':
      return CheckCircle
    default:
      return null
  }
}

const getStatusClass = (status: FeedbackStatus): string => {
  console.log('Status for class:', status) // Debug log
  const normalizedStatus = status.toLowerCase() as FeedbackStatus
  switch (normalizedStatus) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'reviewed':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'resolved':
      return 'bg-green-100 text-green-800 border-green-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}
</script>

<template>
  <div class="flex flex-col space-y-4 bg-white rounded-lg shadow-sm p-6">
    <h2 class="text-xl font-semibold text-green-800">Latest Feedback</h2>
    <div v-if="isLoading" class="flex justify-center">
      <LoadingSpinner />
    </div>
    <div v-else class="space-y-2">
      <div v-for="item in feedback" :key="item.id"
           class="flex flex-col p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
        <div class="flex items-center justify-between mb-2">
          <span class="font-medium text-gray-900">{{ item.user.username }}</span>
          <span 
            class="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md border"
            :class="getStatusClass(item.status)"
          >
            <component
              :is="getStatusIcon(item.status)"
              v-if="getStatusIcon(item.status)"
              class="h-4 w-4 mr-1"
            />
            {{ displayStatus(item.status) }}
          </span>
        </div>
        <p class="text-gray-600 text-sm">{{ item.message }}</p>
        <span class="text-xs text-gray-500 mt-2">{{ formatDate(item.created_at) }}</span>
      </div>
    </div>
  </div>
</template>