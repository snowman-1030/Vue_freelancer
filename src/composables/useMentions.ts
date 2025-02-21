import { ref, computed } from 'vue'
import axios from '@/lib/axios'

export interface GraphDataPoint {
  date: string
  positive: number
  negative: number
  neutral: number
}

export interface Mention {
  id: number
  keyword_term: string
  title: string
  content: string
  url: string
  author: string
  source: string
  post_date: string
  created_at: string
  sentiment: 'positive' | 'neutral' | 'negative' | null
  sentiment_confidence?: number
}

export interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: Mention[]
  total_pages: number
  current_page: number
  stats: {
    positive: number
    negative: number
    neutral: number
    keywords: string[]
  }
  graph_data: GraphDataPoint[]
}

export function useMentions() {
  // Add cache map
  const responseCache = ref(new Map<string, {
    data: PaginatedResponse
    timestamp: number
  }>())

  // const mentions = ref<Mention[]>([])
  const isLoading = ref(false)
  // const error = ref<string | null>(null)
  const error = false;
  const totalCount = ref(0)
  // const totalPages = ref(0)

  // Stats and graph data from API response
  const stats = ref({
    positive: 0,
    negative: 0,
    neutral: 0,
    keywords: [] as string[]
  })
  const graphData = ref<GraphDataPoint[]>([])
  const availableKeywords = ref<string[]>([])

  // Computed stats
  const totalMentions = computed(() => totalCount.value)
  const positiveMentions = computed(() => stats.value.positive)
  const negativeMentions = computed(() => stats.value.negative)
  const neutralMentions = computed(() => stats.value.neutral)

  interface FetchParams {
    page?: number
    start_date?: string
    end_date?: string
    platforms?: string
    sentiment?: string
    keyword?: string
    search?: string
    ordering?: string  // Parameter name used by API endpoints for sorting
  }

  // Initialize mentions ref
  // mentions.value = []

  // Fetch mentions with optional filters and caching
  const fetchMentions = async (filters: FetchParams = {}) => {
    const cacheKey = JSON.stringify(filters)
    const cached = responseCache.value.get(cacheKey)
    
    // Use cache if less than 5 minutes old
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      mentions.value = cached.data.results
      totalCount.value = cached.data.count
      totalPages.value = cached.data.total_pages
      stats.value = cached.data.stats
      graphData.value = cached.data.graph_data
      availableKeywords.value = cached.data.stats.keywords
      return
    }

    isLoading.value = true;
    try {
      console.log('Sending filters to API:', filters)
      const response = await axios.get<PaginatedResponse>('/posts/', { params: filters })
      console.log('API Response:', response.data)
      
      // Cache the response
      responseCache.value.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      })
      
      mentions.value = response.data.results
      totalCount.value = response.data.count
      totalPages.value = response.data.total_pages
      stats.value = response.data.stats
      graphData.value = response.data.graph_data
      availableKeywords.value = response.data.stats.keywords
    } catch (err) {
      // error.value = 'Failed to fetch mentions'
      console.error('Error fetching mentions:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Retry sentiment analysis for a specific mention
  const retrySentiment = async (mentionId: number) => {
    try {
      const response = await axios.post(`/posts/${mentionId}/retry-sentiment/`)
      
      // Update the mention in the local state
      const index = mentions.value.findIndex(m => m.id === mentionId)
      if (index !== -1) {
        mentions.value[index] = {
          ...mentions.value[index],
          sentiment: response.data.sentiment,
          sentiment_confidence: response.data.sentiment_confidence
        }
      }
      
      return response.data
    } catch (err) {
      console.error('Error retrying sentiment analysis:', err)
      throw err
    }
  }

  const mentions = [
      {
        "id": 242,
        "keyword_term": "kush",
        "title": "Moor Seeds....Moor Trees.....",
        "content": "Fire OG preservation underway. Threw in long valley royal kush and boo....I have a feeling these will marry well ...after this will be the wolf pack preservation.Day 1.",
        "url": "https://phenohunter.org/index.php?threads/moor-seeds-moor-trees.3615/post-273689",
        "author": "Lester Moor",
        "source": "phenohunter.org",
        "post_date": "2025-02-21T06:40:33Z",
        "sentiment": "positive",
        "created_at": "2025-02-21T09:17:30.067162Z",
        "sentiment_confidence":0
      },
      {
          "id": 30,
          "keyword_term": "kush",
          "title": "Strains we miss",
          "content": "I miss kushs, those were the end of the good ole days😭",
          "url": "https://overgrow.com/t/strains-we-miss/104980/411",
          "author": "ThcTattedGenetics",
          "source": "overgrow.com",
          "post_date": "2025-02-21T06:25:01.913000Z",
          "sentiment": "positive",
          "created_at": "2025-02-21T09:02:07.555422Z",
          "sentiment_confidence":0
      },
      {
          "id": 31,
          "keyword_term": "kush",
          "title": "What are your latest seed purchases? Post those new packs & purchase info here",
          "content": "I have been intending to do something with CBD-heavy strains for my wife’s chronic pain.  I sprouted two Cream and Cheese 20/20%. Two Doctor SMan 30:1 CBD sprouted and, thought to take a chance, went to Pacific Seeds for $44 with shipping and tax, got me 3 Stephen Hawking Kush CBD seeds.  Here’s what I received.  WTF! Do they have chickens working in quality control? Fucked up seed 600×600 41.3 KB",
          "url": "https://overgrow.com/t/what-are-your-latest-seed-purchases-post-those-new-packs-purchase-info-here/105041/4308",
          "author": "BobbyBudz",
          "source": "overgrow.com",
          "post_date": "2025-02-21T06:05:50.678000Z",
          "sentiment": "negative",
          "created_at": "2025-02-21T09:02:07.560756Z",
          "sentiment_confidence":0
      },
      {
          "id": 32,
          "keyword_term": "kush",
          "title": "Humboldt CSI Plant Guide",
          "content": "Three Queens- white fire og x bubba kush Ran this pack n found a keeper with mold resistance, not all were mold resistant.  A classic kush aroma with faint lime peel hints,.  Reminded me of the white and triangle kush in terms of effects, structure and trichs.   potent relaxation, focus, anxiety relief. Pain relief.  Also cured real nice, it would taste great a year later.  Other Phenos were more bubba, short, compact.  This one wouldn’t purple and I appreciated that too.  Cut at 70-75… the last couple days something would always happen but 90 would be ideal. IMG_2801 1179×1768 189 KB IMG_2803 1179×1614 165 KB IMG_2802 1179×1934 155 KB",
          "url": "https://overgrow.com/t/humboldt-csi-plant-guide/105365/522",
          "author": "Mangoman911",
          "source": "overgrow.com",
          "post_date": "2025-02-21T04:54:29.332000Z",
          "sentiment": "positive",
          "created_at": "2025-02-21T09:02:07.567050Z"
      },
      {
          "id": 33,
          "keyword_term": "kush",
          "title": "Take seeds, leave seeds- Landrace Edition",
          "content": "I will take black critical Kush @dogtown and leave Vvvvv lemints f5 vvvV",
          "url": "https://overgrow.com/t/take-seeds-leave-seeds-landrace-edition/147089/882",
          "author": "420noob",
          "source": "overgrow.com",
          "post_date": "2025-02-21T04:04:34.864000Z",
          "sentiment": "neutral",
          "created_at": "2025-02-21T09:02:07.573518Z",
          "sentiment_confidence":0
      },
      {
          "id": 3,
          "keyword_term": "kush",
          "title": "$400 - 650 Watt LEDs - Scynce Raging Kush 2 - Used for 1 year - (100 available)",
          "content": "5h - I'm interested in 35 units at $100 apiece plus shipping.",
          "url": "https://forum.growersnetwork.org/t/400-650-watt-leds-scynce-raging-kush-2-used-for-1-year-100-available/58323/11",
          "author": "donnasbuds",
          "source": "growersnetwork.org",
          "post_date": "2025-02-21T03:32:02.535000Z",
          "sentiment": "neutral",
          "created_at": "2025-02-21T08:59:09.679389Z",
          "sentiment_confidence":0
      },
      {
          "id": 86,
          "keyword_term": "kush",
          "title": "Cookies kush 3 months into veg need some help",
          "content": "I agree looks hungry",
          "url": "https://ilgmforum.com/t/cookies-kush-3-months-into-veg-need-some-help/117811/3",
          "author": "Mmanson1981",
          "source": "ilgmforum.com",
          "post_date": "2025-02-21T02:14:16.742000Z",
          "sentiment": "neutral",
          "created_at": "2025-02-21T09:03:39.556262Z",
          "sentiment_confidence":0
      },
      {
          "id": 34,
          "keyword_term": "kush",
          "title": "Triangle Kush and her crosses (What’s your favorite flavor?)",
          "content": "Yeah someone should definitely start one, not to just bash and call out dealers but to post honest reviews with pictures",
          "url": "https://overgrow.com/t/triangle-kush-and-her-crosses-whats-your-favorite-flavor/29055/945",
          "author": "Midnight",
          "source": "overgrow.com",
          "post_date": "2025-02-21T01:38:31.668000Z",
          "sentiment": "neutral",
          "created_at": "2025-02-21T09:02:07.578977Z",
          "sentiment_confidence":0
      },
      {
          "id": 573,
          "keyword_term": "kush",
          "title": "Thirvnrob's Multi Strain Seed Drawer Clean Out",
          "content": "Power Plant #3 is on day 37 post flip. She’s flexing her Sativa muscle…Power Plant #2 is on day 43. I’ll have to post a pic later.Finally, Pure Kush #2 on day 44 post flip…And a group shot…",
          "url": "https://www.420magazine.com/community/threads/thirvnrobs-multi-strain-seed-drawer-clean-out.544277/post-6091134",
          "author": "Thirvnrob",
          "source": "420magazine.com",
          "post_date": "2025-02-21T01:26:46Z",
          "sentiment": "neutral",
          "created_at": "2025-02-21T09:58:48.554766Z",
          "sentiment_confidence":0
      },
      {
          "id": 87,
          "keyword_term": "kush",
          "title": "Confused on technique",
          "content": "@Storm @Myfriendis410 @Caligurl @ChittyChittyBangin @OGIncognito @LiesGrows a look at the purple kush. 17 good colas on this one. i only got 23g’s from the sour diesel, was really compact. will get a lot more off of this one. IMG_1320 1920×1440 156 KB",
          "url": "https://ilgmforum.com/t/confused-on-technique/102215/392",
          "author": "bullsnow",
          "source": "ilgmforum.com",
          "post_date": "2025-02-21T01:21:24.902000Z",
          "sentiment": "positive",
          "created_at": "2025-02-21T09:03:39.562944Z",
          "sentiment_confidence":0
      }
  ]
  
  const totalPages = 40;

  return {
    // State
    mentions,
    isLoading,
    error,
    totalCount,
    totalPages,
    stats,

    // Computed
    totalMentions,
    positiveMentions,
    negativeMentions,
    neutralMentions,

    // Methods
    fetchMentions,
    retrySentiment,
    
    // Graph data
    graphData,
    availableKeywords
  }
}
