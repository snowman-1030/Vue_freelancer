<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFeedback } from '@/views/dashboard/feedback/composables/useFeedback'
import type { FeedbackStatus } from '@/services/feedback'

const store = useFeedback()
const messagesContainer = ref<HTMLElement | null>(null)

// Computed properties to safely access store values
const selectedItem = computed(() => store.selectedItem.value)
const isLoading = computed(() => store.isLoading.value)

// Local state
const currentStatus = ref<FeedbackStatus>('pending')
const replyMessage = ref('')
const isSubmittingReply = ref(false)

const isOpen = computed({
  get: () => !!selectedItem.value,
  set: (value: boolean) => {
    if (!value) {
      close()
    }
  }
})

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(selectedItem, (newItem) => {
  if (newItem) {
    currentStatus.value = newItem.status
    replyMessage.value = '' // Reset reply message when opening new item
    scrollToBottom() // Scroll to bottom when opening new item
  }
})

// Watch for new replies and scroll to bottom
watch(() => selectedItem.value?.replies, () => {
  scrollToBottom()
}, { deep: true })

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

const close = () => {
  store.setSelectedItem(null)
  replyMessage.value = ''
}

const save = async () => {
  if (selectedItem.value && currentStatus.value !== selectedItem.value.status) {
    await store.updateStatus(selectedItem.value.id, currentStatus.value)
  }
}

const submitReply = async () => {
  if (!selectedItem.value || !replyMessage.value.trim()) return

  isSubmittingReply.value = true
  try {
    await store.createReply(selectedItem.value.id, replyMessage.value)
    replyMessage.value = '' // Clear the reply input on success
  } catch (error) {
    console.error('Failed to submit reply:', error)
  } finally {
    isSubmittingReply.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[600px] bg-white">
      <DialogHeader class="border-b border-gray-100 pb-4">
        <DialogTitle class="text-xl text-green-800">Feedback Details</DialogTitle>
        <DialogDescription class="text-gray-500">
          View and update the status of this feedback item.
        </DialogDescription>
      </DialogHeader>
      
      <div v-if="selectedItem" class="py-6 space-y-6">
        <!-- Original Feedback -->
        <div class="space-y-4">
          <div class="grid grid-cols-4 items-start gap-4">
            <Label class="text-right text-sm font-medium text-gray-600">User</Label>
            <div class="col-span-3 text-gray-900">{{ selectedItem.user }}</div>
          </div>
          <div class="grid grid-cols-4 items-start gap-4">
            <Label class="text-right text-sm font-medium text-gray-600">Type</Label>
            <div class="col-span-3 text-gray-900">{{ getFeedbackType(selectedItem.message) }}</div>
          </div>
          <div class="grid grid-cols-4 items-start gap-4">
            <Label class="text-right text-sm font-medium text-gray-600">Message</Label>
            <div class="col-span-3 text-gray-900">{{ getMessageContent(selectedItem.message) }}</div>
          </div>
          <div class="grid grid-cols-4 items-start gap-4">
            <Label class="text-right text-sm font-medium text-gray-600">Date</Label>
            <div class="col-span-3 text-gray-900">{{ formatDate(selectedItem.created_at) }}</div>
          </div>
          <div v-if="selectedItem.attachment" class="grid grid-cols-4 items-start gap-4">
            <Label class="text-right text-sm font-medium text-gray-600">Attachment</Label>
            <div class="col-span-3">
              <a 
                :href="selectedItem.attachment"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:text-blue-800"
              >
                View Attachment
              </a>
            </div>
          </div>
          <div class="grid grid-cols-4 items-start gap-4">
            <Label class="text-right text-sm font-medium text-gray-600">Status</Label>
            <div class="col-span-3">
              <Select v-model="currentStatus">
                <SelectTrigger class="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <!-- Conversation Thread -->
        <div class="border-t border-gray-100 pt-6 flex flex-col" style="height: 60vh">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Conversation</h3>
          
          <!-- Scrollable Messages Container -->
          <div class="flex-1 overflow-y-auto mb-4" ref="messagesContainer">
            <!-- Empty State -->
            <div v-if="!selectedItem.replies.length" class="text-center py-4 text-gray-500">
              No replies yet. Start the conversation by sending a message.
            </div>
            
            <!-- Replies List -->
            <div v-else class="space-y-4 px-1">
              <div 
                v-for="reply in selectedItem.replies" 
                :key="reply.id"
                class="p-4 rounded-lg"
                :class="[
                  reply.is_admin 
                    ? 'bg-green-50 border border-green-100' 
                    : 'bg-gray-50 border border-gray-100'
                ]"
              >
                <div class="flex justify-between items-start mb-2">
                  <span 
                    class="font-medium"
                    :class="[
                      reply.is_admin ? 'text-green-700' : 'text-gray-700'
                    ]"
                  >
                    {{ reply.user }}
                    <span v-if="reply.is_admin" class="text-xs ml-2 text-green-600">(Admin)</span>
                  </span>
                  <span class="text-sm text-gray-500">
                    {{ formatDate(reply.created_at) }}
                  </span>
                </div>
                <p class="text-gray-700">{{ reply.message }}</p>
              </div>
            </div>
          </div>

          <!-- Reply Form - Fixed at Bottom -->
          <div class="border-t border-gray-100 pt-4 bg-white">
            <Textarea
              v-model="replyMessage"
              placeholder="Type your reply..."
              class="w-full min-h-[100px] resize-none"
            />
            <div class="flex justify-end">
              <Button
                type="button"
                class="bg-green-600 hover:bg-green-700 text-white"
                :disabled="!replyMessage.trim() || isSubmittingReply"
                @click="submitReply"
              >
                <template v-if="isSubmittingReply">
                  <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </template>
                <template v-else>
                  Send Reply
                </template>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-4 pt-6 border-t border-gray-100">
        <Button
          variant="outline"
          @click="close"
        >
          Close
        </Button>
        <Button
          variant="default"
          class="bg-green-600 hover:bg-green-700 text-white"
          @click="save"
          :disabled="!selectedItem || isLoading || currentStatus === selectedItem?.status"
        >
          <template v-if="isLoading">
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </template>
          <template v-else>
            Update Status
          </template>
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>