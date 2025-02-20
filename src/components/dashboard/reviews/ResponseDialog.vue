<script setup lang="ts">
import { ref, computed } from 'vue'
import { MessageCircle, Wand2, X, Save, AlertTriangle } from 'lucide-vue-next'
import { useTemplatesStore, type ResponseTemplate } from '@/stores/templates'
import type { ReviewMention } from '@/types/reviews'
import { getResponseSuggestion, checkCompliance } from '@/services/ai'
import { createPostingAttempt } from '@/services/forum'
import PostingStatus from './PostingStatus.vue'

const props = defineProps<{
  review: ReviewMention
  show: boolean
  credentials: Array<{
    id: number
    forum: string
    username: string
    status: string
  }>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', response: string): void
}>()

const templatesStore = useTemplatesStore()
const responseContent = ref('')
const selectedTemplateId = ref<number | ''>('')
const selectedCredentialsId = ref<number | ''>('')
const showSaveTemplate = ref(false)
const newTemplateName = ref('')
const isLoading = ref(false)
const complianceIssues = ref<string[]>([])
const showComplianceWarning = ref(false)
const postingAttemptId = ref<number | null>(null)

const templates = computed(() => templatesStore.templates)

// Get suggested template category based on review sentiment
const suggestedCategory = computed((): ResponseTemplate['category'] => {
  if (!props.review?.sentiment) return 'general'
  return (props.review.sentiment === 'positive' || 
          props.review.sentiment === 'negative' || 
          props.review.sentiment === 'neutral') 
    ? props.review.sentiment 
    : 'general'
})

// Filter templates by sentiment for quicker access
const suggestedTemplates = computed(() => 
  templatesStore.getTemplatesByCategory(suggestedCategory.value)
)

// Filter credentials for current review's source
const availableCredentials = computed(() => 
  props.credentials.filter(c => c.forum === props.review.source && c.status === 'active')
)

async function handleTemplateSelect(event: Event) {
  const select = event.target as HTMLSelectElement
  const templateId = Number(select.value)
  if (templateId) {
    const template = templates.value.find(t => t.id === templateId)
    if (template) {
      const variables = {
        customer_name: props.review.author,
        product_name: props.review.keyword_term || 'our product'
      }
      responseContent.value = templatesStore.fillTemplate(template, variables)
      await checkResponseCompliance()
    }
  }
}

async function checkResponseCompliance() {
  const { compliant, issues } = await checkCompliance(responseContent.value)
  if (!compliant && issues) {
    complianceIssues.value = issues
    showComplianceWarning.value = true
  } else {
    complianceIssues.value = []
    showComplianceWarning.value = false
  }
}

async function handleSubmit() {
  if (!responseContent.value.trim() || !selectedCredentialsId.value) return
  
  const { compliant, issues } = await checkCompliance(responseContent.value)
  if (!compliant) {
    complianceIssues.value = issues || []
    showComplianceWarning.value = true
    return
  }

  try {
    isLoading.value = true
    
    // Create posting attempt
    const response = await createPostingAttempt({
      review_id: props.review.id,
      credentials_id: selectedCredentialsId.value,
      response_text: responseContent.value
    })
    
    postingAttemptId.value = response.data.id
    emit('submit', responseContent.value)
    
  } catch (error) {
    console.error('Error creating posting attempt:', error)
  } finally {
    isLoading.value = false
  }
}

function saveAsTemplate() {
  if (newTemplateName.value && responseContent.value) {
    templatesStore.addTemplate({
      name: newTemplateName.value,
      content: responseContent.value,
      category: suggestedCategory.value
    })
    showSaveTemplate.value = false
    newTemplateName.value = ''
  }
}

