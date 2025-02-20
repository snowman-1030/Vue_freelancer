<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

defineProps<{
  platforms: Array<{
    name: string
    icon: string
  }>
}>()
</script>

<template>
  <div class="bg-green-50 py-10 md:py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row text-center md:text-left items-center gap-12">
        <div class="flex-1">
          <h3 class="text-3xl font-bold text-green-800 mb-6">
            Monitor Top Cannabis Platforms
          </h3>
          <p class="text-gray-600 text-md md:text-lg mb-8">
            Comprehensive monitoring of leading cannabis forums, review sites, and online communities to protect your
            brand 24/7.
          </p>
          <RouterLink to="/register"
            class="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors inline-flex items-center gap-2 text-md md:text-lg font-medium shadow-md">
            Start Monitoring Now
            <ArrowRight class="h-5 w-5" />
          </RouterLink>
        </div>
        <div class="flex-1">
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 grid-rows-2 gap-6">
            <div v-for="(platform, index) in platforms" :key="index"
              class="bg-white p-6 sm:p-6 md:p-6 rounded-lg shadow-md flex flex-col items-center justify-center aspect-square transition-all duration-300 hover:shadow-lg hover:scale-105">
              <img :src="platform.icon" :alt="platform.name" class="w-12 h-12 mb-3" loading="lazy" />
              <p class="text-gray-900">{{ platform.name }}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
