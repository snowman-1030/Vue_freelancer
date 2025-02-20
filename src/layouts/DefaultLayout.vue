<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <router-link to="/" class="text-xl font-semibold text-gray-900">
            VueLeaf
          </router-link>
          <div class="flex items-center space-x-4">
            <router-link 
              to="/" 
              class="text-gray-600 hover:text-gray-900 transition-colors duration-150"
              active-class="text-blue-600"
            >
              Home
            </router-link>
          </div>
        </div>
      </nav>
    </header>
    
    <router-view />
  </div>
</template>
