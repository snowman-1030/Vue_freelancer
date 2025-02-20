<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Pencil, Trash2, FileText } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useArticlesStore } from '../../stores/articles'
import ConfirmDialog from '../../components/admin/ConfirmDialog.vue'

const articlesStore = useArticlesStore()
const { articles, isLoading, error } = storeToRefs(articlesStore)

const showDeleteDialog = ref(false)
const selectedArticle = ref<null | { id: string; title: string }>(null)

onMounted(async () => {
  await articlesStore.fetchArticles()
})

const openDeleteDialog = (article: { id: string; title: string }) => {
  selectedArticle.value = article
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (selectedArticle.value) {
    try {
      await articlesStore.deleteArticle(selectedArticle.value.id)
      showDeleteDialog.value = false
      selectedArticle.value = null
    } catch (e) {
      // Error is handled by the store
    }
  }
}
</script>

<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-bold text-green-800 mb-2">
              Content Management
            </h1>
            <p class="text-gray-600 text-lg">
              Create and manage your articles. Keep your content fresh and engaging for your audience.
            </p>
          </div>
          <RouterLink
            to="/admin/articles/new"
            class="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus class="h-5 w-5 mr-2" />
            New Article
          </RouterLink>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-700">{{ error }}</p>
      </div>

      <!-- Content Section -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-semibold text-green-800 mb-4">Articles List</h2>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>

        <!-- Articles Table -->
        <div v-else-if="articles.length > 0" class="overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="article in articles" :key="article.id">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ article.title }}</div>
                  <div class="text-sm text-gray-500">{{ article.description }}</div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                  >
                    {{ article.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ article.date }}
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <RouterLink
                    :to="`/admin/articles/${article.id}/edit`"
                    class="text-green-600 hover:text-green-900 mr-4"
                  >
                    <Pencil class="h-5 w-5 inline" />
                  </RouterLink>
                  <button
                    @click="openDeleteDialog(article)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <Trash2 class="h-5 w-5 inline" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <FileText class="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p class="text-gray-600 text-lg mb-4">No articles yet</p>
          <p class="text-gray-500 mb-8">Start by creating your first article</p>
          <RouterLink
            to="/admin/articles/new"
            class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus class="h-5 w-5 mr-2" />
            Create Article
          </RouterLink>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Dialog -->
  <ConfirmDialog
    v-if="showDeleteDialog"
    :show="showDeleteDialog"
    title="Delete Article"
    :message="`Are you sure you want to delete '${selectedArticle?.title}'? This action cannot be undone.`"
    confirm-text="Delete"
    type="danger"
    @close="showDeleteDialog = false"
    @confirm="confirmDelete"
  />
</template>