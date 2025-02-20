import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// Views
import Home from '../views/Home.vue'
import Dashboard from '../views/Dashboard.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'
import AdminArticles from '../views/admin/Articles.vue'
import AdminUsers from '../views/admin/Users.vue'
import AdminScrapers from '../views/admin/Scrapers.vue'
import AdminSettings from '../views/admin/Settings.vue'
import AdminDatabase from '../views/admin/Database.vue'
import AdminLogin from '../views/admin/Login.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Welcome from '../views/Welcome.vue'
import AdminLayout from '../layouts/AdminLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: Welcome,
    meta: { requiresAuth: true }
  },
  {
    path: '/resources',
    name: 'resources',
    component: () => import('../views/Resources.vue')
  },
  {
    path: '/resources/:id',
    name: 'resource',
    component: () => import('../views/Article.vue')
  },
  {
    path: '/features',
    name: 'features',
    component: () => import('../views/Features.vue')
  },
  {
    path: '/pricing',
    name: 'pricing',
    component: () => import('../views/Pricing.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/About.vue')
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('../views/Privacy.vue')
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('../views/Terms.vue')
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard-overview',
        component: () => import('../views/dashboard/Overview.vue')
      },
      {
        path: 'mentions',
        name: 'dashboard-mentions',
        component: () => import('../views/dashboard/Mentions.vue')
      },
      {
        path: 'tracking',
        name: 'dashboard-tracking',
        component: () => import('../views/dashboard/tracking/TrackingPage.vue')
      },
      {
        path: 'reviews',
        name: 'dashboard-reviews',
        component: () => import('../views/dashboard/Reviews.vue')
      },
      {
        path: 'settings',
        name: 'dashboard-settings',
        component: () => import('../views/dashboard/Settings.vue')
      },
      {
        path: 'profile',
        name: 'dashboard-profile',
        component: () => import('../views/dashboard/Profile.vue')
      },
      {
        path: 'analytics',
        name: 'dashboard-analytics',
        component: () => import('../views/dashboard/analytics/AnalyticsPage.vue')
      },
      {
        path: 'competitors',
        name: 'dashboard-competitors',
        component: () => import('../views/dashboard/Competitors.vue')
      },
      {
        path: 'chat',
        name: 'dashboard-chat',
        component: () => import('../views/dashboard/chat/ChatPage.vue')
      },
      {
        path: 'alerts',
        name: 'dashboard-alerts',
        component: () => import('../views/dashboard/alerts/preferences/AlertsPreferencesPage.vue')
      },
      {
        path: 'alerts/preferences',
        name: 'alerts-preferences',
        component: () => import('../views/dashboard/alerts/preferences/AlertsPreferencesPage.vue')
      },
      {
        path: 'feedback',
        name: 'dashboard-feedback',
        component: () => import('../views/dashboard/feedback/FeedbackPage.vue')
      },
      {
        path: 'reports',
        name: 'dashboard-reports',
        component: () => import('../views/dashboard/reports/ReportsPage.vue')
      },
      {
        path: 'billing',
        name: 'dashboard-billing',
        component: () => import('../views/dashboard/Billing.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboard
      },
      {
        path: 'articles',
        name: 'admin-articles',
        component: AdminArticles
      },
      {
        path: 'articles/new',
        name: 'admin-articles-new',
        component: () => import('../views/admin/ArticleEditor.vue')
      },
      {
        path: 'articles/:id/edit',
        name: 'admin-articles-edit',
        component: () => import('../views/admin/ArticleEditor.vue')
      },
      {
        path: 'users',
        name: 'admin-users',
        component: AdminUsers
      },
      {
        path: 'feedback',
        name: 'admin-feedback',
        component: () => import('../views/admin/feedback/FeedbackPage.vue')
      },
      {
        path: 'scrapers',
        name: 'admin-scrapers',
        component: AdminScrapers
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: AdminSettings
      },
      {
        path: 'database',
        name: 'admin-database',
        component: AdminDatabase
      },
      {
        path: 'profile',
        name: 'admin-profile',
        component: () => import('../views/dashboard/Profile.vue')
      },
      {
        path: 'activity',
        name: 'admin-activity',
        component: () => import('../views/admin/ActivityLogView.vue')
      }
    ]
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLogin
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { requiresGuest: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _, next) => {
  const isAuthenticated = !!localStorage.getItem('access_token')
  const isAdmin = localStorage.getItem('user_role') === 'admin'

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next('/')
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next(isAdmin ? '/admin' : '/dashboard')
  } else {
    next()
  }
})

export default router
