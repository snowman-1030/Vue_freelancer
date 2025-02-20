<script setup lang="ts">
import heroImage from '@/assets/images/illustrations/hero-finance.png'
</script>

<template>
  <!-- Hero Section -->
  <div class="bg-green-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24 pb-10 md:pb-28">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div class="text-center md:text-left">
          <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold text-green-900 mb-6 leading-tight tracking-tight">
            The Smarter Way to <br class="hidden sm:inline" />
            Protect & Grow Your <br class="hidden sm:inline" />
            Cannabis Brand
          </h1>
          <p class="text-md  md:text-xl text-gray-700 mb-8 max-w-2xl">
            Get instant alerts, respond quickly, and build trust with your customers. Your brand reputation matters more than ever.
          </p>
          <button class="bg-yellow-400 text-yellow-900 px-8 py-4 rounded-md text-md md:text-xl font-semibold hover:bg-yellow-500 transition-colors">
            Start Monitoring Now
          </button>
        </div>
        <div class="order-first md:order-last">
          <img
            :src="heroImage"
            alt="Financial Growth Illustration"
            class="h-auto max-w-full mx-auto"
          />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
        <div class="text-center bg-white rounded-lg shadow-md p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div class="text-3xl md:text-4xl font-bold text-amber-600 mb-1">73%</div>
          <p class="text-sm text-gray-600">read reviews before purchase</p>
        </div>
        <div class="text-center bg-white rounded-lg shadow-md p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div class="text-3xl md:text-4xl font-bold text-teal-600 mb-1">92%</div>
          <p class="text-sm text-gray-600">trust peer recommendations</p>
        </div>
        <div class="text-center bg-white rounded-lg shadow-md p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div class="text-3xl md:text-4xl font-bold text-indigo-600 mb-1">4.2x</div>
          <p class="text-sm text-gray-600">higher brand conversion</p>
        </div>
      </div>
    </div>
  </div>
</template>
