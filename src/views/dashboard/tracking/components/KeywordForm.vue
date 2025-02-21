<template>
  <!-- Payment Required Dialog -->
  <TransitionRoot appear :show="showPaymentDialog" as="template">
    <Dialog as="div" @close="showPaymentDialog = false" class="relative z-50">
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
                    <DialogTitle class="md:text-2xl text-lg font-bold text-green-800 mb-4">Upgrade Your Experience</DialogTitle>
                    <p class="md:text-lg text-gray-600 text-md">
                      Ready to unlock more tracking power? Upgrade your plan to start monitoring more keywords and get deeper insights into your brand's presence. Our premium features are just a click away! 🚀
                    </p>
                  </div>
                  <div class="flex-shrink-0 w-48 h-48 relative">
                    <img
                      :src="upgradeImage"
                      alt="Upgrade illustration"
                      class="object-contain w-48 h-48"
                    />
                  </div>
                </div>
                <div class="flex justify-center">
                  <button
                    @click="navigateToBilling"
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

  <Card class="mb-8 bg-white shadow-sm">
    <CardHeader>
      <div class="flex items-center gap-3 mb-2">
        <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
          <Plus class="w-10 h-5 text-gray-500" />
        </div>
        <div>
          <CardTitle class="md:text-lg font-medium text-gray-700 text-md">Add New Keyword</CardTitle>
          <p class="text-sm sm:text-base text-gray-500 text-left">Enter a new keyword or phrase and select sites to track across platforms</p>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div class="space-y-6">
        <!-- Loading State -->
        <template v-if="store.isLoading">
          <div class="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
            <div class="flex-grow h-10 bg-gray-200 rounded animate-pulse"></div>
            <div class="w-full md:w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div class="space-y-2">
            <div class="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div v-for="i in 8" :key="i" class="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </template>

        <!-- Loaded State -->
        <template v-else>
          <!-- Error Alert -->
          <div v-if="error" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <AlertCircle class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>

          <div class="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
            <Input
              placeholder="Enter keyword or phrase"
              v-model="newKeyword"
              class="flex-grow bg-gray-50 border-gray-200 text-gray-900"
            />
            <Button
              @click="canAddKeyword && addKeyword()"
              class="bg-yellow-400 hover:bg-yellow-500 text-yellow-800 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-2 text-sm font-medium w-full md:w-auto rounded-md"
            >
              <div class="relative mr-2">
                <Square class="h-4 w-4" />
                <Plus class="h-2.5 w-2.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              Keyword
            </Button>
          </div>
          <SiteSelector v-model="selectedSites" />
        </template>
      </div>
    </CardContent>
  </Card>

  <LoadingDialog v-model:open="showLoadingDialog" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { Square, Plus, AlertCircle } from 'lucide-vue-next'
import { useTracking } from '../composables/useTracking'
import SiteSelector from './SiteSelector.vue'
import LoadingDialog from '@/components/ui/loading-dialog.vue'
import upgradeImage from '@/assets/images/illustrations/upgrade.png'

const router = useRouter()
const store = useTracking()
const newKeyword = ref('')
const selectedSites = ref<string[]>([])
const showLoadingDialog = ref(false)
const showPaymentDialog = ref(false)
const error = ref('')

const canAddKeyword = computed(() =>
  newKeyword.value.trim().length > 0 && selectedSites.value.length > 0
)

const navigateToBilling = () => {
  showPaymentDialog.value = false
  router.push('/dashboard/billing')
}

const addKeyword = async () => {
  if (canAddKeyword.value) {
    try {
      error.value = ''
      // First try to validate the keyword limit
      const currentCount = store.totalKeywords
      const limit = store.keywordLimit
      
      if (currentCount >= limit) {
        error.value = `You've reached your keyword limit (${currentCount}/${limit}). Upgrade to Advanced tier to track up to 50 keywords.`
        return
      }

      // Only show loading dialog if we pass the limit check
      showLoadingDialog.value = true
      await store.addKeyword(newKeyword.value, selectedSites.value)
      // Only clear form if successful
      newKeyword.value = ''
      selectedSites.value = []
    } catch (err: any) {
      if (err.response?.status === 402) {
        showPaymentDialog.value = true
      } else {
        error.value = err.message || 'Failed to add keyword'
      }
      showLoadingDialog.value = false
    }
  }
}
</script>
