<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h3 class="text-xl font-semibold text-green-800 mb-4">Report Filters</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Date Range -->
      <div class="space-y-2">
        <Label>Start Date</Label>
        <Input
          type="date"
          v-model="localFilters.startDate"
          @change="emitUpdate"
        />
      </div>
      
      <div class="space-y-2">
        <Label>End Date</Label>
        <Input
          type="date"
          v-model="localFilters.endDate"
          @change="emitUpdate"
        />
      </div>
      
      <!-- Platform Filter -->
      <div class="space-y-2">
        <Label>Platform</Label>
        <Select
          v-model="localFilters.platform"
          @update:modelValue="emitUpdate"
        >
          <option value="">All Platforms</option>
          <option
            v-for="source in availableSources"
            :key="source"
            :value="source"
          >
            {{ source }}
          </option>
        </Select>
      </div>
      
      <!-- Keyword Filter -->
      <div class="space-y-2">
        <Label>Keyword</Label>
        <Input
          type="text"
          v-model="localFilters.keyword"
          placeholder="Filter by keyword"
          @input="emitUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { ReportFilter } from '@/types/reports'

// Props and emits
const props = defineProps<{
  modelValue: ReportFilter
  availableSources: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ReportFilter): void
  (e: 'update:filters', value: ReportFilter): void
}>()

// Local state
const localFilters = ref<ReportFilter>({ ...props.modelValue })

// Methods
function emitUpdate() {
  emit('update:modelValue', localFilters.value)
  emit('update:filters', localFilters.value)
}

// Watch for prop changes
watch(
  () => props.modelValue,
  (newValue) => {
    localFilters.value = { ...newValue }
  },
  { deep: true }
)
</script>