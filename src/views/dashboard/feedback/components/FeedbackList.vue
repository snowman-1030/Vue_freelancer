<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Loader2, MessageSquarePlus, ArrowRight } from 'lucide-vue-next'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useFeedback } from '../composables/useFeedback'
import FeedbackCard from './FeedbackCard.vue'

const feedbackStore = useFeedback()

// Handle submit feedback click
const handleSubmitClick = () => {
  // Reset form before showing it
  feedbackStore.resetForm()
  // Update form data to show it
  feedbackStore.updateFormData({ message: '' })
}

// Computed properties to safely access store values
const items = computed(() => feedbackStore.items.value)
const filteredItems = computed(() => feedbackStore.filteredItems.value)
const isLoading = computed(() => feedbackStore.isLoading.value)
const error = computed(() => feedbackStore.error.value)

onMounted(async () => {
  await feedbackStore.fetchUserFeedback()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <Loader2 class="h-8 w-8 animate-spin text-green-600" />
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive">
      <AlertDescription>
        {{ error }}
      </AlertDescription>
    </Alert>

    <!-- Empty State -->
    <div
      v-else-if="!items.length"
      class="flex flex-col items-center justify-center min-h-[16rem] bg-white rounded-lg border border-gray-100 py-12 px-6 text-center my-8"
    >
      <div class="relative mb-6">
        <div class="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center">
          <MessageSquarePlus class="w-8 h-8 text-purple-400" />
        </div>
        
        <!-- Speech bubble decorative elements -->
        <div class="absolute -right-3 -top-1 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
          <span class="text-purple-400 text-xs">?</span>
        </div>
        <div class="absolute -left-3 -bottom-1 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
          <span class="text-purple-400 text-xs">!</span>
        </div>
        
        <!-- Animated pulse ring -->
        <div class="absolute inset-0 w-16 h-16 rounded-full border-2 border-purple-100 animate-pulse" />
      </div>

      <h3 class="text-lg font-medium text-gray-900 mb-2">
        No Feedback Yet
      </h3>
      <p class="text-gray-500 text-sm mb-5 max-w-[280px]">
        Share your thoughts and help us improve. Your feedback shapes the future of our platform.
      </p>

      <button
        @click="handleSubmitClick"
        class="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
      >
        <MessageSquarePlus class="w-4 h-4 mr-2" />
        Submit Feedback
        <ArrowRight class="w-4 h-4 ml-2" />
      </button>
    </div>

    <!-- Feedback List -->
    <template v-else>
      <FeedbackCard
        v-for="item in filteredItems"
        :key="item.id"
        :item="item"
      />
    </template>
  </div>
</template>