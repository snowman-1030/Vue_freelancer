<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Save, Upload, Lock, User } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import axios from '@/lib/axios'
import * as Sentry from '@sentry/vue'
import { getFullAvatarUrl } from '@/utils/url'
import analyticsImage from '@/assets/images/analytics/analytics-green.png'

const toast = useToast()
const authStore = useAuthStore()

interface Profile {
  name: string
  email: string
  avatar: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const profile = ref<Profile>({
  name: '',
  email: '',
  avatar: authStore.avatar
})

const showDefaultAvatar = ref(false)

const passwordForm = ref<PasswordForm>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const avatarPreview = ref<string | null>(null)
const saving = ref(false)
const changingPassword = ref(false)
const avatarRef = ref<HTMLImageElement | null>(null)

// Track failed avatar URLs to prevent infinite loops
const failedAvatarUrls = new Set<string>()

// Handle avatar load errors
const handleAvatarError = () => {
  if (!avatarRef.value) return
  
  const currentSrc = avatarRef.value.src
  
  // Prevent infinite loops by tracking failed URLs
  if (!failedAvatarUrls.has(currentSrc)) {
    failedAvatarUrls.add(currentSrc)
    
    // Log URL construction details
    const urlDetails = {
      attemptedSrc: currentSrc,
      originalAvatar: profile.value.avatar,
      authStoreAvatar: authStore.avatar,
      constructedUrl: getFullAvatarUrl(profile.value.avatar || authStore.avatar),
      apiUrl: import.meta.env.VITE_API_URL,
      userId: authStore.username,
      mediaPath: currentSrc.includes('media/avatars/') ? 'media path found' : 'no media path'
    }

    // Track error in Sentry with detailed URL info
    Sentry.captureMessage('Avatar failed to load', {
      level: 'warning',
      extra: {
        ...urlDetails,
        fallbackApplied: true
      }
    })

    console.error('Avatar load failed:', urlDetails)
    
    // Show error message only once
    toast.error('Failed to load avatar image')
    
    // Show default avatar icon
    showDefaultAvatar.value = true
  }
}

// Load user profile
const loadProfile = async () => {
  try {
    const response = await axios.get('/users/profile/')
    profile.value = response.data
    // Reset default avatar flag when loading new profile
    showDefaultAvatar.value = false
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Profile load failed',
        username: authStore.username
      }
    })
    toast.error('Failed to load profile')
  }
}

// Handle avatar upload
const handleAvatarUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    
    // Preview
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
      // Reset default avatar flag when showing preview
      showDefaultAvatar.value = false
    }
    reader.readAsDataURL(file)

    // Upload
    const formData = new FormData()
    formData.append('avatar', file)
    
    try {
      const response = await axios.post('/users/upload_avatar/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      toast.success('Avatar updated successfully')
      // Update auth store with new avatar URL
      authStore.updateAvatar(response.data.avatar_url)
    } catch (error: any) {
      // Track error in Sentry
      Sentry.captureException(error, {
        extra: {
          context: 'Avatar upload failed',
          username: authStore.username,
          fileSize: file.size,
          fileType: file.type
        }
      })
      
      toast.error('Failed to update avatar')
      avatarPreview.value = null
      showDefaultAvatar.value = true
    }
  }
}

// Handle profile save
const handleSaveProfile = async () => {
  saving.value = true
  try {
    await axios.put('/users/update_profile/', {
      name: profile.value.name,
      email: profile.value.email
    })
    toast.success('Profile updated successfully')
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Profile update failed',
        username: authStore.username
      }
    })
    toast.error('Failed to update profile')
  } finally {
    saving.value = false
  }
}

// Handle password change
const handleChangePassword = async () => {
  if (!passwordForm.value.currentPassword) {
    toast.error('Please enter your current password')
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error('New passwords don\'t match')
    return
  }
  if (passwordForm.value.newPassword.length < 8) {
    toast.error('Password must be at least 8 characters long')
    return
  }

  changingPassword.value = true
  try {
    await axios.post('/users/change_password/', {
      current_password: passwordForm.value.currentPassword,
      new_password: passwordForm.value.newPassword
    })
    toast.success('Password changed successfully')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context: 'Password change failed',
        username: authStore.username
      }
    })
    toast.error('Failed to change password')
  } finally {
    changingPassword.value = false
  }
}

onMounted(loadProfile)
</script>

<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h1 class="text-xl md:text-2xl font-medium text-green-800 mb-2">
              Profile Settings
            </h1>
            <p class="text-gray-600 text-lg">
              Manage your account's essential security settings in one convenient place. Update your email address to ensure you never miss important notifications, and maintain your account's security by regularly updating your password. Your account's security is our priority.
            </p>
          </div>
          <div class="w-48 h-48 flex-shrink-0 relative">
            <img
              :src="analyticsImage"
              alt="Profile Settings illustration"
              class="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      <!-- Avatar and Name Section -->
      <div class="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div class="p-6">
          <div class="flex items-center space-x-6">
            <div class="relative w-24 h-24">
              <template v-if="!showDefaultAvatar && (avatarPreview || profile.avatar || authStore.avatar)">
                <img
                  :src="avatarPreview || getFullAvatarUrl(profile.avatar) || getFullAvatarUrl(authStore.avatar)"
                  :alt="profile.name"
                  class="w-24 h-24 rounded-full object-cover border-4 border-green-200"
                  @error="handleAvatarError"
                  ref="avatarRef"
                />
              </template>
              <template v-else>
                <div class="w-24 h-24 rounded-full bg-gray-100 border-4 border-green-200 flex items-center justify-center">
                  <User class="w-12 h-12 text-gray-400" />
                </div>
              </template>
              <label
                for="avatar-upload"
                class="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50"
              >
                <Upload class="w-4 h-4 text-gray-600" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarUpload"
                />
              </label>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ profile.name }}</h3>
              <p class="text-base text-gray-500">Click the icon to change your avatar</p>
            </div>
          </div>
          <div class="mt-6 space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                id="name"
                v-model="profile.name"
                type="text"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                v-model="profile.email"
                type="email"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              @click="handleSaveProfile"
              class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              :disabled="saving"
            >
              <Save class="w-4 h-4 mr-2" />
              {{ saving ? 'Saving...' : 'Save Profile' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Password Change Card -->
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-6">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50">
              <Lock class="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 class="text-lg font-medium text-gray-700">Change Password</h2>
              <p class="text-base text-gray-500">Update your password to keep your account secure.</p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <label for="current-password" class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                id="current-password"
                v-model="passwordForm.currentPassword"
                type="password"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                id="new-password"
                v-model="passwordForm.newPassword"
                type="password"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p class="text-sm text-gray-500 mt-1">Password must be at least 8 characters long</p>
            </div>
            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                id="confirm-password"
                v-model="passwordForm.confirmPassword"
                type="password"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <button
            @click="handleChangePassword"
            class="mt-6 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            :disabled="changingPassword"
          >
            <Lock class="w-4 h-4 mr-2" />
            {{ changingPassword ? 'Changing...' : 'Change Password' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
