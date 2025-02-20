<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { buttonVariants, type ButtonVariants } from '.'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    class?: string
  }>(),
  {
    variant: 'default',
    size: 'default',
  },
)

const classNames = computed(() => {
  return cn(buttonVariants({ variant: props.variant, size: props.size, class: props.class }))
})
</script>

<template>
  <button :class="classNames">
    <slot />
  </button>
</template>
