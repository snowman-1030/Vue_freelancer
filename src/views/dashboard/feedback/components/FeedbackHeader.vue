<script setup lang="ts">
import { computed } from 'vue'
import { Search, Filter } from 'lucide-vue-next'
import feedbackImage from '@/assets/images/analytics/analytics-green.png'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFeedback } from '../composables/useFeedback'

const feedbackStore = useFeedback()

// Computed properties to safely access store values
const filterStatus = computed({
  get: () => feedbackStore.filterStatus.value,
  set: (value: string) => feedbackStore.setFilterStatus(value)
})

const searchTerm = computed({
  get: () => feedbackStore.searchTerm.value,
  set: (value: string) => feedbackStore.setSearchTerm(value)
})
</script>

<template>
  <div class="mb-8 space-y-6">
    <!-- Header Content -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex flex-col md:flex-row items-center gap-6">
        <div class="flex-1">
          <h1 class="text-2xl md:text-3xl font-bold text-green-800 mb-2">
            Welcome to the Feedback Center
          </h1>
          <p class="text-gray-600 text-lg">
            Help us make your brand management experience even better. Share your thoughts, suggestions, or report any issues you encounter while using our platform. Your feedback goes directly to our admin team and helps shape future improvements.
          </p>
        </div>
        <div class="w-48 h-48 flex-shrink-0 relative hidden md:block">
          <img
            :src="feedbackImage"
            alt="Feedback Illustration"
            class="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-lg shadow-sm p-4">
      <div class="flex items-center gap-4 w-full sm:w-auto">
        <Select
          v-model="filterStatus"
          class="w-[180px]"
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Filter class="h-5 w-5 text-gray-500" />
      </div>
      
      <div class="relative w-full sm:w-auto">
        <Input
          v-model="searchTerm"
          type="text"
          placeholder="Search feedback..."
          class="pl-10 pr-4 py-2 w-full sm:w-64"
        />
        <Search 
          class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>
  </div>
</template>