<script setup lang="ts">
// 1. Vue imports
import { ref } from 'vue'

// 2. Component imports
import { Shield, Globe, MessageCircle, Check, Hash, Zap, Leaf } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import advancedIllustration from '../assets/images/illustrations/advanced-plan.png'
import starterIllustration from '../assets/images/illustrations/starter-plan.png'
import essentialIllustration from '../assets/images/illustrations/essential-plan.png'
import Navigation from '../components/home/Navigation.vue'
import Footer from '../components/home/Footer.vue'

// 3. Type definitions
type BillingCycle = 'monthly' | 'annually'

// 4. State management
const billingCycle = ref<BillingCycle>('monthly')

const pricingPlans = [
  {
    name: "Starter",
    price: {
      monthly: 249,
      annually: 199
    },
    description: "For brands just getting started",
    features: [
      "Review scanning every 24 hours",
      "Track up to 5 keywords",
      "Monitor 5 major cannabis platforms",
      "Email alerts for reviews",
      "Basic analytics",
      "Automated forum posting",
      "Standard email support"
    ],
    cta: "Get Started",
    icon: Shield,
    color: "bg-blue-100",
    tag: "Getting Started"
  },
  {
    name: "Essential",
    price: {
      monthly: 499,
      annually: 399
    },
    description: "Perfect for single-location brands",
    features: [
      "Review scanning every 12 hours",
      "Track up to 10 keywords",
      "Monitor top 10 cannabis platforms",
      "Email alerts for reviews",
      "Basic analytics with CSV export",
      "Automated forum posting",
      "Priority email support"
    ],
    cta: "Upgrade Now",
    highlighted: true,
    icon: Leaf,
    color: "bg-yellow-100",
    tag: "Most Popular"
  },
  {
    name: "Advanced",
    price: {
      monthly: 999,
      annually: 799
    },
    description: "For growing cannabis brands",
    features: [
      "Review scanning every 6 hours",
      "Track up to 25 keywords",
      "Monitor all cannabis platforms",
      "Email & push alerts for reviews",
      "Advanced analytics with CSV/PDF exports",
      "AI chat assistant",
      "Automated forum posting",
      "Priority live chat support"
    ],
    cta: "Get Started",
    icon: Zap,
    color: "bg-green-100",
    tag: "Full Featured"
  }
]

const platforms = [
  { name: "Autoflower", icon: Globe },
  { name: "BeanBasement", icon: Shield },
  { name: "GrowersNetwork", icon: Hash },
  { name: "GrowWeedEasy", icon: Globe },
  { name: "Homegrown", icon: Shield },
  { name: "ICMag", icon: Hash },
  { name: "ILGM", icon: Globe },
  { name: "420 Magazine", icon: Shield },
  { name: "MarijuanaPassion", icon: Hash },
  { name: "Overgrow", icon: Globe },
  { name: "Percy's Grow Room", icon: Shield },
  { name: "PhenoHunter", icon: Hash },
  { name: "Reddit", icon: MessageCircle },
  { name: "RollItUp", icon: Globe },
  { name: "420SA", icon: Shield },
  { name: "THCFarmer", icon: Hash },
  { name: "UK420", icon: Globe }
]

const faqs = [
  {
    question: "What subscription plans do you offer?",
    answer: "We offer three flexible plans: Starter, Professional, and Enterprise. Each plan is designed to meet different business needs and scales with your brand's growth."
  },
  {
    question: "Can I upgrade or downgrade my plan at any time?",
    answer: "Yes, you can change your plan at any time. Plan changes take effect immediately, and your billing will be prorated accordingly."
  },
  {
    question: "What payment methods do you accept?",
    answer: "Due to current banking regulations in the cannabis industry, we currently accept Bitcoin as our payment method. We're happy to guide you through the payment process if you're new to cryptocurrency transactions."
  },
  {
    question: "Do you offer discounts for annual subscriptions?",
    answer: "Yes, you can save up to 20% by choosing annual billing over monthly billing on any of our plans."
  },
  {
    question: "What happens to my data if I cancel my subscription?",
    answer: "You'll have 30 days to export your data after cancellation. After this period, your data will be securely deleted from our systems."
  },
  {
    question: "How frequently does VueLeaf scan for new reviews?",
    answer: "Scanning frequency varies by plan - Starter scans every 24 hours, Essential every 12 hours, and Advanced every 6 hours for the most up-to-date brand monitoring."
  },
  {
    question: "Do you require a long-term commitment?",
    answer: "No, our standard plans are billed monthly with no long-term commitment required. Annual billing is available for additional savings."
  }
]

const selectedFaq = ref('')

