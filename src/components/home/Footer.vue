<script setup lang="ts">
import { Shield, Globe, MessageCircle, Facebook } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="bg-white text-gray-800 border-t-4 border-green-600">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-center sm:text-start md:text-left">
        <!-- Logo & Social -->
        <div>
          <div class="flex items-center justify-center sm:justify-start mb-4">
            <Shield class="h-8 w-8 text-green-600" />
            <span class="ml-2 text-2xl font-bold text-green-800">Vueleaf</span>
          </div>
          <p class="text-md md:text-lg text-gray-600 mb-4 text-center">
            Protecting and growing cannabis brands through intelligent review management.
          </p>
          <div class=" text-md md:text-lg flex justify-center sm:justify-start space-x-4">
            <a href="#" class="text-green-600 hover:text-green-700">
              <Facebook class="h-6 w-6" />
            </a>
            <a href="#" class="text-green-600 hover:text-green-700">
              <Globe class="h-6 w-6" />
            </a>
            <a href="#" class="text-green-600 hover:text-green-700">
              <MessageCircle class="h-6 w-6" />
            </a>
          </div>
        </div>

        <!-- Product -->
        <div>
          <h3 class="font-semibold mb-4 text-green-800">Product</h3>
          <ul class="space-y-2">
            <li><RouterLink to="/features" class="text-gray-600 hover:text-green-600">Features</RouterLink></li>
            <li><RouterLink to="/pricing" class="text-gray-600 hover:text-green-600">Pricing</RouterLink></li>
            <li><a href="#" class="text-gray-600 hover:text-green-600">Case Studies</a></li>
            <li><a href="#" class="text-gray-600 hover:text-green-600">Reviews</a></li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h3 class="font-semibold mb-4 text-green-800">Company</h3>
          <ul class="space-y-2">
            <li><RouterLink to="/about" class="text-gray-600 hover:text-green-600">About</RouterLink></li>
            <li><RouterLink to="/resources" class="text-gray-600 hover:text-green-600">Resources</RouterLink></li>
            <li><a href="#" class="text-gray-600 hover:text-green-600">Careers</a></li>
            <li><a href="#" class="text-gray-600 hover:text-green-600">Contact</a></li>
          </ul>
        </div>

        <!-- Resources -->
        <div>
          <h3 class="font-semibold mb-4 text-green-800">Resources</h3>
          <ul class="space-y-2">
            <li><RouterLink to="/dashboard/feedback" class="text-gray-600 hover:text-green-600">Help Center</RouterLink></li>
            <li><a href="#" class="text-gray-600 hover:text-green-600">API Documentation</a></li>
            <li><RouterLink to="/privacy" class="text-gray-600 hover:text-green-600">Privacy Policy</RouterLink></li>
            <li><RouterLink to="/terms" class="text-gray-600 hover:text-green-600">Terms of Service</RouterLink></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-200 pt-6 text-center">
        <p class="text-gray-600">© 2024 Vueleaf. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>
