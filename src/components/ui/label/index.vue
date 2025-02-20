<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  htmlFor?: string
  required?: boolean
  class?: string
}>()

const labelClasses = computed(() => {
  return [
    'block text-sm font-medium text-gray-700',
    props.class
  ].filter(Boolean).join(' ')
})
</script>

<template>
  <label :for="htmlFor" :class="labelClasses">
    <slot />
    <span v-if="required" class="text-red-500 ml-1">*</span>
  </label>
</template>