import { ref } from 'vue'
import axios from '@/lib/axios'

export interface Message {
  id: number
  text: string
  sender: 'user' | 'ai'
  sentiment?: 'positive' | 'neutral' | 'negative'
  visualization?: Visualization
		insights?: {
				type: string
				data: any[]
				summary?: string
				sentiment?: string
				recommendations?: string[]
		}
}

export interface KeywordData {
  keyword: string
  mentions: number
}

export interface GaugeData {
  value: number
  max: number
}

interface Visualization {
  type: 'bar_chart' | 'pie_chart' | 'gauge_chart'
  data: KeywordData[] | GaugeData[]
  config?: {
    xAxis?: string
    yAxis?: string
    title?: string
    min?: number
    max?: number
  }
}

interface BackendGaugeData {
  score?: number
  value?: number
  max?: number
}

interface BackendVisualization {
  type: 'bar_chart' | 'pie_chart' | 'gauge_chart'
  data: KeywordData[] | BackendGaugeData[]
  config?: {
    xAxis?: string
    yAxis?: string
    title?: string
    min?: number
    max?: number
  }
}

export interface ChatResponse {
  query: string
  insights: {
      type: string
      data: any
      summary?: string
      message?: string
      visualization?: BackendVisualization
      recommendations?: string[]
  }
  error?: string
}

interface CategoryQuestion {
  category: string
  questions: string[]
}

export function useChat() {
  const messages = ref<Message[]>([])
  const input = ref('')
  const selectedCategory = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Main quick access questions
  const mainQuestions = [
    "Show me the trend of mentions for my brand over the last 30 days",
    "What's the latest buzz around my brand?",
    "What is the overall brand rating for our company?",
    "Show me posts where my brand is mentioned alongside competitors"
  ]

  const categorizedQuestions: CategoryQuestion[] = [
    {
      category: "Brand Reputation",
      questions: [
        "Show me the most recent positive posts about my brand",
        "Show me the most recent negative posts about my brand",
        "Which platforms have the most negative sentiment about my brand?",
        "Show me the ratio of positive to negative sentiments over the past month"
      ]
    },
    {
      category: "Sentiment Analysis",
      questions: [
        "Show me posts with high sentiment confidence",
        "Show me posts that need sentiment review"
      ]
    },
    {
      category: "Source Analysis",
      questions: [
        "What sources give us the most consistent sentiment scores?",
        "Which sources have the most variable sentiment?"
      ]
    },
    {
      category: "Forum Activity",
      questions: [
        "Show me our top performing forums",
        "Compare activity across different forum tiers"
      ]
    },
    {
      category: "Brand Rating",
      questions: [
        "Show me our rating component breakdown",
        "What's our daily rating activity look like?"
      ]
    }
  ]

  const transformGaugeData = (data: BackendGaugeData[]): GaugeData[] => {
    return data.map(item => ({
      value: item.score ?? item.value ?? 0,
      max: item.max ?? 100
    }))
  }

  const transformVisualization = (visualization: BackendVisualization): Visualization => {
    if (visualization.type === 'gauge_chart') {
      return {
        ...visualization,
        data: transformGaugeData(visualization.data as BackendGaugeData[])
      }
    }
    return visualization as Visualization
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    try {
      isLoading.value = true
      error.value = null

      // Add user message
      const userMessageId = Date.now()
      messages.value.push({ id: userMessageId, text, sender: 'user' })
      input.value = ''

      // Add temporary AI message
      const tempMessageId = Date.now() + 1
      messages.value.push({
        id: tempMessageId,
        text: "🤖 Robot brain doing backflips...",
        sender: 'ai'
      })
      
      // Send to API with streaming response - Fixed URL by removing extra /api prefix
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ query: text })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body available')

      // Process the streaming response
      const messageIndex = messages.value.findIndex(m => m.id === tempMessageId)
      if (messageIndex !== -1) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          // Convert the chunk to text and handle incomplete lines
          const chunk = new TextDecoder().decode(value)
          const lines = chunk.split('\n').filter(line => line.trim())
          
          // Process each complete line
          for (const line of lines) {
            // Skip if line is not valid JSON format
            if (!line.startsWith('{') || !line.endsWith('}')) {
              console.warn('Skipping invalid JSON line:', line)
              continue
            }
            
            try {
              let data;
              try {
                data = JSON.parse(line)
              } catch (parseError) {
                console.error('Error parsing chunk:', parseError, 'Line:', line)
                continue
              }

              if (!data) continue

              if (data.status === 'processing') {
                messages.value[messageIndex] = {
                  id: tempMessageId,
                  text: "Processing your request...",
                  sender: 'ai'
                }
              } else if (data.status === 'complete') {
                const result = data.data
                let visualization = undefined

                if (result.insights?.visualization) {
                  console.log('Raw visualization data:', result.insights.visualization);
                  visualization = transformVisualization(result.insights.visualization);
                  console.log('Transformed visualization data:', visualization);
                }
                
                const finalSentiment = result.sentiment || result.insights?.sentiment
                
                const updatedMessage: Message = {
                  id: tempMessageId,
                  text: result.insights?.summary || "Here's what I found...",
                  sender: 'ai' as const,
                  visualization: visualization,
                  sentiment: finalSentiment,
                  insights: result.insights
                }

                // Store message in local state for context
                if (messages.value.length > 10) {
                  messages.value = messages.value.slice(-10)
                }
                
                messages.value[messageIndex] = updatedMessage
              } else if (data.status === 'error') {
                messages.value[messageIndex] = {
                  id: tempMessageId,
                  text: data.message,
                  sender: 'ai'
                }
                error.value = data.message
              }
            } catch (e) {
              console.error('Error parsing chunk:', e)
            }
          }
        }
      }

    } catch (err: any) {
      console.error('Chat error:', err)
      const errorMessage = (err?.response?.data?.error || err?.message || 'An error occurred while processing your request') as string
      error.value = errorMessage
      messages.value.push({
        id: Date.now(),
        text: errorMessage,
        sender: 'ai'
      })
    } finally {
      isLoading.value = false
    }
  }

  const handleCategoryClick = (category: string) => {
    selectedCategory.value = category
  }

  const handleQuestionClick = (question: string) => {
    input.value = question
    selectedCategory.value = null
  }

  return {
    messages,
    input,
    selectedCategory,
    mainQuestions,
    categorizedQuestions,
    isLoading,
    error,
    sendMessage,
    handleCategoryClick,
    handleQuestionClick
  }
}
