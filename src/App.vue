<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from '@/components/ui/toast/ToastContainer.vue'
</script>

<template>
  <RouterView />
  <ToastContainer />
</template>

<style>
/* Global scrollbar styles */
:root {
  scrollbar-width: auto;
  scrollbar-color: #22c55e #f1f1f1;
}

::-webkit-scrollbar {
  width: 14px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #22c55e;
  border-radius: 4px;
  border: 2px solid #f1f1f1;
}

::-webkit-scrollbar-thumb:hover {
  background: #16a34a;
}

::-webkit-scrollbar-thumb:active {
  background: #15803d;
}
</style>
