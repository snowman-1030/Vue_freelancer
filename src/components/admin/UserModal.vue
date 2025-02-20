<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { X, User2, Mail, Shield, Activity, Lock, Star, CreditCard } from 'lucide-vue-next'

type UserRole = 'admin' | 'user'
type UserStatus = 'active' | 'inactive'
type UserTier = 'starter' | 'essential' | 'advanced'

interface User {
  id: number
  name: string
  email: string
  role: UserRole
  status: UserStatus
  tier: UserTier
  lastLogin: string | null
  has_paid: boolean
}

const props = defineProps<{
  show: boolean
  user: User | null
}>()

const emit = defineEmits<{
  close: []
  save: [userData: Partial<User> & { password?: string }]
}>()

const formData = ref({
  name: '',
  email: '',
  role: 'user' as UserRole,
  status: 'active' as UserStatus,
  tier: 'essential' as UserTier,
  has_paid: false,
  password: '',
  confirmPassword: '',
})

onMounted(() => {
  if (props.user) {
    formData.value = {
      ...formData.value,
      name: props.user.name,
      email: props.user.email,
      role: props.user.role,
      status: props.user.status,
      tier: props.user.tier || 'essential',  // Ensure tier is set with fallback
      has_paid: props.user.has_paid || false  // Set has_paid with fallback
    }
  }
})

const handleSubmit = () => {
  if (!formData.value.name || !formData.value.email) {
    alert('Please fill in all required fields')
    return
  }

  // Validate password if provided or if it's a new user
  if (formData.value.password || !props.user) {
    if (formData.value.password !== formData.value.confirmPassword) {
      alert('Passwords do not match')
      return
    }
  }

  // Map frontend fields to backend fields
  const userData = {
    username: formData.value.name,  // Use name as username
    email: formData.value.email,
    is_staff: formData.value.role === 'admin',
    is_active: formData.value.status === 'active',
    tier: formData.value.tier,
    has_paid: formData.value.has_paid,
    role: formData.value.role,
    status: formData.value.status,
    ...(formData.value.password ? { password: formData.value.password } : {})
  }

  emit('save', userData)
}
</script>

<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-50" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="w-full max-w-md bg-white rounded-lg shadow-xl">
              <!-- Header -->
              <div class="bg-green-700 p-6 rounded-t-lg">
                <div class="flex items-center justify-between">
                  <h2 class="text-xl font-semibold text-white">
                    {{ user ? 'Edit User' : 'Add New User' }}
                  </h2>
                  <button 
                    @click="emit('close')"
                    class="text-green-100 hover:text-white transition-colors"
                  >
                    <X class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <!-- Form -->
              <form @submit.prevent="handleSubmit">
                <div class="p-6 space-y-5">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">Username</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User2 class="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="text"
                        v-model="formData.name"
                        class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 transition-all outline-none ring-0 focus:outline-none focus:ring-0 focus:border-green-600 hover:border-gray-300 focus:hover:border-green-600"
                        required
                      />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail class="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="email"
                        v-model="formData.email"
                        class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 transition-all outline-none ring-0 focus:outline-none focus:ring-0 focus:border-green-600 hover:border-gray-300 focus:hover:border-green-600"
                        required
                      />
                    </div>
                  </div>

                  <!-- Password fields -->
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                      {{ user ? 'New Password (leave blank to keep current)' : 'Password' }}
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock class="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="password"
                        v-model="formData.password"
                        class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 transition-all outline-none ring-0 focus:outline-none focus:ring-0 focus:border-green-600 hover:border-gray-300 focus:hover:border-green-600"
                        :required="!user"
                      />
                    </div>
                  </div>

                  <div class="space-y-2" v-if="formData.password">
                    <label class="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock class="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="password"
                        v-model="formData.confirmPassword"
                        class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 transition-all outline-none ring-0 focus:outline-none focus:ring-0 focus:border-green-600 hover:border-gray-300 focus:hover:border-green-600"
                        :required="formData.password.length > 0"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">Role</label>
                      <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Shield class="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          v-model="formData.role"
                          class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 transition-all appearance-none cursor-pointer outline-none ring-0 focus:outline-none focus:ring-0 focus:border-green-600 hover:border-gray-300 focus:hover:border-green-600"
                        >
                          <option value="admin">Admin</option>
                          <option value="user">User</option>
                        </select>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">Status</label>
                      <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Activity class="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          v-model="formData.status"
                          class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 transition-all appearance-none cursor-pointer outline-none ring-0 focus:outline-none focus:ring-0 focus:border-green-600 hover:border-gray-300 focus:hover:border-green-600"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">Subscription Tier</label>
                      <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Star class="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          v-model="formData.tier"
                          class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 transition-all appearance-none cursor-pointer outline-none ring-0 focus:outline-none focus:ring-0 focus:border-green-600 hover:border-gray-300 focus:hover:border-green-600"
                        >
                          <option value="starter">Starter</option>
                          <option value="essential">Essential</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700">Payment Status</label>
                      <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCard class="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          v-model="formData.has_paid"
                          class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 transition-all appearance-none cursor-pointer outline-none ring-0 focus:outline-none focus:ring-0 focus:border-green-600 hover:border-gray-300 focus:hover:border-green-600"
                        >
                          <option :value="true">Paid</option>
                          <option :value="false">Unpaid</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer -->
                <div class="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-100 flex justify-end space-x-3">
                  <button
                    type="button"
                    @click="emit('close')"
                    class="px-4 py-2.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {{ user ? 'Update User' : 'Add User' }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
