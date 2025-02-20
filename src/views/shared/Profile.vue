<template>
  <div class="flex-1 flex flex-col h-screen overflow-hidden">
    <!-- Header -->
    <header class="bg-white text-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-green-800">Profile Settings</h1>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="space-y-6">
          <!-- Profile Settings Card -->
          <div class="bg-white shadow-lg rounded-lg overflow-hidden">
            <div class="bg-gray-100 text-gray-800 p-6">
              <h2 class="text-2xl font-semibold">Profile Settings</h2>
              <p class="text-gray-600">Manage your personal information.</p>
            </div>
            <div class="p-6 space-y-6">
              <div class="flex items-center space-x-6">
                <div class="relative">
                  <img
                    :src="avatarPreview || profile.avatar || authStore.avatar"
                    :alt="profile.name"
                    class="w-24 h-24 rounded-full object-cover border-4 border-green-200"
                  />
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
              <div class="space-y-4">
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

          <!-- Password Change Card -->
          <div class="bg-white shadow-lg rounded-lg overflow-hidden">
            <div class="bg-gray-100 text-gray-800 p-6">
              <div class="flex items-center gap-3">
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50">
                  <Lock class="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 class="text-lg font-medium text-gray-700">Change Password</h2>
                  <p class="text-base text-gray-500">Update your password to keep your account secure.</p>
                </div>
              </div>
            </div>
            <div class="p-6 space-y-6">
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
                class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                :disabled="changingPassword"
              >
                <Lock class="w-4 h-4 mr-2" />
                {{ changingPassword ? 'Changing...' : 'Change Password' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Save, Upload, Lock } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import axios from '@/lib/axios'

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
  avatar: authStore.avatar || '/placeholder.svg?height=128&width=128'
})

const passwordForm = ref<PasswordForm>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const avatarPreview = ref<string | null>(null)
const saving = ref(false)
const changingPassword = ref(false)

// Load user profile
const loadProfile = async () => {
  try {
    const response = await axios.get('/users/profile/')
    profile.value = response.data
  } catch (error) {
    toast.error('Failed to load profile')
  }
}

// Handle avatar upload
const handleAvatarUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    
    // Preview
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)

    // Upload
    const formData = new FormData()
    formData.append('avatar', file)
    
    axios.post('/users/upload_avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then((response) => {
      toast.success('Avatar updated successfully')
      // Update auth store with new avatar URL
      authStore.updateAvatar(response.data.avatar_url)
    })
    .catch(() => {
      toast.error('Failed to update avatar')
      avatarPreview.value = null
    })
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
    toast.error('Failed to change password')
  } finally {
    changingPassword.value = false
  }
}

onMounted(loadProfile)
</script>
