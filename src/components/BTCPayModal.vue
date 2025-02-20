<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { XCircle, ArrowUpCircle } from 'lucide-vue-next'

interface BTCPayMessage {
  status: 'new' | 'paid' | 'confirmed' | 'complete' | 'expired' | 'invalid'
}

const props = defineProps<{
  invoiceUrl: string
  planType: string
  amount: string
  show: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const error = ref<string | null>(null)
const isCompleted = ref(false)

const handleIframeMessage = (event: MessageEvent) => {
  if (event.origin !== 'https://btcpay978166.lndyn.com') return
  
  const data = event.data as BTCPayMessage
  console.log('BTCPay message received:', data)
  
  if (data.status === 'complete' || data.status === 'confirmed') {
    console.log('Payment completed!')
    isCompleted.value = true
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } else if (data.status === 'expired') {
    error.value = 'Payment time expired. Please try again.'
    emit('close')
  } else if (data.status === 'invalid') {
    error.value = 'Payment invalid. Please try again.'
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('message', handleIframeMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleIframeMessage)
})

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-[100]">
    <div class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm"></div>

    <div class="fixed inset-0 overflow-hidden">
      <div class="flex min-h-full items-center justify-center p-6">
        <div class="relative w-full max-w-[600px] bg-white flex flex-col h-[800px] max-h-[90vh] overflow-hidden rounded-[20px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] ring-1 ring-gray-200/50">
          <div class="relative border-b border-gray-200 bg-white px-8 py-5 rounded-t-[20px]">
            <div class="flex justify-between">
              <div class="flex gap-3">
                <ArrowUpCircle class="h-10 w-10 text-green-600 bg-green-50 rounded-lg p-2 flex-shrink-0" />
                <div>
                  <h3 class="text-xl font-semibold text-gray-900">
                    Upgrade to {{ planType }} Plan
                  </h3>
                  <p class="mt-1 text-sm font-medium text-gray-500">
                    Complete your payment of ${{ amount }} to upgrade your plan
                  </p>
                </div>
              </div>
              <button
                type="button"
                class="rounded-lg p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                @click="handleClose"
              >
                <XCircle class="h-6 w-6" />
              </button>
            </div>
          </div>

          <div v-if="error" class="px-8 py-4 bg-yellow-50/80 border-y border-yellow-100">
            <p class="text-sm font-medium text-yellow-800">{{ error }}</p>
          </div>
          <div class="relative flex-1 overflow-hidden bg-white">
            <template v-if="props.loading">
              <div class="flex items-center justify-center min-h-[600px]">
                <div class="relative w-32 h-32">
                  <!-- Outer spinning ring -->
                  <div class="absolute inset-0 rounded-full border-[10px] border-t-green-400 border-r-green-500 border-b-green-600 border-l-green-300 animate-[spin_1s_linear_infinite]"></div>
                  <!-- Inner gradient circle -->
                  <div class="absolute inset-6 rounded-full bg-gradient-to-br from-green-300 via-green-500 to-green-600 animate-pulse"></div>
                  <!-- Loading text -->
                  <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-base font-medium text-gray-600">
                    Creating Invoice...
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <iframe
                :src="props.invoiceUrl"
                class="absolute inset-0 w-full h-full border-0"
                allow="payment"
                frameborder="0"
              ></iframe>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>