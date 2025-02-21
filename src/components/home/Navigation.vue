<script setup lang="ts">
// 1. Vue imports
import { RouterLink } from 'vue-router'

// 2. Component imports
import { Menu, LogOut, X } from 'lucide-vue-next'

// 3. Asset imports
import vueleafLogo from '../../assets/images/VUELEAF_logo_white.png'
// import vueleafLogo from '../../assets/images/VUELEAF_logo.png'

// 4. Store imports
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

// 5. Methods
const handleLogout = () => {
  authStore.logout()
}

// 6. Drawer visibility state for small screens
import { ref } from 'vue'
const isDrawerOpen = ref(false)

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}
</script>

<template>
  <nav class="bg-green-800 text-white sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <RouterLink to="/" class="flex items-center">
            <img :src="vueleafLogo" alt="VueLeaf Logo" class="h-10 w-auto object-contain" loading="eager" />
          </RouterLink>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-4">
          <RouterLink to="/features" class="text-green-100 hover:text-white transition-colors duration-200 font-medium">
            Features
          </RouterLink>
          <RouterLink to="/pricing" class="text-green-100 hover:text-white transition-colors duration-200 font-medium">
            Pricing
          </RouterLink>
          <a href="#testimonials" class="text-green-100 hover:text-white transition-colors duration-200 font-medium">
            Testimonials
          </a>
          <RouterLink to="/resources"
            class="text-green-100 hover:text-white transition-colors duration-200 font-medium">
            Resources
          </RouterLink>

          <!-- Auth Buttons -->
          <template v-if="!authStore.isAuthenticated()">
            <div class="flex items-center space-x-4">
              <RouterLink to="/login"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium">
                Login
              </RouterLink>
              <RouterLink to="/register"
                class="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-md transition-colors duration-200 font-medium">
                Sign Up
              </RouterLink>
            </div>
          </template>

          <template v-else>
            <div class="flex items-center space-x-4">
              <RouterLink v-if="authStore.isAdmin()" to="/admin"
                class="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors duration-200">
                Admin Panel
              </RouterLink>

              <RouterLink v-else to="/dashboard"
                class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200">
                Dashboard
              </RouterLink>

              <button @click="handleLogout"
                class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 inline-flex items-center">
                <LogOut class="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden flex items-center">
          <button @click="toggleDrawer">
            <Menu class="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    </div>

    <!-- Drawer for Mobile -->
    <div v-if="isDrawerOpen" class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" @click="toggleDrawer">
      <div class="absolute top-0 right-0 bg-green-800 text-white w-64 h-full p-6" @click.stop>
        <!-- Close Button -->
        <div class="flex justify-start">
          <button @click="toggleDrawer">
            <X class="h-6 w-6 text-white" />
          </button>
        </div>

        <div class="flex flex-col text-center space-y-6">
          <RouterLink to="/features" class="text-green-100 hover:text-white transition-colors duration-200">
            Features
          </RouterLink>
          <RouterLink to="/pricing" class="text-green-100 hover:text-white transition-colors duration-200">
            Pricing
          </RouterLink>
          <a href="#testimonials" class="text-green-100 hover:text-white transition-colors duration-200">
            Testimonials
          </a>
          <RouterLink to="/resources" class="text-green-100 hover:text-white transition-colors duration-200">
            Resources
          </RouterLink>

          <!-- Auth Buttons -->
          <template v-if="!authStore.isAuthenticated()">
            <RouterLink to="/login"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200">
              Login
            </RouterLink>
            <RouterLink to="/register"
              class="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-md transition-colors duration-200">
              Sign Up
            </RouterLink>
          </template>

          <template v-else>
            <RouterLink v-if="authStore.isAdmin()" to="/admin"
              class="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors duration-200">
              Admin Panel
            </RouterLink>

            <RouterLink v-else to="/dashboard"
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200">
              Dashboard
            </RouterLink>

            <button @click="handleLogout"
              class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 inline-flex items-center">
              <LogOut class="h-4 w-4 mr-2" />
              Logout
            </button>
          </template>
        </div>
      </div>
    </div>

  </nav>
</template>
