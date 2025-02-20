import type { SentimentData, TrendData } from './reports'

export interface DashboardMetric {
  id: string
  label: string
  value: number | string
  trend?: number
  period?: string
  loading?: boolean
  error?: string
}

export interface DashboardBrandHealth {
  score: number
  total: number
  trend: number
  sentimentData: SentimentData[]
  trendData: TrendData[]
}

export interface ScraperStatus {
  id: number
  source: string
  status: 'running' | 'completed' | 'failed'
  started_at: string
  completed_at?: string
  posts_found: number
  error_message?: string
}

export interface UserData {
  id: number
  username: string
  avatar: string | null
  date_joined: string
  last_login: string | null
}

export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved'

export interface FeedbackData {
  id: number
  message: string
  status: FeedbackStatus
  created_at: string
  user: {
    id: number
    username: string
  }
}

export interface DashboardResponse {
  metrics: DashboardMetric[]
  brandHealth: DashboardBrandHealth
  scraperStatus: ScraperStatus[]
  latestUsers: UserData[]
  latestFeedback: FeedbackData[]
  metadata: {
    generatedAt: string
    nextUpdate: string
  }
}