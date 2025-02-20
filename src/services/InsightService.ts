import type { ReportResponse, SentimentData, SourceData, TrendData } from '../types/reports'

export interface InsightResult {
  type: 'positive' | 'neutral' | 'negative' | 'info'
  title: string
  description: string
  metric?: string
  change?: number
  significance: 'high' | 'medium' | 'low'
}

export class InsightService {
  /**
   * Analyze overall sentiment gauge data
   */
  analyzeSentimentGauge(
    current: { value: number; total: number },
    previous?: { value: number; total: number }
  ): InsightResult[] {
    const insights: InsightResult[] = []
    
    // Current sentiment analysis
    const sentimentLevel = this.getSentimentLevel(current.value)
    const score = current.value * 50 + 50
    
    insights.push({
      type: sentimentLevel,
      title: 'Overall Sentiment',
      description: `${this.getSentimentDescription(current.value)} (${score.toFixed(1)}% positive rating)`,
      metric: `${score.toFixed(1)}%`,
      significance: 'high'
    })

    // Add sentiment strength insight
    const strength = Math.abs(current.value)
    if (strength >= 0.3) {
      insights.push({
        type: current.value > 0 ? 'positive' : 'negative',
        title: 'Sentiment Strength',
        description: `Strong ${current.value > 0 ? 'positive' : 'negative'} sentiment intensity detected`,
        metric: `${(strength * 100).toFixed(1)}% strength`,
        significance: strength >= 0.4 ? 'high' : 'medium'
      })
    }

    // Add confidence insight based on volume
    if (current.total >= 100) {
      insights.push({
        type: 'info',
        title: 'Analysis Confidence',
        description: `High confidence score based on ${current.total} total mentions`,
        metric: `${current.total} mentions`,
        significance: current.total >= 500 ? 'high' : 'medium'
      })
    }

    // Change analysis if previous data exists
    if (previous) {
      const change = ((current.value - previous.value) / Math.abs(previous.value)) * 100
      const volumeChange = ((current.total - previous.total) / previous.total) * 100
      
      if (Math.abs(change) >= 5) {
        insights.push({
          type: change > 0 ? 'positive' : 'negative',
          title: 'Sentiment Trend',
          description: `Overall sentiment has ${change > 0 ? 'improved' : 'declined'} compared to previous period`,
          change,
          significance: Math.abs(change) >= 10 ? 'high' : 'medium'
        })
      }

      if (Math.abs(volumeChange) >= 10) {
        insights.push({
          type: 'info',
          title: 'Mention Volume',
          description: `Total mentions have ${volumeChange > 0 ? 'increased' : 'decreased'} compared to previous period`,
          change: volumeChange,
          significance: Math.abs(volumeChange) >= 20 ? 'high' : 'medium'
        })
      }
    }

    return insights
  }

  /**
   * Analyze sentiment distribution data
   */
  analyzeSentimentDistribution(
    distribution: SentimentData[]
  ): InsightResult[] {
    const insights: InsightResult[] = []
    const total = distribution.reduce((sum, item) => sum + item.count, 0)
    
    // Calculate percentages
    const sentimentPercentages = distribution.reduce((acc, item) => {
      acc[item.sentiment] = (item.count / total) * 100
      return acc
    }, {} as Record<string, number>)

    // Dominant sentiment
    const dominant = distribution.reduce((prev, current) => 
      current.count > prev.count ? current : prev
    )

    insights.push({
      type: dominant.sentiment as 'positive' | 'neutral' | 'negative',
      title: 'Dominant Sentiment',
      description: `${this.capitalize(dominant.sentiment)} sentiment leads with ${sentimentPercentages[dominant.sentiment].toFixed(1)}% (${sentimentPercentages['positive'].toFixed(1)}% positive, ${sentimentPercentages['negative'].toFixed(1)}% negative)`,
      metric: `${sentimentPercentages[dominant.sentiment].toFixed(1)}%`,
      significance: 'high'
    })

    // Sentiment ratio analysis
    const positiveRatio = sentimentPercentages['positive'] || 0
    const negativeRatio = sentimentPercentages['negative'] || 0
    const ratio = positiveRatio / (negativeRatio || 1)

    if (ratio >= 2) {
      insights.push({
        type: 'positive',
        title: 'Positive/Negative Ratio',
        description: `Positive mentions outweigh negative by ${ratio.toFixed(1)}x`,
        metric: `${ratio.toFixed(1)}x`,
        significance: ratio >= 3 ? 'high' : 'medium'
      })
    } else if (ratio <= 0.5) {
      insights.push({
        type: 'negative',
        title: 'Positive/Negative Ratio',
        description: `Negative mentions outweigh positive by ${(1/ratio).toFixed(1)}x`,
        metric: `${(1/ratio).toFixed(1)}x`,
        significance: ratio <= 0.33 ? 'high' : 'medium'
      })
    }

    return insights
  }

