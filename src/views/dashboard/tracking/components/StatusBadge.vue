<template>
  <Button 
    size="sm"
    variant="outline"
    :class="[
      'w-24',
      status === 'active' 
        ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200' 
        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200',
      'transition-colors duration-200 font-medium rounded-sm'
    ]"
  >
    {{ status }}
  </Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

defineProps<{
  status: 'active' | 'paused'
}>()
</script>