const toggleFaq = (index: string) => {
  selectedFaq.value = selectedFaq.value === index ? '' : index
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <Navigation />
    <main class="flex-grow">
      <!-- Hero Section -->
      <section class="bg-gradient-to-br from-gray-100 to-green-100 py-24">
        <div class="container mx-auto text-center px-4">
          <h1 class="text-4xl md:text-6xl font-bold mb-8 text-gray-900">
            Join the cannabis brands who understand that reputation is everything.
          </h1>
          <p class="text-xl md:text-2xl max-w-3xl mx-auto mb-12 text-gray-700">
            Simple, transparent pricing for powerful brand protection
          </p>
          <div class="flex justify-center space-x-6">
            <RouterLink
              to="/register"
              class="bg-green-600 text-white hover:bg-green-700 px-8 py-4 text-lg rounded-lg font-semibold shadow-md transition-colors"
            >
              Get Started
            </RouterLink>
            <button
              class="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg rounded-lg font-semibold transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      <!-- Trust Stats Row -->
      <section class="bg-white py-12 border-b border-gray-200">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="flex flex-col items-center text-center">
              <h3 class="text-3xl font-bold text-gray-900 mb-2">10,000+</h3>
              <p class="text-gray-600">Reviews Monitored Daily</p>
            </div>
            <div class="flex flex-col items-center text-center">
              <h3 class="text-3xl font-bold text-gray-900 mb-2">24/7</h3>
              <p class="text-gray-600">Brand Protection & Alerts</p>
            </div>
            <div class="flex flex-col items-center text-center">
              <h3 class="text-3xl font-bold text-gray-900 mb-2">50+</h3>
              <p class="text-gray-600">Cannabis Platforms Monitored</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing Plans -->
      <section class="py-12 bg-white">
        <div class="container mx-auto px-4">
          <!-- Billing Cycle Toggle -->
          <div class="flex justify-center items-center mb-12 space-x-4">
            <span class="text-base font-medium text-gray-600">Monthly</span>
            <button
              @click="billingCycle = billingCycle === 'monthly' ? 'annually' : 'monthly'"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="billingCycle === 'annually' ? 'bg-green-600' : 'bg-gray-200'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="billingCycle === 'annually' ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
            <span class="text-base font-medium text-gray-600">Annually</span>
          </div>

          <div class="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div
              v-for="(plan, index) in pricingPlans"
              :key="index"
              class="flex flex-col rounded-lg border transition-all duration-300 overflow-hidden"
              :class="{
                'border-yellow-300 border-2 shadow-lg scale-105 z-10 bg-yellow-50': plan.highlighted,
                'hover:shadow-lg hover:scale-102': !plan.highlighted,
                'bg-blue-50': plan.name === 'Starter',
                'bg-yellow-50': plan.name === 'Essential',
                'bg-green-50': plan.name === 'Advanced'
              }"
            >
              <div :class="[plan.color, 'p-6']">
                <div class="flex justify-between items-center mb-4">
                  <component :is="plan.icon" class="h-12 w-12" :class="{
                    'text-blue-600': plan.name === 'Starter',
                    'text-yellow-600': plan.name === 'Essential',
                    'text-green-600': plan.name === 'Advanced'
                  }" />
                  <span
                    class="px-3 py-1 rounded-full text-sm font-semibold"
                    :class="{
                      'bg-blue-200 text-blue-800': plan.name === 'Starter',
                      'bg-yellow-400 text-yellow-800': plan.name === 'Essential',
                      'bg-green-200 text-green-800': plan.name === 'Advanced'
                    }"
                  >
                    {{ plan.tag }}
                  </span>
                </div>
                <h3 class="text-2xl font-bold mb-2 text-gray-800">{{ plan.name }}</h3>
                <p class="text-gray-600">{{ plan.description }}</p>
              </div>

              <div class="flex-grow p-6">
                <div class="text-center mb-6">
                  <div class="text-4xl font-bold mb-4 text-gray-900">
                    <template v-if="typeof plan.price === 'object'">
                      ${{ billingCycle === 'annually' ? plan.price.annually : plan.price.monthly }}
                      <span class="text-base font-normal text-gray-600">/month</span>
                    </template>
                  </div>
                  <div v-if="billingCycle === 'annually'" class="text-xs text-gray-500 -mt-1">
                    (billed annually)
                  </div>
                  <template v-if="typeof plan.price === 'object'">
                    <template v-if="billingCycle === 'annually'">
                      <div class="text-sm text-gray-500">
                        <span class="line-through">${{ plan.price.monthly }}/month</span> when paying monthly
                      </div>
                    </template>
                    <template v-else>
                      <div class="text-sm text-gray-500">
                        ${{ plan.price.annually }}/month when billed annually
                      </div>
                    </template>
                    <div class="text-base font-bold text-green-600 mt-1">
                      {{ billingCycle === 'annually'
                        ? `Save $${(plan.price.monthly - plan.price.annually) * 12}`
                        : `Switch to annual billing to save $${(plan.price.monthly - plan.price.annually) * 12}`
                      }}
                    </div>
                  </template>
                </div>

                <ul class="space-y-4 text-base mb-6 px-2">
                  <li
                    v-for="(feature, featureIndex) in plan.features"
                    :key="featureIndex"
                    class="flex items-center"
                  >
                    <Check
                      class="h-5 w-5 mr-2 flex-shrink-0"
                      :class="{
                        'text-purple-500': plan.name === 'Enterprise',
                        'text-yellow-500': plan.highlighted,
                        'text-blue-500': plan.name === 'Starter',
                        'text-green-500': !plan.highlighted && plan.name !== 'Enterprise' && plan.name !== 'Starter'
                      }"
                    />
                    <span
                      class="text-gray-700"
                      :class="{
                        'font-semibold': featureIndex === 0
                      }"
                    >
                      {{ feature }}
                    </span>
                  </li>
                </ul>
              </div>

              <div>
               <div class="px-6 pb-1">
                 <img
                   :src="plan.name === 'Advanced' ? advancedIllustration : plan.name === 'Starter' ? starterIllustration : essentialIllustration"
                   alt="Advanced plan features illustration"
                   class="max-w-[250px] h-auto mx-auto block opacity-60"
                   :class="{
                     '[filter:hue-rotate(90deg)_saturate(200%)_brightness(1.3)]': plan.name === 'Starter',
                     '[filter:hue-rotate(240deg)_saturate(200%)_brightness(1.2)]': plan.name === 'Essential'
                   }"
                 />
               </div>
               <div class="px-6 py-3">
                 <RouterLink
                   to="/register"
                   class="block w-full py-3 text-center rounded-lg text-lg font-semibold transition-colors"
                   :class="{
                     'bg-blue-600 hover:bg-blue-700 text-white': plan.name === 'Starter',
                     'bg-yellow-400 hover:bg-yellow-500 text-yellow-900': plan.name === 'Essential',
                     'bg-green-600 hover:bg-green-700 text-white': plan.name === 'Advanced'
                   }"
                 >
                   {{ plan.cta }}
                 </RouterLink>
               </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Platforms Section -->
      <section class="py-24 bg-green-100 relative overflow-hidden">
        <div class="container mx-auto text-center px-4 relative z-10">
          <h2 class="text-4xl font-bold mb-6 text-gray-900 leading-tight">
            Monitor <span class="text-green-600">Every Platform</span> That Matters
          </h2>
          <p class="text-xl mb-12 text-gray-700 max-w-2xl mx-auto">
            Keep track of your brand across all major cannabis platforms with our comprehensive monitoring system.
          </p>
          <div class="flex flex-wrap justify-center gap-6">
            <div
              v-for="(platform, index) in platforms"
              :key="index"
              class="bg-white rounded-full px-6 py-3 text-lg font-medium text-gray-800 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-green-50 flex items-center space-x-2"
            >
              <component :is="platform.icon" class="h-6 w-6 text-gray-400" />
              <span>{{ platform.name }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="bg-gray-50 py-24">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold mb-12 text-center text-gray-900">
            Frequently Asked Questions
          </h2>
          <div class="max-w-3xl mx-auto">
            <div
              v-for="(faq, index) in faqs"
              :key="index"
              class="border-b border-gray-200"
            >
              <button
                class="w-full py-6 text-left flex justify-between items-center hover:text-green-600"
                @click="toggleFaq(`faq-${index}`)"
              >
                <span class="text-lg font-medium">{{ faq.question }}</span>
                <span class="transform transition-transform" :class="{
                  'rotate-180': selectedFaq === `faq-${index}`
                }">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div
                v-show="selectedFaq === `faq-${index}`"
                class="pb-6 text-gray-600"
              >
                {{ faq.answer }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action Section -->
      <section class="bg-gradient-to-br from-green-50 to-green-100 text-green-800 py-24">
        <div class="container mx-auto text-center px-4">
          <h2 class="text-4xl font-bold mb-6">Ready to Take Control of Your Brand's Reputation?</h2>
          <p class="text-xl mb-12 max-w-3xl mx-auto text-green-700">
            Join the leading cannabis brands using VueLeaf to monitor and improve their online presence.
          </p>
          <RouterLink
            to="/register"
            class="inline-block bg-green-600 text-white hover:bg-green-700 text-lg px-8 py-3 rounded-lg font-semibold shadow-md transition-colors"
          >
            Start Protecting Your Brand
          </RouterLink>
        </div>
      </section>
    </main>
    <Footer />
  </div>
</template>