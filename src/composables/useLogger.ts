import * as Sentry from '@sentry/vue'

interface RequestContext {
  id: string
  method: string
  endpoint: string
  params?: Record<string, any>
  headers?: Record<string, any>
  body?: any
  status?: number
  duration?: number
}

const SENSITIVE_FIELDS = ['password', 'token', 'refresh', 'email', 'Authorization']

const maskSensitiveData = (data: any): any => {
  if (!data) return data
  
  const masked = JSON.parse(JSON.stringify(data))
  const maskObject = (obj: any) => {
    for (const key in obj) {
      if (SENSITIVE_FIELDS.includes(key)) {
        obj[key] = '[REDACTED]'
      } else if (typeof obj[key] === 'object') {
        maskObject(obj[key])
      }
    }
  }
  maskObject(masked)
  return masked
}

const generateRequestId = (): string => {
  return Math.random().toString(36).substring(2, 8)
}

export function useLogger() {
  const filterHeaders = (headers: Record<string, any>): Record<string, any> => {
    // Filter out standard headers
    return Object.fromEntries(
      Object.entries(headers).filter(([key, value]) => {
        if (['Accept', 'Content-Type'].includes(key) && 
            (value === 'application/json' || 
             value === 'application/json, text/plain, */*')) {
          return false
        }
        return true
      })
    )
  }

  return {
    request: (endpoint: string, method: string, params?: Record<string, any>, headers?: Record<string, any>, body?: any): string => {
      const requestId = generateRequestId()
      
      // Show all requests in development, or when explicitly enabled
      if (process.env.NODE_ENV === 'development' || localStorage.getItem('DEBUG_API') === 'true') {
        const relevantHeaders = headers ? filterHeaders(headers) : {}
        
        console.debug(`[DEBUG] [${requestId}] 🌐 Request`, {
          method,
          endpoint,
          ...(Object.keys(params || {}).length && { params: maskSensitiveData(params) }),
          ...(Object.keys(relevantHeaders).length && { headers: maskSensitiveData(relevantHeaders) }),
          ...(body && { body: maskSensitiveData(body) })
        })
      }

      return requestId
    },

    response: (requestId: string, endpoint: string, method: string, status: number, body: any, duration: number) => {
      // Show all responses in development, errors, slow responses, or when debug is enabled
      if (process.env.NODE_ENV === 'development' || status >= 400 || duration > 1000 || localStorage.getItem('DEBUG_API') === 'true') {
        const level = status >= 400 ? 'ERROR' : 'INFO'
        const icon = status >= 400 ? '❌' : '✅'
        
        console[status >= 400 ? 'error' : 'info'](`[${level}] [${requestId}] ${icon} Response (${duration}ms)`, {
          status: `${status} ${status >= 400 ? 'Error' : 'OK'}`,
          body: maskSensitiveData(body)
        })
      }

      // Track performance in Sentry
      if (duration > 1000) {
        Sentry.addBreadcrumb({
          category: 'performance',
          message: `Slow API call to ${endpoint}`,
          data: { method, status, duration }
        })
      }
    },

    error: (requestId: string, message: string, error: Error, context: Partial<RequestContext>) => {
      console.error(`[ERROR] [${requestId}] ❌ ${message}`, {
        status: context.status || 'Unknown',
        location: error.stack?.split('\n')[1]?.trim() || 'Unknown',
        request: `${context.method} ${context.endpoint}`,
        error
      })

      Sentry.captureException(error, {
        extra: maskSensitiveData({
          requestId,
          ...context
        })
      })
    }
  }
}