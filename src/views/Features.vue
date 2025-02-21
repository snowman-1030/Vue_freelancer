<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Shield, AlertTriangle, BarChart2, MessageCircle, Search, TrendingUp, Brain, Bell, Zap } from 'lucide-vue-next'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Footer from '@/components/home/Footer.vue'
import Navigation from '@/components/home/Navigation.vue'

// Types
interface Feature {
  title: string
  description: string
  icon: any
}

// State
const currentImage = ref(0)
import mentionsImage from '@/assets/images/features/mentions.png'
import trackingImage from '@/assets/images/features/tracking.png'

const images = [
  mentionsImage,
  trackingImage
]

// Features data
const features: Feature[] = [
  {
    title: "24/7 Brand Monitoring",
    description: "Instant alerts when your brand is mentioned across 30+ cannabis platforms, social media, and review sites",
    icon: AlertTriangle,
  },
  {
    title: "AI-Powered Sentiment Analysis",
    description: "Turn customer opinions into actionable insights with our advanced sentiment analysis that understands cannabis industry context",
    icon: BarChart2,
  },
  {
    title: "Streamlined Review Management",
    description: "Respond to brand mentions across all platforms from one dashboard, with AI-suggested responses that maintain compliance",
    icon: MessageCircle,
  },
  {
    title: "Proactive Brand Protection",
    description: "Identify and address potential reputation issues before they escalate, with fraud detection and competitor monitoring",
    icon: Shield,
  }
]

const intelligentMonitoringFeatures: Feature[] = [
  {
    title: "AI-Powered Understanding",
    description: "Our AI speaks the language of cannabis, understanding industry slang, trends, and context in real-time. By learning from thousands of daily conversations, we get smarter at protecting your brand every day.",
    icon: Brain,
  },
  {
    title: "Intelligent Alerts",
    description: "Get instant, contextual alerts that matter. Our AI analyzes sentiment, urgency, and potential impact in every mention of your brand. No noise, no missed opportunities - just actionable insights.",
    icon: Bell,
  },
  {
    title: "Predictive Insights",
    description: "Stop problems before they start. Our advanced AI identifies emerging trends and potential issues, giving you time to act rather than react. Turn prediction into protection for your brand's reputation.",
    icon: Zap,
  },
]

// Methods
onMounted(() => {
  const interval = setInterval(() => {
    currentImage.value = (currentImage.value + 1) % images.length
  }, 5000)

  return () => clearInterval(interval)
})
</script>

