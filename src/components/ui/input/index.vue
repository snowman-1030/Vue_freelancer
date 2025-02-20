<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  id?: string
  name?: string
  class?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputClasses = computed(() => {
  return [
    'block w-full rounded-md border-gray-300 shadow-sm',
    'focus:border-green-500 focus:ring-green-500',
    'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
    'sm:text-sm',
    props.class
  ].filter(Boolean).join(' ')
})
</script>

<template>
  <input
    :value="modelValue"
    @input="$event => emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    :type="type || 'text'"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :id="id"
    :name="name"
    :class="inputClasses"
  />
</template>