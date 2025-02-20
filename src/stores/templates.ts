import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ResponseTemplate {
  id: number
  name: string
  content: string
  category: 'positive' | 'negative' | 'neutral' | 'quality' | 'general'
  variables?: string[]
}

export const useTemplatesStore = defineStore('templates', () => {
  // State
  const templates = ref<ResponseTemplate[]>([
    {
      id: 1,
      name: 'Positive Review Response',
      content: 'Thank you for your positive feedback, {customer_name}! We\'re thrilled to hear that you had a great experience with {product_name}. Your satisfaction is our top priority, and we appreciate you taking the time to share your thoughts.',
      category: 'positive',
      variables: ['customer_name', 'product_name']
    },
    {
      id: 2,
      name: 'Quality Concern Response',
      content: 'Dear {customer_name}, we apologize for any issues you\'ve experienced with {product_name}. We take quality concerns seriously and would like to learn more about your experience. Please contact our support team at support@example.com with your order details so we can address this properly.',
      category: 'negative',
      variables: ['customer_name', 'product_name']
    },
    {
      id: 3,
      name: 'Neutral Feedback Response',
      content: 'Hello {customer_name}, thank you for sharing your feedback about {product_name}. We value your input and are always looking for ways to improve. If you have any specific suggestions, we\'d love to hear them.',
      category: 'neutral',
      variables: ['customer_name', 'product_name']
    }
  ])

  // Actions
  function addTemplate(template: Omit<ResponseTemplate, 'id'>) {
    const newId = Math.max(...templates.value.map(t => t.id)) + 1
    templates.value.push({
      ...template,
      id: newId
    })
  }

  function updateTemplate(id: number, updates: Partial<ResponseTemplate>) {
    const index = templates.value.findIndex(t => t.id === id)
    if (index !== -1) {
      templates.value[index] = {
        ...templates.value[index],
        ...updates
      }
    }
  }

  function deleteTemplate(id: number) {
    templates.value = templates.value.filter(t => t.id !== id)
  }

  function getTemplatesByCategory(category: ResponseTemplate['category']) {
    return templates.value.filter(t => t.category === category)
  }

  function fillTemplate(template: ResponseTemplate, variables: Record<string, string>) {
    let content = template.content
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{${key}}`, 'g'), value)
    })
    return content
  }

  return {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByCategory,
    fillTemplate
  }
})
