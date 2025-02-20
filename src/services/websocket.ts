import { ref } from 'vue'

export interface WebSocketMessage {
  type: 'feedback_update' | 'feedback_reply' | 'feedback_deleted' | 'dashboard_update'
  data: any
}

class WebSocketService {
  private socket: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10  // Increased max attempts
  private reconnectTimeout = 3000
  private connectionTimeout = 15000  // 15 second connection timeout
  private connectionTimer: NodeJS.Timeout | null = null
  isConnected = ref(false)

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        console.debug('WebSocket: Already connected')
        resolve()
        return
      }

      console.debug('WebSocket: Starting connection...')

      // Get JWT token from localStorage
      const token = localStorage.getItem('access_token')
      if (!token) {
        const error = new Error('No authentication token found. Please log in again.')
        console.error('WebSocket:', error.message)
        reject(error)
        return
      }

      try {
        // Connect through Nginx/Cloudflare
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host = window.location.host
        
        // Set connection timeout
        this.connectionTimer = setTimeout(() => {
          if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
            console.error('WebSocket: Connection timeout')
            this.socket.close()
            reject(new Error('Connection timeout'))
          }
        }, this.connectionTimeout)

        this.socket = new WebSocket(
          `${protocol}//${host}/ws/feedback/?token=${token}`
        )

        this.socket.onopen = () => {
          if (this.connectionTimer) {
            clearTimeout(this.connectionTimer)
            this.connectionTimer = null
          }
          console.debug('WebSocket: Connected successfully')
          this.isConnected.value = true
          this.reconnectAttempts = 0
          resolve()
        }

        this.socket.onclose = (event) => {
          if (this.connectionTimer) {
            clearTimeout(this.connectionTimer)
            this.connectionTimer = null
          }
          console.debug(`WebSocket: Disconnected with code ${event.code}`)
          this.isConnected.value = false
          
          // Handle different close codes
          switch (event.code) {
            case 1000: // Normal closure
              console.debug('WebSocket: Closed normally')
              break
            case 1001: // Going away
              this.reconnect()
              break
            case 1006: // Abnormal closure (often Cloudflare timeout)
              console.warn('WebSocket: Abnormal closure (possible Cloudflare timeout)')
              this.reconnect()
              break
            case 4001: // Unauthorized
              console.error('WebSocket: Unauthorized')
              break
            default:
              if (event.code >= 4000) {
                console.error(`WebSocket: Application error ${event.code}`)
              } else {
                console.warn(`WebSocket: Connection lost (code ${event.code})`)
                this.reconnect()
              }
          }

          // Reject the promise if we're still connecting
          if (!this.isConnected.value) {
            reject(new Error(`Connection closed with code ${event.code}`))
          }
        }

        this.socket.onerror = (error) => {
          console.error('WebSocket: Error occurred:', error)
          // Don't reject here, let onclose handle it
          // This prevents duplicate error handling
        }

        this.socket.onmessage = (event) => {
          console.debug('WebSocket: Received message:', event.data)
        }
      } catch (error) {
        if (this.connectionTimer) {
          clearTimeout(this.connectionTimer)
          this.connectionTimer = null
        }
        console.error('WebSocket: Failed to create connection:', error)
        reject(error)
      }
    })
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const backoff = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000) // Exponential backoff, max 30s
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${backoff/1000}s...`)
    
    setTimeout(() => {
      this.connect()
    }, backoff)
  }

  subscribe(callback: (message: WebSocketMessage) => void) {
    if (!this.socket) {
      throw new Error('WebSocket not initialized')
    }

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        callback(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
}

export const websocketService = new WebSocketService()