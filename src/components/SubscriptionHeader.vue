<script setup lang="ts">
// 1. Vue imports
import { computed } from 'vue'

// 2. Component imports
import { Calendar, BarChart3, CreditCard, Bitcoin } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'

// 3. Type definitions
interface SubscriptionData {
  status: 'active' | 'inactive'
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

// 4. Props and emits
const props = defineProps<{
  billingCycle: 'monthly' | 'annually'
  selectedPlan: PlanDetails | null
  subscriptionData?: SubscriptionData
}>()

const emit = defineEmits<{
  (e: 'update:billingCycle', value: 'monthly' | 'annually'): void
}>()

// 5. State management
const currentSubscription = computed(() => props.subscriptionData || {
  status: 'inactive',
  currentPlan: props.selectedPlan?.name || 'No Plan',
  renewalDate: '',
  billingCycle: props.billingCycle,
  lastPayment: null,
  usage: { keywords: 0, keywordsLimit: props.selectedPlan?.features.keywordsLimit || 0 }
})

const isActive = computed(() => currentSubscription.value.status === 'active')

const planPrices = {
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

const currentPlanInfo = computed(() => {
  const currentPlan = currentSubscription.value.currentPlan.toLowerCase() as keyof typeof planPrices
  return {
    name: currentSubscription.value.currentPlan,
    price: currentPlan in planPrices ? planPrices[currentPlan][props.billingCycle] : '0.00',
    keywordsUsed: currentSubscription.value.usage.keywords,
    keywordsLimit: currentSubscription.value.usage.keywordsLimit,
    usagePercentage: currentSubscription.value.usage.keywordsLimit > 0
      ? (currentSubscription.value.usage.keywords / currentSubscription.value.usage.keywordsLimit) * 100
      : 0
  }
})

// Calculate days until next payment
const nextPaymentDate = computed(() => {
  if (!currentSubscription.value.renewalDate) return null
  return new Date(currentSubscription.value.renewalDate)
})

const daysUntilPayment = computed(() => {
  if (!nextPaymentDate.value) return null
  const today = new Date()
  const diffTime = nextPaymentDate.value.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// 6. Methods
const toggleBillingCycle = () => {
  emit('update:billingCycle', props.billingCycle === 'monthly' ? 'annually' : 'monthly')
}
</script>

<template>
  <div class="w-full space-y-6">
    <!-- Top Section with Plan Selection Header -->
    <div class="bg-gray-50/80 rounded-lg p-6 shadow-sm border border-gray-100">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <div class="p-2 bg-blue-100/50 rounded-lg">
            <CreditCard class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 class="text-xl font-semibold text-gray-800">Choose Your Plan</h1>
            <p class="text-sm text-gray-500">Choose from our plans below to get started with VueLeaf.</p>
          </div>
        </div>
        
        <div class="flex items-center bg-gray-200/50 rounded-full p-1">
          <button 
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              props.billingCycle === 'monthly' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600'
            ]"
            @click="toggleBillingCycle"
          >
            Monthly
          </button>
          <button 
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              props.billingCycle === 'annually' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600'
            ]"
            @click="toggleBillingCycle"
          >
            Annually
            <span class="ml-1 px-1.5 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded-full">-20%</span>
          </button>
        </div>
      </div>

      <!-- Info Status Row -->
      <div class="mt-6 flex divide-x divide-gray-200">
        <!-- Current Plan Status -->
        <div class="flex-1 px-4 first:pl-0 last:pr-0">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-sm font-medium text-gray-600">Current Plan</h2>
            <div class="p-1 bg-slate-100 rounded">
              <BarChart3 class="w-4 h-4 text-slate-600" />
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-baseline">
              <div class="flex items-center gap-2">
                <div class="text-lg font-medium text-gray-800">{{ currentPlanInfo.name }}</div>
                <span 
                  :class="[
                    'px-2 py-1 text-xs rounded',
                    isActive ? 'bg-green-100/60 text-green-600' : 'bg-gray-100/60 text-gray-600'
                  ]"
                >
                  {{ isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="flex items-center gap-1.5 text-sm text-gray-500">
                <span class="w-1.5 h-1.5 rounded-full" :class="isActive ? 'bg-green-400' : 'bg-gray-400'"></span>
                {{ isActive ? 'All systems online' : 'Inactive' }}
              </div>
            </div>
            <div class="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                class="absolute top-0 left-0 h-full bg-slate-400 rounded-full transition-all duration-500 ease-out"
                :style="{ width: isActive ? '100%' : '0%' }"
              />
            </div>
          </div>
        </div>

        <!-- Next Payment Status -->
        <div class="flex-1 px-4 first:pl-0 last:pr-0">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-sm font-medium text-gray-600">Next Payment</h2>
            <div class="p-1 bg-slate-100 rounded">
              <Calendar class="w-4 h-4 text-slate-600" />
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-baseline">
              <div class="text-lg font-medium text-gray-800">${{ currentPlanInfo.price }}</div>
              <div class="text-sm text-gray-500" v-if="nextPaymentDate">
                due {{ nextPaymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
                <template v-if="daysUntilPayment"> • {{ daysUntilPayment }} days</template>
              </div>
            </div>
            <div class="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                class="absolute top-0 left-0 h-full bg-slate-400 rounded-full transition-all duration-500 ease-out"
                :style="{ width: `${isActive ? (daysUntilPayment ? (30 - daysUntilPayment) / 30 * 100 : 0) : 0}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Keywords Status -->
        <div class="flex-1 px-4 first:pl-0 last:pr-0">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-sm font-medium text-gray-600">Keywords Used</h2>
            <div class="p-1 bg-slate-100 rounded">
              <BarChart3 class="w-4 h-4 text-slate-600" />
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-baseline">
              <div class="text-lg font-medium text-gray-800">
                {{ currentPlanInfo.keywordsUsed }} 
                <span class="text-gray-400 text-sm font-normal">/ {{ currentPlanInfo.keywordsLimit }}</span>
              </div>
              <div class="text-sm text-gray-500">
                {{ currentPlanInfo.keywordsLimit - currentPlanInfo.keywordsUsed }} remaining
              </div>
            </div>
            <div class="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                class="absolute top-0 left-0 h-full bg-slate-400 rounded-full transition-all duration-500 ease-out"
                :style="{ width: `${currentPlanInfo.usagePercentage}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Payment History Section -->
    <div v-if="currentSubscription.lastPayment" class="bg-gray-50/80 rounded-lg p-6 shadow-sm border border-gray-100">
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
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <div class="font-medium text-gray-800">{{ currentPlanInfo.name }} Plan ({{ currentSubscription.billingCycle }})</div>
            <div class="text-sm text-gray-500 flex items-center space-x-2">
              <span>{{ new Date(currentSubscription.lastPayment.date).toLocaleString() }}</span>
              <span>•</span>
              <div class="flex items-center space-x-1">
                <div class="w-4 h-4 rounded-full flex items-center justify-center" style="background-color: #F7931A">
                  <Bitcoin class="w-2.5 h-2.5 text-white" />
                </div>
                <span>Bitcoin</span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="font-medium">${{ currentSubscription.lastPayment.amount.toFixed(2) }}</span>
            <span class="px-2 py-1 bg-green-100/60 text-green-600 text-sm rounded">Paid</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>