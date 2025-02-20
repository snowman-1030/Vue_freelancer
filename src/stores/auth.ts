import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/lib/axios'
import { useRouter } from 'vue-router'
import { getFullAvatarUrl } from '../utils/url'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const token = ref(localStorage.getItem('access_token') || '')
  const userRole = ref(localStorage.getItem('user_role') || '')
  const username = ref(localStorage.getItem('username') || '')
  const avatar = ref(localStorage.getItem('avatar_url') || '')
  const tier = ref(localStorage.getItem('user_tier') || 'essential')
  const hasPaid = ref(localStorage.getItem('has_paid') === 'true')
  const renewalDate = ref(localStorage.getItem('renewal_date') || '')
  const loading = ref(false)
  const error = ref('')

  async function fetchProfile() {
    try {
      const response = await axios.get('/auth/profile/')
      const user = response.data
      userRole.value = user.is_staff ? 'admin' : 'user'
      username.value = user.username
      tier.value = user.tier || 'essential'
      avatar.value = getFullAvatarUrl(user.avatar_url || '')
      hasPaid.value = user.has_paid || false
      renewalDate.value = user.renewal_date || ''

      localStorage.setItem('user_role', userRole.value)
      localStorage.setItem('username', username.value)
      localStorage.setItem('user_tier', tier.value)
      localStorage.setItem('avatar_url', avatar.value)
      localStorage.setItem('has_paid', String(hasPaid.value))
      localStorage.setItem('renewal_date', renewalDate.value)
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  }

  function getTierLimits() {
    switch (tier.value) {
      case 'advanced':
        return {
          keywords: 50,
          platforms: 'unlimited'
        }
      case 'essential':
        return {
          keywords: 20,
          platforms: 5
        }
      default:  // starter tier
        return {
          keywords: 5,
          platforms: 2
        }
    }
  }

  async function login(usernameInput: string, password: string) {
    try {
      loading.value = true
      error.value = ''

      const response = await axios.post('/auth/login/', {
        username: usernameInput,
        password
      })
      const { access_token, refresh_token, role, user } = response.data
      // const { access_token, refresh_token, role, user } = { 
      //   access_token: "access_token", 
      //   refresh_token: "refresh_token", 
      //   role: "admin", 
      //   user: { 
      //     tier: "tier", 
      //     has_paid: true, 
      //     renewal_date: "" 
      //   } 
      // };
      
      token.value = access_token
      userRole.value = role
      username.value = usernameInput
      tier.value = user.tier || 'essential'
      hasPaid.value = user.has_paid || false
      renewalDate.value = user.renewal_date || ''

      // Process avatar URL before storing
      const processedAvatarUrl = getFullAvatarUrl(user.avatar_url || '')
      avatar.value = processedAvatarUrl

      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('user_role', role)
      localStorage.setItem('username', usernameInput)
      localStorage.setItem('user_tier', user.tier || 'essential')
      localStorage.setItem('has_paid', String(hasPaid.value))
      localStorage.setItem('renewal_date', user.renewal_date || '')
      localStorage.setItem('avatar_url', processedAvatarUrl)
      localStorage.setItem('avatar_url', user.avatar_url || '')

      // Regular login flow - redirect based on role
      router.push(role === 'admin' ? '/admin' : '/dashboard/')
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Login failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  function updateAvatar(avatarUrl: string) {
    const processedUrl = getFullAvatarUrl(avatarUrl)
    avatar.value = processedUrl
    localStorage.setItem('avatar_url', processedUrl)
  }

  function logout() {
    token.value = ''
    userRole.value = ''
    username.value = ''
    avatar.value = ''
    tier.value = 'essential'
    hasPaid.value = false
    renewalDate.value = ''
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('username')
    localStorage.removeItem('avatar_url')
    localStorage.removeItem('user_tier')
    localStorage.removeItem('has_paid')
    localStorage.removeItem('renewal_date')
    router.push('/login')
  }

  function isAdmin() {
    return userRole.value === 'admin'
  }

  function isAuthenticated() {
    return !!token.value
  }

  return {
    token,
    userRole,
    username,
    avatar,
    tier,
    hasPaid,
    renewalDate,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isAuthenticated,
    updateAvatar,
    getTierLimits,
    fetchProfile
  }
})
