<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { AlertTriangle } from 'lucide-vue-next'

defineProps<{
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel 
              class="relative transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm border border-green-600 transition-all w-full max-w-lg"
            >
              <div class="p-8">
                <div class="flex items-start gap-6">
                  <div 
                    class="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                    :class="{
                      'bg-red-100': type === 'danger',
                      'bg-yellow-100': type === 'warning',
                      'bg-blue-100': type === 'info' || !type
                    }"
                  >
                    <AlertTriangle 
                      class="h-7 w-7"
                      :class="{
                        'text-red-600': type === 'danger',
                        'text-yellow-600': type === 'warning',
                        'text-blue-600': type === 'info' || !type
                      }"
                    />
                  </div>
                  <div class="flex-1">
                    <DialogTitle as="h3" class="text-2xl font-semibold text-gray-900 mb-3">
                      {{ title }}
                    </DialogTitle>
                    <p class="text-gray-600 text-base leading-relaxed">{{ message }}</p>
                  </div>
                </div>

                <div class="mt-10 flex justify-end gap-3">
                  <button
                    type="button"
                    class="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    @click="emit('close')"
                  >
                    {{ cancelText || 'Cancel' }}
                  </button>
                  <button
                    type="button"
                    class="px-6 py-3 rounded-xl font-medium transition-colors"
                    :class="{
                      'bg-red-600 text-white hover:bg-red-700': type === 'danger',
                      'bg-yellow-600 text-white hover:bg-yellow-700': type === 'warning',
                      'bg-green-600 text-white hover:bg-green-700': type === 'info' || !type
                    }"
                    @click="emit('confirm')"
                  >
                    {{ confirmText || 'Confirm' }}
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