<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <th :class="cn('h-12 px-6 py-4 text-left align-middle font-semibold text-gray-700 text-sm whitespace-nowrap [&:has([role=checkbox])]:pr-0', props.class)">
    <slot />
  </th>
</template>
