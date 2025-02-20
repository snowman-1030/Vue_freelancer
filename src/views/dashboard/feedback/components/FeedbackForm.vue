<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Loader2, AlertCircle } from 'lucide-vue-next'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import FileUpload from './FileUpload.vue'
import { useFeedback } from '../composables/useFeedback'
import { useAuthStore } from '@/stores/auth'

const isOpen = ref(false)
const feedbackStore = useFeedback()
const authStore = useAuthStore()
const submitError = ref('')

// Destructure isSubmitting from the store
const { isSubmitting } = feedbackStore

// Local form state
const title = ref('')
const type = ref('')
const description = ref('')
const attachment = ref<File | null>(null)

const handleSubmit = async () => {
		console.log('=== Feedback Submit Debug ===')
		
		// Validation
  if (!authStore.isAuthenticated()) {
    submitError.value = 'Please log in to submit feedback'
    return
  }
  
  if (!title.value || !type.value || !description.value) {
    submitError.value = 'Please fill in all required fields'
    return
  }
  
  // Combine fields into a formatted message
  const message = [
    type.value,
    description.value
  ].join('\n\n')

  console.log('FeedbackForm: Submitting with message:', message)
  
		submitError.value = ''
		
  try {
    // Update form data and submit
    feedbackStore.updateFormData({
      message,
      attachment: attachment.value || undefined
    })
    const result = await feedbackStore.submitFeedback()
    console.log('FeedbackForm: Submission successful:', result)
    
    // Reset form on success
    isOpen.value = false
    title.value = ''
    type.value = ''
    description.value = ''
    attachment.value = null
  } catch (error: any) {
				console.error('FeedbackForm: Submission failed:', error)
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      submitError.value = 'Your session has expired. Please log in again.'
      authStore.logout()
				} else if (error.response?.status === 413) {
      submitError.value = 'Attachment is too large. Please choose a smaller file.'
    } else {
      submitError.value = error.message || 'Failed to submit feedback. Please try again.'
    }
  }
}
</script>

<template>
  <div class="mb-8">
    <Button 
      class="bg-green-600 hover:bg-green-700 text-white rounded-md"
      @click="isOpen = true"
    >
      <Plus class="h-5 w-5 mr-2" /> Submit New Feedback
    </Button>

    <TransitionRoot appear :show="isOpen" as="template">
      <Dialog as="div" @close="isOpen = false" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-[600px] bg-white rounded-lg shadow-sm p-6">
                <DialogTitle class="text-lg font-semibold mb-2">Submit Feedback</DialogTitle>
                <p class="text-gray-600 mb-6">Please provide details about your feedback. We appreciate your input!</p>

                <form class="space-y-6">
                  <div class="space-y-2">
                    <Label for="title">Title</Label>
                    <Input 
                      id="title" 
                      v-model="title"
                      placeholder="Brief description of your feedback"
                      required
                    />
                  </div>

                  <div class="space-y-2">
                    <Label for="type">Type</Label>
                    <Select v-model="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="support">Support Request</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div class="space-y-2">
                    <Label for="description">Description</Label>
                    <Input
                      id="description"
                      v-model="description"
                      placeholder="Please provide detailed information..."
                      type="textarea"
                      class="min-h-32"
                      required
                    />
                  </div>

                  <div class="space-y-2">
                    <Label>Screenshot (optional)</Label>
                    <FileUpload
                      v-model="attachment"
                    />
                  </div>

                  <Alert>
                    <AlertDescription>
                      Your feedback will be visible to administrators who will respond as soon as possible.
                    </AlertDescription>
                  </Alert>

                  <!-- Error Alert -->
                  <Alert v-if="submitError" class="bg-red-50 border-red-200">
                    <AlertCircle class="h-4 w-4 text-red-600" />
                    <AlertDescription class="text-red-600">
                      {{ submitError }}
                    </AlertDescription>
                  </Alert>

                  <div class="flex justify-end space-x-4">
                    <Button
                      type="button"
                      class="rounded-md bg-red-100 hover:bg-red-200 text-red-600"
                      @click="isOpen = false"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      class="rounded-md bg-green-100 hover:bg-green-200 text-green-600"
                      :disabled="isSubmitting || !title || !type || !description"
                      @click="handleSubmit"
                    >
                      <template v-if="isSubmitting">
                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </template>
                      <template v-else>
                        Submit Feedback
                      </template>
                    </Button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>