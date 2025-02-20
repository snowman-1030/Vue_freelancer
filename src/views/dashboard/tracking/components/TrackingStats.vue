<template>
  <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
    <!-- Loading State -->
    <template v-if="store.isLoading">
      <div v-for="i in 4" :key="i" class="transform transition-all duration-200">
        <Card class="bg-white shadow-sm">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <div class="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
            <div class="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div class="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
            <div v-if="i === 4" class="mt-2 mb-4">
              <div class="h-1.5 w-full rounded-full bg-gray-200">
                <div class="h-1.5 rounded-full bg-indigo-700/50 animate-pulse w-1/2"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>

    <!-- Loaded State -->
    <template v-else>
      <div
        v-for="stat in stats"
        :key="stat.title"
        class="transform transition-all duration-200 hover:translate-y-[-2px]"
      >
        <Card :class="
          stat.title === 'Total Keywords' ? 'shadow-sm hover:shadow-md transition-all duration-200 border border-blue-500/10 bg-gradient-to-br from-blue-100/60 to-indigo-100/60' :
          stat.title === 'Active Keywords' ? 'shadow-sm hover:shadow-md transition-all duration-200 border border-emerald-500/10 bg-gradient-to-br from-emerald-100/60 to-green-100/60' :
          stat.title === 'Total Mentions' ? 'shadow-sm hover:shadow-md transition-all duration-200 border border-amber-500/10 bg-gradient-to-br from-amber-100/60 to-yellow-100/60' :
          'shadow-sm hover:shadow-md transition-all duration-200 border border-indigo-500/10 bg-gradient-to-br from-indigo-100/60 to-sky-100/60'
        ">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle :class="
              stat.title === 'Total Keywords' ? 'text-sm font-medium text-blue-700' :
              stat.title === 'Active Keywords' ? 'text-sm font-medium text-emerald-700' :
              stat.title === 'Total Mentions' ? 'text-sm font-medium text-amber-700' :
              'text-sm font-medium text-indigo-700'
            ">{{ stat.title }}</CardTitle>
            <component :is="stat.icon" :class="
              stat.title === 'Total Keywords' ? 'h-4 w-4 text-blue-700' :
              stat.title === 'Active Keywords' ? 'h-4 w-4 text-emerald-700' :
              stat.title === 'Total Mentions' ? 'h-4 w-4 text-amber-700' :
              'h-4 w-4 text-indigo-700'
            " />
          </CardHeader>
          <CardContent>
            <div :class="
              stat.title === 'Total Keywords' ? 'text-3xl font-bold text-blue-700' :
              stat.title === 'Active Keywords' ? 'text-3xl font-bold text-emerald-700' :
              stat.title === 'Total Mentions' ? 'text-3xl font-bold text-amber-700' :
              'text-3xl font-bold text-indigo-700'
            ">{{ stat.value }}</div>
            <template v-if="stat.subtext">
              <p :class="
                stat.title === 'Total Keywords' ? 'mt-2 text-sm text-blue-700/80' :
                stat.title === 'Active Keywords' ? 'mt-2 text-sm text-emerald-700/80' :
                stat.title === 'Total Mentions' ? 'mt-2 text-sm text-amber-700/80' :
                'mt-2 text-sm text-indigo-700/80'
              ">
                {{ stat.subtext }}
              </p>
            </template>
            <div v-if="stat.title === 'Keyword Limit'" class="mt-2 mb-4 relative z-10">
              <div class="h-1.5 w-full rounded-full bg-gray-200">
                <div
                  class="h-1.5 rounded-full bg-indigo-700 transition-all duration-200"
                  :style="{ width: `${progressValue}%` }"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as LucideIcons from 'lucide-vue-next'
import { useTracking } from '../composables/useTracking'
import { useAnalyticsStore } from '@/stores/analytics'

const store = useTracking()
const analyticsStore = useAnalyticsStore()

const progressValue = computed(() => (store.totalKeywords / store.keywordLimit) * 100)

const stats = computed(() => [
  {
    title: 'Total Keywords',
    value: store.totalKeywords,
    icon: LucideIcons.Users,
    subtext: '+2 from last month'
  },
  {
    title: 'Active Keywords',
    value: store.activeKeywords,
    icon: LucideIcons.Search,
    subtext: '+1 from last month'
  },
  {
    title: 'Total Mentions',
    value: analyticsStore.overallStats?.totalMentions ?? 0,
    icon: LucideIcons.BarChart2,
    subtext: '+201 from last month'
  },
  {
    title: 'Keyword Limit',
    value: `${store.totalKeywords}/${store.keywordLimit}`,
    icon: LucideIcons.Bell
  }
])
</script>
