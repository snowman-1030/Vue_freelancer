import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Feedback, FeedbackStatus } from '@/services/feedback'
import { feedbackService } from '@/services/feedback'
import { websocketService, type WebSocketMessage } from '@/services/websocket'

export const useFeedbackStore = defineStore('feedback', () => {
  // State
  const items = ref<Feedback[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)
  const filterStatus = ref<string>('all')
  const searchTerm = ref('')
  const selectedItem = ref<Feedback | null>(null)

  // Getters
  const filteredItems = computed(() => {
    let filtered = items.value

    if (filterStatus.value !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus.value)
    }

    if (searchTerm.value) {
      const search = searchTerm.value.toLowerCase()
      filtered = filtered.filter(item => 
        item.message.toLowerCase().includes(search) ||
        item.user.toLowerCase().includes(search) ||
        item.replies.some(reply => 
          reply.message.toLowerCase().includes(search) ||
          reply.user.toLowerCase().includes(search)
        )
      )
    }

    return filtered
  })

  const totalFeedback = computed(() => items.value.length)
  const pendingFeedback = computed(() => 
    items.value.filter(item => item.status === 'pending').length
  )
  const resolvedFeedback = computed(() => 
    items.value.filter(item => item.status === 'resolved').length
  )

  // Actions
  async function fetchUserFeedback() {
    if (isLoading.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      items.value = await feedbackService.getUserFeedback()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch feedback'
      console.error('Error fetching feedback:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAllFeedback() {
    if (isLoading.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      items.value = await feedbackService.getAllFeedback()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch feedback'
      console.error('Error fetching feedback:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function createFeedback(message: string, attachment?: File) {
    console.log('FeedbackStore: Starting createFeedback')
    
    if (isSubmitting.value) {
      console.log('FeedbackStore: Submission already in progress')
      error.value = 'A submission is already in progress'
      throw new Error('A submission is already in progress')
    }
    
    isSubmitting.value = true
    error.value = null
    
    try {
      // Only make the API call, let WebSocket handle the UI update
      const newFeedback = await feedbackService.createFeedback({ message, attachment })
      return newFeedback
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to submit feedback'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  async function updateStatus(id: number, status: FeedbackStatus) {
    if (isLoading.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      const updated = await feedbackService.updateFeedbackStatus(id, status)
      
      // Update in items array
      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value[index] = updated
      }
      
      // Update selected item if it's the one we just updated
      if (selectedItem.value?.id === id) {
        selectedItem.value = updated
      }
      
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update status'
      console.error('Error updating status:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createReply(feedbackId: number, message: string) {
    if (isSubmitting.value) return
    
    isSubmitting.value = true
    error.value = null
    
    try {
      const newReply = await feedbackService.createReply(feedbackId, message)
      
      // Update the feedback item with the new reply
      const feedbackIndex = items.value.findIndex(item => item.id === feedbackId)
      if (feedbackIndex !== -1) {
        // Get fresh feedback data to ensure we have the latest state
        const updatedFeedback = await feedbackService.getFeedbackDetails(feedbackId)
        items.value[feedbackIndex] = updatedFeedback
        
        // Update selected item if it's the one we just replied to
        if (selectedItem.value?.id === feedbackId) {
          selectedItem.value = updatedFeedback
        }
      }
      
      return newReply
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to submit reply'
      console.error('Error submitting reply:', err)
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  function setFilterStatus(status: string) {
    filterStatus.value = status
  }

  function setSearchTerm(term: string) {
    searchTerm.value = term
  }

  function setSelectedItem(item: Feedback | null) {
    selectedItem.value = item
  }

  async function deleteFeedback(id: number) {
    if (isLoading.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      await feedbackService.deleteFeedback(id)
      items.value = items.value.filter(item => item.id !== id)
      if (selectedItem.value?.id === id) {
        selectedItem.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete feedback'
      console.error('Error deleting feedback:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function clearAllFeedback() {
    if (isLoading.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      await feedbackService.clearAllFeedback()
      items.value = []
      selectedItem.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to clear feedback'
      console.error('Error clearing feedback:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // WebSocket setup
  async function initializeFeedback(isAdmin = false) {
    try {
      // First load the data
      if (isAdmin) {
        await fetchAllFeedback()
      } else {
        await fetchUserFeedback()
      }

      // Then try to set up WebSocket
      try {
        await websocketService.connect()
        console.debug('FeedbackStore: WebSocket connected, setting up subscription')
        
        websocketService.subscribe((message: WebSocketMessage) => {
          console.debug('FeedbackStore: Received WebSocket message:', message.type)
          
          if (message.type === 'feedback_deleted') {
            // Remove the deleted feedback from the items array
            console.debug('FeedbackStore: Processing feedback deletion:', message.data.id)
            items.value = items.value.filter(item => item.id !== message.data.id)
            // Clear selected item if it was the one deleted
            if (selectedItem.value?.id === message.data.id) {
              selectedItem.value = null
            }
          } else if (message.type === 'feedback_update') {
            // Update existing feedback item or add new one
            const index = items.value.findIndex(item => item.id === message.data.id)
            if (index !== -1) {
              console.debug('FeedbackStore: Updating existing feedback:', message.data.id)
              items.value[index] = message.data
              // Update selected item if it's the one that was updated
              if (selectedItem.value?.id === message.data.id) {
                selectedItem.value = message.data
              }
            } else {
              console.debug('FeedbackStore: Adding new feedback:', message.data.id)
              items.value.unshift(message.data)
            }
          } else if (message.type === 'feedback_reply') {
            // Add new reply to feedback item
            const feedbackId = message.data.feedback_id
            console.debug('FeedbackStore: Processing new reply for feedback:', feedbackId)
            
            const index = items.value.findIndex(item => item.id === feedbackId)
            if (index !== -1) {
              // Fetch fresh feedback data to ensure we have the latest state
              feedbackService.getFeedbackDetails(feedbackId).then(updatedFeedback => {
                console.debug('FeedbackStore: Updating feedback with new reply:', feedbackId)
                items.value[index] = updatedFeedback
                if (selectedItem.value?.id === feedbackId) {
                  selectedItem.value = updatedFeedback
                }
              })
            }
          }
        })
      } catch (err) {
        console.error('FeedbackStore: Failed to setup WebSocket:', err)
        if (err instanceof Error && err.message.includes('authentication')) {
          // If it's an authentication error, we should redirect to login
          window.location.href = '/login'
          return
        }
        error.value = err instanceof Error ? err.message : 'Failed to connect to WebSocket'
        // Don't throw here - we still have the initial data loaded
      }
    } catch (err) {
      console.error('FeedbackStore: Failed to initialize feedback:', err)
      if (err instanceof Error && err.message.includes('authentication')) {
        // If it's an authentication error, we should redirect to login
        window.location.href = '/login'
        return
      }
      error.value = err instanceof Error ? err.message : 'Failed to load feedback'
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
    
    // Getters
    filteredItems,
    totalFeedback,
    pendingFeedback,
    resolvedFeedback,
    
    // Actions
    fetchUserFeedback,
    fetchAllFeedback,
    createFeedback,
    updateStatus,
    createReply,
    setFilterStatus,
    setSearchTerm,
    setSelectedItem,
    deleteFeedback,
    clearAllFeedback,
    initializeFeedback,
    
    // WebSocket state
    isWebSocketConnected: websocketService.isConnected
  }
})