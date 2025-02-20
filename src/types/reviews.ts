import type { Mention } from '@/composables/useMentions'

export interface ReviewMention extends Mention {
  response?: {
    content: string
    author: string
    date: string
  }
  flagged?: boolean
  status?: 'pending' | 'responded' | 'flagged'
}

export interface ReviewResponse {
  id: number
  content: string
  author: string
  date: string
  reviewId: number
}

export interface ReviewFlag {
  id: number
  reason: string
  notes?: string
  assignedTo?: string
  status: 'open' | 'resolved'
  date: string
  reviewId: number
}

export interface PostingAttempt {
  id: number
  review: {
    id: number
    title: string
    url: string
    source: string
  }
  forum_name: string
  forum_username: string
  response_text: string
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'scheduled'
  error_type?: 'login_failed' | 'thread_locked' | 'permission_denied' | 'network_error' | 'post_rejected' | 'other'
  error_message?: string
  retry_count: number
  scheduled_time?: string
  created_at: string
  updated_at: string
  completed_at?: string
}
