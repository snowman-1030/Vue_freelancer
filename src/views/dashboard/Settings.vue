<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
          <!-- Welcome Message -->
          <div class="bg-white rounded-lg shadow-sm p-6 mb-8 flex items-start">
            <div class="flex-grow pr-6">
              <h2 class="text-2xl font-semibold text-gray-800 mb-4">Welcome to Settings</h2>
              <p class="text-gray-600 text-lg">
                Power your automated review responses by securely connecting your forum accounts. Add your login credentials for each platform to enable direct engagement with your community. Our system uses these secure connections to help your brand maintain an active presence across the growing space. Your credentials are encrypted and used solely for authorized responses.
              </p>
            </div>
            <div class="hidden md:block w-48 flex-shrink-0">
              <img
                :src="analyticsImage"
                alt="Settings Welcome Illustration"
                class="w-full h-auto"
              />
            </div>
          </div>

          <!-- Security Alert -->
          <div class="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-8 flex items-start">
            <div class="w-full">
              <h2 class="text-lg font-medium text-yellow-800 mb-2">Important Security Information</h2>
              <div class="text-base space-y-2 text-yellow-800">
                <p>These forum credentials enable automated brand monitoring and responses. We need this access to protect your reputation across platforms.</p>
                <p>At VueLeaf, we treat your security as our highest priority. All passwords are encrypted using industry-standard methods before being stored in our database. We never store plaintext passwords, and our systems undergo regular security audits.</p>
                <p>Remember to use strong, unique passwords for each forum to maximize your account security.</p>
              </div>
            </div>
          </div>

          <!-- Add New Forum -->
          <div class="bg-white rounded-lg shadow-sm mb-8">
            <div class="p-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50">
                  <Plus class="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 class="text-lg font-medium text-gray-700">Add New Forum</h2>
                  <p class="text-base text-gray-500">Enter the details for a new forum to track.</p>
                </div>
              </div>
              
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- Forum Selection -->
                  <select 
                    v-model="form.forum"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Forum</option>
                    <option v-for="forum in forums" :key="forum.id" :value="forum.id">
                      {{ forum.name }}
                    </option>
                  </select>

                  <!-- Username -->
                  <input 
                    type="text"
                    v-model="form.username"
                    placeholder="Username"
                    class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />

                  <!-- Password with toggle -->
                  <div class="relative">
                    <input 
                      :type="showPassword ? 'text' : 'password'"
                      v-model="form.password"
                      placeholder="Password"
                      class="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <component :is="showPassword ? EyeOff : Eye" class="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                <!-- Password Strength Indicator -->
                <div v-if="form.password" class="mt-2">
                  <div class="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                    <div 
                      :class="{
                        'h-full transition-all duration-300': true,
                        'bg-red-500': passwordStrength < 40,
                        'bg-orange-500': passwordStrength >= 40 && passwordStrength < 60,
                        'bg-yellow-500': passwordStrength >= 60 && passwordStrength < 80,
                        'bg-green-500': passwordStrength >= 80
                      }"
                      :style="{ width: `${passwordStrength}%` }"
                    />
                  </div>
                  <p class="text-xs mt-1 text-gray-600">
                    Password strength: 
                    <span :class="{
                      'font-medium': true,
                      'text-red-600': passwordStrength < 40,
                      'text-orange-600': passwordStrength >= 40 && passwordStrength < 60,
                      'text-yellow-600': passwordStrength >= 60 && passwordStrength < 80,
                      'text-green-600': passwordStrength >= 80
                    }">
                      {{ 
                        passwordStrength < 40 ? 'Weak' : 
                        passwordStrength < 60 ? 'Fair' : 
                        passwordStrength < 80 ? 'Good' : 
                        'Strong'
                      }}
                    </span>
                  </p>
                </div>

                <button 
                  type="submit"
                  class="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 inline-flex items-center"
                  :disabled="loading"
                >
                  <Plus class="h-4 w-4 mr-2" />
                  Add Forum
                </button>
              </form>
            </div>
          </div>

          <!-- Manage Credentials -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="p-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50">
                  <Shield class="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 class="text-lg font-medium text-gray-700">Manage Forum Credentials</h2>
                  <p class="text-base text-gray-500">View and manage your forum credentials.</p>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b">
                      <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-200/50">Forum</th>
                      <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-200/50">Username</th>
                      <th class="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-200/50">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cred in credentials" :key="cred.id" class="border-b last:border-b-0 hover:bg-gray-50">
                      <td class="py-3 px-4">
                        <span :class="{
                          'px-3 py-1 rounded text-sm font-medium': true,
                          'bg-blue-100 text-blue-800': cred.forum === 'rollitup.org',
                          'bg-green-100 text-green-800': cred.forum === 'thcfarmer.com',
                          'bg-yellow-100 text-yellow-800': cred.forum === 'icmag.com',
                          'bg-pink-100 text-pink-800': cred.forum === '420magazine.com',
                          'bg-purple-100 text-purple-800': cred.forum === 'overgrow.com'
                        }">
                          {{ getForum(cred.forum)?.name }}
                        </span>
                      </td>
                      <td class="py-3 px-4">
                        <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-medium">
                          {{ cred.username }}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-right">
                        <button 
                          @click="deleteCredentials(cred.id)"
                          class="bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 inline-flex items-center"
                          :disabled="deleting === cred.id"
                        >
                          <Trash2 class="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mt-6">
                <button 
                  @click="handleSaveChanges"
                  class="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 inline-flex items-center"
                >
                  <Save class="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import analyticsImage from '@/assets/images/analytics/analytics-green.png'
