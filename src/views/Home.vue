<script setup lang="ts">
import { Shield, MessageCircle, Star, ArrowRight, AlertTriangle } from 'lucide-vue-next'
import Navigation from '../components/home/Navigation.vue'
import AlertStrip from '../components/home/AlertStrip.vue'
import HeroSection from '../components/home/HeroSection.vue'
import FeaturesSection from '../components/home/FeaturesSection.vue'
import TrustedBy from '../components/home/TrustedBy.vue'
import RiskAlert from '../components/home/RiskAlert.vue'
import TestimonialsSection from '../components/home/TestimonialsSection.vue'
import MonitorPlatforms from '../components/home/MonitorPlatforms.vue'
import Footer from '../components/home/Footer.vue'

// Import platform icons
import weedmapsIcon from '@/assets/images/platforms/weedmaps.png'
import leaflyIcon from '@/assets/images/platforms/leafly.png'
import thcfarmerIcon from '@/assets/images/platforms/thcfarmer.png'
import redditIcon from '@/assets/images/platforms/reddit.png'
import instagramIcon from '@/assets/images/platforms/instagram.png'
import facebookIcon from '@/assets/images/platforms/facebook.png'

const features = [
  {
    title: "24/7 Brand Monitoring",
    description: "Real-time alerts for reviews across all major platforms",
    icon: AlertTriangle,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-500"
  },
  {
    title: "Reputation Defense",
    description: "Stop negative reviews from damaging your brand image",
    icon: Shield,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-500"
  },
  {
    title: "Customer Analytics",
    description: "Understand what drives positive and negative feedback",
    icon: MessageCircle,
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    iconColor: "text-purple-500"
  },
  {
    title: "Competitor Watch",
    description: "See how you stack up against competitors across all platforms",
    icon: ArrowRight,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconColor: "text-green-500"
  },
  {
    title: "Review Management",
    description: "Respond to customers quickly and compliantly",
    icon: MessageCircle,
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    iconColor: "text-orange-500"
  },
  {
    title: "Brand Protection",
    description: "Automated tools to defend your online reputation",
    icon: Star,
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    iconColor: "text-pink-500"
  }
]

const testimonials = [
  {
    quote: "Vueleaf has been a game-changer for our brand's online reputation. We've seen a 30% increase in positive reviews since using their platform.",
    author: "Jane Doe",
    company: "GreenGrow Cannabis",
    avatar: "/default-avatar.svg",
    rating: 5
  },
  {
    quote: "The real-time alerts and analytics have helped us address customer concerns faster than ever before. Highly recommended!",
    author: "John Smith",
    company: "Herbal Horizons",
    avatar: "/default-avatar.svg",
    rating: 5
  }
]

const platforms = [
  { name: "Weedmaps", icon: weedmapsIcon },
  { name: "Leafly", icon: leaflyIcon },
  { name: "THCFarmer", icon: thcfarmerIcon },
  { name: "Reddit", icon: redditIcon },
  { name: "Instagram", icon: instagramIcon },
  { name: "Facebook", icon: facebookIcon }
]
</script>

<template>
  <div class="min-h-screen bg-white font-sans">
    <Navigation />
    <AlertStrip />
    <HeroSection />
    <FeaturesSection :features="features" />
    <TrustedBy />
    <RiskAlert />
    <TestimonialsSection :testimonials="testimonials" />
    <MonitorPlatforms :platforms="platforms" />
    <Footer />
  </div>
</template>
