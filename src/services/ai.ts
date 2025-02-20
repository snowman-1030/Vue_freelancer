import type { ReviewMention } from '@/types/reviews'
import axios from '@/lib/axios'

interface AISuggestion {
  content: string
  confidence: number
  tone: 'professional' | 'friendly' | 'apologetic' | 'grateful'
}

async function generateResponse(review: ReviewMention): Promise<string> {
  // Analyze review content using Claude
  const prompt = `
Review: "${review.content}"
Author: ${review.author}
Context: This is a ${review.sentiment} review about ${review.keyword_term || 'our products'}.

You are a cannabis industry expert with comprehensive knowledge across cultivation, genetics, products, equipment, retail, and industry trends. Generate a response that:

1. Shows deep understanding of the specific cannabis topic in the review
2. Uses precise technical terminology relevant to that topic
3. Provides helpful insights based on industry expertise
4. Maintains professionalism while showing genuine concern
5. Stays under 500 characters
6. Builds credibility through demonstrated knowledge
7. Addresses the reviewer's specific experience and concerns
8. Avoids generic responses

Important: First identify the exact cannabis topic being discussed (growing, products, equipment, retail, etc.), then respond with relevant expertise for that specific area. Focus on being genuinely helpful with real industry knowledge.

Response format: Direct response text only, no explanations.
`

  try {
    // Call Claude API endpoint using configured axios instance
    const response = await axios.post('/ai/generate_response/', {
      prompt,
      review_id: review.id,
    })

    if (!response.data) {
      throw new Error('Failed to generate AI response')
    }

    const data = response.data
    return data.response
  } catch (error) {
    console.error('Error generating AI response')
    // Fallback to a safe, generic response
    return `Thank you for sharing your experience with ${review.keyword_term || 'our products'}. We appreciate your detailed feedback and will use it to improve our services.`
  }
}

export async function getResponseSuggestion(review: ReviewMention): Promise<AISuggestion> {
  const response = await generateResponse(review)
  
  // Determine tone based on content analysis
  let tone: AISuggestion['tone'] = 'professional'
  if (response.toLowerCase().includes('thank you') || response.toLowerCase().includes('appreciate')) {
    tone = 'grateful'
  } else if (response.toLowerCase().includes('sorry') || response.toLowerCase().includes('apologize')) {
    tone = 'apologetic'
  } else if (response.toLowerCase().includes('help') || response.toLowerCase().includes('assist')) {
    tone = 'friendly'
  }

  return {
    content: response,
    confidence: 0.95, // Higher confidence with Claude
    tone
  }
}

export async function improveResponse(content: string, tone: AISuggestion['tone']): Promise<string> {
  // TODO: Replace with actual AI service call
  const toneModifiers: Record<AISuggestion['tone'], string[]> = {
    professional: ['respectfully', 'certainly', 'we understand'],
    friendly: ['thanks so much', 'we appreciate', 'great to hear'],
    apologetic: ['we sincerely apologize', 'we regret', 'please allow us'],
    grateful: ['we truly appreciate', 'thank you so much', 'we are grateful']
  }

  // Simple tone adjustment by adding tone-specific phrases
  const modifiers = toneModifiers[tone]
  const modifier = modifiers[Math.floor(Math.random() * modifiers.length)]
  
  return content.replace(/^/, `${modifier}, `)
}

export async function checkCompliance(content: string): Promise<{
  compliant: boolean
  issues?: string[]
  suggestions?: string[]
}> {
  // Simple compliance rules
  const rules = [
    {
      test: (text: string) => text.length > 500,
      issue: 'Response exceeds 500 characters',
      suggestion: 'Try to be more concise'
    },
    {
      test: (text: string) => /\b(guarantee|promise|ensure)\b/i.test(text),
      issue: 'Avoid making absolute guarantees',
      suggestion: 'Use softer language like "aim to" or "strive to"'
    },
    {
      test: (text: string) => /\b(never|always|definitely)\b/i.test(text),
      issue: 'Avoid absolute terms',
      suggestion: 'Use more flexible language'
    },
    {
      test: (text: string) => /\b(stupid|idiot|dumb|crazy)\b/i.test(text),
      issue: 'Inappropriate or unprofessional language detected',
      suggestion: 'Maintain professional tone'
    }
  ]

  const issues: string[] = []
  const suggestions: string[] = []

  rules.forEach(rule => {
    if (rule.test(content)) {
      issues.push(rule.issue)
      suggestions.push(rule.suggestion)
    }
  })

  return {
    compliant: issues.length === 0,
    issues: issues.length > 0 ? issues : undefined,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  }
}
