<script setup lang="ts">
// 1. Vue imports
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 2. Component imports
import axios from '@/lib/axios'
import { Check, Shield, Leaf, Zap, XCircle, Bitcoin, ChevronDown } from 'lucide-vue-next'
import BTCPayModal from '@/components/BTCPayModal.vue'
import SubscriptionHeader from '@/components/SubscriptionHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useTracking } from '@/views/dashboard/tracking/composables/useTracking'

import advancedIllustration from '../../assets/images/illustrations/advanced-plan.png'
import starterIllustration from '../../assets/images/illustrations/starter-plan.png'
import essentialIllustration from '../../assets/images/illustrations/essential-plan.png'

// Type definitions for subscription data
type SubscriptionStatus = 'active' | 'inactive'
interface SubscriptionData {
  status: SubscriptionStatus
  currentPlan: string
  renewalDate: string
  billingCycle: 'monthly' | 'annually'
  lastPayment?: {
    amount: number
    date: string
  } | null
  usage: {
    keywords: number
    keywordsLimit: number
  }
}

const authStore = useAuthStore()
const trackingStore = useTracking()

// Fetch latest user data on mount
onMounted(() => {
  authStore.fetchProfile()
  fetchInvoices()
})

// Computed subscription data
const subscriptionData = computed((): SubscriptionData => ({
  status: authStore.hasPaid ? 'active' : 'inactive',
  currentPlan: authStore.tier,
  renewalDate: authStore.renewalDate,
  billingCycle: billingCycle.value,
  lastPayment: null,
  usage: {
    keywords: trackingStore.activeKeywords,
    keywordsLimit: selectedPlan.value?.features?.keywordsLimit || 0
  }
}))

// 3. Type definitions
interface InvoiceData {
  invoiceUrl: string
}

interface ErrorData {
  error: string
  details?: string
}

interface BTCPayMessage {
  status: 'new' | 'paid' | 'confirmed' | 'complete' | 'expired' | 'invalid'
}

interface BTCPayOptions {
  mode?: 'fixed'
  defaultPaymentMethod?: string
  defaultLanguage?: string
  container?: HTMLElement | string
}

interface BTCPay {
  showInvoice: (invoiceId: string, options?: BTCPayOptions) => void
  hideFrame: () => void
  setApiUrlPrefix: (url: string) => void
  onModalWillEnter: (callback: () => void) => void
  onModalWillLeave: (callback: () => void) => void
  onModalReceiveMessage: (callback: (data: BTCPayMessage) => void) => void
}

declare global {
  interface Window {
    btcpay?: BTCPay
  }
}

type BillingCycle = 'monthly' | 'annually'

// Invoice related types
interface Invoice {
  btcpay_id: string
  status: 'new' | 'paid' | 'expired' | 'invalid'
  amount_usd: string
  plan_type: string
  billing_cycle: BillingCycle
  created_at: string
  updated_at: string
}

interface PlanPrices {
  [key: string]: {
    monthly: string
    annually: string
  }
}
interface PlanDetails {
  name: string
  price: {
    monthly: string
    annually: string
  }
  features: {
    keywordsLimit: number
    scanInterval: string
    platforms: string
  }
}

// 4. State management
const isLoading = ref(false)
const error = ref<ErrorData | null>(null)
const invoices = ref<Invoice[]>([])
const isLoadingInvoices = ref(false)
const invoiceError = ref<string | null>(null)
const expandedFeatures = ref<Record<string, boolean>>({
  starter: false,
  essential: false,
  advanced: false
})

const toggleFeatures = (plan: string) => {
  expandedFeatures.value[plan] = !expandedFeatures.value[plan]
}

// Fetch user's invoices
async function fetchInvoices() {
  isLoadingInvoices.value = true
  invoiceError.value = null
  
  try {
    const response = await axios.get<Invoice[]>('billing/invoices/')
    invoices.value = response.data
  } catch (err: any) {
    console.error('Failed to fetch invoices:', err)
    invoiceError.value = err?.response?.data?.error || 'Failed to load invoice history'
  } finally {
    isLoadingInvoices.value = false
  }
}
const showModal = ref(false)
const btcpayReady = ref(false)
const billingCycle = ref<BillingCycle>('monthly')
const selectedPlan = ref<PlanDetails | null>(null)
const currentInvoice = ref<{
  url: string
  planType: string
  amount: string
} | null>(null)

