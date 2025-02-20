<script setup lang="ts">
// 1. Vue imports
import { ref, watch } from 'vue'

// 2. Component imports
// None needed

// 3. Type definitions
interface SentimentVisibility {
  positive: boolean
  neutral: boolean
  negative: boolean
}

// 4. Props and emits
const props = defineProps<{
  modelValue: SentimentVisibility
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: SentimentVisibility): void
}>()

// 5. State management
const visibility = ref<SentimentVisibility>({
  positive: props.modelValue.positive,
  neutral: props.modelValue.neutral,
  negative: props.modelValue.negative
})

// 6. Methods
function toggleSentiment(type: keyof SentimentVisibility) {
  visibility.value[type] = !visibility.value[type]
  emit('update:modelValue', { ...visibility.value })
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  visibility.value = { ...newValue }
}, { deep: true })
</script>

<template>
  <div class="flex gap-2">
    <button
      @click="toggleSentiment('positive')"
      :class="[
        'flex-1 flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500',
        visibility.positive
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'border border-gray-300 text-gray-400 hover:border-green-500'
      ]"
    >
      Positive
    </button>

    <button
      @click="toggleSentiment('neutral')"
      :class="[
        'flex-1 flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500',
        visibility.neutral
          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          : 'border border-gray-300 text-gray-400 hover:border-yellow-500'
      ]"
    >
      Neutral
    </button>

    <button
      @click="toggleSentiment('negative')"
      :class="[
        'flex-1 flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500',
        visibility.negative
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'border border-gray-300 text-gray-400 hover:border-red-500'
      ]"
    >
      Negative
    </button>
  </div>
</template>