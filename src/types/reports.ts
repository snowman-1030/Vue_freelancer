export interface ReportFilter {
  startDate: string
  endDate: string
  platform?: string
  keyword?: string
  sentiment?: string
}

export interface SentimentData {
  sentiment: string
  count: number
  confidence: number
}

export interface SourceData {
  source: string
  count: number
  percentage: number
}

export interface TrendData {
  date: string
  value: number
  sentiment?: string
  source?: string
}

export interface ReportResponse {
  startDate: string
  endDate: string
  filters: ReportFilter
  data: {
    sentimentCounts?: SentimentData[]
    sentimentScore?: {
      value: number
      total: number
    }
    platformSentiment?: Array<{
      source: string
      sentiment: string
      count: number
      confidence: number
    }>
    sourceCounts?: SourceData[]
    sentimentTrends?: TrendData[]
    sourceTrends?: TrendData[]
    keywords?: Array<{
      keyword: string
      total: number
      positive: number
      negative: number
      neutral: number
    }>
  }
  metadata: {
    totalRecords: number
    generatedAt: string
  }
}