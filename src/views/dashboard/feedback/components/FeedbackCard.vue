<script setup lang="ts">
import { Clock, AlertCircle, CheckCircle, MessageSquare } from 'lucide-vue-next'
import type { Feedback } from '@/services/feedback'
import { Button } from '@/components/ui/button'
import { useFeedback } from '../composables/useFeedback'

const props = defineProps<{
  item: Feedback
}>()

const store = useFeedback()

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'resolved': return 'bg-green-100 text-green-800 border-green-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return Clock
    case 'reviewed': return AlertCircle
    case 'resolved': return CheckCircle
    default: return null
  }
}

const getFeedbackType = (message: string) => {
  // Type is the first line
  const firstLine = message.split(/\r?\n/)[0].toLowerCase()
  return firstLine === 'bug' || firstLine === 'feature' || firstLine === 'support' ? firstLine : 'other'
}

const getMessageContent = (message: string) => {
  // Content is everything after the double newline
  const parts = message.split(/\r?\n\r?\n/)
  return parts.length > 1 ? parts[1].trim() : ''
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`
  }
  
  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`
}

const openDialog = () => {
  store.setSelectedItem(props.item)
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
    <!-- Main Feedback -->
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-sm font-medium text-gray-500">{{ item.user }}</span>
          <span class="text-sm text-gray-400">•</span>
          <span class="text-sm text-gray-500">{{ formatDate(item.created_at) }}</span>
        </div>
        <div class="text-gray-600 mb-2">
          <div class="space-y-3">
            <p class="text-sm text-gray-500">{{ getFeedbackType(item.message) }}</p>
            <p>{{ getMessageContent(item.message) }}</p>
          </div>
        </div>
        <div v-if="item.attachment" class="mt-2">
          <a 
            :href="item.attachment"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View Attachment
          </a>
        </div>
      </div>
      <div 
        :class="[
          'px-2 py-1 rounded-md border flex items-center space-x-1',
          getStatusColor(item.status)
        ]"
      >
        <component
          :is="getStatusIcon(item.status)"
          class="h-4 w-4"
        />
        <span class="capitalize">{{ item.status }}</span>
      </div>
    </div>

    <!-- View Conversation Button -->
    <div class="mt-4 flex justify-between items-center">
      <div v-if="item.replies.length" class="text-sm text-gray-500">
        {{ item.replies.length }} {{ item.replies.length === 1 ? 'reply' : 'replies' }}
        • Last reply {{ formatDate(item.replies[item.replies.length - 1].created_at) }}
      </div>
      <Button
        variant="outline"
        size="sm"
        class="text-xs"
        @click="openDialog"
      >
        <MessageSquare class="h-4 w-4 mr-1" />
        {{ item.replies.length ? 'View Conversation' : 'Reply' }}
      </Button>
    </div>
  </div>
</template>