// Plan prices
const planPrices: PlanPrices = {
  starter: {
    monthly: '10.00',
    annually: '10.00'
  },
  essential: {
    monthly: '499.00',
    annually: '399.00'
  },
  advanced: {
    monthly: '999.00',
    annually: '799.00'
  }
}

// Convert plan prices to PlanDetails format
const plansData = computed<Record<string, PlanDetails>>(() => ({
  starter: {
    name: 'Starter',
    price: planPrices.starter,
    features: {
      keywordsLimit: 5,
      scanInterval: '24 hours',
      platforms: '5 major cannabis platforms'
    }
  },
  essential: {
    name: 'Essential',
    price: planPrices.essential,
    features: {
      keywordsLimit: 10,
      scanInterval: '12 hours',
      platforms: 'top 10 cannabis platforms'
    }
  },
  advanced: {
    name: 'Advanced',
    price: planPrices.advanced,
    features: {
      keywordsLimit: 25,
      scanInterval: '6 hours',
      platforms: 'all cannabis platforms'
    }
  }
}))

const handleModalClose = () => {
  showModal.value = false
  currentInvoice.value = null
}

// BTCPay script loading
function loadBTCPayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://btcpay978166.lndyn.com/modal/btcpay.js'
    script.async = true
    
    // Get nonce from existing script
    const nonce = document.querySelector('script[nonce]')?.getAttribute('nonce')
    if (nonce) {
      script.setAttribute('nonce', nonce)
    }

    script.onload = () => {
      if (!window.btcpay) {
        reject(new Error('BTCPay script loaded but btcpay object not found'))
        return
      }
      window.btcpay.setApiUrlPrefix('https://btcpay978166.lndyn.com')
      btcpayReady.value = true
      resolve()
    }

    script.onerror = () => {
      reject(new Error('Failed to load BTCPay script'))
    }

    document.head.appendChild(script)
  })
}

