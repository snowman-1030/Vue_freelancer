<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Bell, MessageCircle, Star, Shield, AlertTriangle, TrendingUp, Clock, Timer } from 'lucide-vue-next'
import Card from "@/components/ui/card/Card.vue"
import CardHeader from "@/components/ui/card/CardHeader.vue"
import CardTitle from "@/components/ui/card/CardTitle.vue"
import CardDescription from "@/components/ui/card/CardDescription.vue"
import CardContent from "@/components/ui/card/CardContent.vue"
import Switch from "@/components/ui/switch/index.vue"
import Label from "@/components/ui/label/Label.vue"
import Select from "@/components/ui/select/index.vue"
import Button from "@/components/ui/button/Button.vue"
import Input from "@/components/ui/input/Input.vue"
import { notificationService } from "@/services/notifications"
import { useToast } from "@/composables/useToast"
import socialMediaImage from '@/assets/images/dashboard/social-media.png'

const toast = useToast()
const isLoading = ref(false)
const isSaving = ref(false)

const alertPreferences = ref({
  push_enabled: true,
  new_review_alerts: true,
  negative_review_alerts: true,
  response_reminders: true,
  positive_review_alerts: false,
  review_milestones: true,
  trend_alerts: true,
  notification_frequency: 'weekly' as 'daily' | 'weekly',
  time_zone: 'UTC',
  quiet_hours_start: null as string | null,
  quiet_hours_end: null as string | null
})

const timeZoneOptions = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' }
]

// Initialize OneSignal and load preferences
onMounted(async () => {
  isLoading.value = true
  try {
    // Initialize OneSignal first
    await notificationService.initialize()
    console.log('OneSignal initialized successfully')

    // Then load preferences
    const prefs = await notificationService.getPreferences()
    alertPreferences.value = prefs
  } catch (error) {
    console.error('Failed to initialize:', error)
    toast.error('Failed to initialize notifications')
  } finally {
    isLoading.value = false
  }
})

// Handle push notification toggle
const handlePushToggle = async (enabled: boolean) => {
  isSaving.value = true
  try {
    // First try to update the subscription
    await notificationService.updateSubscription(enabled)
    
    // Only show success message if the subscription was actually updated
    // The backend will be updated through the subscription change event
    toast.success(`Push notifications ${enabled ? 'enabled' : 'disabled'}`)
  } catch (error) {
    console.error('Failed to toggle push notifications:', error)
    // Revert the toggle if it failed
    alertPreferences.value.push_enabled = !enabled
    if (error instanceof Error) {
      toast.error(error.message)
    } else {
      toast.error('Failed to update push notification settings')
    }
  } finally {
    isSaving.value = false
  }
}

const handleSavePreferences = async () => {
  isSaving.value = true
  try {
    await notificationService.updateSubscription(alertPreferences.value.push_enabled)
    await notificationService.updatePreferences(alertPreferences.value)
    toast.success('Preferences saved successfully')
  } catch (error) {
    toast.error('Failed to save preferences')
    console.error('Failed to save preferences:', error)
  } finally {
    isSaving.value = false
  }
}