  /**
   * Analyze platform-specific sentiment data
   */
  analyzePlatformSentiment(
    platformData: Array<{
      source: string
      sentiment: string
      count: number
      confidence: number
    }>
  ): InsightResult[] {
    const insights: InsightResult[] = []
    
    // Group by platform
    const platformSentiments = platformData.reduce((acc, item) => {
      if (!acc[item.source]) {
        acc[item.source] = {
          positive: 0,
          negative: 0,
          neutral: 0,
          total: 0
        }
      }
      acc[item.source][item.sentiment.toLowerCase()] += item.count
      acc[item.source].total += item.count
      return acc
    }, {} as Record<string, Record<string, number>>)

    // Calculate overall platform stats
    const platforms = Object.entries(platformSentiments)
    const totalMentions = platforms.reduce((sum, [_, counts]) => sum + counts.total, 0)

    // Find platform with most engagement
    const mostActive = platforms.sort((a, b) => b[1].total - a[1].total)[0]
    if (mostActive) {
      const [platform, counts] = mostActive
      const percentage = (counts.total / totalMentions) * 100
      insights.push({
        type: 'info',
        title: 'Most Active Platform',
        description: `${platform} leads platform engagement with ${percentage.toFixed(1)}% of total mentions`,
        metric: `${percentage.toFixed(1)}% of mentions`,
        significance: percentage >= 25 ? 'high' : 'medium'
      })
    }

    // Analyze each platform
    platforms.forEach(([platform, counts]) => {
      const total = counts.total
      const positiveRatio = (counts.positive / total) * 100
      const negativeRatio = (counts.negative / total) * 100
      const neutralRatio = (counts.neutral / total) * 100

      // Based on typical distributions from database:
      // Neutral: ~50-60%
      // Positive: ~25-30%
      // Negative: ~10-15%

      // Check for unusually high positive sentiment
      if (positiveRatio >= 35) {
        insights.push({
          type: 'positive',
          title: `${platform} Sentiment`,
          description: `Above average positive sentiment on ${platform}`,
          metric: `${positiveRatio.toFixed(1)}% positive`,
          significance: positiveRatio >= 40 ? 'high' : 'medium'
        })
      }

      // Check for concerning negative sentiment
      if (negativeRatio >= 20) {
        insights.push({
          type: 'negative',
          title: `${platform} Sentiment`,
          description: `Higher than usual negative sentiment on ${platform}`,
          metric: `${negativeRatio.toFixed(1)}% negative`,
          significance: negativeRatio >= 25 ? 'high' : 'medium'
        })
      }

      // Analyze sentiment balance
      const posNegRatio = positiveRatio / (negativeRatio || 1)
      const typicalRatio = 2.0 // Based on database averages

      if (posNegRatio >= typicalRatio * 1.5) {
        insights.push({
          type: 'positive',
          title: `${platform} Balance`,
          description: `Strong positive to negative ratio on ${platform}`,
          metric: `${posNegRatio.toFixed(1)}x ratio`,
          significance: posNegRatio >= typicalRatio * 2 ? 'high' : 'medium'
        })
      } else if (posNegRatio <= typicalRatio * 0.5) {
        insights.push({
          type: 'negative',
          title: `${platform} Balance`,
          description: `Concerning positive to negative ratio on ${platform}`,
          metric: `${(1/posNegRatio).toFixed(1)}x inverse ratio`,
          significance: posNegRatio <= typicalRatio * 0.3 ? 'high' : 'medium'
        })
      }

      // Check for unusual neutrality
      if (neutralRatio >= 70) {
        insights.push({
          type: 'info',
          title: `${platform} Neutrality`,
          description: `Unusually high neutral sentiment on ${platform}`,
          metric: `${neutralRatio.toFixed(1)}% neutral`,
          significance: neutralRatio >= 80 ? 'high' : 'medium'
        })
      }
    })

    // Add comparative insights
    if (platforms.length > 1) {
      // Find platform with best positive/negative ratio
      const bestPlatform = platforms
        .map(([platform, counts]) => ({
          platform,
          ratio: counts.positive / (counts.negative || 1)
        }))
        .sort((a, b) => b.ratio - a.ratio)[0]

      if (bestPlatform && bestPlatform.ratio > 2.5) {
        insights.push({
          type: 'positive',
          title: 'Best Performing Platform',
          description: `${bestPlatform.platform} leads all platforms with an exceptional ${bestPlatform.ratio.toFixed(1)}:1 positive to negative ratio (typical ratio is 2:1)`,
          metric: `${bestPlatform.ratio.toFixed(1)}x positive/negative`,
          significance: bestPlatform.ratio >= 3.5 ? 'high' : 'medium'
        })
      }
    }

    return insights
  }

