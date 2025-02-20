<script setup lang="ts">
// 1. Vue imports
import { ref, onMounted } from 'vue'

// 2. Component imports
import { useAdminDashboardStore } from '@/stores/adminDashboard'
import { LoadingSpinner } from '@/components/ui/loading'

// 3. Type definitions
interface UserData {
  id: number
  username: string
  avatar: string | null
  date_joined: string
  last_login: string | null
}

// 4. Props and emits
const props = defineProps<{
  users: UserData[]
  isLoading: boolean
}>()

// 5. State management
const store = useAdminDashboardStore()

// 6. Methods
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <div class="flex flex-col space-y-4 bg-white rounded-lg shadow-sm p-6">
    <h2 class="text-xl font-semibold text-green-800">Latest Users</h2>
    <div v-if="isLoading" class="flex justify-center">
      <LoadingSpinner />
    </div>
    <div v-else class="space-y-2">
      <div v-for="user in users" :key="user.id"
           class="flex items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
        <img v-if="user.avatar" :src="user.avatar" 
             class="w-8 h-8 rounded-full mr-3"
             alt="User avatar" />
        <div v-else class="w-8 h-8 rounded-full bg-green-100 mr-3 flex items-center justify-center">
          <span class="text-green-800 font-medium">{{ user.username[0] }}</span>
        </div>
        <div class="flex-grow">
          <span class="font-medium text-gray-900">{{ user.username }}</span>
          <div class="text-sm text-gray-500">
            <p>Joined {{ formatDate(user.date_joined) }}</p>
            <p>Last login: {{ user.last_login ? formatDate(user.last_login) : 'Never' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>