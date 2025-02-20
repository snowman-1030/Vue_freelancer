<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
</script>

<template>
  <div class="bg-yellow-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div class="flex flex-row sm:flex-row items-center text-start justify-center text-sm text-yellow-800 gap-2">
        <Bell class="h-5 w-5 text-yellow-500 animate-pulse" />
        <span class="hidden sm:block text-base font-medium">
          New reviews for cannabis brands in your area: <strong class="text-yellow-700 font-bold text-lg">20+</strong>
        </span>
        <span class="block sm:hidden text-base  text-sm">
          New cannabis brand reviews nearby:  <strong class="text-yellow-700 font-bold text-md">20+</strong>
        </span>
      </div>
    </div>
  </div>
</template>