const handleTestNotification = async () => {
  isSaving.value = true
  try {
    // First check if notifications are enabled
    if (!alertPreferences.value.push_enabled) {
      throw new Error('Please enable push notifications first')
    }
    
    await notificationService.sendTestNotification()
    toast.success('Test notification sent')
  } catch (error) {
    console.error('Failed to send test notification:', error)
    if (error instanceof Error) {
      toast.error(error.message)
    } else {
      toast.error('Failed to send test notification')
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="flex-1 overflow-y-auto p-6 min-h-screen">
      <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mb-4"></div>
          <p class="text-gray-600">Loading preferences...</p>
        </div>
      </div>
      
      <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Welcome Section -->
        <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div class="flex flex-col md:flex-row items-center gap-6">
            <div class="flex-1">
              <h1 class="text-xl md:text-2xl font-medium text-green-800 mb-2">
                Welcome to your Alerts Preferences!
              </h1>
              <p class="text-gray-600 text-lg">
                Here you can customize how you stay informed about your brand's presence in the cannabis community. Choose which notifications matter most to you, from new reviews to trend alerts, set your preferred frequency, and configure your time zone and quiet hours. Take a moment to fine-tune these settings to ensure you get the right information at the right time.
              </p>
            </div>
            <div class="w-48 h-48 flex-shrink-0 relative">
              <img
                :src="socialMediaImage"
                alt="Communication illustration"
                class="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        <!-- Push Notifications -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                <Bell class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <CardTitle class="text-lg font-medium text-gray-700">Push Notifications</CardTitle>
                <CardDescription class="text-base text-gray-500">Enable or disable push notifications.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-6 pt-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center justify-between">
                <Label html-for="push-enabled">Enable Push Notifications</Label>
                <Switch
                  id="push-enabled"
                  v-model="alertPreferences.push_enabled"
                  :disabled="isSaving"
                  @update:model-value="handlePushToggle"
                />
              </div>
              <div class="flex justify-end mt-4">
                <Button
                  @click="handleTestNotification"
                  :disabled="!alertPreferences.push_enabled || isSaving"
                  variant="outline"
                  size="sm"
                >
                  Send Test Notification
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Notification Triggers -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                <AlertTriangle class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <CardTitle class="text-lg font-medium text-gray-700">Notification Triggers</CardTitle>
                <CardDescription class="text-base text-gray-500">Choose which events warrant notifications.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-6 pt-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <Bell class="h-5 w-5 text-blue-500" />
                <Label html-for="new-reviews">New Review Alerts</Label>
              </div>
              <Switch
                id="new-reviews"
                v-model="alertPreferences.new_review_alerts"
                :disabled="isSaving"
              />
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <AlertTriangle class="h-5 w-5 text-red-500" />
                <Label html-for="negative-reviews">Negative Review Alerts</Label>
              </div>
              <Switch
                id="negative-reviews"
                v-model="alertPreferences.negative_review_alerts"
                :disabled="isSaving"
              />
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <MessageCircle class="h-5 w-5 text-purple-500" />
                <Label html-for="response-reminders">Response Reminders</Label>
              </div>
              <Switch
                id="response-reminders"
                v-model="alertPreferences.response_reminders"
                :disabled="isSaving"
              />
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <Star class="h-5 w-5 text-yellow-500" />
                <Label html-for="positive-reviews">Positive Review Alerts</Label>
              </div>
              <Switch
                id="positive-reviews"
                v-model="alertPreferences.positive_review_alerts"
                :disabled="isSaving"
              />
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <Shield class="h-5 w-5 text-green-500" />
                <Label html-for="review-milestones">Review Milestones</Label>
              </div>
              <Switch
                id="review-milestones"
                v-model="alertPreferences.review_milestones"
                :disabled="isSaving"
              />
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <TrendingUp class="h-5 w-5 text-indigo-500" />
                <Label html-for="trend-alerts">Trend Alerts</Label>
              </div>
              <Switch
                id="trend-alerts"
                v-model="alertPreferences.trend_alerts"
                :disabled="isSaving"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Notification Frequency -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                <Clock class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <CardTitle class="text-lg font-medium text-gray-700">Notification Frequency</CardTitle>
                <CardDescription class="text-base text-gray-500">Set how often you'd like to receive notifications.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-6 pt-4">
            <div class="space-y-2">
              <Label html-for="notification-frequency">Summary Frequency</Label>
              <Select
                id="notification-frequency"
                v-model="alertPreferences.notification_frequency"
                :options="[
                  { value: 'daily', label: 'Daily Summary' },
                  { value: 'weekly', label: 'Weekly Summary' }
                ]"
                placeholder="Select frequency"
                :disabled="isSaving"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Time Zone and Quiet Hours -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                <Timer class="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <CardTitle class="text-lg font-medium text-gray-700">Time Zone and Quiet Hours</CardTitle>
                <CardDescription class="text-base text-gray-500">Configure your preferred time zone and set quiet hours.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-6 pt-4">
            <div class="space-y-2">
              <Label html-for="timezone">Time Zone</Label>
              <Select
                id="timezone"
                v-model="alertPreferences.time_zone"
                :options="timeZoneOptions"
                placeholder="Select your time zone"
                :disabled="isSaving"
              />
            </div>
            <div class="space-y-2">
              <Label>Quiet Hours</Label>
              <div class="flex space-x-4">
                <div class="flex-1">
                  <Label html-for="quiet-start">Start</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    :value="alertPreferences.quiet_hours_start || ''"
                    @input="(e: Event) => alertPreferences.quiet_hours_start = (e.target as HTMLInputElement).value || null"
                    :disabled="isSaving"
                  />
                </div>
                <div class="flex-1">
                  <Label html-for="quiet-end">End</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    :value="alertPreferences.quiet_hours_end || ''"
                    @input="(e: Event) => alertPreferences.quiet_hours_end = (e.target as HTMLInputElement).value || null"
                    :disabled="isSaving"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Save Button -->
        <div class="flex justify-end">
          <Button 
            @click="handleSavePreferences"
            :disabled="isLoading || isSaving"
          >
            {{ isSaving ? 'Saving...' : 'Save Preferences' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
