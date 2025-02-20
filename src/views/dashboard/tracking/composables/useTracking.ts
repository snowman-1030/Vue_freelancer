import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import axios from '@/lib/axios'

interface Keyword {
  id: number
  term: string
  source: string
  status: 'active' | 'paused'
  mentions: number
  trend: 'up' | 'down' | 'stable'
}

interface KeywordResponse {
  id: number
  term: string
  source: string
  is_active: boolean
  mentions: number
  created_at: string
  updated_at: string
}

interface State {
  keywords: Keyword[]
  selectedSites: string[]
  editingId: number | null
  newKeyword: string
  filterValue: 'all' | 'active' | 'paused'
  isLoading: boolean
  currentPage: number
  itemsPerPage: number
  totalMentions: number
}

export const useTracking = defineStore('tracking', {
  state: (): State => ({
    keywords: [],
    selectedSites: [],
    editingId: null,
    newKeyword: '',
    filterValue: 'all',
    isLoading: false,
    currentPage: 1,
    itemsPerPage: 10,
    totalMentions: 0
  }),

  getters: {
    totalKeywords: (state): number => state.keywords.length,
    activeKeywords: (state): number => state.keywords.filter(k => k.status === 'active').length,
    keywordLimit(): number {
      const authStore = useAuthStore()
      return authStore.getTierLimits().keywords
    },
    filteredKeywords: (state): Keyword[] => {
      if (state.filterValue === 'all') return state.keywords
      return state.keywords.filter(k => k.status === state.filterValue)
    },
    totalPages: (state): number => Math.ceil(state.keywords.length / state.itemsPerPage),
    paginatedKeywords: (state): Keyword[] => {
      // Sort by ID in descending order to show newest first
      const sortedKeywords = [...state.keywords].sort((a, b) => b.id - a.id)
      const start = (state.currentPage - 1) * state.itemsPerPage
      const end = start + state.itemsPerPage
      return sortedKeywords.slice(start, end)
    }
  },

  actions: {
    async fetchKeywords() {
      try {
        this.isLoading = true
        const response = await axios.get<KeywordResponse[]>('/keywords/')
        this.keywords = response.data.map((k: KeywordResponse) => ({
          id: k.id,
          term: k.term,
          source: k.source,
          status: k.is_active ? 'active' : 'paused',
          mentions: k.mentions,
          trend: 'stable',
          created_at: k.created_at
        }))
        // Calculate total mentions from keywords
        this.totalMentions = this.keywords.reduce((sum, k) => sum + k.mentions, 0)
      } catch (error) {
        console.error('Failed to fetch keywords:', error)
      } finally {
        this.isLoading = false
      }
    },

    async addKeyword(term: string, sites: string[]) {
      if (!term.trim() || sites.length === 0) return

      if (this.totalKeywords >= this.keywordLimit) {
        throw new Error(`You've reached your keyword limit (${this.totalKeywords}/${this.keywordLimit}). Upgrade to Advanced tier to track up to 50 keywords.`)
      }

      try {
        for (const source of sites) {
          try {
            const response = await axios.post<KeywordResponse>('/keywords/', {
              term: term.trim(),
              source,
              is_active: true
            })
            
            const newKeyword: Keyword = {
              id: response.data.id,
              term: response.data.term,
              source: response.data.source,
              status: 'active',
              mentions: 0,
              trend: 'stable'
            }
            this.keywords.push(newKeyword)
            
            await axios.post(`/keywords/${response.data.id}/trigger_scrape/`)
            await new Promise(resolve => setTimeout(resolve, 300))
          } catch (error) {
            throw error
          }
        }
        
        this.newKeyword = ''
        this.selectedSites = []
      } catch (error) {
        throw error
      }
    },

    async deleteKeyword(id: number) {
      try {
        await axios.delete(`/keywords/${id}/`)
        this.keywords = this.keywords.filter(keyword => keyword.id !== id)
      } catch (error) {
        console.error('Failed to delete keyword:', error)
      }
    },

    async toggleStatus(id: number) {
      const keyword = this.keywords.find(k => k.id === id)
      if (keyword) {
        try {
          await axios.patch(`/keywords/${id}/`, {
            is_active: keyword.status === 'active' ? false : true
          })
          keyword.status = keyword.status === 'active' ? 'paused' : 'active'
        } catch (error) {
          console.error('Failed to toggle keyword status:', error)
        }
      }
    },

    async updateKeyword(id: number, term: string) {
      const keyword = this.keywords.find(k => k.id === id)
      if (keyword) {
        try {
          await axios.patch(`/keywords/${id}/`, { term })
          keyword.term = term
        } catch (error) {
          console.error('Failed to update keyword:', error)
        }
      }
      this.editingId = null
    },

    async initialize() {
      const authStore = useAuthStore()
      await authStore.fetchProfile()
      await this.fetchKeywords()
    }
  }
})
