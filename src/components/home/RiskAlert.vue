<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const risks = [
  { title: "Product Quality Crisis", content: "DO NOT BUY LIGHTS, THEY ARE A RIP OFF! No warranty. Had it for less than a year and it has gone belly up. NO WARRANTY!!!" },
  { title: "Review Manipulation Allegations", content: "Very bad company who pays growers with free merch to give good reviews for bad products" },
  { title: "Customer Service Failure", content: "Terrible customer service and would frequently fail to address legitimate problems." }
]
</script>

<template>
  <div class="bg-red-50 py-10 md:py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-10">
        <div class="inline-flex items-center px-8 py-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-md md:text-lg font-semibold mb-6">
          <AlertTriangle class="h-5 w-5 mr-2" />
          Reputation Risk Alert
        </div>
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Your Brand is One Bad Review Away from Crisis
        </h2>
        <p class="text-md: md:text-xl text-gray-600 max-w-3xl mx-auto">
          Don't let negative reviews destroy your brand's reputation. Take control now.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 mt-10">
        <div 
          v-for="(risk, index) in risks" 
          :key="index"
          class="bg-white p-6 rounded-lg shadow-md border border-red-200"
        >
          <div class="flex items-start">
            <AlertTriangle class="h-6 w-6 text-red-500 mt-1 flex-shrink-0 mr-4" />
            <div>
              <h3 class="font-semibold text-gray-800 text-md md:text-lg mb-2">{{ risk.title }}</h3>
              <p class="text-gray-600 italic">"{{ risk.content }}"</p>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-12">
        <RouterLink
          to="/register"
          class="bg-red-500 text-white px-8 py-3 rounded-lg text-md md:text-lg font-semibold shadow-lg hover:bg-red-600 transition-colors inline-block"
        >
          Protect Your Brand Now
        </RouterLink>
      </div>
    </div>
  </div>
</template>
