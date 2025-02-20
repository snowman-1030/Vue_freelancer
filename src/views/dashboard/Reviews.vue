<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import analyticsImage from '@/assets/images/analytics/analytics-green.png'
import {
  Search, ArrowUpDown, MessageCircle, MessageSquare,
  TrendingUp, TrendingDown, Minus,
  Flag, Clock, CheckCircle, X, ArrowRight,
  Globe, Tag, Reply, History, Check, Star
} from 'lucide-vue-next'
import Pagination from '@/components/common/Pagination.vue'
import { useMentions } from '@/composables/useMentions'
import type { ReviewMention, ReviewFlag } from '@/types/reviews'
import ResponseDialog from '@/components/dashboard/reviews/ResponseDialog.vue'
import FlagDialog from '@/components/dashboard/reviews/FlagDialog.vue'
import { getForumCredentials, type ForumCredentials } from '@/services/forum'

// Initialize mentions composable
const {
  mentions,
  isLoading,
  error,
  totalCount,
  totalPages,
  fetchMentions,
  stats
} = useMentions()

// Date input refs
const startDateRef = ref<HTMLInputElement | null>(null)
const endDateRef = ref<HTMLInputElement | null>(null)

// Local state
const currentPage = ref(1)
const selectedSentiment = ref('all')
const selectedPlatform = ref('all-platforms')
const selectedKeyword = ref('all-keywords')
const searchQuery = ref('') // Added searchQuery
const showRespondDialog = ref(false)
const showFlagDialog = ref(false)
const showHistoryDialog = ref(false)
const selectedReview = ref<ReviewMention | null>(null)
const credentials = ref<ForumCredentials[]>([])
const sortDirection = ref<'asc' | 'desc'>('desc')

// Date state
const startDate = ref('')
const endDate = ref('')

// Initialize dates with 30-day default
const initializeDates = () => {
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)
  
  startDate.value = thirtyDaysAgo.toISOString().split('T')[0]
  endDate.value = today.toISOString().split('T')[0]
}


// Get keywords from API stats
const availableKeywords = computed(() => {
  return stats.value.keywords || []
})

// Computed properties
// Stats use totalCount for accurate numbers across all pages
const reviewsRequiringResponse = computed(() => totalCount.value)
const averageResponseTime = computed(() => "4.2 hours")
const responseRate = computed(() => 85) // Example fixed value
const flaggedReviews = computed(() => Math.round(totalCount.value * 0.05)) // Example: 5% of total

// Debounce function
const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Debounced fetch function
const debouncedFetch = debounce((query: string) => {
  const filters = {
    page: currentPage.value,
    sentiment: selectedSentiment.value !== 'all' ? selectedSentiment.value : undefined,
    platforms: selectedPlatform.value !== 'all-platforms' ? selectedPlatform.value : undefined,
    keyword: selectedKeyword.value !== 'all-keywords' ? selectedKeyword.value : undefined,
    search: query,
    ordering: sortDirection.value === 'asc' ? 'post_date' : '-post_date'
  }
  fetchMentions(filters)
}, 1000) // Wait 1 second for user to finish typing a complete word

// Watch for non-search filter changes
watch([selectedSentiment, selectedPlatform, selectedKeyword, currentPage, sortDirection, startDate, endDate], () => {
  const filters = {
    page: currentPage.value,
    sentiment: selectedSentiment.value !== 'all' ? selectedSentiment.value : undefined,
    platforms: selectedPlatform.value !== 'all-platforms' ? selectedPlatform.value : undefined,
    keyword: selectedKeyword.value !== 'all-keywords' ? selectedKeyword.value : undefined,
    search: searchQuery.value || undefined,
    ordering: sortDirection.value === 'asc' ? 'post_date' : '-post_date',
    start_date: startDate.value,
    end_date: endDate.value
  }
  fetchMentions(filters)
})

// Watch for search query changes
watch(searchQuery, (newValue) => {
  debouncedFetch(newValue)
})

