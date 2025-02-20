import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/lib/axios'

export interface User {
  id: number
  name: string
  username: string
  email: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  tier: 'starter' | 'essential' | 'advanced'
  has_paid: boolean
  lastLogin: string | null
  avatar_url?: string
  is_active: boolean
  is_staff: boolean
  first_name: string
  last_name: string
  notification_frequency: string
  time_zone: string
  push_enabled: boolean
  onesignal_player_id?: string
  new_review_alerts: boolean
  positive_review_alerts: boolean
  negative_review_alerts: boolean
  trend_alerts: boolean
  response_reminders: boolean
  review_milestones: boolean
  quiet_hours_start: string | null
  quiet_hours_end: string | null
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])

  async function fetchUsers() {
    try {
      const response = await axios.get('/users/')
      users.value = response.data.map((user: any) => ({
        ...user,
        lastLogin: user.last_login,
        name: user.username, // Also mapping username to name as per API response
        tier: user.tier || 'essential' // Default to essential tier if not set
      }))
    } catch (error) {
      console.error('Failed to fetch users:', error)
      throw error
    }
  }

  async function addUser(userData: Omit<User, 'id' | 'lastLogin'>) {
    try {
      console.log('Sending user data to backend:', userData)
      const response = await axios.post('/users/', userData)
      console.log('Backend response:', response.data)
      users.value.push({
        ...response.data,
        tier: response.data.tier || 'essential' // Default to essential tier if not set
      })
    } catch (error) {
      console.error('Failed to add user:', error)
      throw error
    }
  }

  async function updateUser(id: number, userData: Partial<User>) {
    try {
      const response = await axios.put(`/users/${id}/`, userData)
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = {
          ...response.data,
          tier: response.data.tier || 'essential', // Default to essential tier if not set
          lastLogin: response.data.last_login,
          name: response.data.username
        }
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  async function deleteUser(id: number) {
    try {
      await axios.delete(`/users/${id}/`)
      users.value = users.value.filter(user => user.id !== id)
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  }

  // Initialize users
  fetchUsers().catch(error => {
    console.error('Failed to initialize users:', error)
  })

  return {
    users,
    addUser,
    updateUser,
    deleteUser,
    fetchUsers
  }
})
