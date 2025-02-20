<script setup lang="ts">
// 1. Vue imports
import { ref, watch, computed } from 'vue'
import { Globe, Check } from 'lucide-vue-next'

// 2. Component imports
// None needed

// 3. Type definitions
interface Platform {
  value: string
  label: string
}

// 4. Props and emits
const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

// 5. State management
const selectedPlatforms = ref<string[]>(props.modelValue)
const isOpen = ref(false)

const platforms: Platform[] = [
  { value: 'autoflower.org', label: 'Autoflower' },
  { value: 'beanbasement.nl', label: 'Bean Basement' },
  { value: 'growersnetwork.org', label: 'Growers Network' },
  { value: 'growweedeasy.com', label: 'GrowWeedEasy' },
  { value: 'homegrowncannabisco.community', label: 'Homegrown Cannabis Co' },
  { value: 'icmag.com', label: 'ICMag' },
  { value: 'ilgmforum.com', label: 'ILGM Forum' },
  { value: 'marijuanapassion.com', label: 'MarijuanaPassion' },
  { value: '420magazine.com', label: '420 Magazine' },
  { value: 'overgrow.com', label: 'Overgrow' },
  { value: 'percysgrowroom.com', label: "Percy's Grow Room" },
  { value: 'phenohunter.com', label: 'PhenoHunter' },
  { value: 'reddit.com', label: 'Reddit' },
  { value: 'rollitup.org', label: 'RollItUp' },
  { value: 'thcfarmer.com', label: 'THC Farmer' },
  { value: 'uk420.com', label: 'UK420' },
  { value: '420sa.co.za', label: '420SA' }
]

// 6. Methods
function togglePlatform(platform: string) {
  const index = selectedPlatforms.value.indexOf(platform)
  if (index === -1) {
    selectedPlatforms.value.push(platform)
  } else {
    selectedPlatforms.value.splice(index, 1)
  }
  updateSelection()
}

function selectAll() {
  selectedPlatforms.value = platforms.map(p => p.value)
  updateSelection()
}

function clearSelection() {
  selectedPlatforms.value = []
  updateSelection()
}

function updateSelection() {
  emit('update:modelValue', selectedPlatforms.value)
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  selectedPlatforms.value = [...newValue]
}, { deep: true })

// Computed display text
const displayText = computed(() => {
  if (selectedPlatforms.value.length === 0) {
    return 'All Platforms'
  }
  if (selectedPlatforms.value.length === platforms.length) {
    return 'All Platforms'
  }
  if (selectedPlatforms.value.length === 1) {
    return platforms.find(p => p.value === selectedPlatforms.value[0])?.label || 'Unknown Platform'
  }
  return `${selectedPlatforms.value.length} Platforms`
})
</script>

<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
    >
      <Globe class="h-4 w-4 text-gray-500" />
      <span class="text-sm text-gray-700">{{ displayText }}</span>
    </button>

    <!-- Dropdown Panel -->
    <div
      v-if="isOpen"
      class="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg"
    >
      <!-- Actions -->
      <div class="p-2 border-b border-gray-200 flex justify-between">
        <button
          @click="selectAll"
          class="text-sm text-green-600 hover:text-green-700"
        >
          Select All
        </button>
        <button
          @click="clearSelection"
          class="text-sm text-gray-600 hover:text-gray-700"
        >
          Clear
        </button>
      </div>

      <!-- Platform List -->
      <div class="max-h-64 overflow-y-auto">
        <button
          v-for="platform in platforms"
          :key="platform.value"
          @click="togglePlatform(platform.value)"
          class="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50"
        >
          <span class="text-sm text-gray-700">{{ platform.label }}</span>
          <Check
            v-if="selectedPlatforms.includes(platform.value)"
            class="h-4 w-4 text-green-600"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.max-h-64 {
  max-height: 16rem;
}
</style>