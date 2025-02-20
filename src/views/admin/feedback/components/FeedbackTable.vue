<script setup lang="ts">
import { computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { Loader2, MessageSquare, Trash2 } from 'lucide-vue-next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StatusBadge from './StatusBadge.vue'
import { useFeedbackStore } from '@/stores/feedback'
import type { Feedback } from '@/services/feedback'

const store = useFeedbackStore()

// Computed properties to safely access store values
const filteredItems = computed(() => store.filteredItems)
const isLoading = computed(() => store.isLoading)
const error = computed(() => store.error)

const openDialog = (item: Feedback) => {
  store.setSelectedItem(item)
}

const getFeedbackType = (message: string) => {
  // Type is the first line
  const firstLine = message.split(/\r?\n/)[0].toLowerCase()
  return firstLine === 'bug' || firstLine === 'feature' || firstLine === 'support' ? firstLine : 'other'
}

const getMessageContent = (message: string) => {
  // Content is everything after the double newline
  const parts = message.split(/\r?\n\r?\n/)
  return parts.length > 1 ? parts[1].trim() : ''
}

const formatDate = (dateString: string) => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

const handleDelete = async (id: number) => {
  try {
    console.log('FeedbackTable: Attempting to delete feedback:', id)
    await store.deleteFeedback(id)
    console.log('FeedbackTable: Successfully deleted feedback:', id)
  } catch (err) {
    console.error('FeedbackTable: Error deleting feedback:', err)
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Feedback Items</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="isLoading" class="flex justify-center items-center py-8">
        <Loader2 class="h-8 w-8 animate-spin text-green-600" />
      </div>

      <div v-else-if="error" class="text-center py-8 text-red-600">
        {{ error }}
      </div>

      <div v-else-if="!filteredItems.length" class="text-center py-8 text-gray-500">
        No feedback items found.
      </div>

      <Table v-else>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Replies</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in filteredItems" :key="item.id">
            <TableCell>{{ item.user }}</TableCell>
            <TableCell>{{ getFeedbackType(item.message) }}</TableCell>
            <TableCell class="max-w-md">
              <p class="truncate">{{ getMessageContent(item.message) }}</p>
            </TableCell>
            <TableCell>{{ formatDate(item.created_at) }}</TableCell>
            <TableCell>
              <StatusBadge :status="item.status" />
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1 text-gray-600">
                <MessageSquare class="h-4 w-4" />
                <span>{{ item.replies.length }}</span>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  class="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 whitespace-nowrap"
                  @click="openDialog(item)"
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md border border-red-200"
                  @click="handleDelete(item.id)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>