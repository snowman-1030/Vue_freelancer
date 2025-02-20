import type { Component } from 'vue'
import type { Feedback } from '@/services/feedback'

export interface StatusConfig {
  color: string
  icon: Component
}

export interface FeedbackState {
  items: Feedback[]
  filterStatus: string
  searchTerm: string
  selectedItem: Feedback | null
}

export interface NavItem {
  label: string
  href: string
}

export interface FormField {
  id: string
  label: string
  component: Component | string
  props?: Record<string, any>
}

// Re-export the Feedback type from our service
export type { Feedback } from '@/services/feedback'