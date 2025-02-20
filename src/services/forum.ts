import axios from '@/lib/axios'
import type { PostingAttempt } from '@/types/reviews'

export interface ForumCredentials {
  id: number
  forum: string
  username: string
  status: string
}

export async function getForumCredentials() {
  return axios.get<ForumCredentials[]>('/forum-credentials/')
}

export async function createPostingAttempt(data: {
  review_id: number
  credentials_id: number
  response_text: string
  scheduled_time?: string
}) {
  return axios.post<PostingAttempt>('/posting-attempts/', data)
}

export async function getPostingStatus(attemptId: number) {
  return axios.get<PostingAttempt>(`/posting-attempts/${attemptId}/status/`)
}

export async function retryPosting(attemptId: number) {
  return axios.post<PostingAttempt>(`/posting-attempts/${attemptId}/retry/`)
}

export async function getPostingStats() {
  return axios.get('/posting-attempts/stats/')
}