<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import {
  Send,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  X,
  MessageSquare,
  Loader2,
  Bot
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import KeywordChart from './components/KeywordChart.vue'
import SentimentIndicator from './components/SentimentIndicator.vue'
import { useChat } from './composables/useChat'
import teamworkImage from '@/assets/images/illustrations/teamwork.png'

// State management
const isQuestionsOpen = ref(false)
const chatContainer = ref<HTMLDivElement | null>(null)
const questionsPanel = ref<HTMLDivElement | null>(null)
const showScrollIndicator = ref(true)

// Check if panel needs scroll indicator
const checkScroll = () => {
  if (questionsPanel.value) {
    const { scrollTop, scrollHeight, clientHeight } = questionsPanel.value
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    showScrollIndicator.value = !isAtBottom
  }
}

// Watch for panel open to check scroll
watch(isQuestionsOpen, (newVal: boolean) => {
  if (newVal) {
    nextTick(() => {
      checkScroll()
    })
  }
})

// Chat composable
const {
  messages,
  input,
  mainQuestions,
  categorizedQuestions,
  isLoading,
  error,
  sendMessage,
  handleQuestionClick
} = useChat()

const scrollToBottom = async () => {
  await nextTick()
  setTimeout(() => {
    if (chatContainer.value) {
      const scrollHeight = chatContainer.value.scrollHeight
      chatContainer.value.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      })
    }
  }, 100)
}

const originalSendMessage = sendMessage
const wrappedSendMessage = async (text: string) => {
  await originalSendMessage(text)
  await scrollToBottom()
}

onMounted(() => {
  scrollToBottom()
})

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey && !isLoading.value) {
    e.preventDefault()
    wrappedSendMessage(input.value)
  }
}
</script>

