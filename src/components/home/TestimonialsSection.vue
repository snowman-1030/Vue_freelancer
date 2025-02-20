<script setup lang="ts">
import { Quote, Star } from 'lucide-vue-next'
import ratingImage from '@/assets/images/ui/rating.png'

defineProps<{
  testimonials: Array<{
    quote: string
    author: string
    company: string
    avatar: string
    rating: number
  }>
}>()
</script>

<template>
  <div class="bg-white py-10 md:py-24" id="testimonials">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-green-800 mb-4">What Our Clients Say</h2>
        <p class="text-md md:text-xl text-gray-600 max-w-3xl mx-auto whitespace-wrap">Discover how Vueleaf is transforming brand management for cannabis businesses.</p>
      </div>
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <!-- <img
            :src="ratingImage"
            alt="Customer Rating Illustration"
            class="h-auto max-w-full"
            style="max-width: 500px"
          /> -->
          <img
            :src="ratingImage"
            alt="Customer Rating Illustration"
            class="h-auto max-w-full"
          />
        </div>
        <div class="space-y-8">
          <div
            v-for="(testimonial, index) in testimonials"
            :key="index"
            class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6"
          >
            <div class="flex flex-row sm:flex-row items-start  sm:items-start gap-0 sm:gap-0 justify-between mb-4">
              <div class="flex items-start">
                <div class="rounded-full bg-gray-200 -ml-2 sm:ml-0 mr-2 sm:mr-4 overflow-hidden">
                  <!-- <div class="h-12 w-12 rounded-full bg-gray-200 mr-4 overflow-hidden"> -->
                  <img
                    :src="testimonial.avatar"
                    :alt="testimonial.author"
                    class="h-6 w-6 sm:w-full sm:h-full  object-cover"
                  />
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ testimonial.author }}</p>
                  <p class="text-sm text-gray-600">{{ testimonial.company }}</p>
                </div>
              </div>
              <div class="flex">
                <Star
                  v-for="i in 5"
                  :key="i"
                  class="h-4 w-4"
                  :class="i <= testimonial.rating ? 'text-yellow-400' : 'text-gray-300'"
                  fill="currentColor"
                />
              </div>
            </div>
            <blockquote class="relative">
              <Quote class="absolute top-0 left-0 text-green-200 h-6 w-6 -mt-2 -ml-2" />
              <p class="text-gray-600 italic pl-6">{{ testimonial.quote }}</p>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
