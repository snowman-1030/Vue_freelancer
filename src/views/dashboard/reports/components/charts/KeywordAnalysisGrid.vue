<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div 
      v-for="keyword in keywords" 
      :key="keyword.keyword"
      class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-200"
    >
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-semibold capitalize">{{ keyword.keyword }}</h2>
        <span class="text-sm text-gray-500">{{ keyword.total }} mentions</span>
      </div>
      
      <div class="space-y-1.5">
        <!-- Positive -->
        <div class="flex items-center justify-between">
          <span class="text-gray-600 text-sm">Positive</span>
          <div class="flex items-center">
            <div class="w-32 h-3 bg-gray-100 rounded mr-2">
              <div 
                :style="{ 
                  width: `${(keyword.positive / keyword.total) * 100}%`,
                  height: '100%',
                  backgroundColor: '#9dddb4',
                  borderRadius: '4px'
                }"
              />
            </div>
            <span class="text-sm text-gray-600">{{ keyword.positive }}</span>
          </div>
        </div>
        
        <!-- Neutral -->
        <div class="flex items-center justify-between">
          <span class="text-gray-600 text-sm">Neutral</span>
          <div class="flex items-center">
            <div class="w-32 h-3 bg-gray-100 rounded mr-2">
              <div 
                :style="{ 
                  width: `${(keyword.neutral / keyword.total) * 100}%`,
                  height: '100%',
                  backgroundColor: '#ffd999',
                  borderRadius: '4px'
                }"
              />
            </div>
            <span class="text-sm text-gray-600">{{ keyword.neutral }}</span>
          </div>
        </div>
        
        <!-- Negative -->
        <div class="flex items-center justify-between">
          <span class="text-gray-600 text-sm">Negative</span>
          <div class="flex items-center">
            <div class="w-32 h-3 bg-gray-100 rounded mr-2">
              <div 
                :style="{ 
                  width: `${(keyword.negative / keyword.total) * 100}%`,
                  height: '100%',
                  backgroundColor: '#ffb3b3',
                  borderRadius: '4px'
                }"
              />
            </div>
            <span class="text-sm text-gray-600">{{ keyword.negative }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Keyword {
  keyword: string
  total: number
  positive: number
  neutral: number
  negative: number
}

defineProps<{
  keywords: Keyword[]
}>()
</script>