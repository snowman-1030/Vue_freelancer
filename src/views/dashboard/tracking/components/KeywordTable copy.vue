<template>
  <Card class="bg-white shadow-sm">
    <CardHeader>
      <div class="flex items-center gap-3 mb-6">
        <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
          <Tag class="w-10 h-5 text-gray-500" />
        </div>
        <div>
          <CardTitle class="md:text-lg font-medium text-gray-700 text-md">Current Tracking Keywords</CardTitle>
          <p class="text-sm sm:text-base text-gray-500">Manage your tracked keywords and phrases</p>
        </div>
      </div>
      <div v-if="store.isLoading" class="w-[120px] h-10 bg-gray-200 rounded animate-pulse"></div>
      <Select v-else v-model="filterValue" class="w-[120px]">
        <SelectTrigger class="bg-gray-50 border border-gray-200 text-gray-900 transition-all focus:ring-2 focus:ring-green-600 focus:ring-offset-0 focus:border-transparent">
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="paused">Paused</SelectItem>
        </SelectContent>
      </Select>
    </CardHeader>
    <CardContent>
      <template v-if="store.totalKeywords === 0">
        <!-- <div class="flex flex-col items-center justify-center h-64 p-6 text-center">
          <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <Search class="w-8 h-8 text-emerald-400" />
          </div>

          <h3 class="md:text-lg font-medium text-gray-700 mb-2 text-md">
            No Active Keywords
          </h3>
          <p class="text-gray-500 text-sm mb-5 max-w-[700px]">
            Set up keywords to start monitoring conversations about your brand across cannabis communities.
          </p>

        </div> -->
      </template>
      <Table >
        <TableHeader class="bg-gray-50/50">
          <TableRow>
            <TableHead class="w-[180px] text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-200/50">Keyword</TableHead>
            <TableHead class="w-[120px] text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-200/50">Status</TableHead>
            <TableHead class="w-[180px] text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-200/50">Source</TableHead>
            <TableHead class="w-[120px] text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider border-y border-gray-200/50">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Loading State -->
          <template v-if="store.isLoading">
            <TableRow v-for="i in 5" :key="i" class="group hover:bg-gray-50/50 transition-all duration-200">
              <TableCell class="py-4 px-6 border-b border-gray-200/50">
                <div class="h-9 bg-gray-200 rounded animate-pulse w-48"></div>
              </TableCell>
              <TableCell class="py-4">
                <div class="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
              </TableCell>
              <TableCell class="py-4">
                <div class="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
              </TableCell>
              <TableCell class="text-right py-4">
                <div class="flex justify-end space-x-2">
                  <div class="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                  <div class="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                  <div class="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- Loaded State -->
          <!-- <TableRow v-else v-for="keyword in store.paginatedKeywords" :key="keyword.id" class="group hover:bg-gray-50/50 transition-all duration-200">
            <TableCell class="py-4 px-6 border-b border-gray-200/50">
              <template v-if="editingId === keyword.id">
                <Input 
                  v-model="editValue" 
                  class="w-full bg-gray-50 border border-gray-200 text-gray-900 transition-all"
                />
              </template>
              <template v-else>
                <span class="text-base text-gray-700">{{ keyword.term }}</span>
              </template>
            </TableCell>
            <TableCell class="py-4 px-6 border-b border-gray-200/50">
              <StatusBadge :status="keyword.status" />
            </TableCell>
            <TableCell class="py-4 px-6 border-b border-gray-200/50">
              <span class="text-base text-gray-600">{{ getSourceName(keyword.source) }}</span>
            </TableCell>
            <TableCell class="text-right py-4 px-6 border-b border-gray-200/50">
              <div class="flex justify-end space-x-2">
                <template v-if="editingId === keyword.id">
                  <Button 
                    size="sm" 
                    @click="saveEdit(keyword.id)" 
                    class="w-10 h-10 p-0 bg-green-50 hover:bg-green-100 text-green-700 rounded-sm"
                  >
                    <Save class="h-4 w-4" />
                  </Button>
                </template>
                <template v-else>
                  <Button 
                    size="sm" 
                    @click="startEditing(keyword.id, keyword.term)" 
                    class="w-10 h-10 p-0 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-sm"
                  >
                    <Edit2 class="h-4 w-4" />
                  </Button>
                </template>
                <Button 
                  size="sm"
                  @click="deleteKeyword(keyword.id)"
                  class="w-10 h-10 p-0 bg-red-50 hover:bg-red-100 text-red-700 rounded-sm"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow> -->


          <TableRow class="group hover:bg-gray-50/50 transition-all duration-200">
  <!-- First column: term (static value) -->
  <TableCell class="py-4 px-6 border-b border-gray-200/50">
    <span class="text-base text-gray-700">Sample Term</span>
  </TableCell>
  
  <!-- Second column: status (static value) -->
  <TableCell class="py-4 px-6 border-b border-gray-200/50">
    <StatusBadge :status="'active'" />
  </TableCell>

  <!-- Third column: source name (static value) -->
  <TableCell class="py-4 px-6 border-b border-gray-200/50">
    <span class="text-base text-gray-600">Sample Source</span>
  </TableCell>
  
  <!-- Fourth column: action buttons (static) -->
  <TableCell class="text-right py-4 px-6 border-b border-gray-200/50">
    <div class="flex justify-end space-x-2">
      <!-- Save button (static) -->
      <Button 
        size="sm" 
        @click="saveEdit('sample-id')" 
        class="w-10 h-10 p-0 bg-green-50 hover:bg-green-100 text-green-700 rounded-sm"
      >
        <Save class="h-4 w-4" />
      </Button>

      <!-- Edit button (static) -->
      <Button 
        size="sm" 
        @click="startEditing('sample-id', 'Sample Term')" 
        class="w-10 h-10 p-0 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-sm"
      >
        <Edit2 class="h-4 w-4" />
      </Button>

      <!-- Delete button (static) -->
      <Button 
        size="sm"
        @click="deleteKeyword('sample-id')"
        class="w-10 h-10 p-0 bg-red-50 hover:bg-red-100 text-red-700 rounded-sm"
      >
        <Trash2 class="h-4 w-4" />
      </Button>
    </div>
  </TableCell>
