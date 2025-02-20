<script setup lang="ts">
import { ref, onMounted, computed, watch, Teleport } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Underline from '@tiptap/extension-underline'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import ResizableImage from 'tiptap-extension-resize-image'
import Youtube from '@tiptap/extension-youtube'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { Save, ArrowLeft, Bold, Italic, Strikethrough, Underline as UnderlineIcon,
         AlignLeft, AlignCenter, AlignRight, AlignJustify, Table as TableIcon,
         Image as ImageIcon, Link as LinkIcon, List, ListOrdered, Heading1,
         Heading2, Undo, Redo, Palette, Highlighter } from 'lucide-vue-next'
import { useArticlesStore } from '../../stores/articles'
import type { Article } from '../../stores/articles'
import * as articlesService from '../../services/articles'

const route = useRoute()
const router = useRouter()
const articlesStore = useArticlesStore()
const isEditing = route.params.id !== undefined

const article = ref<Omit<Article, 'id'>>({
  title: '',
  description: '',
  content: '',
  status: 'draft' as 'draft' | 'published',
  date: new Date().toISOString().split('T')[0]
})

// Image upload state
const isUploading = ref(false)
const isGeneratingDescription = ref(false)
const showImageModal = ref(false)
const imageUrl = ref('')
const selectedFile = ref<File | null>(null)
const uploadType = ref<'url' | 'file'>('url')

const generateDescription = async () => {
  if (!editor.value?.getHTML()) {
    return
  }

  try {
    isGeneratingDescription.value = true
    const content = editor.value.getHTML()
    const response = await articlesService.generateDescription(content)
    if (response.description) {
      article.value.description = response.description
    }
  } catch (error: any) {
    console.error('Error generating description:', error)
    const errorMessage = error?.response?.data?.error || 'Failed to generate description. Please try again.'
    alert(errorMessage)
  } finally {
    isGeneratingDescription.value = false
  }
}

const resetImageForm = () => {
  imageUrl.value = ''
  selectedFile.value = null
  uploadType.value = 'url'
  isUploading.value = false
}

// Watch modal state to reset form when closed
watch(showImageModal, (newValue) => {
  if (!newValue) {
    resetImageForm()
  }
})

const editor = useEditor({
  content: '',
  parseOptions: {
    preserveWhitespace: true
  },
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2]
      },
      bulletList: false,
      orderedList: false,
      listItem: false
    }),
    BulletList.configure({
      keepMarks: true,
      HTMLAttributes: {
        class: 'bullet-list'
      }
    }),
    OrderedList.configure({
      keepMarks: true,
      HTMLAttributes: {
        class: 'ordered-list'
      }
    }),
    ListItem,
    Underline,
    Superscript,
    Subscript,
    Highlight,
    TextAlign.configure({
      types: ['heading', 'paragraph', 'bulletList', 'orderedList'],
    }),
    ResizableImage,
    Youtube.configure({
      inline: true,
    }),
    Link.configure({
      openOnClick: false,
    }),
    Placeholder.configure({
      placeholder: 'Write your article content here...',
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
    TextStyle,
    Color,
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none'
    }
  }
})

const isActive = computed(() => ({
  bold: editor.value?.isActive('bold'),
  italic: editor.value?.isActive('italic'),
  strike: editor.value?.isActive('strike'),
  underline: editor.value?.isActive('underline'),
  h1: editor.value?.isActive('heading', { level: 1 }),
  h2: editor.value?.isActive('heading', { level: 2 }),
  bulletList: editor.value?.isActive('bulletList'),
  orderedList: editor.value?.isActive('orderedList'),
  alignLeft: editor.value?.isActive({ textAlign: 'left' }),
  alignCenter: editor.value?.isActive({ textAlign: 'center' }),
  alignRight: editor.value?.isActive({ textAlign: 'right' }),
  alignJustify: editor.value?.isActive({ textAlign: 'justify' }),
  textColor: editor.value?.getAttributes('textStyle').color,
  highlight: editor.value?.getAttributes('highlight').color,
}))

