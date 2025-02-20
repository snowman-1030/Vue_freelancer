<script setup lang="ts">
import { ref, computed } from 'vue'
import { UserPlus, Search, Pencil, Trash2, AlertCircle } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useUsersStore, type User } from '../../stores/users'
import UserModal from '../../components/admin/UserModal.vue'
import ConfirmDialog from '../../components/admin/ConfirmDialog.vue'

const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)

const searchQuery = ref('')
const showUserModal = ref(false)
const showDeleteDialog = ref(false)
const selectedUser = ref<User | null>(null)
const error = ref('')

const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.role.toLowerCase().includes(query) ||
    user.tier.toLowerCase().includes(query) ||
    (user.has_paid ? 'paid' : 'unpaid').includes(query)
  )
})

const openUserModal = (user?: User) => {
  error.value = ''
  selectedUser.value = user || null
  showUserModal.value = true
}

const closeUserModal = () => {
  selectedUser.value = null
  showUserModal.value = false
}

const openDeleteDialog = (user: User) => {
  error.value = ''
  selectedUser.value = user
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (selectedUser.value) {
    try {
      await usersStore.deleteUser(selectedUser.value.id)
      showDeleteDialog.value = false
      selectedUser.value = null
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete user'
    }
  }
}

const handleUserSave = async (userData: Partial<User>) => {
  try {
    if (selectedUser.value) {
      // Update existing user
      await usersStore.updateUser(selectedUser.value.id, userData)
      // Show success message for password update if password was changed
      if ('password' in userData && typeof (userData as any).password === 'string') {
        error.value = ''
        const successDiv = document.createElement('div')
        successDiv.className = 'mb-8 bg-green-50 border border-green-200 rounded-lg p-4'
        successDiv.innerHTML = `
          <div class="flex items-center">
            <p class="text-sm text-green-700">Password successfully updated for ${selectedUser.value.name}</p>
          </div>
        `
        const contentSection = document.querySelector('.max-w-7xl')
        if (contentSection) {
          const existingSuccess = contentSection.querySelector('.bg-green-50')
          if (existingSuccess) {
            existingSuccess.remove()
          }
          contentSection.insertBefore(successDiv, contentSection.children[1])
          setTimeout(() => successDiv.remove(), 5000) // Remove after 5 seconds
        }
      }
    } else {
      // Add new user
      await usersStore.addUser(userData as Omit<User, 'id' | 'lastLogin'>)
    }
    closeUserModal()
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to save user'
  }
}
</script>

<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="flex-1">
            <h1 class="text-2xl md:text-2xl font-medium text-grey-700">
              User Management
            </h1>
            <p class="text-base text-gray-500">
              Manage user accounts, roles, and permissions. Control access to your platform's features and data.
            </p>
          </div>
          <div>
            <button
              @click="openUserModal()"
              class="inline-flex items-center px-6 py-2.5 text-base font-medium bg-gradient-to-r from-green-100 to-green-50/80 text-green-700 hover:from-green-200 hover:to-green-100 rounded-md transition-all duration-300"
            >
              <UserPlus class="w-5 h-5 mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="mb-8">
        <div class="flex items-center bg-gradient-to-r from-red-500/10 to-red-500/5 rounded-lg p-4">
          <AlertCircle class="w-4 h-4 text-red-800 mr-2" />
          <div>
            <p class="text-base font-semibold text-red-800">Error</p>
            <p class="text-base text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- Search Bar -->
        <div class="p-6 border-b border-gray-200">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search users..."
              class="pl-10 pr-4 py-2 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </div>

        <!-- Users Table -->
        <div class="overflow-x-auto">
          <table class="min-w-[1024px] w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[300px]">User</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">Tier</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">Payment</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[160px]">Last Login</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[84px]">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in filteredUsers" :key="user.id">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <img v-if="user.avatar_url" :src="user.avatar_url"
                         class="w-10 h-10 rounded-full mr-4"
                         alt="User avatar" />
                    <div v-else class="w-10 h-10 rounded-full bg-green-100 mr-4 flex items-center justify-center">
                      <span class="text-green-800 font-medium text-lg">{{ user.name[0] }}</span>
                    </div>
                    <div>
                      <div class="text-lg text-gray-900">{{ user.name }}</div>
                      <div class="text-base text-gray-700">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center justify-center">
                    <span v-if="user.role === 'admin'" class="inline-flex items-center justify-center px-4 py-1.5 text-base font-medium bg-gradient-to-r from-purple-100 to-purple-50/80 text-purple-800 rounded-md">
                      {{ user.role }}
                    </span>
                    <span v-else class="inline-flex items-center justify-center px-4 py-1.5 text-base font-medium bg-gradient-to-r from-sky-100 to-sky-50/80 text-sky-800 rounded-md">
                      {{ user.role }}
                    </span>
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center justify-center">
                    <span v-if="user.tier === 'starter'" class="inline-flex items-center justify-center px-4 py-1.5 text-base font-medium bg-gradient-to-r from-slate-100 to-slate-50/80 text-slate-800 rounded-md">
                      {{ user.tier }}
                    </span>
                    <span v-else-if="user.tier === 'essential'" class="inline-flex items-center justify-center px-4 py-1.5 text-base font-medium bg-gradient-to-r from-amber-100 to-amber-50/80 text-amber-800 rounded-md">
                      {{ user.tier }}
                    </span>
                    <span v-else class="inline-flex items-center justify-center px-4 py-1.5 text-base font-medium bg-gradient-to-r from-green-100 to-green-50/80 text-green-800 rounded-md">
                      {{ user.tier }}
                    </span>
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center justify-center">
                    <span v-if="user.status === 'active'" class="inline-flex items-center justify-center px-4 py-1.5 text-base font-medium bg-gradient-to-r from-green-500/10 to-green-500/5 text-green-700 rounded-md">
                      Active
                    </span>
                    <span v-else class="inline-flex items-center justify-center px-4 py-1.5 text-base font-medium bg-gradient-to-r from-red-500/10 to-red-500/5 text-red-700 rounded-md">
                      Inactive
                    </span>
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center justify-center">
                    <span v-if="user.has_paid" class="inline-flex items-center justify-center px-4 py-1.5 text-base font-medium bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 rounded-md">
                      Paid
                    </span>
                    <span v-else class="inline-flex items-center justify-center px-4 py-1.5 text-base font-medium bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-700 rounded-md">
                      Unpaid
                    </span>
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center justify-center">
                    <span class="inline-flex items-center justify-center px-4 py-1.5 text-base font-medium bg-gradient-to-r from-slate-100 to-slate-50/80 text-slate-700 rounded-md whitespace-nowrap">
                      {{ user.lastLogin ? new Date(user.lastLogin).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric'
                      }) : 'Never' }}
                    </span>
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium flex items-center justify-end gap-2">
                  <button
                    @click="openUserModal(user)"
                    class="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md mr-3"
                    title="Edit user"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    @click="openDeleteDialog(user)"
                    class="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md"
                    title="Delete user"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- User Modal -->
  <UserModal
    v-if="showUserModal"
    :show="showUserModal"
    :user="selectedUser"
    @close="closeUserModal"
    @save="handleUserSave"
  />

  <!-- Delete Confirmation Dialog -->
  <ConfirmDialog
    v-if="showDeleteDialog"
    :show="showDeleteDialog"
    title="Delete User"
    :message="`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`"
    confirm-text="Delete"
    type="danger"
    @close="showDeleteDialog = false"
    @confirm="confirmDelete"
  />
</template>
