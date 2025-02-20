<script setup lang="ts">
// 1. Vue imports
import { ref, onMounted } from 'vue'

// 2. Component imports
import { 
  Search, Filter, ArrowUpDown, ExternalLink, MessageCircle, 
  Leaf, TrendingUp, TrendingDown, Minus, Star, Bell, Calendar, 
  Settings, Flag, Clock, CheckCircle, AlertTriangle, Wand2, X, 
  User2, Mail, Shield, Activity 
} from 'lucide-vue-next'

// UI Component imports with correct paths
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Pagination,
  PaginationList,
  PaginationFirst,
  PaginationLast,
  PaginationNext,
  PaginationPrev,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

// 3. Type definitions
interface Review {
  id: number
  author: string
  content: string
  rating: number
  platform: string
  sentiment: 'positive' | 'neutral' | 'negative'
  status: 'pending' | 'responded' | 'flagged'
  date: string
}

// 4. State management
const currentPage = ref(1)
const selectedSentiment = ref('all')
const selectedPlatform = ref('all')
const selectedStatus = ref('all')
const responseDialogOpen = ref(false)
const historyDialogOpen = ref(false)

// Mock data for reviews
const reviews = ref<Review[]>([
  {
    id: 1,
    author: "Jane Doe",
    content: "Great product! The effects were exactly what I was looking for.",
    rating: 5,
    platform: "Leafly",
    sentiment: "positive",
    status: "pending",
    date: "2024-11-19T13:57:52"
  },
  {
    id: 2,
    author: "John Smith",
    content: "Decent quality, but the packaging could be improved.",
    rating: 3,
    platform: "Weedmaps",
    sentiment: "neutral",
    status: "responded",
    date: "2024-11-18T10:23:15"
  },
  {
    id: 3,
    author: "Alice Johnson",
    content: "Disappointed with the product. It didn't meet my expectations.",
    rating: 2,
    platform: "Google",
    sentiment: "negative",
    status: "flagged",
    date: "2024-11-17T18:45:30"
  }
])

const itemsPerPage = 10
const totalPages = Math.ceil(reviews.value.length / itemsPerPage)

// Helper functions
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

