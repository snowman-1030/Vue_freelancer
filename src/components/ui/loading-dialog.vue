<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" @close="onOpenChange" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="sm:max-w-3xl bg-white rounded-lg shadow-sm p-6">
              <div class="flex flex-col space-y-6">
                <div class="flex items-center gap-8">
                  <div class="flex-1">
                    <DialogTitle class="text-2xl font-bold text-green-800 mb-4">Robots Rolling Out</DialogTitle>
                    <p class="text-lg text-gray-600">
                      Beginning your brand analysis now. Our robots are remarkably thorough and slightly obsessive about finding every mention. Check back in 5 minutes! 🤖
                    </p>
                  </div>
                  <div class="flex-shrink-0 w-48 h-48 relative">
                    <img
                      :src="loadingImage"
                      alt="Robot illustration"
                      class="object-contain w-48 h-48"
                    />
                  </div>
                </div>
                <div class="flex justify-center">
                  <button 
                    @click="() => onOpenChange(false)"
                    class="bg-green-800 text-white hover:bg-green-700 transition-colors px-4 py-2 rounded-md"
                  >
                    Got it, thanks!
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import loadingImage from '@/assets/images/ui/loading.png'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const onOpenChange = (value: boolean) => {
  emit('update:open', value)
}
</script>