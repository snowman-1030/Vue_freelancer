export interface FeedbackItem {
  id: number
  type: string
  date: string
  status: 'Pending' | 'In Progress' | 'Resolved'
  message: string
}

export interface FormData {
  title: string
  type: string
  description: string
}

export interface FeedbackStats {
  total: number
  pending: number
  resolved: number
}

export interface FileUploadState {
  file: File | null
  preview: string | null
}