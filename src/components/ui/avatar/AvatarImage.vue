<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  src?: string
  alt?: string
  class?: string
}>()

const classNames = computed(() => {
  return cn('aspect-square h-full w-full', props.class)
})
</script>

<template>
  <img :src="src" :alt="alt" :class="classNames" />
</template>
