<template>
  <div>
    <Label class="text-base font-medium text-gray-700 mb-4 block">Select sites to track:</Label>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <div
        v-for="site in sites"
        :key="site.id"
        class="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-sm transition-colors hover:bg-gray-100 border border-gray-200 cursor-pointer"
        @click="toggleSite(site.id, !modelValue.includes(site.id))"
      >
        <Checkbox 
          :model-value="modelValue.includes(site.id)"
          @update:model-value="(checked) => toggleSite(site.id, checked)"
        />
        <Label 
          :for="site.id" 
          class="flex items-center space-x-2.5 text-base text-gray-700 cursor-pointer select-none"
        >
          <component 
            :is="getSiteIcon(site.id)" 
            class="h-5 w-5"
            :class="site.iconColor"
          />
          <span>{{ site.name }}</span>
        </Label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import * as LucideIcons from 'lucide-vue-next'
import axios from '@/lib/axios'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const sites = ref<Array<{id: string, name: string, icon: string, iconColor: string}>>([])

onMounted(async () => {
  try {
    const response = await axios.get('/logs/available-sources/')
    // Sort sites alphabetically by name
    sites.value = response.data.sort((a: {name: string}, b: {name: string}) =>
      a.name.localeCompare(b.name)
    )
  } catch (error) {
    console.error('Failed to fetch available sources:', error)
  }
})

const toggleSite = (siteId: string, checked: boolean) => {
  const newValue = checked
    ? [...props.modelValue, siteId]
    : props.modelValue.filter(id => id !== siteId)
  emit('update:modelValue', newValue)
}

const getSiteIcon = (siteId: string) => {
  const site = sites.value.find(s => s.id === siteId)
  return site ? LucideIcons[site.icon as keyof typeof LucideIcons] : LucideIcons.Globe
}
</script>
