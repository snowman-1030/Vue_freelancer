import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { useLogger } from '@/composables/useLogger'

// Extend AxiosRequestConfig to include metadata
interface RequestConfigWithMetadata extends InternalAxiosRequestConfig {
  metadata?: {
    startTime?: number
    requestId: string
  }
  _retry?: boolean
}

const baseURL = import.meta.env.VITE_API_URL

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - handle auth token and logging
axiosInstance.interceptors.request.use(
  (config: RequestConfigWithMetadata) => {
    const logger = useLogger()
    const startTime = Date.now()
    
    // Log the request and store request ID
    const requestId = logger.request(
      config.url || 'unknown',
      config.method?.toUpperCase() || 'unknown',
      config.params,
      config.headers as Record<string, any>,
      config.data
    )
    
    // Store request ID and start time for response/error correlation
    config.metadata = { 
      requestId,
      startTime
    }
    
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    const logger = useLogger()
    const requestId = (error.config as RequestConfigWithMetadata)?.metadata?.requestId || 
                     Math.random().toString(36).substring(2, 8)

    logger.error(
      requestId,
      'Request failed',
      error as Error,
      {
        method: error.config?.method?.toUpperCase(),
        endpoint: error.config?.url
      }
    )
    return Promise.reject(error)
  }
)

// Response interceptor - handle token refresh and logging
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const logger = useLogger()
    const config = response.config as RequestConfigWithMetadata
    const duration = Date.now() - (config.metadata?.startTime || Date.now())
    const requestId = config.metadata?.requestId || Math.random().toString(36).substring(2, 8)

    // Log successful response
    logger.response(
      requestId,
      config.url || 'unknown',
      config.method?.toUpperCase() || 'unknown',
      response.status,
      response.data,
      duration
    )

    return response
  },
  async (error: AxiosError) => {
    const logger = useLogger()
    const originalRequest = error.config as RequestConfigWithMetadata
    const duration = Date.now() - (originalRequest.metadata?.startTime || Date.now())
    const requestId = originalRequest.metadata?.requestId || Math.random().toString(36).substring(2, 8)

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        // Use base axios for refresh to avoid interceptor loop
        const { data } = await axios.create({
          baseURL,
          headers: {
            'Content-Type': 'application/json'
          }
        }).post('/auth/refresh/', {
          refresh: refreshToken
        })
        
        localStorage.setItem('access_token', data.access)
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        logger.error(
          requestId,
          'Token refresh failed',
          refreshError as Error,
          {
            method: originalRequest.method?.toUpperCase(),
            endpoint: originalRequest.url,
            status: 401
          }
        )
        localStorage.clear()
        window.location.href = '/login'
      }
    }

    // Only log non-402 errors since we handle payment required with a dialog
    if (error.response?.status !== 402) {
      logger.error(
        requestId,
        `API Error: ${error.message}`,
        error as Error,
        {
          method: originalRequest.method?.toUpperCase(),
          endpoint: originalRequest.url,
          status: error.response?.status
        }
      )
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance
