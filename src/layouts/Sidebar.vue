<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  MessageCircle,
  Users,
  Bell,
  FileText,
  User,
  Settings,
  HelpCircle,
  ChevronLeft,
  Menu as MenuIcon,
  LogOut,
  Bot,
  Target,
  MessageSquare,
  BarChart2,
  Send,
  Database,
  CreditCard,
  Clock, X
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// const isCollapsed = ref(false)
const activeItem = computed(() => {
  const path = router.currentRoute.value.path
  return path.split('/').pop() || 'dashboard'
})

interface MenuItem {
  icon: any
  text: string
  route: string
  badge?: string | number
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

const isAdminRoute = computed(() => router.currentRoute.value.path.startsWith('/admin'))

const adminSections: MenuSection[] = [
  {
    title: 'Admin Panel',
    items: [
      { icon: LayoutDashboard, text: 'Dashboard', route: '/admin' },
      { icon: FileText, text: 'Articles', route: '/admin/articles' },
      { icon: Users, text: 'Users', route: '/admin/users' },
      { icon: Clock, text: 'Activity Log', route: '/admin/activity' },
      { icon: MessageSquare, text: 'Feedback', route: '/admin/feedback' },
      { icon: Bot, text: 'Scrapers', route: '/admin/scrapers' },
      { icon: Database, text: 'Database', route: '/admin/database' },
      { icon: Settings, text: 'Settings', route: '/admin/settings' }
    ]
  }
]

const userSections: MenuSection[] = [
  {
    title: 'Overview',
    items: [
      { icon: LayoutDashboard, text: 'Dashboard', route: '/dashboard' },
      { icon: MessageCircle, text: 'Mentions', route: '/dashboard/mentions' },
      { icon: Target, text: 'Tracking', route: '/dashboard/tracking' },
      { icon: Users, text: 'Competitors', route: '/dashboard/competitors' }
    ]
  },
  {
    title: 'Engagement',
    items: [
      { icon: MessageSquare, text: 'Reviews', route: '/dashboard/reviews' },
      { icon: Bell, text: 'Alerts', route: '/dashboard/alerts' }
    ]
  },
  {
    title: 'Analytics',
    items: [
      { icon: BarChart2, text: 'Analytics', route: '/dashboard/analytics' },
      { icon: FileText, text: 'Reports', route: '/dashboard/reports' },
      { icon: Bot, text: 'Chat', route: '/dashboard/chat' }
    ]
  },
  {
    title: 'Account',
    items: [
      { icon: User, text: 'Profile', route: '/dashboard/profile' },
      { icon: Settings, text: 'Automation', route: '/dashboard/settings' },
      { icon: CreditCard, text: 'Billing', route: '/dashboard/billing' }
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, text: 'Get Help', route: '/help' },
      { icon: Send, text: 'Feedback', route: '/dashboard/feedback' }
    ]
  }
]

const menuSections = computed(() => isAdminRoute.value ? adminSections : userSections)
const props = defineProps<{ isSidebarOpen: boolean }>()
const emit = defineEmits(['close-sidebar'])

const isCollapsed = ref(false)
</script>

<template>
  <div class="flex flex-col h-screen relative overflow-x-hidden antialiased z-50" :class="[
    isCollapsed ? 'w-20' : 'w-64',
    'duration-300 ease-in-out'
  ]" style="background-color: #12512A;z-index: 9999">
    <!-- Logo Section -->
    <div class="h-16 flex items-center border-b border-white/10">
      <template v-if="!isCollapsed">
        <div class="flex-1 flex items-center px-6 py-1.5">
          <img src="@/assets/images/VUELEAF_logo_white.png" alt="VueLeaf Logo" class="h-10 object-contain" />
        </div>
      </template>
      <div class="flex items-center justify-center" :class="[isCollapsed ? 'w-full px-3' : 'px-4']">
        <button @click="isCollapsed = !isCollapsed"
          class="hidden md:block p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <component :is="isCollapsed ? MenuIcon : ChevronLeft" class="w-5 h-5 text-gray-300" />
        </button>
        <button @click="emit('close-sidebar')"
          class="block md:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <X class="h-6 w-6 text-white" />
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex-1 px-4 py-5 space-y-5 overflow-y-auto overflow-x-hidden hide-scrollbar">
      <div v-for="section in menuSections" :key="section.title" class="mb-5">
        <template v-if="!isCollapsed">
          <h3 class="text-base font-medium text-gray-300 px-3 mb-2">
            {{ section.title }}
          </h3>
        </template>

        <RouterLink v-for="item in section.items" :key="item.text" :to="item.route" @click="emit('close-sidebar')"
          class="relative group flex items-center gap-x-4 cursor-pointer rounded-lg px-3 py-2.5 mb-1 transition-all duration-200 ease-in-out"
          :class="[
            activeItem === item.route.split('/').pop()
              ? 'bg-white/10 text-white'
              : 'text-gray-300 hover:bg-white/5'
          ]">
          <div class="flex items-center justify-center">
            <component :is="item.icon" class="w-6 h-6" :class="[
              activeItem === item.route.split('/').pop()
                ? 'text-white'
                : 'text-gray-300 group-hover:text-white'
            ]" />
          </div>

          <template v-if="!isCollapsed">
            <span class="text-lg font-medium whitespace-nowrap" :class="[
              activeItem === item.route.split('/').pop()
                ? 'text-white'
                : 'text-gray-300 group-hover:text-white'
            ]">
              {{ item.text }}
            </span>
            <span v-if="item.badge" class="ml-auto bg-white/10 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {{ item.badge }}
            </span>
          </template>

          <div v-if="isCollapsed"
            class="absolute left-full ml-6 invisible opacity-0 group-hover:visible group-hover:opacity-100 px-2 py-1 bg-white text-[#12512A] text-sm rounded whitespace-nowrap z-50 transition-all duration-200">
            {{ item.text }}
          </div>
        </RouterLink>
      </div>
    </div>

    <!-- User Profile -->
    <div class="p-4 border-t border-white/10">
      <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer"
        :class="{ 'justify-center': isCollapsed }">
        <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <img v-if="authStore.avatar" :src="authStore.avatar" :alt="authStore.username"
            class="w-full h-full object-cover" />
          <span v-else class="text-sm font-medium text-gray-600">
            {{ authStore?.username?.charAt(0).toUpperCase() }}
          </span>
        </div>
        <template v-if="!isCollapsed">
          <div class="flex-1 min-w-0">
            <p class="text-base font-medium text-white truncate">
              {{ authStore.username }}
            </p>
            <p class="text-sm text-gray-400 truncate">
              {{ authStore.userRole }}
            </p>
          </div>
          <LogOut @click="authStore.logout()" class="w-5 h-5 text-gray-300 hover:text-white transition-colors" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
