<script setup lang="ts">
import { onMounted } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useArticlesStore } from '../stores/articles'
import Navigation from '../components/home/Navigation.vue'
import Footer from '../components/home/Footer.vue'

const articlesStore = useArticlesStore()
const { publishedArticles, isLoading, error } = storeToRefs(articlesStore)

onMounted(async () => {
  await articlesStore.fetchPublicArticles()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navigation />
    
    <main class="flex-grow bg-gradient-to-br from-gray-50 to-green-50">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 class="text-4xl font-bold text-green-800 mb-8 text-center">Cannabis Industry Resources</h1>
        
        <!-- Error Alert -->
        <div v-if="error" class="mb-8 p-4 bg-red-50 border border-red-200 rounded-md">
          <p class="text-red-700">{{ error }}</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
        
        <!-- Articles List -->
        <div v-else-if="publishedArticles.length > 0" class="space-y-8 mb-12">
          <div 
            v-for="article in publishedArticles" 
            :key="article.id" 
            class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <RouterLink :to="`/resources/${article.id}`" class="block p-6">
              <div class="cursor-pointer">
                <h2 class="text-2xl font-semibold text-green-700 mb-2 hover:text-green-800">{{ article.title }}</h2>
                <p class="text-gray-600 mb-4 hover:text-gray-700">{{ article.description }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500">{{ article.date }}</span>
                  <span class="text-green-600 hover:text-green-700 font-medium flex items-center">
                    Read More <ArrowRight class="ml-2 h-4 w-4" />
                  </span>
                </div>
              </div>
            </RouterLink>
          </div>
        </div>

        <!-- No Articles State -->
        <div v-else class="text-center py-12">
          <p class="text-gray-600 text-lg mb-4">No resources published yet.</p>
          <p class="text-gray-500">Check back soon for new content!</p>
        </div>

        <!-- CTA Section -->
        <div class="bg-white shadow-lg rounded-lg p-8 text-center border-t-4 border-green-600">
          <h2 class="text-3xl font-bold text-green-800 mb-4">Protect Your Cannabis Brand</h2>
          <p class="text-xl text-gray-600 mb-6">Join VueLeaf today and take control of your online reputation.</p>
          <RouterLink 
            to="/register"
            class="inline-block bg-yellow-400 text-yellow-900 hover:bg-yellow-500 px-8 py-3 rounded-lg text-lg font-semibold shadow-md transition-colors"
          >
            Sign Up Now
          </RouterLink>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
