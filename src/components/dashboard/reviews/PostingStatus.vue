<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { AlertCircle, CheckCircle2, Clock, RefreshCw, XCircle } from 'lucide-vue-next'
import type { PostingAttempt } from '@/types/reviews'
import { getPostingStatus, retryPosting } from '@/services/forum'
import type { Component } from 'vue'

const props = defineProps<{
  attemptId: number
}>()

const attempt = ref<PostingAttempt | null>(null)
const isLoading = ref(false)
const pollingInterval = ref<number | null>(null)

// Status icon mapping
const statusIcons: Record<PostingAttempt['status'], Component> = {
  pending: Clock,
  in_progress: RefreshCw,
  success: CheckCircle2,
  failed: XCircle,
  scheduled: Clock
}

// Status color mapping
const statusColors: Record<PostingAttempt['status'], string> = {
  pending: 'text-yellow-500',
  in_progress: 'text-blue-500',
  success: 'text-green-500',
  failed: 'text-red-500',
  scheduled: 'text-purple-500'
}

// Error type display mapping
const errorTypeDisplay: Record<NonNullable<PostingAttempt['error_type']>, string> = {
  login_failed: 'Login Failed',
  thread_locked: 'Thread Locked',
  permission_denied: 'Permission Denied',
  network_error: 'Network Error',
  post_rejected: 'Post Rejected',
  other: 'Other Error'
}

async function fetchStatus() {
  if (!props.attemptId) return
  
  try {
    isLoading.value = true
    const response = await getPostingStatus(props.attemptId)
    attempt.value = response.data
    
    // Stop polling if we reach a final state
    if (['success', 'failed'].includes(response.data.status)) {
      stopPolling()
    }
  } catch (error) {
    console.error('Error fetching posting status:', error)
  } finally {
    isLoading.value = false
  }
}

function startPolling() {
  if (pollingInterval.value) return
  
  // Poll every 5 seconds
  pollingInterval.value = window.setInterval(fetchStatus, 5000)
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

async function handleRetry() {
  if (!props.attemptId) return
  
  try {
    isLoading.value = true
    await retryPosting(props.attemptId)
    await fetchStatus()
    startPolling()
  } catch (error) {
    console.error('Error retrying posting:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStatus()
  startPolling()
})

watch(() => props.attemptId, (newId) => {
  if (newId) {
    fetchStatus()
    startPolling()
  } else {
    stopPolling()
  }
})

// Clean up polling on component unmount
onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div v-if="attempt" class="rounded-lg border p-4 space-y-3">
    <!-- Status Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <component
          :is="statusIcons[attempt.status]"
          :class="[
            statusColors[attempt.status],
            { 'animate-spin': attempt.status === 'in_progress' }
          ]"
          class="h-5 w-5"
        />
        <span class="font-medium capitalize">{{ attempt.status.replace('_', ' ') }}</span>
      </div>
      <span class="text-sm text-gray-500">
        {{ new Date(attempt.created_at).toLocaleString() }}
      </span>
    </div>

    <!-- Forum Info -->
    <div class="text-sm text-gray-600">
      <p>Forum: {{ attempt.forum_name }}</p>
      <p>Username: {{ attempt.forum_username }}</p>
    </div>

    <!-- Error Details -->
    <div v-if="attempt.error_type" class="bg-red-50 border border-red-100 rounded p-3">
      <div class="flex items-start space-x-2">
        <AlertCircle class="h-5 w-5 text-red-500 mt-0.5" />
        <div>
          <p class="font-medium text-red-800">
            {{ errorTypeDisplay[attempt.error_type] }}
          </p>
          <p class="mt-1 text-sm text-red-700">
            {{ attempt.error_message }}
          </p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="attempt.status === 'failed'" class="flex justify-end">
      <button
        @click="handleRetry"
        :disabled="isLoading"
        class="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        <RefreshCw v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
        <RefreshCw v-else class="mr-2 h-4 w-4" />
        Retry (Attempt {{ attempt.retry_count + 1 }})
      </button>
    </div>
  </div>
</template>