function getPlatformColor(platform: string) {
  switch (platform.toLowerCase()) {
    case 'leafly':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'weedmaps':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'google':
      return 'bg-red-100 text-red-800 border-red-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

function getSentimentIcon(sentiment: string) {
  switch (sentiment) {
    case 'positive':
      return TrendingUp
    case 'negative':
      return TrendingDown
    default:
      return Minus
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'responded':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'flagged':
      return 'bg-red-100 text-red-800 border-red-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}
</script>

<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Summary Section -->
      <div class="mb-8">
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card class="bg-blue-50 border-blue-200 shadow-sm">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium text-blue-700">Reviews Requiring Response</CardTitle>
              <MessageCircle class="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-blue-900">18</div>
            </CardContent>
          </Card>
          <Card class="bg-green-50 border-green-200 shadow-sm">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium text-green-700">Average Response Time</CardTitle>
              <Clock class="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-green-900">4.2 hours</div>
            </CardContent>
          </Card>
          <Card class="bg-yellow-50 border-yellow-200 shadow-sm">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium text-yellow-700">Response Rate</CardTitle>
              <CheckCircle class="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-yellow-900">92%</div>
            </CardContent>
          </Card>
          <Card class="bg-red-50 border-red-200 shadow-sm">
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium text-red-700">Flagged Reviews</CardTitle>
              <Flag class="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-red-900">3</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="mb-8 space-y-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search reviews..."
              class="pl-10 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 rounded-md"
            />
          </div>
          <div class="flex flex-wrap gap-4">
            <Select v-model="selectedPlatform">
              <SelectTrigger class="w-[180px] border-gray-300 rounded-md">
                <Filter class="mr-2 h-4 w-4 text-green-600" />
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="leafly">Leafly</SelectItem>
                <SelectItem value="weedmaps">Weedmaps</SelectItem>
                <SelectItem value="google">Google</SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="selectedSentiment">
              <SelectTrigger class="w-[180px] border-gray-300 rounded-md">
                <MessageCircle class="mr-2 h-4 w-4 text-green-600" />
                <SelectValue placeholder="All Sentiments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="positive">
                  <span class="flex items-center">
                    <Badge class="mr-2 bg-green-100 text-green-800 border-green-300">Positive</Badge>
                  </span>
                </SelectItem>
                <SelectItem value="neutral">
                  <span class="flex items-center">
                    <Badge class="mr-2 bg-yellow-100 text-yellow-800 border-yellow-300">Neutral</Badge>
                  </span>
                </SelectItem>
                <SelectItem value="negative">
                  <span class="flex items-center">
                    <Badge class="mr-2 bg-red-100 text-red-800 border-red-300">Negative</Badge>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="selectedStatus">
              <SelectTrigger class="w-[180px] border-gray-300 rounded-md">
                <CheckCircle class="mr-2 h-4 w-4 text-green-600" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" class="w-[180px] border-gray-300 text-green-700 rounded-md">
              <ArrowUpDown class="mr-2 h-4 w-4" />
              Sort by Date
            </Button>
          </div>
        </div>
      </div>

      <!-- Reviews List -->
      <div class="space-y-6">
        <Card v-for="review in reviews" :key="review.id" class="overflow-hidden rounded-md">
          <CardContent class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    :class="`px-3 py-1 rounded-md flex items-center ${getPlatformColor(review.platform)}`"
                  >
                    {{ review.platform }}
                  </Badge>
                  <Badge :class="`
                    inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md border
                    ${review.sentiment === 'positive' ? 'bg-green-100 text-green-800 border-green-300' : 
                      review.sentiment === 'negative' ? 'bg-red-100 text-red-800 border-red-300' : 
                      'bg-yellow-100 text-yellow-800 border-yellow-300'}
                    cursor-default pointer-events-none
                  `">
                    <component :is="getSentimentIcon(review.sentiment)" class="h-4 w-4 mr-1" />
                    {{ review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1) }}
                  </Badge>
                  <Badge :class="`
                    inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md border
                    ${getStatusColor(review.status)}
                    cursor-default pointer-events-none
                  `">
                    {{ review.status.charAt(0).toUpperCase() + review.status.slice(1) }}
                  </Badge>
                </div>
                <h2 class="text-xl font-semibold text-green-800">
                  {{ review.author }}
                </h2>
              </div>
              <div class="flex items-center">
                <Star
                  v-for="i in 5"
                  :key="i"
                  :class="`h-5 w-5 ${i <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`"
                  :fill="i <= review.rating ? 'currentColor' : 'none'"
                />
              </div>
            </div>
            <p class="text-gray-600 mb-4">{{ review.content }}</p>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">{{ formatDate(review.date) }}</span>
              <div class="space-x-2">
                <Dialog :open="responseDialogOpen" @update:open="responseDialogOpen = $event">
                  <DialogTrigger asChild @click="responseDialogOpen = true">
                    <Button variant="default" size="sm" class="bg-green-100 hover:bg-green-200 text-green-800 border border-green-300">
                      Respond
                    </Button>
                  </DialogTrigger>
                  <DialogContent class="sm:max-w-md p-0">
                    <DialogHeader class="bg-green-700 p-6 rounded-t-lg">
                      <div class="flex items-center justify-between">
                        <DialogTitle class="text-xl font-semibold text-white">Respond to Review</DialogTitle>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" class="text-green-100 hover:text-white hover:bg-green-600">
                            <X class="h-5 w-5" />
                          </Button>
                        </DialogTrigger>
                      </div>
                    </DialogHeader>
                    <form @submit.prevent>
                      <div class="p-6 space-y-5">
                        <div class="space-y-2">
                          <div class="flex items-center gap-2 text-sm text-gray-600">
                            <span class="font-medium text-gray-900">{{ review.author }}</span>
                            <span>•</span>
                            <span>{{ formatDate(review.date) }}</span>
                          </div>
                          <p class="text-gray-900">{{ review.content }}</p>
                        </div>
                        <div class="space-y-4">
                          <div class="flex items-center justify-between">
                            <Label class="text-sm font-medium text-gray-700">Response Templates</Label>
                            <Button variant="secondary" class="bg-purple-50 hover:bg-purple-100 text-purple-700">
                              <Wand2 class="mr-2 h-4 w-4" />
                              AI Suggest
                            </Button>
                          </div>
                          <Select>
                            <SelectTrigger class="w-full bg-gray-50 border border-gray-200 rounded-lg text-gray-900 transition-all outline-none ring-0 focus:outline-none focus:ring-0 focus:border-green-600 hover:border-gray-300 focus:hover:border-green-600">
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="quality">Quality Concern Response</SelectItem>
                              <SelectItem value="positive">Positive Review Response</SelectItem>
                            </SelectContent>
                          </Select>
                          <div class="space-y-2">
                            <div class="relative">
                              <Textarea 
                                class="min-h-[150px] w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 transition-all outline-none ring-0 focus:outline-none focus:ring-0 focus:border-green-600 hover:border-gray-300 focus:hover:border-green-600" 
                                placeholder="Write your response..."
                              />
                              <MessageCircle class="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                            </div>
                            <div class="flex justify-end text-sm text-gray-600">
                              Characters: 0/500
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-100 flex justify-end space-x-3">
                        <DialogTrigger asChild>
                          <Button variant="outline" class="px-4 py-2.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                            Cancel
                          </Button>
                        </DialogTrigger>
                        <Button class="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                          Send Response
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button variant="default" size="sm" class="bg-red-100 hover:bg-red-200 text-red-800 border border-red-300">
                  Flag
                </Button>
                <Dialog :open="historyDialogOpen" @update:open="historyDialogOpen = $event">
                  <DialogTrigger asChild @click="historyDialogOpen = true">
                    <Button variant="default" size="sm" class="bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300">
                      History
                    </Button>
                  </DialogTrigger>
                  <DialogContent class="sm:max-w-[425px] p-0">
                    <DialogHeader class="bg-green-700 p-6 rounded-t-lg">
                      <div class="flex items-center justify-between">
                        <DialogTitle class="text-xl font-semibold text-white">Review History</DialogTitle>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" class="text-green-100 hover:text-white hover:bg-green-600">
                            <X class="h-5 w-5" />
                          </Button>
                        </DialogTrigger>
                      </div>
                    </DialogHeader>
                    <div class="p-6 space-y-6">
                      <div class="space-y-4">
                        <div class="flex items-start gap-2">
                          <div class="mt-1 bg-green-100 p-1.5 rounded-full">
                            <MessageCircle class="h-3 w-3 text-green-800" />
                          </div>
                          <div class="space-y-1">
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                              <span class="font-medium text-green-800">Sarah M.</span>
                              <span>•</span>
                              <span>11/28/2024, 11:30:00 AM</span>
                            </div>
                            <p class="text-sm text-gray-600">Thank you for your feedback. We apologize for the inconsistency...</p>
                          </div>
                        </div>
                        <div class="flex items-start gap-2">
                          <div class="mt-1 bg-red-100 p-1.5 rounded-full">
                            <Flag class="h-3 w-3 text-red-800" />
                          </div>
                          <div class="space-y-1">
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                              <span class="font-medium text-green-800">John D.</span>
                              <span>•</span>
                              <span>11/28/2024, 10:45:00 AM</span>
                            </div>
                            <p class="text-sm text-gray-600">Flagged for quality concern investigation</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-100 flex justify-end">
                      <DialogTrigger asChild>
                        <Button variant="outline" class="px-4 py-2.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                          Close
                        </Button>
                      </DialogTrigger>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="default" size="sm" class="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300">
                  Mark as Done
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Pagination -->
      <div class="mt-8">
        <Pagination>
          <PaginationList>
            <PaginationFirst
              @click="currentPage = 1"
              :disabled="currentPage === 1"
            />
            <PaginationPrev
              @click="currentPage = Math.max(currentPage - 1, 1)"
              :disabled="currentPage === 1"
            />
            <template v-for="i in totalPages" :key="i">
              <PaginationEllipsis v-if="i > 2 && i < totalPages - 1 && i !== currentPage" />
              <button
                v-else
                class="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                :class="{ 'bg-accent': currentPage === i }"
                @click="currentPage = i"
              >
                {{ i }}
              </button>
            </template>
            <PaginationNext
              @click="currentPage = Math.min(currentPage + 1, totalPages)"
              :disabled="currentPage === totalPages"
            />
            <PaginationLast
              @click="currentPage = totalPages"
              :disabled="currentPage === totalPages"
            />
          </PaginationList>
        </Pagination>
      </div>
    </div>
  </div>
</template>
