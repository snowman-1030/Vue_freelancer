<script setup lang="ts">
import { ref } from 'vue'
import { Upload, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button/index'

const props = defineProps<{
  modelValue: File | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', file: File | null): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
    emit('update:modelValue', file)
  } else {
    alert('File size must be less than 5MB')
  }
  
  // Reset input value to allow selecting the same file again
  if (input) input.value = ''
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  const file = e.dataTransfer?.files[0]
  
  if (file && file.size <= 5 * 1024 * 1024) {
    emit('update:modelValue', file)
  } else {
    alert('File size must be less than 5MB')
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const removeFile = () => {
  emit('update:modelValue', null)
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}
</script>

<template>
  <div 
    class="border-2 border-dashed rounded-lg p-6 text-center"
    @drop="handleDrop"
    @dragover="handleDragOver"
  >
    <template v-if="!modelValue">
      <div>
        <Upload class="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <div class="space-y-1">
          <p class="text-sm text-gray-500">Drag and drop or click to upload</p>
          <p class="text-xs text-gray-400">PNG, JPG up to 5MB</p>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          class="hidden"
          accept="image/*"
          @change="handleFileSelect"
        />
        <Button
          variant="outline"
          class="mt-4 rounded-md"
          @click="triggerFileInput"
        >
          Select File
        </Button>
      </div>
    </template>
    <template v-else>
      <div class="flex items-center justify-between bg-gray-50 p-2 rounded">
        <div class="flex items-center space-x-2">
          <div class="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
            <span class="text-xs text-gray-600">File</span>
          </div>
          <span class="text-sm">{{ modelValue.name }}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          @click="removeFile"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
    </template>
  </div>
</template>