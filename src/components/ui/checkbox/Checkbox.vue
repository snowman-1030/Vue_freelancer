<template>
  <div class="relative">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="h-4 w-4 rounded-none border border-green-600 bg-white text-green-600 focus:ring-green-500 focus:ring-offset-0"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