  /**
   * Analyze source breakdown data
   */
  analyzeSourceBreakdown(
    sourceData: SourceData[]
  ): InsightResult[] {
    const insights: InsightResult[] = []
    const total = sourceData.reduce((sum, item) => sum + item.count, 0)

    // Find dominant sources
    const sortedSources = [...sourceData].sort((a, b) => b.count - a.count)
    const topSource = sortedSources[0]
    
    if (topSource) {
      const percentage = (topSource.count / total) * 100
      insights.push({
        type: 'info',
        title: 'Primary Source',
        description: `${topSource.source} leads platform activity with ${percentage.toFixed(1)}% of total mentions`,
        metric: `${percentage.toFixed(1)}%`,
        significance: percentage >= 50 ? 'high' : 'medium'
      })
    }

    // Source concentration analysis
    const top3Percentage = sortedSources
      .slice(0, 3)
      .reduce((sum, item) => sum + (item.count / total) * 100, 0)

    // Add distribution pattern insight
    const distributionPattern = top3Percentage >= 75 ? 'Highly concentrated'
      : top3Percentage >= 60 ? 'Moderately concentrated'
      : 'Well distributed';

    insights.push({
      type: 'info',
      title: 'Distribution Pattern',
      description: `${distributionPattern} content distribution (top 3 sources: ${top3Percentage.toFixed(1)}%)`,
      metric: `${top3Percentage.toFixed(1)}%`,
      significance: top3Percentage >= 75 ? 'high' : 'medium'
    });

    return insights
  }

