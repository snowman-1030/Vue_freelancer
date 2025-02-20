import type { Component } from 'vue'

export interface ForumActivity {
  name: string
  mentions: number
  percentage: number
  trend: 'up' | 'down' | 'neutral'
  trendPercentage: number
  icon?: Component
}

export interface CompetitorForumActivity {
  totalMentions: number
  forums: ForumActivity[]
}