onMounted(async () => {
  if (isEditing) {
    try {
      const fetchedArticle = await articlesStore.fetchArticle(route.params.id as string)
      article.value = {
        title: fetchedArticle.title,
        description: fetchedArticle.description,
        content: fetchedArticle.content || '',
        status: fetchedArticle.status,
        date: fetchedArticle.date
      }
      if (article.value.content) {
        // Parse content and ensure images are properly handled
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = article.value.content
        
        // Process any images to ensure they have proper attributes
        tempDiv.querySelectorAll('img').forEach(img => {
          if (!img.style.width && !img.style.height) {
            img.style.width = 'auto'
            img.style.height = 'auto'
          }
        })
        
        editor.value?.commands.setContent(tempDiv.innerHTML)
      }
    } catch (e) {
      console.error('Error loading article:', e)
      router.push('/admin/articles')
    }
  }
})

const saveArticle = async () => {
  const now = new Date()
  const formattedDate = now.toISOString().split('T')[0]

  try {
    const articleData = {
      ...article.value,
      content: editor.value?.getHTML() || '',
      date: formattedDate
    }

    if (isEditing) {
      await articlesStore.updateArticle(route.params.id as string, articleData)
    } else {
      // For new articles, check if it already exists in the store
      const existingArticle = articlesStore.articles.find(
        a => a.title === articleData.title && a.description === articleData.description
      )
      if (!existingArticle) {
        await articlesStore.addArticle(articleData)
      }
    }
    
    // Refresh the articles list to ensure correct state
    await articlesStore.fetchArticles()
    router.push('/admin/articles')
  } catch (e) {
    console.error('Error saving article:', e)
  }
}

const addImage = () => {
  showImageModal.value = true
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    const file = input.files[0]
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed')
      return
    }

    selectedFile.value = file
  }
}
const insertImage = async () => {
  if (isUploading.value) return

  try {
    isUploading.value = true
    const paramId = route.params.id
    const currentArticleId = typeof paramId === 'string' ? paramId : null
    let imageSource = ''
    let finalArticleId = currentArticleId

    // Handle URL upload
    if (uploadType.value === 'url') {
      if (!imageUrl.value) {
        alert('Please enter an image URL')
        return
      }
      imageSource = imageUrl.value
    } else {
      // Handle file upload
      if (!selectedFile.value) {
        alert('Please select an image file')
        return
      }

      if (!article.value.title || !article.value.description) {
        alert('Please fill in the title and description before uploading an image')
        return
      }

      // Save article first if it's new
      if (!currentArticleId) {
        const now = new Date()
        const formattedDate = now.toISOString().split('T')[0]
        const articleData = {
          ...article.value,
          content: editor.value?.getHTML() || '',
          date: formattedDate
        }
        const response = await articlesStore.addArticle(articleData)
        finalArticleId = response.id
      }

      // Upload image
      const formData = new FormData()
      const file = selectedFile.value
      formData.append('image', file)
      formData.append('caption', file.name)

      const { image_url } = await articlesService.uploadImage(finalArticleId as string, formData)
      imageSource = image_url
    }

    // Insert image with default styling
    editor.value?.chain().focus().insertContent({
      type: 'image',
      attrs: {
        src: imageSource,
        style: 'width: auto; height: auto;'
      }
    }).run()
    
    // Update article content if we have an ID
    if (finalArticleId) {
      const updatedContent = editor.value?.getHTML() || ''
      await articlesStore.updateArticle(finalArticleId, {
        ...article.value,
        content: updatedContent
      })
    }

    showImageModal.value = false
  } catch (error: any) {
    console.error('Error handling image:', error)
    const errorMessage = error?.message || error?.response?.data?.error || 'Failed to handle image. Please try again.'
    alert(errorMessage)
  }
}

const addLink = () => {
  const url = prompt('Enter URL:')
  if (url) {
    editor.value?.chain().focus().setLink({ href: url }).run()
  }
}