// Use reviews directly since backend handles filtering, sorting and pagination
const paginatedReviews = computed<ReviewMention[]>(() => mentions.value.map(mention => ({
  ...mention,
  response: undefined,
  flagged: false,
  status: 'pending' as const
})))

// Process and highlight content
const processContent = (content: string, keyword: string): string => {
  // Escape HTML to prevent XSS
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Create a completely stripped version for matching
  const stripText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove everything except letters and numbers
  }

  // Find all possible matches in the original text
  const findMatches = (content: string, keyword: string) => {
    const strippedKeyword = stripText(keyword)
    const matches: { start: number, end: number, text: string }[] = []
    const matchedRanges = new Set<number>() // Track matched positions
    
    // Sliding window approach to find matches
    for (let i = 0; i < content.length; i++) {
      // Skip if this position is already part of a match
      if (matchedRanges.has(i)) continue

      // Look ahead up to 2x the keyword length to account for extra spaces/punctuation
      const windowSize = keyword.length * 2
      const chunk = content.slice(i, i + windowSize)
      
      if (stripText(chunk).includes(strippedKeyword)) {
        // Find the exact boundaries of the match in the original text
        let start = i
        let end = i
        let found = false
        
        // Expand the end position until we no longer match
        while (end <= i + windowSize && !found) {
          const current = content.slice(start, end)
          const stripped = stripText(current)
          
          if (stripped === strippedKeyword) {
            // Verify word boundaries
            const beforeChar = start > 0 ? content[start - 1] : ' '
            const afterChar = end < content.length ? content[end] : ' '
            const isWordBoundary = /[^a-zA-Z0-9]/.test(beforeChar) && /[^a-zA-Z0-9]/.test(afterChar)
            
            if (isWordBoundary) {
              // Trim whitespace from match boundaries
              let trimStart = start
              let trimEnd = end
              
              // Trim leading whitespace
              while (trimStart < trimEnd && /\s/.test(content[trimStart])) {
                trimStart++
              }
              
              // Trim trailing whitespace
              while (trimEnd > trimStart && /\s/.test(content[trimEnd - 1])) {
                trimEnd--
              }
              
              // Add trimmed match and mark its range as matched
              matches.push({
                start: trimStart,
                end: trimEnd,
                text: content.slice(trimStart, trimEnd)
              })
              
              for (let pos = trimStart; pos < trimEnd; pos++) {
                matchedRanges.add(pos)
              }
              found = true
            }
          }
          end++
        }
      }
    }

    return matches
  }

  const escapedContent = escapeHtml(content)
  const matches = findMatches(escapedContent, keyword)

  if (matches.length === 0) {
    // If no matches found, just truncate
    return escapedContent.length > 800
      ? escapedContent.slice(0, 797) + '...'
      : escapedContent
  }

  // Use the first match for centering
  const firstMatch = matches[0]
  let start = Math.max(0, firstMatch.start - 400)
  let end = Math.min(escapedContent.length, firstMatch.end + 400)
  
  // Adjust if content is less than 800 characters
  if (end - start < 800) {
    start = Math.max(0, start - (800 - (end - start)))
    end = Math.min(escapedContent.length, end + (800 - (end - start)))
  }

  // Add ellipsis if truncated
  const prefix = start > 0 ? '...' : ''
  const suffix = end < escapedContent.length ? '...' : ''

  // Build the highlighted content with all matches within the window
  let result = ''
  let lastIndex = start

  matches.forEach(match => {
    if (match.start >= start && match.end <= end) {
      result += escapedContent.slice(lastIndex, match.start)
      result += `<span class="bg-green-100 text-green-800">${
        escapedContent.slice(match.start, match.end)
      }</span>`
      lastIndex = match.end
    }
  })

  result += escapedContent.slice(lastIndex, end)
  return `${prefix}${result}${suffix}`
}

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
    case 'rollitup.org':
      return 'bg-gradient-to-r from-green-500/10 to-green-500/5 text-green-700 hover:from-green-500/20 hover:to-green-500/15'
    case 'thcfarmer.com':
      return 'bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-700 hover:from-blue-500/20 hover:to-blue-500/15'
    case 'icmag.com':
      return 'bg-gradient-to-r from-purple-500/10 to-purple-500/5 text-purple-700 hover:from-purple-500/20 hover:to-purple-500/15'
    case '420magazine.com':
      return 'bg-gradient-to-r from-orange-500/10 to-orange-500/5 text-orange-700 hover:from-orange-500/20 hover:to-orange-500/15'
    case 'overgrow.com':
      return 'bg-gradient-to-r from-pink-500/10 to-pink-500/5 text-pink-700 hover:from-pink-500/20 hover:to-pink-500/15'
    case 'ilgmforum.com':
      return 'bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 text-indigo-700 hover:from-indigo-500/20 hover:to-indigo-500/15'
    case 'homegrowncannabisco.community':
      return 'bg-gradient-to-r from-teal-500/10 to-teal-500/5 text-teal-700 hover:from-teal-500/20 hover:to-teal-500/15'
    case 'growersnetwork.org':
      return 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-700 hover:from-amber-500/20 hover:to-amber-500/15'
    case 'reddit.com':
      return 'bg-gradient-to-r from-orange-500/10 to-orange-500/5 text-orange-700 hover:from-orange-500/20 hover:to-orange-500/15'
    case 'autoflower.org':
      return 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 text-yellow-700 hover:from-yellow-500/20 hover:to-yellow-500/15'
    case 'marijuanapassion.com':
      return 'bg-gradient-to-r from-lime-500/10 to-lime-500/5 text-lime-700 hover:from-lime-500/20 hover:to-lime-500/15'
    case 'growweedeasy.com':
      return 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15'
    case 'beanbasement.nl':
      return 'bg-gradient-to-r from-violet-500/10 to-violet-500/5 text-violet-700 hover:from-violet-500/20 hover:to-violet-500/15'
    case 'phenohunter.org':
      return 'bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 text-cyan-700 hover:from-cyan-500/20 hover:to-cyan-500/15'
    case 'percysgrowroom.com':
      return 'bg-gradient-to-r from-rose-500/10 to-rose-500/5 text-rose-700 hover:from-rose-500/20 hover:to-rose-500/15'
    case '420sa.co.za':
      return 'bg-gradient-to-r from-sky-500/10 to-sky-500/5 text-sky-700 hover:from-sky-500/20 hover:to-sky-500/15'
    default:
      return 'bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-700 hover:from-gray-500/20 hover:to-gray-500/15'
  }
}

