<script setup lang="ts">
import { computed } from 'vue'
import { Loader2, AlertTriangle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import CompetitorTabs from './CompetitorTabs.vue'
import ForumMetricRow from './ForumMetricRow.vue'
import { useCompetitorStore } from '@/stores/competitors'
import type { CompetitorData } from '@/services/competitors'

interface Props {
  competitors: CompetitorData[]
}

defineProps<Props>()

const store = useCompetitorStore()

const selectedData = computed(() => {
  if (!store.selectedCompetitor) return null
  return store.forumActivities?.[store.selectedCompetitor] || null
})

const totalMentions = computed(() => {
  if (!selectedData.value) return 0
  return selectedData.value.reduce((sum, forum) => sum + forum.mentions, 0)
})
</script>

<template>
  <div>
    <CompetitorTabs
      :competitors="competitors"
    />

    <!-- Loading State -->
    <div v-if="store.isLoading" class="flex items-center justify-center p-8">
      <Loader2 class="h-8 w-8 animate-spin text-green-600" />
    </div>

    <!-- Error State -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <AlertTriangle class="h-5 w-5 text-red-500 mr-2" />
        <p class="text-red-700">{{ store.error }}</p>
      </div>
      <Button 
        class="mt-2" 
        variant="outline" 
        @click="store.loadCompetitorData()"
      >
        Retry
      </Button>
    </div>

    <!-- Data View -->
    <template v-else-if="selectedData">
      <div class="mb-4">
        <div class="text-3xl font-bold text-green-700">
          {{ totalMentions.toLocaleString() }}
        </div>
        <p class="text-base text-gray-600">Total Mentions</p>
      </div>
      
      <div class="space-y-4">
        <ForumMetricRow
          v-for="forum in selectedData"
          :key="forum.name"
          :forum="forum"
        />
      </div>
    </template>

    <!-- Empty State -->
    <div v-else class="text-center p-8 text-gray-500">
      Select a competitor to view forum activity
    </div>
  </div>
</template>