const addTable = () => {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
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
              {{ isEditing ? 'Edit Article' : 'Create New Article' }}
            </h1>
            <p class="text-gray-600 text-lg">
              {{ isEditing ? 'Update your article content and settings.' : 'Create engaging content for your audience.' }}
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <select
              v-model="article.status"
              class="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <button
              @click="saveArticle"
              class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Save class="h-5 w-5 mr-2" />
              {{ isEditing ? 'Update' : 'Publish' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Title Section -->
        <div class="p-6 border-b border-gray-200">
          <input
            type="text"
            v-model="article.title"
            placeholder="Article Title"
            class="text-3xl font-bold w-full border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
          />
        </div>

        <!-- Description Section -->
        <div class="p-6 border-b border-gray-200 bg-gray-50">
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium text-gray-700">
              Description
              <span class="text-gray-500 font-normal">(appears in article previews)</span>
            </label>
            <button
              @click="generateDescription"
              :disabled="isGeneratingDescription || !editor?.getHTML()"
              class="inline-flex items-center px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isGeneratingDescription" class="animate-spin mr-2">⟳</span>
              Auto-Generate
            </button>
          </div>
          <textarea
            v-model="article.description"
            rows="2"
            placeholder="Brief description of the article..."
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 placeholder-gray-400"
          ></textarea>
        </div>

        <!-- Editor Section -->
        <div class="p-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <div class="border rounded-lg overflow-hidden">
            <!-- Toolbar -->
            <div class="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-1">
              <!-- Text Style -->
              <div class="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-2">
              <button
                @click="editor?.chain().focus().toggleBold().run()"
                :class="{ 'bg-gray-200': isActive.bold }"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Bold"
              >
                <Bold class="w-4 h-4" />
              </button>
              <button
                @click="editor?.chain().focus().toggleItalic().run()"
                :class="{ 'bg-gray-200': isActive.italic }"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Italic"
              >
                <Italic class="w-4 h-4" />
              </button>
              <button
                @click="editor?.chain().focus().toggleStrike().run()"
                :class="{ 'bg-gray-200': isActive.strike }"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Strikethrough"
              >
                <Strikethrough class="w-4 h-4" />
              </button>
              <button
                @click="editor?.chain().focus().toggleUnderline().run()"
                :class="{ 'bg-gray-200': isActive.underline }"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Underline"
              >
                <UnderlineIcon class="w-4 h-4" />
              </button>
            </div>

            <!-- Colors -->
            <div class="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-2">
              <div class="relative">
                <button
                  class="p-1.5 rounded hover:bg-gray-200 flex items-center"
                  :class="{ 'bg-gray-200': isActive.textColor }"
                  title="Text Color"
                >
                  <Palette class="w-4 h-4" :style="{ color: isActive.textColor || 'currentColor' }" />
                  <input
                    type="color"
                    @input="(e) => editor?.chain().focus().setColor((e.target as HTMLInputElement).value).run()"
                    class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </button>
              </div>
              <div class="relative">
                <button
                  class="p-1.5 rounded hover:bg-gray-200 flex items-center"
                  :class="{ 'bg-gray-200': isActive.highlight }"
                  title="Highlight Color"
                >
                  <Highlighter class="w-4 h-4" :style="{ color: isActive.highlight || 'currentColor' }" />
                  <input
                    type="color"
                    @input="(e) => editor?.chain().focus().toggleHighlight({ color: (e.target as HTMLInputElement).value }).run()"
                    class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                </button>
              </div>
              <button
                @click="editor?.chain().focus().unsetColor().run()"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Clear Text Color"
              >
                <Palette class="w-4 h-4 text-gray-400" />
              </button>
              <button
                @click="editor?.chain().focus().unsetHighlight().run()"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Clear Highlight"
              >
                <Highlighter class="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <!-- Headings -->
            <div class="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-2">
              <button
                @click="editor?.commands.focus() && editor?.commands.toggleHeading({ level: 1 })"
                :class="{ 'bg-gray-200': isActive.h1 }"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Heading 1"
              >
                <Heading1 class="w-4 h-4" />
              </button>
              <button
                @click="editor?.commands.focus() && editor?.commands.toggleHeading({ level: 2 })"
                :class="{ 'bg-gray-200': isActive.h2 }"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Heading 2"
              >
                <Heading2 class="w-4 h-4" />
              </button>
            </div>

            <!-- Lists -->
            <div class="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-2">
              <button
                @click="editor?.commands.toggleBulletList()"
                :class="{ 'bg-gray-200': isActive.bulletList }"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Bullet List"
              >
                <List class="w-4 h-4" />
              </button>
              <button
                @click="editor?.commands.toggleOrderedList()"
                :class="{ 'bg-gray-200': isActive.orderedList }"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Numbered List"
              >
                <ListOrdered class="w-4 h-4" />
              </button>
            </div>

            <!-- Alignment -->
            <div class="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-2">
              <button
                @click="editor?.chain().focus().setTextAlign('left').run()"
                :class="{ 'bg-gray-200': isActive.alignLeft }"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Align Left"
              >
                <AlignLeft class="w-4 h-4" />
              </button>
              <button
                @click="editor?.chain().focus().setTextAlign('center').run()"
                :class="{ 'bg-gray-200': isActive.alignCenter }"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Align Center"
              >
                <AlignCenter class="w-4 h-4" />
              </button>
              <button
                @click="editor?.chain().focus().setTextAlign('right').run()"
                :class="{ 'bg-gray-200': isActive.alignRight }"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Align Right"
              >
                <AlignRight class="w-4 h-4" />
              </button>
              <button
                @click="editor?.chain().focus().setTextAlign('justify').run()"
                :class="{ 'bg-gray-200': isActive.alignJustify }"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Justify"
              >
                <AlignJustify class="w-4 h-4" />
              </button>
            </div>

            <!-- Media -->
            <div class="flex items-center space-x-1 border-r border-gray-300 pr-2 mr-2">
              <button
                @click="addImage"
                class="p-1.5 rounded hover:bg-gray-200 relative"
                :class="{ 'opacity-50 cursor-wait': isUploading }"
                :disabled="isUploading"
                title="Insert Image"
              >
                <ImageIcon class="w-4 h-4" />
                <span v-if="isUploading" class="absolute inset-0 flex items-center justify-center">
                  <span class="animate-spin h-3 w-3 border-2 border-green-500 rounded-full border-t-transparent"></span>
                </span>
              </button>
              <button
                @click="addLink"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Insert Link"
              >
                <LinkIcon class="w-4 h-4" />
              </button>
              <button
                @click="addTable"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Insert Table"
              >
                <TableIcon class="w-4 h-4" />
              </button>
            </div>

            <!-- Undo/Redo -->
            <div class="flex items-center space-x-1">
              <button
                @click="editor?.chain().focus().undo().run()"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Undo"
              >
                <Undo class="w-4 h-4" />
              </button>
              <button
                @click="editor?.chain().focus().redo().run()"
                class="p-1.5 rounded hover:bg-gray-200"
                title="Redo"
              >
                <Redo class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Editor -->
          <div class="min-h-[400px] prose max-w-none p-4">
            <editor-content :editor="editor" />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 px-6 py-4 flex justify-between items-center">
        <span class="text-sm text-gray-500">
          {{ isEditing ? 'Last edited' : 'Created' }} on {{ new Date().toLocaleDateString() }}
        </span>
        <div class="flex items-center space-x-3">
          <button
            @click="router.push('/admin/articles')"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            @click="saveArticle"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
          >
            {{ isEditing ? 'Update Article' : 'Publish Article' }}
          </button>
        </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Image Upload Modal -->
  <Teleport to="body">
    <div v-if="showImageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">Insert Image</h3>
          <button @click="showImageModal = false" class="text-gray-400 hover:text-gray-500">
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Upload Type Selector -->
        <div class="flex space-x-4 mb-4">
          <button
            @click="uploadType = 'url'"
            class="flex-1 py-2 px-4 rounded-md"
            :class="uploadType === 'url' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
          >
            Image URL
          </button>
          <button
            @click="uploadType = 'file'"
            class="flex-1 py-2 px-4 rounded-md"
            :class="uploadType === 'file' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
          >
            Upload File
          </button>
        </div>

        <!-- URL Input -->
        <div v-if="uploadType === 'url'" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
          <input
            type="url"
            v-model="imageUrl"
            placeholder="https://example.com/image.jpg"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <!-- File Upload -->
        <div v-else class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div class="space-y-1 text-center">
              <svg
                class="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div class="flex text-sm text-gray-600">
                <label class="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    class="sr-only"
                    accept="image/*"
                    @change="handleFileSelect"
                  />
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
          <div v-if="selectedFile" class="mt-2 text-sm text-gray-500">
            Selected: {{ selectedFile.name }}
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-5 flex justify-end space-x-3">
          <button
            @click="showImageModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="insertImage"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 relative"
            :class="{ 'opacity-50 cursor-wait': isUploading }"
            :disabled="isUploading"
          >
            <span v-if="!isUploading">Insert Image</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
.ProseMirror {
  min-height: 400px;
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Table Styles */
.ProseMirror table {
  border-collapse: collapse;
  margin: 0;
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
}

.ProseMirror td,
.ProseMirror th {
  border: 2px solid #ced4da;
  box-sizing: border-box;
  min-width: 1em;
  padding: 3px 5px;
  position: relative;
  vertical-align: top;
}

.ProseMirror th {
  background-color: #f8f9fa;
  font-weight: bold;
  text-align: left;
}

.ProseMirror .selectedCell:after {
  background: rgba(200, 200, 255, 0.4);
  content: "";
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;
}

.ProseMirror img {
  &.ProseMirror-selectednode {
    outline: 3px solid #10b981; /* Green-600 to match theme */
  }
}

/* Resize handle styles */
.image-resizer {
  display: block;
  width: 7px;
  height: 7px;
  border: 1px solid #10b981;
  background-color: white;
  position: absolute;
  
  &.image-resizer-n {
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    cursor: n-resize;
  }
  
  &.image-resizer-ne {
    top: -6px;
    right: -6px;
    cursor: ne-resize;
  }
  
  &.image-resizer-e {
    top: 50%;
    right: -6px;
    transform: translateY(-50%);
    cursor: e-resize;
  }
  
  &.image-resizer-se {
    bottom: -6px;
    right: -6px;
    cursor: se-resize;
  }
  
  &.image-resizer-s {
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    cursor: s-resize;
  }
  
  &.image-resizer-sw {
    bottom: -6px;
    left: -6px;
    cursor: sw-resize;
  }
  
  &.image-resizer-w {
    top: 50%;
    left: -6px;
    transform: translateY(-50%);
    cursor: w-resize;
  }
  
  &.image-resizer-nw {
    top: -6px;
    left: -6px;
    cursor: nw-resize;
  }
}

.ProseMirror hr {
  margin: 1rem 0;
}

.ProseMirror blockquote {
  border-left: 4px solid #e9ecef;
  margin: 1rem 0;
  padding-left: 1rem;
  color: #6c757d;
}

/* List Styles */
.ProseMirror ul,
.ProseMirror ol {
  padding-left: 2rem;
  margin: 1rem 0;
}

.ProseMirror ul {
  list-style-type: disc;
}

.ProseMirror ol {
  list-style-type: decimal;
}

.ProseMirror ul[data-type="bulletList"] {
  list-style-type: disc;
}

.ProseMirror ol[data-type="orderedList"] {
  list-style-type: decimal;
}

/* Heading Styles */
.ProseMirror h1 {
  font-size: 2em;
  font-weight: bold;
  margin: 0.5em 0;
  line-height: 1.2;
}

.ProseMirror h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.5em 0;
  line-height: 1.2;
}

/* Color styles */
.ProseMirror mark {
  border-radius: 0.25em;
  padding: 0.1em 0.3em;
  margin: 0 0.1em;
}

.ProseMirror span[style*="color:"] {
  border-radius: 0.25em;
  padding: 0.1em 0;
}

/* Color picker button styles */
input[type="color"] {
  cursor: pointer;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 0.25rem;
}
</style>