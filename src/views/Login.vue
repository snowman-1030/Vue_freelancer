<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Eye, EyeOff, AlertCircle, Lock, Leaf } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { RouterLink ,useRouter} from 'vue-router'
import Navigation from '../components/home/Navigation.vue'
import Footer from '../components/home/Footer.vue'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import loginImage from '@/assets/images/auth/login.png'

const authStore = useAuthStore()
const router = useRouter()
// Types
interface FormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

// State management
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')
const formData = reactive<FormData>({
  username: '',
  password: '',
  rememberMe: false
})

// Methods
const handleInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const { name, value, checked } = target
  
  if (name === 'username' || name === 'password') {
    formData[name] = value
  } else if (name === 'rememberMe') {
    formData.rememberMe = checked
  }
}

const handleSubmit = async (e: Event) => {
  // router.push('/features')
  e.preventDefault()
  error.value = ''
  isLoading.value = true

  try {
    await authStore.login(formData.username, formData.password)
   
  } catch (err) {
    error.value = typeof err === 'string' ? err : 'Invalid username or password. Please try again.'
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
              <!-- Illustration Section -->
              <div class="md:w-1/2 bg-green-50 p-8 flex items-center justify-center">
                <img
                  :src="loginImage"
                  alt="Login illustration"
                  class="object-contain w-[300px] h-[300px]"
                />
              </div>

              <!-- Form Section -->
              <div class="md:w-1/2 p-8">
                <div class="text-center mb-8">
                  <h2 class="text-3xl font-bold text-gray-900">Sign in to Vueleaf</h2>
                  <p class="mt-2 text-gray-600">
                    Manage your cannabis brand's online reputation
                  </p>
                </div>

                <form @submit="handleSubmit" class="space-y-6">
                  <!-- Username/Email Field -->
                  <div class="space-y-2">
                    <Label for="username" class="text-gray-700">Username or Email</Label>
                    <div class="relative">
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        required
                        autocomplete="username"
                        v-model="formData.username"
                        @input="handleInputChange"
                        class="pl-10 bg-gray-50 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                      <Leaf class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <!-- Password Field -->
                  <div class="space-y-2">
                    <Label for="password" class="text-gray-700">Password</Label>
                    <div class="relative">
                      <Input
                        id="password"
                        name="password"
                        :type="showPassword ? 'text' : 'password'"
                        required
                        autocomplete="current-password"
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

                  <!-- Remember Me & Forgot Password -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        name="rememberMe"
                        :checked="formData.rememberMe"
                        @update:checked="(checked: boolean) => formData.rememberMe = checked"
                      />
                      <label
                        for="rememberMe"
                        class="text-sm text-gray-600"
                      >
                        Remember me
                      </label>
                    </div>
                    <RouterLink
                      to="/forgot-password"
                      class="text-sm text-green-600 hover:text-green-500"
                    >
                      Forgot password?
                    </RouterLink>
                  </div>

                  <!-- Error Message -->
                  <div v-if="error" class="text-red-500 text-sm flex items-center">
                    <AlertCircle class="h-4 w-4 mr-2" />
                    {{ error }}
                  </div>

                  <!-- Submit Button -->
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
                      Signing in...
                    </template>
                    <template v-else>
                      Sign in
                    </template>
                  </Button>

                  <!-- Sign Up Link -->
                  <div class="mt-6 text-center">
                    <p class="text-sm text-gray-600">
                      Don't have an account? 
                      <RouterLink to="/register" class="font-medium text-green-600 hover:text-green-500">
                        Sign up for free
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