import { Bell, Plus, Trash2, Save, Eye, EyeOff, Shield } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import axios from '@/lib/axios'

const toast = useToast()

// User info (replace with actual user data from your auth store)
const username = ref('John Doe')
const userInitials = computed(() => {
  return username.value
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
})

// Forum options
const forums = [
  { id: 'rollitup.org', name: 'RollItUp (Xenforo)' },
  { id: 'thcfarmer.com', name: 'THC Farmer (Xenforo)' },
  { id: 'icmag.com', name: 'ICMag (Xenforo)' },
  { id: '420magazine.com', name: '420 Magazine (Xenforo)' },
  { id: 'overgrow.com', name: 'Overgrow (Discourse)' },
  { id: 'ilgmforum.com', name: 'ILGM Forum (Discourse)' },
  { id: 'homegrowncannabisco.community', name: 'Homegrown Cannabis Co (Discourse)' },
  { id: 'growersnetwork.org', name: 'Growers Network (Discourse)' },
  { id: 'reddit.com', name: 'Reddit' }
]

// Form state
const form = ref({
  forum: '',
  username: '',
  password: ''
})

// UI state
const showPassword = ref(false)
const loading = ref(false)
const deleting = ref<string | null>(null)
const credentials = ref<any[]>([])

// Password strength calculation
const passwordStrength = computed(() => {
  const password = form.value.password
  if (!password) return 0
  
  let score = 0
  
  // Length check
  if (password.length > 0) score += 20
  if (password.length > 8) score += 20
  
  // Character type checks
  if (/[a-z]/.test(password)) score += 15
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 15
  if (/[^A-Za-z0-9]/.test(password)) score += 15
  
  return Math.min(100, score)
})

// Get forum details by ID
const getForum = (id: string) => forums.find(f => f.id === id)

// Load saved credentials
const loadCredentials = async () => {
  try {
    const response = await axios.get('/forum-credentials/')
    credentials.value = response.data
  } catch (error) {
    toast.error('Failed to load credentials')
  }
}

// Handle form submission
const handleSubmit = async () => {
  if (!form.value.forum || !form.value.username || !form.value.password) {
    toast.error('Please fill in all fields')
    return
  }

  loading.value = true
  try {
    await axios.post('/forum-credentials/', form.value)
    toast.success('Credentials saved successfully')
    await loadCredentials()
    form.value = { forum: '', username: '', password: '' }
  } catch (error: any) {
    if (error.response?.data?.username) {
      toast.error(error.response.data.username[0])
    } else {
      toast.error('Failed to save credentials')
    }
  } finally {
    loading.value = false
  }
}

// Delete credentials
const deleteCredentials = async (id: string) => {
  if (!confirm('Are you sure you want to delete these credentials?')) return

  deleting.value = id
  try {
    await axios.delete(`/forum-credentials/${id}/`)
    toast.success('Credentials deleted successfully')
    await loadCredentials()
  } catch (error) {
    toast.error('Failed to delete credentials')
  } finally {
    deleting.value = null
  }
}

// Save all changes
const handleSaveChanges = async () => {
  try {
    // Here you would typically send the updated forums data to your backend
    toast.success('Changes saved successfully')
  } catch (error) {
    toast.error('Failed to save changes')
  }
}

// Load credentials on mount
onMounted(loadCredentials)
</script>
