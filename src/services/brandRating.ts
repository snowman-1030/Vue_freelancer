import { useAnalyticsStore } from '@/stores/analytics'
import type { BrandRatingStatus } from '@/types/analytics'

export class BrandRatingService {
  private static readonly CACHE_PREFIX = 'brand_rating_'
  private static readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  constructor(private analyticsStore = useAnalyticsStore()) {}

  async calculateRating(keywordId: number): Promise<BrandRatingStatus | null> {
    try {
      // First check if we already have a valid rating for this keyword
      const currentRating = this.analyticsStore.brandRating
      if (currentRating?.id === keywordId) {
        return {
          status: 'completed',
          result: currentRating
        }
      }

      // Then check cache for this specific keyword
      const cached = this.getCachedRating(keywordId)
      if (cached?.result?.id === keywordId) {
        return cached
      }

      // Check current calculation status before starting new one
      const currentStatus = await this.analyticsStore.fetchBrandRating(keywordId)
      if (currentStatus) {
        return currentStatus
      }

      // Only start new calculation if no existing calculation is in progress
      const status = await this.analyticsStore.calculateBrandRating(keywordId)
      
      if (status?.status === 'completed' && status.result?.id === keywordId) {
        this.cacheRating(status, keywordId)
      }

      return status
    } catch (error) {
      console.error('Failed to calculate brand rating:', error)
      return null
    }
  }

  private getCachedRating(keywordId: number): BrandRatingStatus | null {
    const cacheKey = `${BrandRatingService.CACHE_PREFIX}${keywordId}`
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    try {
      const { data, timestamp } = JSON.parse(cached)
      const isExpired = Date.now() - timestamp > BrandRatingService.CACHE_DURATION
      
      // Validate cache has correct keywordId
      if (isExpired || !data?.result?.id || data.result.id !== keywordId) {
        localStorage.removeItem(cacheKey)
        return null
      }
      
      return data
    } catch (error) {
      localStorage.removeItem(cacheKey)
      return null
    }
  }

  private cacheRating(data: BrandRatingStatus, keywordId: number): void {
    if (!data?.result?.id || data.result.id !== keywordId) return

    const cacheKey = `${BrandRatingService.CACHE_PREFIX}${keywordId}`
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data,
        timestamp: Date.now()
      })
    )
  }
}