function getSentimentIcon(sentiment: string | null) {
  switch (sentiment) {
    case 'positive':
      return TrendingUp
    case 'negative':
      return TrendingDown
    default:
      return Minus
  }
}

function getStatusColor(status: ReviewMention['status']) {
  switch (status) {
    case 'responded':
      return 'bg-gradient-to-r from-green-500/10 to-green-500/5 text-green-700 hover:from-green-500/20 hover:to-green-500/15'
    case 'pending':
      return 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 text-yellow-700 hover:from-yellow-500/20 hover:to-yellow-500/15'
    case 'flagged':
      return 'bg-gradient-to-r from-red-500/10 to-red-500/5 text-red-700 hover:from-red-500/20 hover:to-red-500/15'
    default:
      return 'bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-700 hover:from-gray-500/20 hover:to-gray-500/15'
  }
}

// Toggle sort direction
function toggleSort() {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}

// Action handlers
function openRespondDialog(review: ReviewMention) {
  selectedReview.value = review
  showRespondDialog.value = true
}

function openFlagDialog(review: ReviewMention) {
  selectedReview.value = review
  showFlagDialog.value = true
}

function openHistoryDialog(review: ReviewMention) {
  selectedReview.value = review
  showHistoryDialog.value = true
}

function handleResponse(response: string) {
  if (selectedReview.value) {
    // TODO: Implement response submission to backend
    console.log('Sending response:', response)
    selectedReview.value.response = {
      content: response,
      author: 'Support Team',
      date: new Date().toISOString()
    }
    selectedReview.value.status = 'responded' as const
    showRespondDialog.value = false
  }
}

