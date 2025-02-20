<script setup lang="ts">
import { computed } from 'vue'
import { badgeVariants } from '.'
import type { BadgeVariants } from '.'

const props = withDefaults(
  defineProps<{
    variant?: BadgeVariants['variant']
    class?: string
  }>(),
  {
    variant: 'default',
  },
)

const classNames = computed(() => {
  return badgeVariants({ variant: props.variant, class: props.class })
})
</script>

<template>
  <span :class="classNames" style="display: inline-flex; align-items: center;">
    <slot />
  </span>
</template>

