<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search, Filter, Trash2 } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useFeedbackStore } from '@/stores/feedback'

const store = useFeedbackStore()
const isConfirmOpen = ref(false)

// Computed properties to safely access store values
const filterStatus = computed({
  get: () => store.filterStatus,
  set: (value: string) => store.setFilterStatus(value)
})

const searchTerm = computed({
  get: () => store.searchTerm,
  set: (value: string) => store.setSearchTerm(value)
})

const isLoading = computed(() => store.isLoading)

async function handleClearFeedback() {
  try {
    await store.clearAllFeedback()
    isConfirmOpen.value = false
  } catch (error) {
    console.error('Failed to clear feedback:', error)
  }
}
</script>

<template>
  <div class="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
    <div class="flex items-center gap-4">
      <Select v-model="filterStatus">
        <SelectTrigger class="w-[180px]">
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
      
      <!-- Clear Feedback Button with Dialog -->
      <Button variant="destructive" class="gap-2 inline-flex" @click="isConfirmOpen = true">
        <Trash2 class="h-4 w-4" />
        Clear All
      </Button>
      <Dialog v-model:open="isConfirmOpen">
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Clear All Feedback</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all feedback? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" @click="isConfirmOpen = false">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              :disabled="isLoading" 
              @click="handleClearFeedback"
            >
              {{ isLoading ? 'Clearing...' : 'Clear All' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    
    <div class="relative">
      <Input
        v-model="searchTerm"
        type="text"
        placeholder="Search feedback..."
        class="pl-10 pr-4 py-2 w-full sm:w-64"
      />
      <Search class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  </div>
</template>