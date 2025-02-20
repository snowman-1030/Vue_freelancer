<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminDashboardStore } from '@/stores/adminDashboard'
import MetricsGrid from '@/components/admin/dashboard/MetricsGrid.vue'
import LatestUsers from '@/components/admin/dashboard/LatestUsers.vue'
import LatestFeedback from '@/components/admin/dashboard/LatestFeedback.vue'
import { Users, FileText, Settings } from 'lucide-vue-next'

const store = useAdminDashboardStore()

onMounted(async () => {
  await store.fetchDashboardData()
})
</script>

<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div class="flex flex-col">
          <h1 class="text-2xl md:text-3xl font-bold text-green-800 mb-2">
            Welcome to Admin Dashboard
          </h1>
          <p class="text-gray-600 text-lg">
            Manage your site content, users, and settings from here. Monitor key metrics and system performance in real-time.
          </p>
          <p v-if="store.lastUpdate" class="text-sm text-gray-500 mt-2">
            Last updated: {{ new Date(store.lastUpdate).toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- Key Metrics Section -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 class="text-xl font-semibold text-green-800 mb-4">Key Metrics</h2>
        <MetricsGrid />
      </div>

      <!-- Latest Activity Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <LatestUsers 
          :users="store.latestUsers"
          :is-loading="store.isLoading"
        />
        <LatestFeedback 
          :feedback="store.latestFeedback"
          :is-loading="store.isLoading"
        />
      </div>

      <!-- Quick Actions Section -->
      <div class="space-y-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-semibold text-green-800 mb-2">Quick Actions</h2>
          <p class="text-gray-600 mb-4">Access frequently used administrative functions</p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RouterLink
              v-for="(action, index) in [
                { name: 'Manage Users', path: '/admin/users', icon: Users },
                { name: 'Content Editor', path: '/admin/articles', icon: FileText },
                { name: 'System Settings', path: '/admin/settings', icon: Settings }
              ]"
              :key="index"
              :to="action.path"
              class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <component :is="action.icon" class="w-6 h-6 mr-3 text-green-700" />
              <span class="text-gray-700">{{ action.name }}</span>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="store.error" class="mt-4 p-4 bg-red-50 rounded-lg">
        <p class="text-red-600">{{ store.error.message }}</p>
      </div>
    </div>
  </div>
</template>