</TableRow>

        </TableBody>
      </Table>
    </CardContent>
    <CardFooter class="pt-6 flex items-center justify-between">
      <p class="text-xs sm:text-sm text-gray-500">
        Tracking updates occur every 15 minutes. Last updated: 5 minutes ago.
      </p>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="store.currentPage === 1"
          @click="store.currentPage--"
          class="h-8 w-8 p-0 bg-gray-50 hover:bg-gray-100"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <span class="text-xs sm:text-sm text-gray-600">
          Page {{ store.currentPage }} of {{ store.totalPages }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="store.currentPage === store.totalPages"
          @click="store.currentPage++"
          class="h-8 w-8 p-0 bg-gray-50 hover:bg-gray-100"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Edit2, Save, Trash2, ChevronLeft, ChevronRight, Tag, ArrowRight, Search } from 'lucide-vue-next'
import { useTracking } from '../composables/useTracking'
import StatusBadge from './StatusBadge.vue'

const store = useTracking()
const editingId = ref<number | null>(null)
const editValue = ref('')
const filterValue = ref<'all' | 'active' | 'paused'>('all')

const getSourceName = (source: string) => {
  const sourceMap: Record<string, string> = {
    'rollitup.org': 'RollItUp',
    'thcfarmer.com': 'THC Farmer',
    'icmag.com': 'ICMag',
    '420magazine.com': '420 Magazine',
    'overgrow.com': 'Overgrow',
    'ilgmforum.com': 'ILGM Forum',
    'homegrowncannabisco.community': 'Homegrown Cannabis Co',
    'growersnetwork.org': 'Growers Network',
    'autoflower.org': 'AutoFlower',
    'marijuanapassion.com': 'Marijuana Passion',
    'growweedeasy.com': 'GrowWeedEasy',
    'beanbasement.nl': 'Bean Basement',
    'phenohunter.org': 'PhenoHunter',
    'reddit.com': 'Reddit',
    'uk420.com': 'UK420',
    'percysgrowroom.com': "Percy's Grow Room",
    '420sa.co.za': '420SA'
  }
  return sourceMap[source] || source
}

const startEditing = (id: number, term: string) => {
  editingId.value = id
  editValue.value = term
}

const saveEdit = (id: number) => {
  store.updateKeyword(id, editValue.value)
  editingId.value = null
}

const deleteKeyword = (id: number) => {
  store.deleteKeyword(id)
}
</script>
