<script setup lang="ts">
import { computed } from 'vue'
import { Clock, MessageSquare, CheckCircle } from 'lucide-vue-next'
import type { FeedbackStatus } from '@/services/feedback'

const props = defineProps<{
  status: FeedbackStatus
}>()

const displayStatus = computed(() => {
  switch (props.status) {
    case 'pending':
      return 'Pending'
    case 'reviewed':
      return 'Under Review'
    case 'resolved':
      return 'Resolved'
    default:
      return props.status
  }
})

type StatusIcon = typeof Clock | typeof MessageSquare | typeof CheckCircle | null

const statusIcon = computed<StatusIcon>(() => {
  switch (props.status) {
    case 'pending':
      return Clock
    case 'reviewed':
      return MessageSquare
    case 'resolved':
      return CheckCircle
    default:
      return null
  }
})

const statusClass = computed(() => {
  switch (props.status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'reviewed':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'resolved':
      return 'bg-green-100 text-green-800 border-green-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md border"
    :class="statusClass"
  >
    <component
      :is="statusIcon"
      v-if="statusIcon"
      class="h-4 w-4 mr-1"
    />
    {{ displayStatus }}
  </span>
</template>