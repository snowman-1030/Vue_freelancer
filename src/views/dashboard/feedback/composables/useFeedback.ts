import { computed, reactive, toRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useFeedbackStore } from '@/stores/feedback'
import type { Feedback, FeedbackStatus } from '@/services/feedback'

export interface FeedbackFormData {
  message: string
  attachment?: File
}

/**
 * Composable for managing feedback functionality.
 * 
 * This composable provides a reactive interface to the feedback store,
 * handling both user and admin feedback operations.
 */
export function useFeedback() {
  const store = useFeedbackStore()
  
  // Form state
  const formState = reactive<FeedbackFormData>({
    message: ''
  })

  // Destructure store properties with storeToRefs to maintain reactivity
  const {
    items,
    isLoading,
    isSubmitting,
    error,
    filterStatus,
    searchTerm,
    selectedItem,
    filteredItems,
  } = storeToRefs(store)

  // Computed properties
  const hasError = computed(() => !!error.value)
  const isEmpty = computed(() => !isLoading.value && items.value.length === 0)
  const hasItems = computed(() => items.value.length > 0)
  const hasSelectedItem = computed(() => !!selectedItem.value)
  
  const totalFeedback = computed(() => items.value.length)
  const pendingFeedback = computed(() => 
    items.value.filter(item => item.status === 'pending').length
  )
  const resolvedFeedback = computed(() => 
    items.value.filter(item => item.status === 'resolved').length
  )
  const inProgressFeedback = computed(() => 
    items.value.filter(item => item.status === 'reviewed').length
  )

  // Form methods
  const updateFormData = (data: Partial<FeedbackFormData>) => {
    Object.assign(formState, data)
  }

  const resetForm = () => {
    formState.message = ''
    delete formState.attachment
  }

  const submitFeedback = async () => {
    console.log('useFeedback: Starting feedback submission')
    console.log('useFeedback: Current form state:', {
      message: formState.message,
      hasAttachment: !!formState.attachment
    })
    console.log('useFeedback: Current store state:', {
      isSubmitting: isSubmitting.value,
      error: error.value
    })

    if (!formState.message) {
      console.log('useFeedback: Missing required message')
      throw new Error('Message is required')
    }
    
    try {
      // Force reset isSubmitting before starting
      isSubmitting.value = false
      
      console.log('useFeedback: Calling store.createFeedback')
      const result = await store.createFeedback(
        formState.message,
        formState.attachment
      )
      console.log('useFeedback: Submission successful, result:', result)
      
      console.log('useFeedback: Resetting form')
      resetForm()
      
      return result
    } catch (err) {
      console.error('useFeedback: Submission failed:', err)
      console.log('useFeedback: Store state after error:', {
        isSubmitting: isSubmitting.value,
        error: error.value
      })
      
      // Reset form state since submission failed
      error.value = err instanceof Error ? err.message : 'Failed to submit feedback'
      throw err
    } finally {
      // Ensure isSubmitting is always reset
      console.log('useFeedback: Resetting isSubmitting in finally block')
      isSubmitting.value = false
    }
  }

  // Data fetching methods
  const fetchUserFeedback = async () => {
    try {
      await store.fetchUserFeedback()
    } catch (err) {
      console.error('Failed to fetch user feedback:', err)
      throw err
    }
  }

  const fetchAllFeedback = async () => {
    try {
      await store.fetchAllFeedback()
    } catch (err) {
      console.error('Failed to fetch all feedback:', err)
      throw err
    }
  }

  // Status and reply methods
  const updateStatus = async (id: number, status: FeedbackStatus) => {
    try {
      const feedback = await store.updateStatus(id, status)
      return feedback
    } catch (err) {
      console.error('Failed to update status:', err)
      throw err
    }
  }

  const createReply = async (feedbackId: number, message: string) => {
    try {
      const reply = await store.createReply(feedbackId, message)
      return reply
    } catch (err) {
      console.error('Failed to create reply:', err)
      throw err
    }
  }

  // Filter methods
  const setFilterStatus = (status: string) => {
    store.setFilterStatus(status)
  }

  const setSearchTerm = (term: string) => {
    store.setSearchTerm(term)
  }

  const setSelectedItem = (item: Feedback | null) => {
    store.setSelectedItem(item)
  }

  // Clear feedback method
  const clearAllFeedback = async () => {
    try {
      await store.clearAllFeedback()
    } catch (err) {
      console.error('Failed to clear feedback:', err)
      throw err
    }
  }

  // Initialize feedback with WebSocket
  const initializeFeedback = async (isAdmin = false) => {
    try {
      await store.initializeFeedback(isAdmin)
    } catch (err) {
      console.error('Failed to initialize feedback:', err)
      throw err
    }
  }

  return {
    // State
    items,
    isLoading,
    isSubmitting,
    error,
    filterStatus,
    searchTerm,
    selectedItem,
    filteredItems,
    formData: toRef(formState),
    
    // Computed
    hasError,
    isEmpty,
    hasItems,
    hasSelectedItem,
    totalFeedback,
    pendingFeedback,
    resolvedFeedback,
    inProgressFeedback,
    
    // Form methods
    updateFormData,
    resetForm,
    submitFeedback,
    
    // Data methods
    fetchUserFeedback,
    fetchAllFeedback,
    clearAllFeedback,
    initializeFeedback,
    
    // Status and reply methods
    updateStatus,
    createReply,
    
    // Filter methods
    setFilterStatus,
    setSearchTerm,
    setSelectedItem,
  }
}