<template>
  <div class="inline-block w-5 h-5">
    <svg v-if="sentiment === 'positive'" viewBox="0 0 20 20" class="w-full h-full">
      <rect width="20" height="20" fill="#4CAF50"/>
      <path d="M10 5L15 12H5L10 5Z" fill="white"/>
    </svg>
				<svg v-else-if="sentiment === 'negative'" viewBox="0 0 20 20" class="w-full h-full">
						<rect width="20" height="20" fill="#F44336"/>
						<path d="M10 15L15 8H5L10 15Z" fill="white"/>
				</svg>
				<svg v-else viewBox="0 0 20 20" class="w-full h-full">
						<rect width="20" height="20" fill="#FFC107"/>
						<path d="M15 10L8 5V15L15 10Z" fill="white"/>
				</svg>
		</div>
</template>

<script setup lang="ts">
defineProps<{
  sentiment: 'positive' | 'negative' | 'neutral'
}>()
</script>

