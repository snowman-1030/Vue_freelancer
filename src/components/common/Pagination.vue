<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'update:currentPage', value: number): void
}>()

function changePage(page: number) {
  emit('update:currentPage', page)
}
</script>

<template>
  <div class="flex items-center justify-center gap-2 py-4">
    <!-- Previous button -->
    <button
      class="flex items-center justify-center h-10 w-10 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="currentPage === 1"
      @click="changePage(currentPage - 1)"
    >
      <ChevronLeft class="w-5 h-5" />
    </button>

    <!-- First page -->
    <button 
      v-if="totalPages > 0"
      class="flex items-center justify-center h-10 min-w-[40px] px-2 rounded text-base transition-colors"
      :class="currentPage === 1 
        ? 'bg-emerald-100 text-emerald-700 font-medium' 
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
      @click="changePage(1)"
    >
      1
    </button>

    <!-- Middle pages -->
    <template v-for="page in totalPages" :key="page">
      <button
        v-if="page !== 1 && page !== totalPages && Math.abs(currentPage - page) <= 2"
        class="flex items-center justify-center h-10 min-w-[40px] px-2 rounded text-base transition-colors"
        :class="page === currentPage 
          ? 'bg-emerald-100 text-emerald-700 font-medium' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
        @click="changePage(page)"
      >
        {{ page }}
      </button>
    </template>

    <!-- Ellipsis -->
    <span v-if="currentPage < totalPages - 3" class="px-2 text-gray-500">...</span>

    <!-- Last page -->
    <button 
      v-if="totalPages > 1"
      class="flex items-center justify-center h-10 min-w-[40px] px-2 rounded text-base transition-colors"
      :class="currentPage === totalPages 
        ? 'bg-emerald-100 text-emerald-700 font-medium' 
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
      @click="changePage(totalPages)"
    >
      {{ totalPages }}
    </button>

    <!-- Next button -->
    <button 
      class="flex items-center justify-center h-10 w-10 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="currentPage === totalPages"
      @click="changePage(currentPage + 1)"
    >
      <ChevronRight class="w-5 h-5" />
    </button>
  </div>
</template>