<template>
  <div class="min-h-screen bg-white font-sans">
    <!-- Navigation -->
    <Navigation />

    <!-- Hero Section -->
    <div class="bg-green-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:py-24 md:pb-28 py-10 pb-10">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div class="md:text-left  text-center">
            <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold text-green-900 mb-6 leading-tight tracking-tight">
              Elevate Your <br class="hidden sm:inline" />
              Cannabis Brand <br class="hidden sm:inline" />
              Protection
            </h1>
            <p class="text-md md:text-xl text-gray-700 mb-8 max-w-2xl text-center md:text-start">
              Harness the power of AI-driven insights to protect and grow your reputation in the dynamic cannabis
              market.
            </p>
            <Button
              class="bg-yellow-400 text-yellow-900 md:px-8 md:py-6 min-h-[4rem] rounded-md text-md md:text-xl font-semibold hover:bg-yellow-500 transition-colors px-4 py-3">
              Get Protected
            </Button>
          </div>
          <div class="flex justify-center">
            <div class="relative">
              <div class="absolute inset-0 bg-green-200 rounded-full filter blur-3xl opacity-50"></div>
              <img src="/src/assets/images/features/growth.png" alt="Brand Growth Illustration"
                class="h-auto max-w-full mx-auto relative z-10" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <section class="md:py-24 bg-white py-10">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class=" mb-16">
          <div class="flex flex-col  mb-8">
            <div class="flex items-center justify-center mx-auto md:mx-0">
              <div class="w-16 h-1  bg-green-500 mb-6"></div>
            </div>
            <h2 class="md:text-4xl font-bold text-green-800 mb-4 text-3xl text-center">
              Your Brand's Digital Guardian
            </h2>
            <p class="md:text-xl text-gray-700 text-md text-center">
              Complete visibility and control over your online presence
            </p>
          </div>
        </div>
        <div class="grid md:grid-cols-2 gap-8">
          <Card v-for="(feature, index) in features" :key="index"
            class="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div class="p-0">
              <div class="flex items-stretch">
                <div :class="[
                  'w-2',
                  index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-purple-500' :
                        'bg-green-500'
                ]"></div>
                <div class="flex-grow p-6">
                  <div class="flex items-center mb-4">
                    <div :class="[
                      'rounded-full p-3 mr-4',
                      index === 0 ? 'bg-yellow-100 text-yellow-500' :
                        index === 1 ? 'bg-blue-100 text-blue-500' :
                          index === 2 ? 'bg-purple-100 text-purple-500' :
                            'bg-green-100 text-green-500'
                    ]">
                      <component :is="feature.icon" class="sm:h-6 sm:w-6 h-5 w-5" />
                    </div>
                    <h3 class="sm:text-xl font-semibold text-green-800 text-md">{{ feature.title }}</h3>
                  </div>
                  <p class="text-gray-600 text-center">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>

    <!-- Dashboard Screenshots Section -->
    <section class="md:py-24 bg-gradient-to-b from-green-50 to-white py-10">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class=" mb-16">
          <div class="flex flex-col  mb-8">
            <!-- <div class="w-16 h-1 bg-green-500 mb-6"></div> -->
            <div class="flex items-center justify-center mx-auto md:mx-0">
              <div class="w-16 h-1  bg-green-500 mb-6"></div>
            </div>
            <h2 class="md:text-4xl font-bold text-green-800 md:mb-6 text-3xl mb-0 text-center ">
              Comprehensive Monitoring Tools
            </h2>
          </div>
          <p class="md:text-xl text-gray-700 md:mb-12 mb-8 text-md text-center ">
            Stay on top of your online presence with our powerful tracking and analysis tools.
          </p>
        </div>

        <!-- Dashboard Images -->
        <div class="relative w-full sm:h-[400px] md:h-[600px] overflow-hidden rounded-lg shadow-lg h-[300px]">
          <img v-for="(src, index) in images" :key="src" :src="src" :alt="`Dashboard ${index + 1}`"
            class="absolute top-0 left-0 w-full h-full md:object-cover transition-opacity duration-1000 object-fit"
            :class="index === currentImage ? 'opacity-100' : 'opacity-0'" />
        </div>

        <!-- Analytics Section -->
        <div class="mt-24">
          <div class="grid md:grid-cols-5 gap-12 items-center">
            <div class="md:col-span-3">
              <div class="flex flex-col text-center md:text-start mb-8">
                <!-- <div class="w-16 h-1 bg-green-500 mb-6"></div> -->
                <div class="flex items-center justify-start mx-auto md:mx-0">
                  <div class="w-16 h-1  bg-green-500 mb-6"></div>
                </div>
                <h3 class="text-3xl font-bold text-green-800 mb-6 text-center md:text-start">
                  Smart Cannabis Analytics
                </h3>
                <p class="md:text-xl text-gray-700 mb-8 text-md text-center md:text-start">
                  Get deep visibility into your brand's performance with our comprehensive tracking tools.
                </p>
              </div>
              <ul class="space-y-8">
                <li class="flex items-start">
                  <div class="bg-green-100 rounded-full p-2 mr-4 mt-1">
                    <Search class="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 class="text-lg font-semibold text-green-800 mb-2">Real-time brand monitoring</h4>
                    <p class="text-gray-600 text-start">Track customer feedback and brand mentions across all major
                      cannabis platforms</p>
                  </div>
                </li>
                <li class="flex items-start">
                  <div class="bg-blue-100 rounded-full p-2 mr-4 mt-1">
                    <BarChart2 class="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 class="text-lg font-semibold text-green-800 mb-2">Performance benchmarking</h4>
                    <p class="text-gray-600 text-start">Compare your metrics against top cannabis brands in your market
                    </p>
                  </div>
                </li>
                <li class="flex items-start">
                  <div class="bg-purple-100 rounded-full p-2 mr-4 mt-1">
                    <TrendingUp class="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 class="text-lg font-semibold text-green-800 mb-2">Data intelligence</h4>
                    <p class="text-gray-600 text-start">Transform cannabis market data into strategic advantages</p>
                  </div>
                </li>
              </ul>
            </div>
            <div class="md:col-span-2 flex justify-center">
              <img src="/src/assets/images/features/analytics.png" alt="Analytics Dashboard Illustration"
                class="max-w-md w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Intelligent Brand Monitoring Section -->
    <section class="md:py-24 bg-white py-10">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-16">
          <div class="flex flex-col mb-8">
            <div class="flex items-center justify-center mx-auto md:mx-0">
              <div class="w-16 h-1  bg-green-500 mb-6"></div>
            </div>
            <h2 class="md:text-4xl font-bold text-green-800 mb-6 text-3xl text-center">
              Industry-Leading Brand Intelligence
            </h2>
          </div>
          <p class="md:text-xl text-center text-gray-700 mb-16 text-md ">
            Your brand never sleeps, and neither does our AI. We understand cannabis conversations like no other
            platform can.
          </p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <Card v-for="(feature, index) in intelligentMonitoringFeatures" :key="index"
            class="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div class="p-0">
              <div class="flex items-stretch h-full">
                <div :class="[
                  'w-2',
                  index === 0 ? 'bg-green-500' :
                    index === 1 ? 'bg-blue-500' :
                      'bg-purple-500'
                ]"></div>
                <div class="flex-grow p-6">
                  <div class="flex flex-col items-center mb-4">
                    <div :class="[
                      'rounded-full p-4 mb-4',
                      index === 0 ? 'bg-green-100 text-green-500' :
                        index === 1 ? 'bg-blue-100 text-blue-500' :
                          'bg-purple-100 text-purple-500'
                    ]">
                      <component :is="feature.icon" class="h-8 w-8" />
                    </div>
                    <h3 class="text-xl font-semibold text-center text-green-800 mb-2">{{ feature.title }}</h3>
                  </div>
                  <p class="text-gray-600 md:text-center text-center">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <Footer />
  </div>
</template>