function handleFlag(flag: Omit<ReviewFlag, 'id' | 'date'>) {
  if (selectedReview.value) {
    // TODO: Implement flag submission to backend
    console.log('Flagging review:', flag)
    selectedReview.value.flagged = true
    selectedReview.value.status = 'flagged' as const
    showFlagDialog.value = false
  }
}

// Fetch data on mount
onMounted(async () => {
  initializeDates() // Initialize with 30-day default
  const filters = {
    start_date: startDate.value,
    end_date: endDate.value
  }
  fetchMentions(filters)
  try {
    const response = await getForumCredentials()
    credentials.value = response.data
  } catch (error) {
    console.error('Error fetching forum credentials:', error)
  }
})
</script>

<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h1 class="text-xl md:text-2xl font-medium text-green-800 mb-2">
              Review Management
            </h1>
            <p class="text-gray-600 text-lg">
              Connect directly with your community through thoughtful engagement and responses. Our platform helps you manage and reply to discussions across the cannabis space, ensuring your brand's voice is heard. From answering questions to addressing feedback, build stronger relationships with people in real-time. Turn every interaction into an opportunity to strengthen your brand's reputation.
            </p>
          </div>
          <div class="w-48 h-48 flex-shrink-0 relative">
            <img
              :src="analyticsImage"
              alt="Review Management illustration"
              class="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      <!-- Summary Section -->
      <div class="mb-8">
        <div class="flex gap-6">
          <!-- Reviews Requiring Response -->
          <div class="shadow-sm hover:shadow-md transition-all duration-200 border border-blue-500/10 bg-gradient-to-br from-blue-100/60 to-indigo-100/60 rounded-lg p-6 flex-1">
            <div class="flex items-center justify-between mb-6">
              <span class="text-sm font-medium text-blue-700">Reviews Requiring Response</span>
              <MessageCircle class="h-4 w-4 text-blue-700" />
            </div>
            <div class="space-y-4">
              <div v-if="isLoading" class="h-8 bg-blue-200/50 rounded animate-pulse w-16"></div>
              <div v-else class="text-3xl font-bold text-blue-700">{{ reviewsRequiringResponse }}</div>
            </div>
          </div>

          <!-- Average Response Time -->
          <div class="shadow-sm hover:shadow-md transition-all duration-200 border border-emerald-500/10 bg-gradient-to-br from-emerald-100/60 to-green-100/60 rounded-lg p-6 flex-1">
            <div class="flex items-center justify-between mb-6">
              <span class="text-sm font-medium text-emerald-700">Average Response Time</span>
              <Clock class="h-4 w-4 text-emerald-700" />
            </div>
            <div class="space-y-4">
              <div v-if="isLoading" class="h-8 bg-emerald-200/50 rounded animate-pulse w-24"></div>
              <div v-else class="text-3xl font-bold text-emerald-700">{{ averageResponseTime }}</div>
            </div>
          </div>

          <!-- Response Rate -->
          <div class="shadow-sm hover:shadow-md transition-all duration-200 border border-amber-500/10 bg-gradient-to-br from-amber-100/60 to-yellow-100/60 rounded-lg p-6 flex-1">
            <div class="flex items-center justify-between mb-6">
              <span class="text-sm font-medium text-amber-700">Response Rate</span>
              <CheckCircle class="h-4 w-4 text-amber-700" />
            </div>
            <div class="space-y-4">
              <div v-if="isLoading" class="h-8 bg-amber-200/50 rounded animate-pulse w-16"></div>
              <div v-else class="text-3xl font-bold text-amber-700">{{ responseRate }}%</div>
            </div>
          </div>

          <!-- Flagged Reviews -->
          <div class="shadow-sm hover:shadow-md transition-all duration-200 border border-rose-500/10 bg-gradient-to-br from-rose-100/60 to-red-100/60 rounded-lg p-6 flex-1">
            <div class="flex items-center justify-between mb-6">
              <span class="text-sm font-medium text-rose-700">Flagged Reviews</span>
              <Flag class="h-4 w-4 text-rose-700" />
            </div>
            <div class="space-y-4">
              <div v-if="isLoading" class="h-8 bg-rose-200/50 rounded animate-pulse w-16"></div>
              <div v-else class="text-3xl font-bold text-rose-700">{{ flaggedReviews }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="mb-8 bg-white rounded-lg shadow-sm">
        <div class="p-6 space-y-4">
          <div>
            <h2 class="text-lg font-medium text-gray-700">Review Filters</h2>
            <p class="text-base text-gray-500">
              Filter reviews by platform, keyword, sentiment, and search terms to focus your analysis.
            </p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- Date Range -->
            <div class="flex flex-col space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="relative">
                  <label class="block relative cursor-pointer">
                    <input
                      ref="startDateRef"
                      v-model="startDate"
                      type="date"
                      placeholder="Start Date (YYYY-MM-DD)"
                      class="w-full pl-3 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 [direction:rtl] [text-align-last:left] [&::-webkit-calendar-picker-indicator]:ml-0"
                    />
                    <div class="absolute inset-0" @click="startDateRef?.showPicker()"></div>
                  </label>
                </div>
                <div class="relative">
                  <label class="block relative cursor-pointer">
                    <input
                      ref="endDateRef"
                      v-model="endDate"
                      type="date"
                      placeholder="End Date (YYYY-MM-DD)"
                      class="w-full pl-3 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 [direction:rtl] [text-align-last:left] [&::-webkit-calendar-picker-indicator]:ml-0"
                    />
                    <div class="absolute inset-0" @click="endDateRef?.showPicker()"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Keywords Dropdown -->
            <div class="flex flex-col space-y-4">
              <div class="relative">
                <Tag class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                <select
                  v-model="selectedKeyword"
                  class="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                >
                  <option value="all-keywords">All Keywords</option>
                  <option v-for="keyword in availableKeywords" :key="keyword" :value="keyword">
                    {{ keyword }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Search Filter -->
            <div class="flex flex-col space-y-4">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search reviews..."
                  :disabled="isLoading"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <!-- Platform Filter -->
            <div class="flex flex-col space-y-4">
              <div class="relative">
                <Globe class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                <select
                  v-model="selectedPlatform"
                  class="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                >
                  <option value="all-platforms">All Platforms</option>
                  <option value="420magazine.com">420 Magazine</option>
                  <option value="420sa.co.za">420SA</option>
                  <option value="autoflower.org">Autoflower</option>
                  <option value="beanbasement.nl">Bean Basement</option>
                  <option value="growersnetwork.org">Growers Network</option>
                  <option value="growweedeasy.com">GrowWeedEasy</option>
                  <option value="homegrowncannabisco.community">Homegrown Cannabis Co</option>
                  <option value="icmag.com">ICMag</option>
                  <option value="ilgmforum.com">ILGM Forum</option>
                  <option value="marijuanapassion.com">Marijuana Passion</option>
                  <option value="overgrow.com">Overgrow</option>
                  <option value="percysgrowroom.com">Percy's Grow Room</option>
                  <option value="phenohunter.org">PhenoHunter</option>
                  <option value="reddit.com">Reddit</option>
                  <option value="rollitup.org">RollItUp</option>
                  <option value="thcfarmer.com">THCFarmer</option>
                  <option value="uk420.com">UK420</option>
                </select>
              </div>
            </div>

            <!-- Sentiment Filter -->
            <div class="flex flex-col space-y-4">
              <div class="relative">
                <MessageSquare class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                <select
                  v-model="selectedSentiment"
                  class="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                >
                  <option value="all">All Sentiments</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>
            </div>

            <!-- Sort Button -->
            <div class="flex flex-col space-y-4">
              <div class="relative">
                <ArrowUpDown class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                <button
                  @click="toggleSort"
                  class="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  Sort by Date
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div v-if="isLoading" class="space-y-6">
        <!-- Skeleton Reviews -->
        <div v-for="i in 5" :key="i" class="relative group">
          <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <!-- Top Bar Skeleton -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div>
                  <div class="h-5 bg-gray-200 rounded animate-pulse w-32 mb-1"></div>
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              </div>
              <div class="flex space-x-2">
                <div class="h-7 bg-gray-200 rounded animate-pulse w-24"></div>
                <div class="h-7 bg-gray-200 rounded animate-pulse w-20"></div>
                <div class="h-7 bg-gray-200 rounded animate-pulse w-20"></div>
                <div class="h-7 bg-gray-200 rounded animate-pulse w-20"></div>
              </div>
            </div>

            <!-- Divider -->
            <hr class="my-4 border-t border-gray-100" />

            <!-- Content Skeleton -->
            <div>
              <div class="h-7 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
              <div class="space-y-2 mb-4">
                <div class="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            </div>

            <!-- Actions Skeleton -->
            <div class="flex justify-end space-x-2">
              <div class="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
              <div class="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
              <div class="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
              <div class="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <div v-else-if="!paginatedReviews.length" class="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-gray-100 p-6 text-center">
        <div class="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <Star class="w-8 h-8 text-amber-400" />
        </div>

        <!-- Text Content -->
        <h3 class="text-lg font-medium text-gray-700 mb-2">
          No Reviews Yet
        </h3>
        <p class="text-gray-500 text-sm mb-5 max-w-[700px]">
          Monitor and respond to customer reviews across platforms. Connect with your community today.
        </p>

      </div>
      <div v-else class="space-y-6">
        <!-- Reviews List -->
        <div
          v-for="review in paginatedReviews"
          :key="review.id"
          class="relative group"
        >
          <div class="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
               :class="{ 'border-red-300 bg-red-50': review.flagged }">
            <!-- Top Bar -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center text-green-600 font-bold">
                  {{ review.author[0].toUpperCase() }}
                </div>
                <div>
                  <h3 class="text-gray-700 font-medium">{{ review.author }}</h3>
                  <p class="text-gray-500 text-sm flex items-center">
                    <Clock class="w-3 h-3 mr-1" />
                    {{ formatDate(review.post_date) }}
                  </p>
                </div>
              </div>
              <div class="flex space-x-2">
                <span
                  class="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-normal transition-colors duration-300"
                  :class="[getPlatformColor(review.source), 'hover:from-opacity-20 hover:to-opacity-15']"
                >
                  <span class="text-sm font-normal">{{ review.source }}</span>
                </span>
                <span
                  class="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-normal bg-gradient-to-r from-sky-100/90 to-blue-50/80 text-blue-700 hover:from-sky-200/90 hover:to-blue-100/80 transition-colors duration-300"
                >
                  <span class="text-sm font-normal">{{ review.keyword_term }}</span>
                </span>
                <span
                  class="inline-flex items-center justify-center w-24 px-3 py-1 rounded-md text-sm font-normal transition-colors duration-300"
                  :class="{
                    'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 hover:from-emerald-500/20 hover:to-emerald-500/15': review.sentiment === 'positive',
                    'bg-gradient-to-r from-rose-500/10 to-rose-500/5 text-rose-700 hover:from-rose-500/20 hover:to-rose-500/15': review.sentiment === 'negative',
                    'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-700 hover:from-amber-500/20 hover:to-amber-500/15': review.sentiment === 'neutral' || review.sentiment === null
                  }"
                >
                  <component :is="getSentimentIcon(review.sentiment || 'neutral')" class="w-4 h-4 mr-1" :class="{
                    'text-emerald-700': review.sentiment === 'positive',
                    'text-rose-700': review.sentiment === 'negative',
                    'text-amber-700': review.sentiment === 'neutral' || review.sentiment === null
                  }" />
                  <span class="text-sm font-normal">
                    {{ review.sentiment ? (review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)) : 'Neutral' }}
                  </span>
                </span>
                <span
                  class="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-normal"
                  :class="getStatusColor(review.status || 'pending')"
                >
                  <Clock class="w-4 h-4 mr-1" />
                  <span class="text-sm font-normal">
                    {{ (review.status || 'pending').charAt(0).toUpperCase() + (review.status || 'pending').slice(1) }}
                  </span>
                </span>
              </div>
            </div>

            <!-- Divider -->
            <hr class="my-4 border-t border-gray-100" />

            <!-- Content -->
            <div>
              <h2 class="text-lg font-medium text-gray-700 mb-4" v-html="processContent(review.title, review.keyword_term)">
              </h2>
              <p class="text-gray-600 leading-relaxed mb-4" v-html="processContent(review.content, review.keyword_term)"></p>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-2">
              <button
                @click="openRespondDialog(review)"
                class="inline-flex items-center px-3 py-1 text-sm font-normal bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 hover:from-slate-200 hover:to-slate-100 rounded-md transition-all duration-300"
                :disabled="review.flagged"
              >
                <Reply class="w-4 h-4 mr-1" />
                Respond
              </button>
              <button
                @click="openFlagDialog(review)"
                class="inline-flex items-center px-3 py-1 text-sm font-normal bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 hover:from-slate-200 hover:to-slate-100 rounded-md transition-all duration-300"
                :class="{ 'from-slate-200 to-slate-100': review.flagged }"
                :disabled="review.flagged"
              >
                <Flag class="w-4 h-4 mr-1" />
                {{ review.flagged ? 'Flagged' : 'Flag' }}
              </button>
              <button
                @click="openHistoryDialog(review)"
                class="inline-flex items-center px-3 py-1 text-sm font-normal bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 hover:from-slate-200 hover:to-slate-100 rounded-md transition-all duration-300"
              >
                <History class="w-4 h-4 mr-1" />
                History
              </button>
              <button
                class="inline-flex items-center px-3 py-1 text-sm font-normal bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 hover:from-slate-200 hover:to-slate-100 rounded-md transition-all duration-300"
                :disabled="review.flagged"
              >
                <Check class="w-4 h-4 mr-1" />
                Mark as Done
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="mt-8">
        <Pagination
          v-model:currentPage="currentPage"
          :totalPages="totalPages"
        />
      </div>

      <!-- Dialogs -->
      <ResponseDialog
        v-if="selectedReview"
        :review="selectedReview"
        :show="showRespondDialog"
        :credentials="credentials"
        @close="showRespondDialog = false"
        @submit="handleResponse"
      />

      <FlagDialog
        v-if="selectedReview"
        :review="selectedReview"
        :show="showFlagDialog"
        @close="showFlagDialog = false"
        @submit="handleFlag"
      />

      <!-- History Dialog -->
      <div v-if="showHistoryDialog && selectedReview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white rounded-lg max-w-[425px] w-full">
          <div class="bg-green-700 p-6 rounded-t-lg flex items-center justify-between">
            <h3 class="text-xl font-semibold text-white">Review History</h3>
            <button @click="showHistoryDialog = false" class="text-green-100 hover:text-white hover:bg-green-600 p-1 rounded">
              <X class="h-5 w-5" />
            </button>
          </div>
          <div class="p-6 space-y-6">
            <div class="space-y-4">
              <div v-if="selectedReview.response" class="flex items-start gap-2">
                <div class="mt-1 bg-green-100 p-1.5 rounded-full">
                  <MessageCircle class="h-3 w-3 text-green-800" />
                </div>
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <span class="font-medium text-green-800">Support Team</span>
                    <span>•</span>
                    <span>{{ formatDate(selectedReview.response.date) }}</span>
                  </div>
                  <p class="text-sm text-gray-600">{{ selectedReview.response.content }}</p>
                </div>
              </div>
              <div v-else class="text-center text-gray-500">
                No response history available
              </div>
            </div>
          </div>
          <div class="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-100 flex justify-end">
            <button 
              @click="showHistoryDialog = false"
              class="px-4 py-2.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