async function getAISuggestion() {
  isLoading.value = true
  try {
    const suggestion = await getResponseSuggestion(props.review)
    responseContent.value = suggestion.content
    await checkResponseCompliance()
  } catch (error) {
    console.error('Error getting AI suggestion:', error)
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  responseContent.value = ''
  selectedTemplateId.value = ''
  selectedCredentialsId.value = ''
  showSaveTemplate.value = false
  newTemplateName.value = ''
  complianceIssues.value = []
  showComplianceWarning.value = false
  postingAttemptId.value = null
}

function handleClose() {
  resetForm()
  emit('close')
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-lg max-w-2xl w-full">
      <!-- Header -->
      <div class="bg-green-700 p-6 rounded-t-lg flex items-center justify-between">
        <h3 class="text-xl font-semibold text-white">Respond to Review</h3>
        <button @click="handleClose" class="text-green-100 hover:text-white hover:bg-green-600 p-1 rounded">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-5">
        <!-- Review Info -->
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span class="font-medium text-gray-900">{{ review.author }}</span>
            <span>•</span>
            <span>{{ review.post_date }}</span>
          </div>
          <p class="text-gray-900">{{ review.content }}</p>
        </div>

        <!-- Response Section -->
        <div class="space-y-4">
          <!-- Template Selection -->
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Response Templates</label>
            <button 
              @click="getAISuggestion"
              class="bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded flex items-center"
              :disabled="isLoading"
            >
              <template v-if="isLoading">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-purple-700 border-t-transparent mr-2"></div>
                Generating...
              </template>
              <template v-else>
                <Wand2 class="mr-2 h-4 w-4" />
                AI Suggest
              </template>
            </button>
          </div>

          <select
            v-model="selectedTemplateId"
            @change="handleTemplateSelect"
            class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
          >
            <option value="">Select a template</option>
            <optgroup label="Suggested Templates">
              <option
                v-for="template in suggestedTemplates"
                :key="template.id"
                :value="template.id"
              >
                {{ template.name }}
              </option>
            </optgroup>
            <optgroup label="All Templates">
              <option
                v-for="template in templates"
                :key="template.id"
                :value="template.id"
              >
                {{ template.name }}
              </option>
            </optgroup>
          </select>

          <!-- Forum Credentials Selection -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              Forum Account
            </label>
            <select
              v-model="selectedCredentialsId"
              class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
              :class="{ 'border-red-300': !selectedCredentialsId }"
            >
              <option value="">Select an account</option>
              <option
                v-for="cred in availableCredentials"
                :key="cred.id"
                :value="cred.id"
              >
                {{ cred.username }} ({{ cred.forum }})
              </option>
            </select>
            <p v-if="!availableCredentials.length" class="text-sm text-red-600">
              No active credentials available for {{ review.source }}
            </p>
          </div>

          <!-- Response Input -->
          <div class="space-y-2">
            <div class="relative">
              <textarea 
                v-model="responseContent"
                class="min-h-[150px] w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
                :class="{ 'border-red-300': showComplianceWarning }"
                placeholder="Write your response..."
                @input="checkResponseCompliance"
              ></textarea>
              <MessageCircle class="absolute top-3 left-3 h-5 w-5 text-gray-400" />
            </div>
            <div class="flex justify-between items-center text-sm text-gray-600">
              <button
                @click="showSaveTemplate = true"
                class="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Save class="h-4 w-4 mr-1" />
                Save as Template
              </button>
              <span>Characters: {{ responseContent.length }}/500</span>
            </div>
          </div>

          <!-- Compliance Warning -->
          <div v-if="showComplianceWarning" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-start">
              <AlertTriangle class="h-5 w-5 text-red-500 mt-0.5 mr-2" />
              <div>
                <h4 class="text-sm font-medium text-red-800">Compliance Issues</h4>
                <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
                  <li v-for="issue in complianceIssues" :key="issue">
                    {{ issue }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Posting Status -->
          <PostingStatus
            v-if="postingAttemptId"
            :attempt-id="postingAttemptId"
          />

          <!-- Save as Template Form -->
          <div v-if="showSaveTemplate" class="border-t border-gray-100 pt-4 mt-4">
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">Template Name</label>
              <input
                v-model="newTemplateName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter template name"
              />
              <div class="flex justify-end space-x-3">
                <button
                  @click="showSaveTemplate = false"
                  class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  @click="saveAsTemplate"
                  class="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-100 flex justify-end space-x-3">
        <button 
          @click="handleClose"
          class="px-4 py-2.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="!responseContent.trim() || showComplianceWarning || !selectedCredentialsId || isLoading"
          class="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <template v-if="isLoading">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2 inline-block"></div>
            Posting...
          </template>
          <template v-else>
            Send Response
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
