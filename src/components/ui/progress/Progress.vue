<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  value?: number
  class?: string
  indicatorClass?: string
}>()

const classNames = computed(() => {
  return cn(
    'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
    props.class
  )
})

const indicatorClassNames = computed(() => {
  return cn(
    'h-full w-full flex-1 bg-primary transition-all',
    props.indicatorClass
  )
})

const progressStyle = computed(() => {
  return {
    transform: `translateX(-${100 - (props.value || 0)}%)`,
  }
})
</script>

<template>
  <div :class="classNames" role="progressbar" :aria-valuemax="100" :aria-valuemin="0" :aria-valuenow="value">
    <div :class="indicatorClassNames" :style="progressStyle" />
  </div>
</template>