  /**
   * Analyze trend data
   */
  analyzeTrends(
    trendData: TrendData[],
    type: 'sentiment' | 'source'
  ): InsightResult[] {
    const insights: InsightResult[] = []
    
    if (trendData.length < 2) return insights

    // Sort by date
    const sortedData = [...trendData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Calculate overall trend with normalized percentages
    const firstValue = sortedData[0].value
    const lastValue = sortedData[sortedData.length - 1].value
    const rawChange = ((lastValue - firstValue) / firstValue) * 100
    const totalChange = Math.abs(rawChange) > 100
      ? Math.sign(rawChange) * (Math.log10(Math.abs(rawChange)) * 25)
      : rawChange

    // Adjust significance thresholds and determine magnitude
    const significanceThreshold = type === 'sentiment' ? 20 : 10
    const getMagnitude = (change: number) =>
      Math.abs(change) >= 75 ? 'substantial'
      : Math.abs(change) >= 40 ? 'significant'
      : 'moderate';
    
    if (Math.abs(totalChange) >= significanceThreshold) {
      const trendMagnitude = getMagnitude(totalChange)
      insights.push({
        type: totalChange > 0 ? 'positive' : 'negative',
        title: 'Overall Trend',
        description: type === 'sentiment'
          ? `${trendMagnitude.charAt(0).toUpperCase() + trendMagnitude.slice(1)} trend: ${Math.abs(totalChange).toFixed(1)}% ${totalChange > 0 ? 'increase' : 'decrease'} in positive to negative sentiment ratio`
          : `Mentions have ${totalChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(totalChange).toFixed(1)}% over the period`,
        change: totalChange,
        significance: Math.abs(totalChange) >= 20 ? 'high' : 'medium'
      })
    }

    // Detect significant changes
    let maxChange = 0
    let maxChangeIndex = 0

    for (let i = 1; i < sortedData.length; i++) {
      const rawChange = ((sortedData[i].value - sortedData[i-1].value) / sortedData[i-1].value) * 100
      const normalizedChange = Math.abs(rawChange) > 100
        ? Math.sign(rawChange) * (Math.log10(Math.abs(rawChange)) * 25)
        : rawChange
      if (Math.abs(normalizedChange) > Math.abs(maxChange)) {
        maxChange = normalizedChange
        maxChangeIndex = i
      }
    }

    if (Math.abs(maxChange) >= 20) {
      const date = new Date(sortedData[maxChangeIndex].date)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const changeMagnitude = getMagnitude(maxChange)
      
      insights.push({
        type: maxChange > 0 ? 'positive' : 'negative',
        title: 'Significant Change',
        description: type === 'sentiment'
          ? `${changeMagnitude.charAt(0).toUpperCase() + changeMagnitude.slice(1)} change on ${date}: ${Math.abs(maxChange).toFixed(1)}% ${maxChange > 0 ? 'improvement' : 'decline'} in sentiment balance`
          : `Notable ${maxChange > 0 ? 'increase' : 'decrease'} in activity on ${date} (${Math.abs(maxChange).toFixed(1)}% change)`,
        change: maxChange,
        significance: 'high'
      })
    }

    // Add insight about platform distribution if this is source data
    if (type === 'source' && sortedData.length > 0) {
      // Get data for the date of maximum change
      const maxChangeDate = sortedData[maxChangeIndex].date
      const dateData = sortedData.filter(item =>
        new Date(item.date).toISOString().split('T')[0] === new Date(maxChangeDate).toISOString().split('T')[0]
      )

      if (dateData.length >= 2) {
        // Sort platforms by value and get top contributors
        const topPlatforms = dateData
          .sort((a, b) => (b.value || 0) - (a.value || 0))
          .slice(0, 2)

        if (topPlatforms.length === 2) {
          insights.push({
            type: 'info',
            title: 'Top Contributors',
            description: `Leading platforms during this period: ${topPlatforms[0].source} (${topPlatforms[0].value}) and ${topPlatforms[1].source} (${topPlatforms[1].value})`,
            significance: 'medium'
          })
        }
      }
    }

    return insights
  }

  /**
   * Analyze keyword data
   */
  analyzeKeywords(
    keywords: Array<{
      keyword: string
      total: number
      positive: number
      negative: number
      neutral: number
    }>
  ): InsightResult[] {
    const insights: InsightResult[] = []
    
    if (!keywords.length) return insights

    // Sort by total mentions
    const sortedKeywords = [...keywords].sort((a, b) => b.total - a.total)
    const topKeyword = sortedKeywords[0]

    // Calculate total mentions across all keywords
    const totalMentions = keywords.reduce((sum, k) => sum + k.total, 0)
    const topKeywordShare = (topKeyword.total / totalMentions) * 100

    // Top keyword analysis
    insights.push({
      type: 'info',
      title: 'Dominant Keyword',
      description: `"${topKeyword.keyword}" dominates discussions with ${topKeywordShare.toFixed(1)}% of all keyword mentions, indicating significant market presence`,
      metric: `${topKeyword.total} mentions`,
      significance: topKeywordShare >= 30 ? 'high' : 'medium'
    })

    // Analyze sentiment patterns in top keywords
    const topKeywords = sortedKeywords.slice(0, 3)
    
    // Calculate average sentiment distribution
    const avgDistribution = {
      positive: keywords.reduce((sum, k) => sum + k.positive, 0) / totalMentions * 100,
      negative: keywords.reduce((sum, k) => sum + k.negative, 0) / totalMentions * 100,
      neutral: keywords.reduce((sum, k) => sum + k.neutral, 0) / totalMentions * 100
    }

    topKeywords.forEach(keyword => {
      const total = keyword.total
      const positiveRatio = (keyword.positive / total) * 100
      const negativeRatio = (keyword.negative / total) * 100
      const neutralRatio = (keyword.neutral / total) * 100

      // Compare to average distribution
      if (positiveRatio >= avgDistribution.positive * 1.5) {
        insights.push({
          type: 'positive',
          title: 'Notable Positive Association',
          description: `"${keyword.keyword}" shows unusually positive sentiment at ${positiveRatio.toFixed(1)}% (avg: ${avgDistribution.positive.toFixed(1)}%)`,
          metric: `${positiveRatio.toFixed(1)}% positive`,
          significance: positiveRatio >= avgDistribution.positive * 2 ? 'high' : 'medium'
        })
      }

      if (negativeRatio >= avgDistribution.negative * 1.5) {
        insights.push({
          type: 'negative',
          title: 'Concerning Sentiment Pattern',
          description: `"${keyword.keyword}" shows elevated negative sentiment at ${negativeRatio.toFixed(1)}% (avg: ${avgDistribution.negative.toFixed(1)}%), suggesting potential areas for brand improvement`,
          metric: `${negativeRatio.toFixed(1)}% negative`,
          significance: negativeRatio >= avgDistribution.negative * 2 ? 'high' : 'medium'
        })
      }

      // Analyze sentiment balance
      const posNegRatio = positiveRatio / (negativeRatio || 1)
      const avgPosNegRatio = avgDistribution.positive / (avgDistribution.negative || 1)

      if (posNegRatio >= avgPosNegRatio * 1.5) {
        insights.push({
          type: 'positive',
          title: 'Strong Positive Sentiment',
          description: `"${keyword.keyword}" has ${posNegRatio.toFixed(1)}x more positive than negative mentions (avg: ${avgPosNegRatio.toFixed(1)}x)`,
          metric: `${posNegRatio.toFixed(1)}x ratio`,
          significance: posNegRatio >= avgPosNegRatio * 2 ? 'high' : 'medium'
        })
      }
    })

    // Analyze keyword concentration
    const top3Share = topKeywords.reduce((sum, k) => sum + k.total, 0) / totalMentions * 100
    if (top3Share >= 60) {
      insights.push({
        type: 'info',
        title: 'Keyword Concentration',
        description: `Top 3 keywords account for ${top3Share.toFixed(1)}% of all mentions, indicating focused discussions`,
        metric: `${top3Share.toFixed(1)}% concentration`,
        significance: top3Share >= 75 ? 'high' : 'medium'
      })
    }

    return insights
  }

  /**
   * Helper method to determine sentiment level
   */
  private getSentimentLevel(value: number): 'positive' | 'neutral' | 'negative' {
    if (value >= 0.2) return 'positive'
    if (value <= -0.2) return 'negative'
    return 'neutral'
  }

  /**
   * Helper method to get sentiment description
   */
  private getSentimentDescription(value: number): string {
    if (value >= 0.5) return 'Overwhelmingly positive sentiment'
    if (value >= 0.2) return 'Generally positive sentiment'
    if (value >= -0.2) return 'Neutral sentiment'
    if (value >= -0.5) return 'Generally negative sentiment'
    return 'Overwhelmingly negative sentiment'
  }

  /**
   * Helper method to capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

export const insightService = new InsightService()