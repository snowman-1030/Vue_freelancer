<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Sidebar from '../layouts/Sidebar.vue'
import { Menu as MenuIcon } from 'lucide-vue-next'

// State for sidebar visibility
const isSidebarOpen = ref(false)

// Toggle sidebar function
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Close sidebar function
const closeSidebar = () => {
  isSidebarOpen.value = false
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-gray-100">
    <!-- Sidebar (Hidden on mobile unless open) -->
    <div :class="[
      'fixed inset-y-0 left-0  bg-white shadow-lg transform transition-transform duration-300 md:relative md:translate-x-0',
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    ]" style="z-index: 9999;">
      <Sidebar :isSidebarOpen="isSidebarOpen" @close-sidebar="closeSidebar" />
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <!-- Header -->
      <header class="bg-white text-gray-800 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <!-- <span class="text-xl font-bold md:hidden">VueLeaf</span> -->
              <div class="flex-1 flex items-center  py-1.5 md:hidden">
                <img src="@/assets/images/VUELEAF_logo.png" alt="VueLeaf Logo" class="h-9 object-contain" />
              </div>
            </div>
            <div class="flex items-center md:hidden">
              <button @click="toggleSidebar">
                <component :is="MenuIcon" class="w-6 h-6 text-gray-800" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
