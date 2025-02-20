<script setup lang="ts">
import { ref, computed } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'

const props = defineProps<{
  modelValue: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const selectedOption = computed(() => {
  return props.options.find(option => option.value === props.modelValue)
})
</script>

<template>
  <Listbox
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <div class="relative">
      <ListboxButton
        class="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 sm:text-sm"
      >
        <span class="block truncate">
          {{ selectedOption?.label || placeholder || 'Select an option' }}
        </span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          <ListboxOption
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            v-slot="{ active, selected }"
          >
            <li
              :class="[
                active ? 'bg-green-600 text-white' : 'text-gray-900',
                'relative cursor-pointer select-none py-2 pl-3 pr-9'
              ]"
            >
              <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">
                {{ option.label }}
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>