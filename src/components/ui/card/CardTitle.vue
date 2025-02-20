<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: string
}>()

const classNames = computed(() => {
  return cn('text-lg font-semibold leading-none tracking-tight', props.class)
})
</script>

<template>
  <h3 :class="classNames">
    <slot />
  </h3>
</template>
