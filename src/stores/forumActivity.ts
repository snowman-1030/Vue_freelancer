import { defineStore } from 'pinia'
import { ref } from 'vue'
import { competitorService } from '@/services/competitors'
import type { ForumActivity } from '@/types/forum'

interface CompetitorForumActivity {
  totalMentions: number
  forums: ForumActivity[]
}

export const useForumActivityStore = defineStore('forumActivity', () => {
  const selectedCompetitor = ref<string | null>(null)
  const competitorData = ref<Record<string, ForumActivity[]>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const setSelectedCompetitor = (competitor: string) => {
    console.log('ForumActivityStore - Setting selected competitor:', competitor)
    selectedCompetitor.value = competitor
  }
    
  const fetchCompetitorData = async () => {
    console.log('ForumActivityStore - Fetching competitor data')
    loading.value = true
    error.value = null
    try {
      const data = await competitorService.getAnalysis()
      console.log('ForumActivityStore - Received data:', data)
      console.log('ForumActivityStore - Forum activities:', data.forumActivities)
      
      competitorData.value = data.forumActivities
      
      // If no competitor is selected, select the first one
      if (!selectedCompetitor.value && data.competitors.length > 0) {
        console.log('ForumActivityStore - Auto-selecting first competitor:', data.competitors[0].name)
        selectedCompetitor.value = data.competitors[0].name
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch forum activity'
      console.error('ForumActivityStore - Error fetching forum activity:', err)
    } finally {
      loading.value = false
    }
  }

  const getSelectedCompetitorData = () => {
    if (!selectedCompetitor.value) {
      console.log('ForumActivityStore - No competitor selected')
      return null
    }
    const data = competitorData.value[selectedCompetitor.value] || []
    console.log('ForumActivityStore - Selected competitor data:', {
      competitor: selectedCompetitor.value,
      data
    })
    return data
  }

  const getTotalMentions = () => {
    const forums = getSelectedCompetitorData()
    if (!forums) return 0
    const total = forums.reduce((sum, forum) => sum + forum.mentions, 0)
    console.log('ForumActivityStore - Total mentions:', total)
    return total
  }

  return {
    selectedCompetitor,
    competitorData,
    loading,
    error,
    setSelectedCompetitor,
    fetchCompetitorData,
    getSelectedCompetitorData,
    getTotalMentions
  }
})