// Load BTCPay on mount
onMounted(async () => {
  try {
    await loadBTCPayScript()
  } catch (err) {
    console.error('BTCPay initialization error:', err)
    error.value = {
      error: 'Failed to initialize payment system. Please refresh and try again.'
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  const script = document.querySelector('script[src*="btcpay.js"]')
  if (script) {
    script.remove()
  }
})

// 5. Methods
async function handleUpgrade(planType: string, billingCycle: 'monthly' | 'annually' = 'annually') {
  error.value = null

  // Check BTCPay readiness first
  if (!btcpayReady.value) {
    error.value = {
      error: 'Payment system not ready. Please refresh and try again.'
    }
    return
  }

  // Set selected plan
  selectedPlan.value = plansData.value[planType as keyof typeof plansData.value]

  // Show modal immediately with loading state
  currentInvoice.value = {
    url: '',
    planType: planType,
    amount: planPrices[planType][billingCycle]
  }
  showModal.value = true
  isLoading.value = true

  try {
    const response = await axios.post<InvoiceData>('billing/create-invoice/', {
      plan_type: planType,
      billing_cycle: billingCycle
    })
    
    if (!response.data.invoiceUrl) {
      console.error('No invoice URL in response')
      error.value = {
        error: 'Invalid invoice response. Please try again.'
      }
      return
    }

    // Update invoice URL after successful API call
    currentInvoice.value = {
      url: response.data.invoiceUrl,
      planType: planType,
      amount: planPrices[planType][billingCycle]
    }
  } catch (err: any) {
    const errorData = err?.response?.data
    if (errorData?.error) {
      error.value = {
        error: errorData.error,
        details: errorData.details
      }
    } else {
      error.value = {
        error: 'Failed to create invoice. Please try again.'
      }
    }
    console.error('Billing error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Subscription Header -->
      <SubscriptionHeader
        v-model:billingCycle="billingCycle"
        :selected-plan="selectedPlan"
        :subscription-data="subscriptionData"
        class="mb-8"
      />

    <!-- Payment History Section -->
    <div class="bg-gray-50/80 rounded-lg p-6 shadow-sm border border-gray-100 mb-8">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: #F7931A">
            <Bitcoin class="w-5 h-5 text-white" />
          </div>
          <h2 class="text-lg font-medium text-gray-800">Payment History</h2>
        </div>
        <span class="text-sm text-gray-500">Last 30 days</span>
      </div>

      <div class="border-t border-gray-200/50 pt-4">
        <!-- Loading State -->
        <div v-if="isLoadingInvoices" class="flex items-center justify-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p class="ml-3 text-sm text-gray-600">Loading payment history...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="invoiceError" class="text-center py-12">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle class="h-6 w-6 text-red-600" />
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Failed to load payment history</h3>
          <p class="mt-1 text-sm text-gray-500">{{ invoiceError }}</p>
        </div>

        <!-- Invoice List -->
        <div v-else-if="invoices.length" class="divide-y divide-gray-200/50">
          <div
            v-for="invoice in invoices"
            :key="invoice.btcpay_id"
            class="border-t border-gray-200/50 pt-4 first:border-t-0 first:pt-0"
          >
            <div class="flex items-center justify-between">
              <div class="space-y-1">
                <div class="font-medium text-gray-800">
                  {{ invoice.plan_type.charAt(0).toUpperCase() + invoice.plan_type.slice(1) }} Plan
                  ({{ invoice.billing_cycle }})
                </div>
                <div class="text-sm text-gray-500 flex items-center space-x-2">
                  <span>{{ new Date(invoice.created_at).toLocaleString() }}</span>
                  <span>•</span>
                  <div class="flex items-center space-x-1">
                    <div class="w-4 h-4 rounded-full flex items-center justify-center" style="background-color: #F7931A">
                      <Bitcoin class="w-2.5 h-2.5 text-white" />
                    </div>
                    <span>Bitcoin</span>
                  </div>
                  <span>•</span>
                  <span>ID: {{ invoice.btcpay_id }}</span>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <span class="font-medium">${{ invoice.amount_usd }}</span>
                <span
                  class="px-2 py-1 text-sm rounded"
                  :class="invoice.status === 'paid' || invoice.status === 'new'
                    ? 'bg-green-100/60 text-green-600'
                    : 'bg-red-100/60 text-red-600'"
                >
                  {{ invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <Bitcoin class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No payment history</h3>
          <p class="mt-1 text-sm text-gray-500">
            Your payment history will appear here after your first transaction.
          </p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">
            Payment System Notice
          </h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>{{ error.error }}</p>
            <p v-if="error.details" class="mt-2 text-xs font-mono bg-yellow-100 p-2 rounded">
              {{ error.details }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Plans Grid -->
    <div class="grid md:grid-cols-3 gap-8">
      <!-- Starter Plan -->
      <div
        class="flex flex-col rounded-lg border transition-all duration-300 overflow-hidden hover:shadow-lg hover:scale-102 bg-blue-50"
      >
        <div class="bg-blue-100 p-4">
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center space-x-3">
              <Shield class="h-10 w-10 text-blue-600" />
              <div>
                <h3 class="text-xl font-bold text-gray-800">Starter</h3>
                <p class="text-sm text-gray-600">For brands just getting started</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-sm font-semibold bg-blue-200 text-blue-800">
              Launch
            </span>
          </div>
        </div>

        <div class="flex-grow p-4">
          <div class="text-center mb-6">
            <div class="text-4xl font-bold mb-4 text-gray-900">
              ${{ billingCycle === 'annually' ? '199' : '249' }}
              <span class="text-base font-normal text-gray-600">/month</span>
            </div>
            <div v-if="billingCycle === 'annually'" class="text-xs text-gray-500 -mt-1">
              (billed annually)
            </div>
            <div class="mb-2"></div>
            <template v-if="billingCycle === 'annually'">
              <div class="text-sm text-gray-500">
                <span class="line-through">${{ planPrices.starter.monthly }}/month</span> when paying monthly
              </div>
            </template>
            <template v-else>
              <div class="text-sm text-gray-500">
                ${{ planPrices.starter.annually }}/month when billed annually
              </div>
            </template>
            <div class="text-base font-bold text-green-600 mt-1">
              {{ billingCycle === 'annually'
                ? 'Save $600/year'
                : 'Switch to annual billing to save $600'
              }}
            </div>
          </div>

          <div class="mb-6 px-2">
            <div class="text-center mb-4">
              <button
                @click="toggleFeatures('starter')"
                class="text-sm text-blue-600 hover:text-blue-700 focus:outline-none inline-flex items-center space-x-1"
              >
                <span>{{ expandedFeatures.starter ? 'Show Less' : 'Show All Features' }}</span>
                <ChevronDown
                  class="h-4 w-4 transition-transform duration-200"
                  :class="{ 'transform rotate-180': expandedFeatures.starter }"
                />
              </button>
            </div>
            <ul
              class="space-y-4 text-base overflow-hidden transition-all duration-300"
              :style="{ maxHeight: expandedFeatures.starter ? '1000px' : '140px' }"
            >
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />
                <span class="text-gray-700 font-semibold">Review scanning every 24 hours</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />
                <span class="text-gray-700">Track up to 5 keywords</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />
                <span class="text-gray-700">Monitor 5 major cannabis platforms</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />
                <span class="text-gray-700">Email alerts for reviews</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />
                <span class="text-gray-700">Basic analytics</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />
                <span class="text-gray-700">Standard email support</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <div class="px-6">
            <img
              :src="starterIllustration"
              alt="Starter plan features illustration"
              class="max-w-[250px] h-auto mx-auto block opacity-60"
              :class="{
                '[filter:hue-rotate(90deg)_saturate(200%)_brightness(1.3)]': true
              }"
            />
          </div>
          <div class="px-6 py-3">
            <button
              @click="handleUpgrade('starter', billingCycle)"
              :disabled="isLoading"
              class="block w-full py-3 text-center rounded-lg text-lg font-semibold transition-colors bg-blue-600 hover:bg-blue-700 text-white"
            >
              <span v-if="isLoading">Processing...</span>
              <span v-else>Get Started</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Essential Plan -->
      <div
        class="flex flex-col rounded-lg border border-yellow-300 border-2 shadow-lg bg-yellow-50 transition-all duration-300 overflow-hidden hover:shadow-lg hover:scale-102"
      >
        <div class="bg-yellow-100 p-4">
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center space-x-3">
              <Leaf class="h-10 w-10 text-yellow-600" />
              <div>
                <h3 class="text-xl font-bold text-gray-800">Essential</h3>
                <p class="text-sm text-gray-600">For those ready to grow</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-400 text-yellow-800">
              Growth
            </span>
          </div>
        </div>
        
        <div class="flex-grow p-4">
          <div class="text-center mb-6">
            <div class="text-3xl font-bold mb-4 text-gray-900">
              ${{ billingCycle === 'annually' ? '399' : '499' }}
              <span class="text-base font-normal text-gray-600">/month</span>
            </div>
            <div v-if="billingCycle === 'annually'" class="text-xs text-gray-500 -mt-1">
              (billed annually)
            </div>
            <template v-if="billingCycle === 'annually'">
              <div class="text-sm text-gray-500">
                <span class="line-through">${{ planPrices.essential.monthly }}/month</span> when paying monthly
              </div>
            </template>
            <template v-else>
              <div class="text-sm text-gray-500">
                ${{ planPrices.essential.annually }}/month when billed annually
              </div>
            </template>
            <div class="text-base font-bold text-green-600 mt-1">
              {{ billingCycle === 'annually'
                ? 'Save $1,200/year'
                : 'Switch to annual billing to save $1,200'
              }}
            </div>
          </div>

          <div class="mb-6 px-2">
            <div class="text-center mb-4">
              <button
                @click="toggleFeatures('essential')"
                class="text-sm text-yellow-600 hover:text-yellow-700 focus:outline-none inline-flex items-center space-x-1"
              >
                <span>{{ expandedFeatures.essential ? 'Show Less' : 'Show All Features' }}</span>
                <ChevronDown
                  class="h-4 w-4 transition-transform duration-200"
                  :class="{ 'transform rotate-180': expandedFeatures.essential }"
                />
              </button>
            </div>
            <ul
              class="space-y-4 text-base overflow-hidden transition-all duration-300"
              :style="{ maxHeight: expandedFeatures.essential ? '1000px' : '140px' }"
            >
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-yellow-500" />
                <span class="text-gray-700 font-semibold">Review scanning every 12 hours</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-yellow-500" />
                <span class="text-gray-700">Track up to 10 keywords</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-yellow-500" />
                <span class="text-gray-700">Monitor top 10 cannabis platforms</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-yellow-500" />
                <span class="text-gray-700">Email alerts for reviews</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-yellow-500" />
                <span class="text-gray-700">Basic analytics with CSV export</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-yellow-500" />
                <span class="text-gray-700">Automated forum posting</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-yellow-500" />
                <span class="text-gray-700">Priority email support</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <div class="px-6">
            <img
              :src="essentialIllustration"
              alt="Essential plan features illustration"
              class="max-w-[250px] h-auto mx-auto block opacity-60"
              :class="{
                '[filter:hue-rotate(240deg)_saturate(200%)_brightness(1.2)]': true
              }"
            />
          </div>
          <div class="px-6 py-3">
            <button
              @click="handleUpgrade('essential', billingCycle)"
              :disabled="isLoading"
              class="block w-full py-3 text-center rounded-lg text-lg font-semibold transition-colors bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
            >
              <span v-if="isLoading">Processing...</span>
              <span v-else>Upgrade Now</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Advanced Plan -->
      <div
        class="flex flex-col rounded-lg border transition-all duration-300 overflow-hidden hover:shadow-lg hover:scale-102 bg-green-50"
      >
        <div class="bg-green-100 p-4">
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center space-x-3">
              <Zap class="h-10 w-10 text-green-600" />
              <div>
                <h3 class="text-xl font-bold text-gray-800">Advanced</h3>
                <p class="text-sm text-gray-600">For established market leaders</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-sm font-semibold bg-green-200 text-green-800">
              Scale
            </span>
          </div>
        </div>

        <div class="flex-grow p-4">
          <div class="text-center mb-6">
            <div class="text-4xl font-bold mb-4 text-gray-900">
              ${{ billingCycle === 'annually' ? '799' : '999' }}
              <span class="text-base font-normal text-gray-600">/month</span>
            </div>
            <div v-if="billingCycle === 'annually'" class="text-xs text-gray-500 -mt-1">
              (billed annually)
            </div>
            <template v-if="billingCycle === 'annually'">
              <div class="text-sm text-gray-500">
                <span class="line-through">${{ planPrices.advanced.monthly }}/month</span> when paying monthly
              </div>
            </template>
            <template v-else>
              <div class="text-sm text-gray-500">
                ${{ planPrices.advanced.annually }}/month when billed annually
              </div>
            </template>
            <div class="text-base font-bold text-green-600 mt-1">
              {{ billingCycle === 'annually'
                ? 'Save $2,400/year'
                : 'Switch to annual billing to save $2,400'
              }}
            </div>
          </div>

          <div class="mb-6 px-2">
            <div class="text-center mb-4">
              <button
                @click="toggleFeatures('advanced')"
                class="text-sm text-green-600 hover:text-green-700 focus:outline-none inline-flex items-center space-x-1"
              >
                <span>{{ expandedFeatures.advanced ? 'Show Less' : 'Show All Features' }}</span>
                <ChevronDown
                  class="h-4 w-4 transition-transform duration-200"
                  :class="{ 'transform rotate-180': expandedFeatures.advanced }"
                />
              </button>
            </div>
            <ul
              class="space-y-4 text-base overflow-hidden transition-all duration-300"
              :style="{ maxHeight: expandedFeatures.advanced ? '1000px' : '140px' }"
            >
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-green-500" />
                <span class="text-gray-700 font-semibold">Review scanning every 6 hours</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-green-500" />
                <span class="text-gray-700">Track up to 25 keywords</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-green-500" />
                <span class="text-gray-700">Monitor all cannabis platforms</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-green-500" />
                <span class="text-gray-700">Email & push alerts for reviews</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-green-500" />
                <span class="text-gray-700">Advanced analytics with CSV/PDF exports</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-green-500" />
                <span class="text-gray-700">AI chat assistant</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-green-500" />
                <span class="text-gray-700">Automated forum posting</span>
              </li>
              <li class="flex items-center">
                <Check class="h-5 w-5 mr-2 flex-shrink-0 text-green-500" />
                <span class="text-gray-700">Priority live chat support</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <div class="px-6">
            <img
              :src="advancedIllustration"
              alt="Advanced plan features illustration"
              class="max-w-[250px] h-auto mx-auto block opacity-60"
            />
          </div>
          <div class="px-6 py-3">
            <button
              @click="handleUpgrade('advanced', billingCycle)"
              :disabled="isLoading"
              class="block w-full py-3 text-center rounded-lg text-lg font-semibold transition-colors bg-green-600 hover:bg-green-700 text-white"
            >
              <span v-if="isLoading">Processing...</span>
              <span v-else>Get Started</span>
            </button>
          </div>
        </div>
      </div>

    </div>

      <!-- BTCPay Modal -->
      <BTCPayModal
        v-if="currentInvoice && showModal"
        :show="true"
        :invoice-url="currentInvoice.url"
        :plan-type="currentInvoice.planType"
        :amount="currentInvoice.amount"
        :loading="isLoading"
        @close="handleModalClose"
      />
    </div>
  </div>
</template>