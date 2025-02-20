<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: string
}>()

const classNames = computed(() => {
  return cn(
    'flex h-full w-full items-center justify-center rounded-full bg-muted',
    props.class,
  )
})
</script>

<template>
  <div :class="classNames">
    <slot />
  </div>
</template>
