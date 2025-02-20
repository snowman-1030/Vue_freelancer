<script setup lang="ts">
defineProps<{
  features: Array<{
    title: string
    description: string
    icon: any
    bgColor: string
    borderColor: string
    iconColor: string
  }>
}>()
</script>

<template>
  <div class="py-10 md:py-24 bg-gray-50" id="features">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-5xl font-bold text-green-800 mb-4">
          Complete Reputation Management
        </h2>
        <p class="text-md md:text-xl text-gray-600 max-w-3xl mx-auto whitespace-wrap">Discover how Vueleaf is transforming brand management for cannabis businesses.</p>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <div 
          v-for="(feature, index) in features" 
          :key="index"
          :class="[feature.bgColor, 'rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg border', feature.borderColor]"
        >
          <div class="flex items-start">
            <div 
              class="rounded-full w-12 h-12 flex items-center justify-center mr-4 bg-white flex-shrink-0"
            >
              <component 
                :is="feature.icon" 
                class="h-6 w-6"
                :class="feature.iconColor"
              />
            </div>
            <div>
              <h3 class="text-md md:text-xl font-semibold mb-2 text-gray-800">{{ feature.title }}</h3>
              <p class="text-gray-600">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
