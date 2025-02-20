<script setup lang="ts">
defineProps<{
  class?: string
}>()
</script>

<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <slot />
  </div>
</template>

<script setup lang="ts" generic="T">
// Card.Header
const CardHeader = defineComponent({
  name: 'CardHeader',
  setup(_, { slots }) {
    return () => (
      <div class="px-6 py-4">
        {slots.default?.()}
      </div>
    )
  }
})

// Card.Title
const CardTitle = defineComponent({
  name: 'CardTitle',
  setup(_, { slots }) {
    return () => (
      <h3 class="text-lg font-medium text-gray-900">
        {slots.default?.()}
      </h3>
    )
  }
})

// Card.Description
const CardDescription = defineComponent({
  name: 'CardDescription',
  setup(_, { slots }) {
    return () => (
      <p class="mt-1 text-sm text-gray-500">
        {slots.default?.()}
      </p>
    )
  }
})

// Card.Content
const CardContent = defineComponent({
  name: 'CardContent',
  setup(_, { slots }) {
    return () => (
      <div class="px-6 py-4">
        {slots.default?.()}
      </div>
    )
  }
})

export { CardHeader, CardTitle, CardDescription, CardContent }
</script>