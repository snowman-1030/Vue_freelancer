import axiosOriginal from 'axios'
import axiosAuth from '@/lib/axios'
import type { Article } from '../stores/articles'

// Public API instance without auth
const publicApi = axiosOriginal.create({
  baseURL: 'https://vueleaf.com/api',
  withCredentials: false
})

// Public endpoints
export async function getPublicArticles() {
  const response = await publicApi.get<Article[]>('/articles/')
  return response.data
}

export async function getPublicArticle(id: string) {
  const response = await publicApi.get<Article>(`/articles/${id}/`)
  return response.data
}

// Authenticated endpoints
export async function getArticles() {
  const response = await axiosAuth.get<Article[]>('/articles/')
  return response.data
}

export async function getArticle(id: string) {
  const response = await axiosAuth.get<Article>(`/articles/${id}/`)
  return response.data
}

export async function createArticle(article: Omit<Article, 'id'>) {
  const response = await axiosAuth.post<Article>('/articles/', article)
  return response.data
}

export async function updateArticle(id: string, article: Partial<Article>) {
  const response = await axiosAuth.patch<Article>(`/articles/${id}/`, article)
  return response.data
}

export async function deleteArticle(id: string) {
  await axiosAuth.delete(`/articles/${id}/`)
}

export async function uploadImage(articleId: string, formData: FormData) {
  const response = await axiosAuth.post<{ image_url: string }>(
    `/articles/${articleId}/upload-image/`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  return response.data
}

export async function generateDescription(content: string) {
  const response = await axiosAuth.post<{ description: string }>(
    '/articles/generate-description/',
    { content }
  )
  return response.data
}