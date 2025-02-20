<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: string
}>()

const classNames = computed(() => {
  return cn(
    'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
    props.class,
  )
})
</script>

<template>
  <div :class="classNames">
    <slot />
  </div>
</template>
