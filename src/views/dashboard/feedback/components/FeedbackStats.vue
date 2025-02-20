<script setup lang="ts">
import { computed } from 'vue'
import { MessageSquare, Clock, CheckCircle, Loader2 } from 'lucide-vue-next'
import { useFeedback } from '../composables/useFeedback'

const feedbackStore = useFeedback()

// Computed properties to safely access store values
const isLoading = computed(() => feedbackStore.isLoading.value)
const totalFeedback = computed(() => feedbackStore.totalFeedback.value)
const pendingFeedback = computed(() => feedbackStore.pendingFeedback.value)
const resolvedFeedback = computed(() => feedbackStore.resolvedFeedback.value)

interface StatItem {
  title: string
  value: number
  icon: any // Using any for Lucide icons as they don't export proper types
  bgClass: string
  iconClass: string
  titleClass: string
  valueClass: string
}

const stats = computed<StatItem[]>(() => [
  {
    title: 'Total Feedback',
    value: totalFeedback.value,
    icon: MessageSquare,
    bgClass: 'border border-blue-500/10 bg-gradient-to-br from-blue-100/60 to-indigo-100/60',
    iconClass: 'text-blue-700',
    titleClass: 'text-blue-700',
    valueClass: 'text-blue-700'
  },
  {
    title: 'Pending Review',
    value: pendingFeedback.value,
    icon: Clock,
    bgClass: 'border border-amber-500/10 bg-gradient-to-br from-amber-100/60 to-yellow-100/60',
    iconClass: 'text-amber-700',
    titleClass: 'text-amber-700',
    valueClass: 'text-amber-700'
  },
  {
    title: 'Resolved',
    value: resolvedFeedback.value,
    icon: CheckCircle,
    bgClass: 'border border-emerald-500/10 bg-gradient-to-br from-emerald-100/60 to-green-100/60',
    iconClass: 'text-emerald-700',
    titleClass: 'text-emerald-700',
    valueClass: 'text-emerald-700'
  }
])
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    <div
      v-for="stat in stats"
      :key="stat.title"
      :class="[
        'rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 border',
        stat.bgClass
      ]"
    >
      <div class="flex flex-row items-center justify-between pb-2 space-y-0">
        <h3 :class="['text-sm font-medium', stat.titleClass]">
          {{ stat.title }}
        </h3>
        <component
          :is="isLoading ? Loader2 : stat.icon"
          class="h-4 w-4"
          :class="[
            stat.iconClass,
            { 'animate-spin': isLoading }
          ]"
        />
      </div>
      <div class="pt-2">
        <div :class="['text-2xl font-bold', stat.valueClass]">
          {{ isLoading ? '-' : stat.value }}
        </div>
      </div>
    </div>
  </div>
</template>