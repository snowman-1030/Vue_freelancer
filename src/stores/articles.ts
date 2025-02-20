import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as articlesService from '../services/articles'

export interface Article {
  id: string
  title: string
  description: string
  content?: string
  date: string
  status: 'published' | 'draft'
}

export const useArticlesStore = defineStore('articles', () => {
  // State
  const articles = ref<Article[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const publishedArticles = computed(() => 
    articles.value.filter(article => article.status === 'published')
  )

  // Actions
  async function fetchPublicArticles() {
    isLoading.value = true
    error.value = null
    try {
      articles.value = await articlesService.getPublicArticles()
    } catch (e) {
      error.value = 'Failed to fetch articles'
      console.error('Error fetching public articles:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchArticles() {
    isLoading.value = true
    error.value = null
    try {
      articles.value = await articlesService.getArticles()
    } catch (e) {
      error.value = 'Failed to fetch articles'
      console.error('Error fetching articles:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchArticle(id: string) {
    isLoading.value = true
    error.value = null
    try {
      const article = await articlesService.getArticle(id)
      const index = articles.value.findIndex(a => a.id === id)
      if (index !== -1) {
        articles.value[index] = article
      } else {
        articles.value.push(article)
      }
      return article
    } catch (e) {
      error.value = 'Failed to fetch article'
      console.error('Error fetching article:', e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function addArticle(article: Omit<Article, 'id'>) {
    isLoading.value = true
    error.value = null
    try {
      const newArticle = await articlesService.createArticle(article)
      articles.value.push(newArticle)
      return newArticle
    } catch (e) {
      error.value = 'Failed to create article'
      console.error('Error creating article:', e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateArticle(id: string, article: Partial<Article>) {
    isLoading.value = true
    error.value = null
    try {
      const updatedArticle = await articlesService.updateArticle(id, article)
      const index = articles.value.findIndex(a => a.id === id)
      if (index !== -1) {
        articles.value[index] = updatedArticle
      }
    } catch (e) {
      error.value = 'Failed to update article'
      console.error('Error updating article:', e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteArticle(id: string) {
    isLoading.value = true
    error.value = null
    try {
      await articlesService.deleteArticle(id)
      articles.value = articles.value.filter(article => article.id !== id)
    } catch (e) {
      error.value = 'Failed to delete article'
      console.error('Error deleting article:', e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    articles,
    isLoading,
    error,
    
    // Getters
    publishedArticles,
    
    // Actions
    fetchPublicArticles,
    fetchArticles,
    fetchArticle,
    addArticle,
    updateArticle,
    deleteArticle
  }
})