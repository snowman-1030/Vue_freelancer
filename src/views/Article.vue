<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import Navigation from '../components/home/Navigation.vue'
import Footer from '../components/home/Footer.vue'

import * as articlesService from '../services/articles'
import type { Article } from '../stores/articles'

const route = useRoute()
const articleId = route.params.id as string
const article = ref<Article | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    isLoading.value = true
    error.value = null
    article.value = await articlesService.getPublicArticle(articleId)
  } catch (e) {
    error.value = 'Failed to load article'
    console.error('Error loading article:', e)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navigation />
    
    <main class="flex-grow bg-gradient-to-br from-gray-50 to-green-50">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <RouterLink 
          to="/resources" 
          class="text-green-600 hover:text-green-700 font-medium flex items-center mb-8"
        >
          <ArrowLeft class="mr-2 h-4 w-4" /> Back to Resources
        </RouterLink>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12 bg-white shadow-lg rounded-lg">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>

        <!-- Article Content -->
        <article v-else-if="article" class="bg-white shadow-lg rounded-lg p-8">
          <h1 class="text-4xl font-bold text-green-800 mb-4">{{ article.title }}</h1>
          <p class="text-gray-600 mb-8">{{ article.date }}</p>
          <div class="prose prose-green max-w-none" v-html="article.content" />
        </article>

        <div v-else class="bg-white shadow-lg rounded-lg p-8 text-center">
          <h2 class="text-2xl font-bold text-red-600 mb-4">Article Not Found</h2>
          <p class="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <RouterLink
            to="/resources"
            class="inline-block bg-green-600 text-white hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Return to Resources
          </RouterLink>
        </div>

        <div class="mt-12 bg-white shadow-lg rounded-lg p-8 text-center border-t-4 border-green-600">
          <h2 class="text-3xl font-bold text-green-800 mb-4">Ready to Take Control of Your Online Reputation?</h2>
          <p class="text-xl text-gray-600 mb-6">Join VueLeaf today and start managing your cannabis brand's online presence effectively.</p>
          <RouterLink
            to="/register"
            class="inline-block bg-yellow-400 text-yellow-900 hover:bg-yellow-500 px-8 py-3 rounded-lg text-lg font-semibold shadow-md transition-colors"
          >
            Sign Up for VueLeaf
          </RouterLink>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style>
/* TipTap Content Styling */
.prose {
  line-height: 1.6;
}
.prose p {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}

.prose h1 {
  margin-top: 2em;
  margin-bottom: 1em;
}

.prose h2 {
  margin-top: 1.75em;
  margin-bottom: 0.75em;
}

.prose ul,
.prose ol {
  margin-top: 0.25em;
  margin-bottom: 0.25em;
  padding-left: 1.625em;
}

.prose li {
  margin-top: 0.1em;
  margin-bottom: 0.1em;
}

/* Remove margin from paragraphs inside list items */
.prose li p {
  margin: 0;
}

.prose ul > li {
  list-style-type: disc;
}

.prose ol > li {
  list-style-type: decimal;
}

.prose blockquote {
  margin: 1.25em 0;
  padding-left: 1em;
  border-left: 4px solid #10B981;
  color: #4B5563;
  font-style: italic;
}

.prose img {
  margin: 2em auto;
  border-radius: 0.375rem;
}

.prose a {
  color: #059669;
  text-decoration: underline;
}

.prose a:hover {
  color: #047857;
}

.prose pre {
  background-color: #1F2937;
  color: #F3F4F6;
  padding: 1em;
  border-radius: 0.375rem;
  overflow-x: auto;
}

.prose code {
  background-color: #F3F4F6;
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
}

/* Text alignment classes */
.prose .text-left {
  text-align: left;
}

.prose .text-center {
  text-align: center;
}

.prose .text-right {
  text-align: right;
}

.prose .text-justify {
  text-align: justify;
}
</style>