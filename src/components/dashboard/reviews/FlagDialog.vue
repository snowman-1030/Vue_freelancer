<script setup lang="ts">
import { ref } from 'vue'
import { X, AlertTriangle } from 'lucide-vue-next'
import type { ReviewMention, ReviewFlag } from '@/types/reviews'

const props = defineProps<{
  review: ReviewMention
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', flag: Omit<ReviewFlag, 'id' | 'date'>): void
}>()

const flagReason = ref('')
const notes = ref('')
const assignedTo = ref('')

const flagCategories = [
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'legal_issue', label: 'Legal Issue' },
  { value: 'quality_concern', label: 'Quality Concern' },
  { value: 'urgent', label: 'Urgent Attention Required' },
  { value: 'spam', label: 'Spam or Misleading' }
]

function handleSubmit() {
  if (flagReason.value) {
    emit('submit', {
      reason: flagReason.value,
      notes: notes.value,
      assignedTo: assignedTo.value || undefined,
      status: 'open',
      reviewId: props.review.id
    })
    resetForm()
  }
}

function resetForm() {
  flagReason.value = ''
  notes.value = ''
  assignedTo.value = ''
}

function handleClose() {
  resetForm()
  emit('close')
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-lg max-w-md w-full">
      <!-- Header -->
      <div class="bg-red-600 p-6 rounded-t-lg flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <AlertTriangle class="h-5 w-5 text-white" />
          <h3 class="text-xl font-semibold text-white">Flag Review</h3>
        </div>
        <button @click="handleClose" class="text-red-100 hover:text-white hover:bg-red-500 p-1 rounded">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Review Info -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">{{ review.content }}</p>
          <div class="mt-2 text-xs text-gray-500">
            By {{ review.author }} • {{ review.post_date }}
          </div>
        </div>

        <!-- Flag Form -->
        <div class="space-y-4">
          <!-- Flag Category -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Flag Reason <span class="text-red-500">*</span>
            </label>
            <select
              v-model="flagReason"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select a reason</option>
              <option
                v-for="category in flagCategories"
                :key="category.value"
                :value="category.value"
              >
                {{ category.label }}
              </option>
            </select>
          </div>

          <!-- Assign To -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Assign To
            </label>
            <select
              v-model="assignedTo"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Unassigned</option>
              <option value="support_team">Support Team</option>
              <option value="legal_team">Legal Team</option>
              <option value="quality_team">Quality Team</option>
            </select>
          </div>

          <!-- Notes -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              v-model="notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Add any additional context or notes..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-100 flex justify-end space-x-3">
        <button 
          @click="handleClose"
          class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="!flagReason"
          class="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Flag Review
        </button>
      </div>
    </div>
  </div>
</template>