<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Welcome Section -->
    <Card class="mb-8">
      <div class="flex flex-col md:flex-row items-center gap-6 p-6">
        <div class="flex-1">
          <h1 class="text-xl md:text-2xl font-medium text-green-800 mb-2">
            Welcome to your AI Chat Assistant!
          </h1>
          <p class="text-gray-600 text-lg">
            Here you can explore your brand's performance data and metrics through natural conversation. Ask about sentiment trends, review patterns, or competitive insights for clear, data-driven answers. Think of me as your brand analytics expert, ready to help you understand your impact in the cannabis community today.
          </p>
        </div>
        <div class="w-48 h-48 flex-shrink-0 relative">
          <img
            :src="teamworkImage"
            alt="AI Chat Assistant illustration"
            class="w-full h-full object-contain"
          />
        </div>
      </div>
    </Card>

    <!-- Error Alert -->
    <Alert v-if="error" variant="destructive" class="mb-4">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Chat Window -->
    <Card class="mb-8 overflow-hidden">
      <CardHeader class="bg-gray-50 rounded-t-lg">
      </CardHeader>
      <CardContent class="p-0">
        <div ref="chatContainer" class="h-[720px] overflow-y-auto p-4 scroll-smooth bg-white">
          <div v-if="!messages.length" class="flex flex-col items-center justify-center h-[720px] bg-white p-6 text-center">
            <div class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <Bot class="w-8 h-8 text-green-500" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Ask Me Anything
            </h3>
            <p class="text-gray-500 text-sm mb-5 max-w-[600px]">
              Ask me questions about brand monitoring, market trends, or get help analyzing your data.
            </p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="message in messages" :key="message.id"
                 :class="['flex flex-col', message.sender === 'user' ? 'items-end' : 'items-start']"
                 @mounted="() => { console.log('Message sentiment:', message.sentiment) }">
              <div :class="[
                'p-4 rounded-lg whitespace-pre-line',
                message.visualization ? 'max-w-[950px]' : 'max-w-[70%]',
                message.sender === 'user' ? 'bg-green-100 text-green-800' : 'bg-white border border-gray-200'
              ]">
                <div v-if="message.sender === 'ai' && message.text.includes('Context:')">
                  <div v-for="(block, idx) in message.text.split('\n\n')" :key="idx">
                    <template v-if="block.includes('Context:')">
                      <div class="flex items-center gap-2 mb-1">
                        <SentimentIndicator :sentiment="(() => {
                                                  const text = block.toLowerCase();
                                                  const [title, context] = text.split('context:');
                                                  
                                                  // Check for negative sentiment
                                                  if (text.includes('worst') || text.includes('lacking') || text.includes('shit') || text.includes('problems')) {
                                                    return 'negative';
                                                  }
                                                  
                                                  // Check for positive sentiment
                                                  if (text.includes('epic') || text.includes('celebrate') || text.includes('amazing') ||
                                                      text.includes('love') || text.includes('cant wait') || text.includes('this light is amazing') ||
                                                      (title.includes('hcc') && context?.includes('viparspectra'))) {
                                                    return 'positive';
                                                  }
                                                  
                                                  return 'neutral';
                                                })()" />
                        <span>{{ block.split('\n')[0] }}</span>
                      </div>
                      <div class="ml-4 text-gray-600 mb-3">{{ block.split('\n')[1] }}</div>
                    </template>
                    <template v-else>
                      <span>{{ block }}</span>
                    </template>
                  </div>
                </div>
                <div v-else>
                  <div class="flex items-center gap-2">
                    <p class="text-[16px] leading-relaxed whitespace-pre-wrap" v-html="message.text.replace(/##LINK\[(.*?)\]##🔗##/g, '<a href=\'$1\' target=\'_blank\'>🔗</a>')"></p>
                    <Loader2 v-if="message.text === '🤖 Robot brain doing backflips...'" class="h-4 w-4 animate-spin text-green-600" />
                  </div>
                  <!-- Display recommendations if available -->
                  <div v-if="message.insights?.recommendations?.length" class="mt-6 space-y-3">
                    <p class="font-semibold text-green-800 text-[16px] mb-2">Recommended Actions:</p>
                    <ul class="list-disc list-inside space-y-3 text-gray-700 text-[16px]">
                      <li v-for="(rec, idx) in message.insights.recommendations" :key="idx" class="ml-2">
                        {{ rec }}
                      </li>
                    </ul>
                  </div>
                </div>
                <div v-if="message.visualization" :key="`viz-container-${message.id}`" class="mt-4 w-[850px] h-[400px] bg-white rounded-lg border border-gray-200 p-4">
                  <KeywordChart 
                    :message-id="message.id"
                    :data="message.visualization.data"
                    :type="message.visualization.type"
                    :config="message.visualization.config"
                    @loaded="scrollToBottom"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div class="flex space-x-2">
            <Input 
              v-model="input"
              @keypress="handleKeyPress"
              placeholder="Type your message here..."
              class="flex-1 text-[16px] h-11"
              :disabled="isLoading"
            />
            <Button 
              @click="() => wrappedSendMessage(input)" 
              class="bg-green-600 hover:bg-green-700 text-white"
              :disabled="isLoading"
            >
              <Loader2 v-if="isLoading" class="h-4 w-4 mr-2 animate-spin" />
              <Send v-else class="h-4 w-4 mr-2" />
              {{ isLoading ? 'Processing...' : 'Send' }}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Questions Panel Button -->
    <button
      @click="isQuestionsOpen = true"
      class="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
    >
      <HelpCircle class="h-5 w-5" />
      <span>Example Questions</span>
    </button>

    <!-- Overlay -->
    <div
      v-if="isQuestionsOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      @click="isQuestionsOpen = false"
    />

    <!-- Questions Panel -->
    <div
      v-if="isQuestionsOpen"
      class="fixed inset-y-0 right-0 w-96 bg-[#fafafa] shadow-xl z-50 transform transition-transform duration-300"
      :class="isQuestionsOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
        <div class="flex items-center gap-2">
          <div class="w-1 h-6 bg-green-500 rounded-full shadow-sm"></div>
          <h2 class="text-lg font-semibold text-gray-800">Example Questions</h2>
        </div>
        <button
          @click="isQuestionsOpen = false"
          class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Questions Sections -->
      <div
        ref="questionsPanel"
        class="h-[calc(100vh-8rem)] overflow-y-auto questions-panel relative"
        @scroll="checkScroll"
      >
        <div class="p-6 space-y-6 pb-32">
          <!-- Main Questions -->
          <div class="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded-lg">
              <MessageSquare class="w-4 w-4 text-green-600" />
              <h3 class="font-medium">Quick Questions</h3>
            </div>
            <div class="space-y-2">
              <Button
                v-for="question in mainQuestions"
                :key="question"
                variant="ghost"
                class="w-full justify-start h-auto py-2.5 px-4 text-left text-sm hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                @click="handleQuestionClick(question); isQuestionsOpen = false"
                :disabled="isLoading"
              >
                {{ question }}
              </Button>
            </div>
          </div>

          <!-- Category Questions -->
          <div
            v-for="catQuestion in categorizedQuestions"
            :key="catQuestion.category"
            class="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100"
          >
            <div class="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded-lg">
              <MessageCircle class="w-4 w-4 text-green-600" />
              <h3 class="font-medium">{{ catQuestion.category }}</h3>
            </div>
            <div class="space-y-2">
              <Button
                v-for="question in catQuestion.questions"
                :key="question"
                variant="ghost"
                class="w-full justify-start h-auto py-2 px-3 text-left text-sm hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                @click="handleQuestionClick(question); isQuestionsOpen = false"
                :disabled="isLoading"
              >
                <ChevronRight class="h-4 w-4 mr-2 text-green-600" />
                {{ question }}
              </Button>
            </div>
          </div>
        </div>

        <!-- Scroll Indicator -->
        <div v-if="showScrollIndicator" class="fixed bottom-0 right-0 w-96 flex justify-center pointer-events-none z-[60]">
          <div class="bg-gradient-to-t from-[#fafafa] to-transparent h-24 w-full absolute bottom-0"></div>
          <div class="bg-green-200 text-green-900 rounded-full p-2 mb-6 relative shadow-sm">
            <ChevronDown class="h-5 w-5 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
/* Webkit (Chrome, Safari, Edge) scrollbar styles */
.questions-panel,
.scroll-smooth {
  scrollbar-width: auto;
  scrollbar-color: #22c55e #f1f1f1;
}

.questions-panel::-webkit-scrollbar,
.scroll-smooth::-webkit-scrollbar {
  width: 14px;
}

.questions-panel::-webkit-scrollbar-track,
.scroll-smooth::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.questions-panel::-webkit-scrollbar-thumb,
.scroll-smooth::-webkit-scrollbar-thumb {
  background: #22c55e;
  border-radius: 4px;
  border: 2px solid #f1f1f1;
}

.questions-panel::-webkit-scrollbar-thumb:hover,
.scroll-smooth::-webkit-scrollbar-thumb:hover {
  background: #16a34a;
}

.questions-panel::-webkit-scrollbar-thumb:active,
.scroll-smooth::-webkit-scrollbar-thumb:active {
  background: #15803d;
}
</style>
