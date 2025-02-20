<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, AlertCircle, Lock, Leaf, Building } from 'lucide-vue-next'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RouterLink } from 'vue-router'
import Navigation from '../components/home/Navigation.vue'
import Footer from '../components/home/Footer.vue'
import axios from '@/lib/axios'
import { useAuthStore } from '../stores/auth'
import loginImage from '@/assets/images/auth/login.png'

const router = useRouter()
const authStore = useAuthStore()

// Types
interface FormData {
  companyName: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

// State management
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')
const formData = reactive<FormData>({
  companyName: '',
  email: '',
  password: '',
  agreeToTerms: false
})

// Methods
const handleInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const { name, value, checked } = target
  
  // Type guard to ensure name is a valid key of FormData
  if (name === 'companyName' || name === 'email' || name === 'password') {
    formData[name] = value
  } else if (name === 'agreeToTerms') {
    formData.agreeToTerms = checked
  }
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  error.value = ''
  isLoading.value = true

  if (!formData.agreeToTerms) {
    error.value = 'Please agree to the Terms of Service and Privacy Policy'
    isLoading.value = false
    return
  }

  try {
    const response = await axios.post('/users/', {
      username: formData.companyName,
      email: formData.email,
      password: formData.password
    })

    if (response.status === 201) {
      // After registration, log in and redirect to billing page
      await authStore.login(formData.companyName, formData.password)
      router.push('/dashboard/billing')
    }
  } catch (err: any) {
    if (err.response?.data) {
      const data = err.response.data
      if (data.email) {
        error.value = data.email[0]
      } else if (data.username) {
        error.value = data.username[0]
      } else if (data.password) {
        error.value = data.password[0]
      } else {
        error.value = 'Registration failed. Please try again.'
      }
    } else {
      error.value = 'An error occurred. Please try again later.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
    <Navigation />
    
    <main class="flex-grow flex items-center justify-center px-4 py-12">
      <Transition
        appear
        enter-active-class="transition duration-500 ease-out"
        enter-from-class="opacity-0 translate-y-5"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div class="w-full max-w-4xl">
          <div class="bg-white shadow-xl rounded-lg overflow-hidden">
            <div class="flex flex-col md:flex-row">
              <div class="md:w-1/2 bg-green-50 p-8 flex items-center justify-center">
                <img
                  :src="loginImage"
                  alt="Registration illustration"
                  class="object-contain w-[300px] h-[300px]"
                />
              </div>
              <div class="md:w-1/2 p-8">
                <div class="text-center mb-8">
                  <h2 class="text-3xl font-bold text-gray-900">Create an Account</h2>
                  <p class="mt-2 text-gray-600">
                    Join Vueleaf to manage your cannabis brand's reputation
                  </p>
                </div>
                <form @submit="handleSubmit" class="space-y-6">
                  <div class="space-y-2">
                    <Label for="companyName" class="text-gray-700">Company Name</Label>
                    <div class="relative">
                      <Input
                        id="companyName"
                        name="companyName"
                        type="text"
                        required
                        autocomplete="organization"
                        v-model="formData.companyName"
                        @input="handleInputChange"
                        class="pl-10 bg-gray-50 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                      <Building class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <Label for="email" class="text-gray-700">Email address</Label>
                    <div class="relative">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autocomplete="email"
                        v-model="formData.email"
                        @input="handleInputChange"
                        class="pl-10 bg-gray-50 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                      <Leaf class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <Label for="password" class="text-gray-700">Password</Label>
                    <div class="relative">
                      <Input
                        id="password"
                        name="password"
                        :type="showPassword ? 'text' : 'password'"
                        required
                        autocomplete="new-password"
                        v-model="formData.password"
                        @input="handleInputChange"
                        class="pl-10 bg-gray-50 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                      <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <button
                        type="button"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center"
                        @click="showPassword = !showPassword"
                      >
                        <component :is="showPassword ? EyeOff : Eye" class="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      :model-value="formData.agreeToTerms"
                      @update:model-value="formData.agreeToTerms = $event"
                    />
                    <label
                      for="agreeToTerms"
                      class="text-sm text-gray-600"
                    >
                      I agree to the Terms of Service and Privacy Policy
                    </label>
                  </div>
                  <div v-if="error" class="text-red-500 text-sm flex items-center">
                    <AlertCircle class="h-4 w-4 mr-2" />
                    {{ error }}
                  </div>
                  <Button 
                    type="submit" 
                    :disabled="isLoading"
                    class="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <template v-if="isLoading">
                      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </template>
                    <template v-else>
                      Create Account
                    </template>
                  </Button>
                  <div class="mt-6 text-center">
                    <p class="text-sm text-gray-600">
                      Already have an account? 
                      <RouterLink to="/login" class="font-medium text-green-600 hover:text-green-500">
                        Sign in
                      </RouterLink>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </main>

    <Footer />
  </div>
</template>
