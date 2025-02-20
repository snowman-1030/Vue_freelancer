<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <tr :class="cn('border-b border-gray-100 transition-colors hover:bg-gray-50/80 data-[state=selected]:bg-gray-50', props.class)">
    <slot />
  </tr>
</template>
