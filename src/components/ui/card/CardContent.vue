<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: string
}>()

const classNames = computed(() => {
  return cn('p-6 pt-0', props.class)
})
</script>

<template>
  <div :class="classNames">
    <slot />
  </div>
</template>
