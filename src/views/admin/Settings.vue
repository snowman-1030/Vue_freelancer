<script setup lang="ts">
import { ref } from 'vue'
import { Save } from 'lucide-vue-next'

const settings = ref({
  siteName: 'VueLeaf',
  siteDescription: 'Cannabis Brand Reputation Management',
  emailNotifications: true,
  slackIntegration: false,
  slackWebhook: '',
})

const saveSettings = () => {
  // In a real app, save to your API
  console.log('Saving settings:', settings.value)
}
</script>

<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-bold text-green-800 mb-2">
              System Settings
            </h1>
            <p class="text-gray-600 text-lg">
              Configure system preferences, manage notifications, and customize your VueLeaf experience.
            </p>
          </div>
          <button
            @click="saveSettings"
            class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Save class="h-5 w-5 mr-2" />
            Save Settings
          </button>
        </div>
      </div>

      <div class="space-y-8">
        <!-- General Settings -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-green-800">General Settings</h2>
          </div>
          <div class="p-6 space-y-6">
            <div>
              <label for="siteName" class="block text-sm font-medium text-gray-700">Site Name</label>
              <input
                type="text"
                id="siteName"
                v-model="settings.siteName"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label for="siteDescription" class="block text-sm font-medium text-gray-700">Site Description</label>
              <textarea
                id="siteDescription"
                v-model="settings.siteDescription"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              ></textarea>
            </div>

            <div class="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                v-model="settings.emailNotifications"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label for="emailNotifications" class="ml-2 block text-sm text-gray-700">
                Enable Email Notifications
              </label>
            </div>

            <div class="flex items-center">
              <input
                type="checkbox"
                id="slackIntegration"
                v-model="settings.slackIntegration"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label for="slackIntegration" class="ml-2 block text-sm text-gray-700">
                Enable Slack Integration
              </label>
            </div>

            <div v-if="settings.slackIntegration">
              <label for="slackWebhook" class="block text-sm font-medium text-gray-700">Slack Webhook URL</label>
              <input
                type="text"
                id="slackWebhook"
                v-model="settings.slackWebhook"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
