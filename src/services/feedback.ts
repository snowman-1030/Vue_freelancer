import axios from '@/lib/axios'
import type { AxiosResponse } from 'axios'

/**
 * Represents a reply in a feedback conversation thread.
 */
export interface FeedbackReply {
  /** Unique identifier for the reply */
  id: number
  /** Username of the reply author */
  user: string
  /** Reply message content */
  message: string
  /** ISO timestamp of when the reply was created */
  created_at: string
  /** Whether the reply was made by an admin user */
  is_admin: boolean
}

/**
 * Valid status values for feedback items.
 */
export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved'

/**
 * Represents a feedback item with its conversation thread.
 */
export interface Feedback {
  /** Unique identifier for the feedback */
  id: number
  /** Username of the feedback author */
  user: string
  /** Feedback message content */
  message: string
  /** Optional URL to an attached file */
  attachment?: string
  /** Current status of the feedback */
  status: FeedbackStatus
  /** ISO timestamp of when the feedback was created */
  created_at: string
  /** ISO timestamp of when the feedback was last updated */
  updated_at: string
  /** List of replies in the conversation thread */
  replies: FeedbackReply[]
  /** Number of unread replies for the current user */
  unread_replies: number
}

/**
 * Data required to create a new feedback item.
 */
export interface CreateFeedbackData {
  /** Feedback message content */
  message: string
  /** Optional file to attach */
  attachment?: File
}

/**
 * Data required to create a reply to feedback.
 */
export interface CreateReplyData {
  /** Reply message content */
  message: string
}

/**
 * Service for interacting with the feedback API endpoints.
 */
export const feedbackService = {
  /**
   * Get all feedback submitted by the current user.
   * 
   * @throws {Error} If the request fails
   * @returns Promise resolving to an array of feedback items
   */
  async getUserFeedback(): Promise<Feedback[]> {
    try {
      const response: AxiosResponse<Feedback[]> = await axios.get('/feedback/user/')
      return response.data
    } catch (error) {
      console.error('Failed to fetch user feedback:', error)
      throw new Error('Failed to fetch your feedback. Please try again later.')
    }
  },

  /**
   * Create a new feedback submission.
   * 
   * @param data - The feedback data to submit
   * @throws {Error} If the request fails
   * @returns Promise resolving to the created feedback item
   */
  async createFeedback(data: CreateFeedbackData): Promise<Feedback> {
    console.log('FeedbackService: Starting createFeedback')
    console.log('FeedbackService: Request data:', {
      message: data.message?.substring(0, 50) + '...',
      hasAttachment: !!data.attachment
    })

    try {
      const formData = new FormData()
      formData.append('message', data.message)
      if (data.attachment) {
        formData.append('attachment', data.attachment)
        console.log('FeedbackService: Attached file:', {
          name: data.attachment.name,
          type: data.attachment.type,
          size: data.attachment.size
        })
      }
      
      console.log('FeedbackService: Sending POST request to /feedback/user/')
      // Let axios set the correct Content-Type with boundary for FormData
      const response: AxiosResponse<Feedback> = await axios.post('/feedback/user/', formData)
      
      console.log('FeedbackService: Request successful, response:', {
        status: response.status,
        data: {
          id: response.data.id,
          status: response.data.status,
          created_at: response.data.created_at
        }
      })
      
      return response.data
    } catch (error: unknown) {
      console.error('FeedbackService: Request failed:', error)
      
      // Type guard for axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            status: number;
            data: unknown;
          }
        }
        if (axiosError.response) {
          console.error('FeedbackService: Error response:', {
            status: axiosError.response.status,
            data: axiosError.response.data
          })
        }
      }
      
      // Preserve the original error message if it's an Error object
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Failed to submit your feedback. Please try again later.')
    }
  },

  /**
   * Get all feedback (admin only).
   * 
   * @throws {Error} If the request fails or user lacks permission
   * @returns Promise resolving to an array of all feedback items
   */
  async getAllFeedback(): Promise<Feedback[]> {
    try {
      const response: AxiosResponse<Feedback[]> = await axios.get('/feedback/admin/')
      return response.data
    } catch (error) {
      console.error('Failed to fetch all feedback:', error)
      throw new Error('Failed to fetch feedback list. Please try again later.')
    }
  },

  /**
   * Get detailed information about a specific feedback item.
   * 
   * @param id - ID of the feedback to fetch
   * @throws {Error} If the request fails or feedback not found
   * @returns Promise resolving to the feedback item
   */
  async getFeedbackDetails(id: number): Promise<Feedback> {
    try {
      const response: AxiosResponse<Feedback> = await axios.get(`/feedback/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch feedback ${id}:`, error)
      throw new Error('Failed to fetch feedback details. Please try again later.')
    }
  },

  /**
   * Update the status of a feedback item (admin only).
   * 
   * @param id - ID of the feedback to update
   * @param status - New status value
   * @throws {Error} If the request fails or user lacks permission
   * @returns Promise resolving to the updated feedback item
   */
  async updateFeedbackStatus(id: number, status: FeedbackStatus): Promise<Feedback> {
    try {
      const response: AxiosResponse<Feedback> = await axios.patch(`/feedback/${id}/`, { status })
      return response.data
    } catch (error) {
      console.error(`Failed to update feedback ${id} status:`, error)
      throw new Error('Failed to update feedback status. Please try again later.')
    }
  },

  /**
   * Create a reply to a feedback item.
   * 
   * @param feedbackId - ID of the feedback to reply to
   * @param message - The reply message
   * @throws {Error} If the request fails or user lacks permission
   * @returns Promise resolving to the created reply
   */
  async createReply(feedbackId: number, message: string): Promise<FeedbackReply> {
    try {
      const response: AxiosResponse<FeedbackReply> = await axios.post(
        `/feedback/${feedbackId}/reply/`,
        { message }
      )
      return response.data
    } catch (error) {
      console.error(`Failed to create reply to feedback ${feedbackId}:`, error)
      throw new Error('Failed to send your reply. Please try again later.')
    }
  },

  /**
   * Clear all feedback data (admin only).
   *
   * @throws {Error} If the request fails or user lacks permission
   */
  async clearAllFeedback(): Promise<void> {
    try {
      await axios.post('/feedback/admin/clear/')
    } catch (error) {
      console.error('Failed to clear feedback:', error)
      throw new Error('Failed to clear feedback data. Please try again later.')
    }
  },

  /**
   * Delete a specific feedback item (admin only).
   *
   * @param id - ID of the feedback to delete
   * @throws {Error} If the request fails or user lacks permission
   */
  async deleteFeedback(id: number): Promise<void> {
    try {
      console.log(`FeedbackService: Attempting to delete feedback ${id}`)
      const response = await axios.delete(`/feedback/${id}/`)
      console.log(`FeedbackService: Delete response status:`, response.status)
    } catch (error) {
      console.error(`FeedbackService: Failed to delete feedback ${id}:`, error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data: unknown } }
        if (axiosError.response) {
          console.error('FeedbackService: Error response:', {
            status: axiosError.response.status,
            data: axiosError.response.data
          })
          // If it's a permissions error, show a more specific message
          if (axiosError.response.status === 403) {
            throw new Error('You do not have permission to delete feedback.')
          }
        }
      }
      throw new Error('Failed to delete feedback. Please try again later.')
    }
  }
}