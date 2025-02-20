<template>
  <div class="w-4 h-4 inline-block">
    <svg v-if="sentiment === 'positive'" viewBox="0 0 16 16" class="w-full h-full">
      <rect width="16" height="16" fill="#4CAF50"/>
      <path d="M8 4L12 10H4L8 4Z" fill="white"/>
    </svg>
    <svg v-else-if="sentiment === 'negative'" viewBox="0 0 16 16" class="w-full h-full">
      <rect width="16" height="16" fill="#F44336"/>
      <path d="M8 12L12 6H4L8 12Z" fill="white"/>
    </svg>
    <svg v-else viewBox="0 0 16 16" class="w-full h-full">
      <rect width="16" height="16" fill="#FFC107"/>
      <path d="M12 8L6 4V12L12 8Z" fill="white"/>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'

const props = defineProps<{
		sentiment: 'positive' | 'negative' | 'neutral'
}>()

onMounted(() => {
		console.log('SentimentIndicator mounted, sentiment:', props.sentiment)
})

watch(() => props.sentiment, (newSentiment) => {
		console.log('SentimentIndicator sentiment changed:', newSentiment)
})
</script>

