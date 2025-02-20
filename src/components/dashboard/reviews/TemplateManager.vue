<script setup lang="ts">
import { ref } from 'vue'
import { useTemplatesStore, type ResponseTemplate } from '@/stores/templates'
import { Plus, Edit, Trash2 } from 'lucide-vue-next'

const templatesStore = useTemplatesStore()

const showAddForm = ref(false)
const editingTemplate = ref<ResponseTemplate | null>(null)
const newTemplate = ref({
  name: '',
  content: '',
  category: 'general' as const,
  variables: [] as string[]
})

function addTemplate() {
  if (newTemplate.value.name && newTemplate.value.content) {
    templatesStore.addTemplate({
      name: newTemplate.value.name,
      content: newTemplate.value.content,
      category: newTemplate.value.category,
      variables: extractVariables(newTemplate.value.content)
    })
    resetForm()
  }
}

function startEdit(template: ResponseTemplate) {
  editingTemplate.value = { ...template }
}

function saveEdit() {
  if (editingTemplate.value) {
    templatesStore.updateTemplate(editingTemplate.value.id, {
      ...editingTemplate.value,
      variables: extractVariables(editingTemplate.value.content)
    })
    editingTemplate.value = null
  }
}

function deleteTemplate(id: number) {
  if (confirm('Are you sure you want to delete this template?')) {
    templatesStore.deleteTemplate(id)
  }
}

function resetForm() {
  newTemplate.value = {
    name: '',
    content: '',
    category: 'general',
    variables: []
  }
  showAddForm.value = false
}

function extractVariables(content: string): string[] {
  const matches = content.match(/{([^}]+)}/g) || []
  return matches.map(match => match.slice(1, -1))
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">Response Templates</h2>
      <button
        @click="showAddForm = true"
        class="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
      >
        <Plus class="w-4 h-4 mr-2" />
        Add Template
      </button>
    </div>

    <!-- Add Template Form -->
    <div v-if="showAddForm" class="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Template Name</label>
        <input
          v-model="newTemplate.name"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Enter template name"
        />
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Category</label>
        <select
          v-model="newTemplate.category"
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="positive">Positive Review</option>
          <option value="negative">Negative Review</option>
          <option value="neutral">Neutral Review</option>
          <option value="quality">Quality Concern</option>
          <option value="general">General</option>
        </select>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Content</label>
        <div class="text-xs text-gray-500 mb-1">
          Use {variable_name} for dynamic content (e.g., {customer_name})
        </div>
        <textarea
          v-model="newTemplate.content"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Enter template content"
        ></textarea>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          @click="resetForm"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          @click="addTemplate"
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Save Template
        </button>
      </div>
    </div>

    <!-- Templates List -->
    <div class="space-y-4">
      <div
        v-for="template in templatesStore.templates"
        :key="template.id"
        class="bg-white p-6 rounded-lg border border-gray-200"
      >
        <div v-if="editingTemplate?.id === template.id">
          <!-- Edit Mode -->
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Template Name</label>
              <input
                v-model="editingTemplate.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Category</label>
              <select
                v-model="editingTemplate.category"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="positive">Positive Review</option>
                <option value="negative">Negative Review</option>
                <option value="neutral">Neutral Review</option>
                <option value="quality">Quality Concern</option>
                <option value="general">General</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                v-model="editingTemplate.content"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3">
              <button
                @click="editingTemplate = null"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                @click="saveEdit"
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
        <div v-else>
          <!-- View Mode -->
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ template.name }}</h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-800': template.category === 'positive',
                  'bg-red-100 text-red-800': template.category === 'negative',
                  'bg-yellow-100 text-yellow-800': template.category === 'neutral',
                  'bg-purple-100 text-purple-800': template.category === 'quality',
                  'bg-gray-100 text-gray-800': template.category === 'general'
                }"
              >
                {{ template.category.charAt(0).toUpperCase() + template.category.slice(1) }}
              </span>
            </div>
            <div class="flex space-x-2">
              <button
                @click="startEdit(template)"
                class="p-1 text-gray-500 hover:text-gray-700"
              >
                <Edit class="w-4 h-4" />
              </button>
              <button
                @click="deleteTemplate(template.id)"
                class="p-1 text-gray-500 hover:text-red-600"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
          <p class="mt-2 text-sm text-gray-600">{{ template.content }}</p>
          <div v-if="template.variables?.length" class="mt-2">
            <span class="text-xs font-medium text-gray-500">Variables: </span>
            <span
              v-for="variable in template.variables"
              :key="variable"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-1"
            >
              {{ variable }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
