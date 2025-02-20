<script setup lang="ts">
import { Shield, Globe, MessageCircle, Star, ArrowRight, Bell, Menu, Facebook, Zap } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import launchImage from '@/assets/images/illustrations/launch.png'
import searchImage from '@/assets/images/illustrations/search.png'

const authStore = useAuthStore()

const handleContactSupport = () => {
  window.location.href = 'mailto:support@vueleaf.com'
}
</script>

<template>
  <div class="min-h-screen bg-white font-sans">
    <!-- Navigation -->
    <nav class="bg-green-800 text-white sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <Shield class="h-8 w-8 text-green-400" />
            <span class="ml-2 text-xl font-bold text-white">Vueleaf</span>
          </div>
          <div class="hidden md:flex items-center space-x-4">
            <a href="#features" class="text-green-100 hover:text-white transition-colors">Features</a>
            <a href="#pricing" class="text-green-100 hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" class="text-green-100 hover:text-white transition-colors">Testimonials</a>
            <a href="#blog" class="text-green-100 hover:text-white transition-colors">Blog</a>
            <router-link to="/login" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
              Login
            </router-link>
            <router-link to="/register" class="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-md transition-colors">
              Sign Up
            </router-link>
          </div>
          <div class="md:hidden flex items-center">
            <Menu class="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </nav>

    <!-- Alert Strip -->
    <div class="bg-yellow-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex items-center justify-center text-sm text-yellow-800 gap-2">
          <Bell class="h-5 w-5 text-yellow-500 animate-pulse" />
          <span class="text-base font-medium">
            New reviews for cannabis brands in your area: <strong class="text-yellow-700 font-bold text-lg">20+</strong>
          </span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-grow">
      <!-- Enhanced Hero Section -->
      <section class="bg-gradient-to-b from-green-50 via-green-100 to-white py-12 overflow-hidden relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div class="text-left">
              <h1 class="text-4xl md:text-5xl font-bold text-green-900 mb-6 leading-tight">
                Welcome to VueLeaf, <span class="text-green-600">{{ authStore.username }}!</span>
              </h1>
              <p class="text-xl text-gray-700 mb-4">
                You've taken the first step towards protecting and enhancing your cannabis brand's online reputation. Let's build a stronger, more trusted brand together.
              </p>
            </div>
            <div class="relative">
              <div class="absolute inset-0 bg-gradient-to-br from-green-200 to-green-300 rounded-full filter blur-3xl opacity-70"></div>
              <img
                :src="launchImage"
                alt="Getting Started Rocket"
                class="relative z-10 h-auto max-w-full mx-auto drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- New Text Section -->
      <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <h2 class="text-3xl font-bold text-green-800 mb-6">Elevate Your Cannabis Brand's Online Presence</h2>
            <p class="text-xl text-gray-700 max-w-3xl mx-auto mb-0">
              In today's digital landscape, your online reputation is crucial. VueLeaf provides you with the tools and insights needed to monitor, manage, and improve your cannabis brand's online presence across all major platforms.
            </p>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="bg-gradient-to-b from-white via-green-50 to-green-100 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid md:grid-cols-2 gap-8">
            <!-- Keyword Tracking Card -->
            <div class="bg-white rounded-lg shadow-lg p-8 border border-green-200">
              <div class="flex items-start space-x-6">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full">
                    <Star class="h-6 w-6" />
                  </div>
                </div>
                <div class="flex-grow">
                  <h2 class="text-2xl font-bold text-green-800 mb-4">Start Tracking Your Brand</h2>
                  <p class="text-gray-600 mb-6">
                    Set up keywords to monitor brand mentions across major cannabis platforms. Receive instant alerts for new brand discussions.
                  </p>
                  <button class="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors inline-flex items-center gap-2 text-lg font-medium shadow-md">
                    Set Up Keywords
                    <ArrowRight class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Mentions Dashboard Card -->
            <div class="bg-white rounded-lg shadow-lg p-8 border border-green-200">
              <div class="flex items-start space-x-6">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full">
                    <MessageCircle class="h-6 w-6" />
                  </div>
                </div>
                <div class="flex-grow">
                  <h2 class="text-2xl font-bold text-green-800 mb-4">View Brand Mentions</h2>
                  <p class="text-gray-600 mb-6">
                    Monitor and analyze what people are saying about your brand across review sites, forums, and social media platforms.
                  </p>
                  <button class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2 text-lg font-medium shadow-md">
                    View Mentions
                    <ArrowRight class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Discover Our Powerful Tools Section -->
      <section class="bg-gradient-to-b from-green-100 via-green-50 to-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-green-800 mb-4">Discover Our Powerful Tools</h2>
            <p class="text-xl text-gray-700 max-w-3xl mx-auto">
              Now that you've taken the first step, let's explore the powerful tools VueLeaf offers to help you manage and enhance your cannabis brand's online reputation.
            </p>
          </div>
          <div class="grid md:grid-cols-2 gap-8 items-center">
            <div class="space-y-6">
              <div class="flex items-start space-x-4">
                <Zap class="h-8 w-8 text-yellow-500 flex-shrink-0" />
                <div>
                  <h3 class="text-xl font-semibold text-green-800 mb-2">Real-time Monitoring</h3>
                  <p class="text-gray-700">Monitor brand mentions across multiple platforms in real-time.</p>
                </div>
              </div>
              <div class="flex items-start space-x-4">
                <Star class="h-8 w-8 text-green-500 flex-shrink-0" />
                <div>
                  <h3 class="text-xl font-semibold text-green-800 mb-2">Sentiment Analysis</h3>
                  <p class="text-gray-700">Gauge public perception of your brand with advanced sentiment analysis.</p>
                </div>
              </div>
              <div class="flex items-start space-x-4">
                <MessageCircle class="h-8 w-8 text-blue-500 flex-shrink-0" />
                <div>
                  <h3 class="text-xl font-semibold text-green-800 mb-2">Automated Responses</h3>
                  <p class="text-gray-700">Get quick and effective engagement with automated response suggestions.</p>
                </div>
              </div>
            </div>
            <div class="relative">
              <img
                :src="searchImage"
                alt="Illustration of a person using VueLeaf's powerful tools"
                class="w-full h-auto max-w-md mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Need Help Section -->
      <section class="bg-gradient-to-b from-white to-green-50 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-green-800 mb-4">Need Help Getting Started?</h2>
            <p class="text-xl text-gray-700 mb-6">Our team is here to help you make the most of VueLeaf.</p>
            <button 
              class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium shadow-md"
              @click="handleContactSupport"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-white text-gray-800 border-t-4 border-green-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div class="col-span-2 md:col-span-1">
            <div class="flex items-center mb-4">
              <Shield class="h-8 w-8 text-green-600" />
              <span class="ml-2 text-2xl font-bold text-green-800">Vueleaf</span>
            </div>
            <p class="text-gray-600 mb-4">
              Protecting and growing cannabis brands through intelligent review management.
            </p>
            <div class="flex space-x-4">
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
          <div>
            <h3 class="text-lg font-semibold mb-4 text-green-800">Product</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-600 hover:text-green-600">Features</a></li>
              <li><a href="#" class="text-gray-600 hover:text-green-600">Pricing</a></li>
              <li><a href="#" class="text-gray-600 hover:text-green-600">Case Studies</a></li>
              <li><a href="#" class="text-gray-600 hover:text-green-600">Reviews</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4 text-green-800">Company</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-600 hover:text-green-600">About</a></li>
              <li><a href="#" class="text-gray-600 hover:text-green-600">Blog</a></li>
              <li><a href="#" class="text-gray-600 hover:text-green-600">Careers</a></li>
              <li><a href="#" class="text-gray-600 hover:text-green-600">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4 text-green-800">Resources</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-600 hover:text-green-600">Help Center</a></li>
              <li><a href="#" class="text-gray-600 hover:text-green-600">API Documentation</a></li>
              <li><a href="#" class="text-gray-600 hover:text-green-600">Privacy Policy</a></li>
              <li><a href="#" class="text-gray-600 hover:text-green-600">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-200 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p class="text-gray-600 mb-4 md:mb-0">© 2024 Vueleaf. All rights reserved.</p>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-600 hover:text-green-600">Privacy Policy</a>
            <a href="#" class="text-gray-600 hover:text-green-600">Terms of Service</a>
            <a href="#" class="text-gray-600 hover:text-green-600">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
