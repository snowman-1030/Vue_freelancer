export interface StatCard {
  title: string
  value: string | number
  change: string
  icon: any
  color: string
  bgColor: string
  borderColor: string
}

export interface SentimentDataPoint {
  date: string
  positive: number
  neutral: number
  negative: number
}

export interface KeywordDataPoint {
  id: number
  keyword: string
  mentions: number
  positive: number
  neutral: number
  negative: number
  source: string
}

export interface PlatformDataPoint {
  name: string
  value: number
}

export interface KeywordCorrelationPoint {
  keyword: string
  positive: number
  neutral: number
  negative: number
}

export interface ScrapedPost {
  id: number
  keyword_id: number
  keyword_term: string
  title: string
  content: string
  url: string
  author: string
  source: string
  post_date: string
  sentiment: 'positive' | 'negative' | 'neutral'
  sentiment_confidence: number
  created_at: string
  updated_at: string
}

export interface ScraperStatus {
  total_posts: number
  posts_by_sentiment: {
    positive: number
    negative: number
    neutral: number
  }
  posts_by_source: {
    [key: string]: number
  }
  recent_logs: Array<{
    id: number
    source: string
    status: string
    started_at: string
    completed_at: string | null
    posts_found: number
  }>
}

export interface BrandRating {
  id: number
  keyword: number
  keyword_term: string
  total_score: number
  sentiment_score: number
  quality_score: number
  volume_score: number
  authority_score: number
  calculated_at: string
}

export interface BrandRatingStatus {
  status: 'calculating' | 'completed' | 'not_calculated' | 'error'
  result: BrandRating | null
  message?: string
}

export interface AnalyticsFilters {
  dateRange: {
    start: Date
    end: Date
  }
  platforms: string[]
  visibleSentiments: {
    positive: boolean
    neutral: boolean
    negative: boolean
  }
  timeFrame: '7d' | '30d' | '90d'
  minMentions: number
  sortBy: 'mentions' | 'sentiment' | 'growth'
}
