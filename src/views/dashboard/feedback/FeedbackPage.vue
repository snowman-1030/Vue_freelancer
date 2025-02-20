<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useFeedback } from './composables/useFeedback'
import { websocketService } from '@/services/websocket'
import FeedbackHeader from './components/FeedbackHeader.vue'
import FeedbackStats from './components/FeedbackStats.vue'
import FeedbackForm from './components/FeedbackForm.vue'
import FeedbackList from './components/FeedbackList.vue'
import FeedbackDialog from './components/FeedbackDialog.vue'

const feedbackStore = useFeedback()

onMounted(async () => {
  try {
    // Initialize feedback with WebSocket for user
    await feedbackStore.initializeFeedback(false)
  } catch (err) {
    console.error('Failed to initialize feedback page:', err)
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
      <FeedbackHeader />
      <FeedbackStats />
      <FeedbackForm />
      <FeedbackList />
      <FeedbackDialog />
    </div>
  </div>
</template>