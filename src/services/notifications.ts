import axios from '@/lib/axios'

interface AlertPreferences {
  push_enabled: boolean
  new_review_alerts: boolean
  negative_review_alerts: boolean
  response_reminders: boolean
  positive_review_alerts: boolean
  review_milestones: boolean
  trend_alerts: boolean
  notification_frequency: 'daily' | 'weekly'
  time_zone: string
  quiet_hours_start: string | null
  quiet_hours_end: string | null
}

interface PushSubscriptionEvent {
  current: {
    token: string | null
    optedIn: boolean
  }
  previous: {
    token: string | null
    optedIn: boolean
  }
}

// Debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Show browser notification in development
async function showDevNotification(title: string, message: string) {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return;
  }

  let permission = Notification.permission;
  
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  
  if (permission === 'granted') {
    const notification = new Notification(title, {
      body: message,
      icon: '/vite.svg'
    });

    // Handle notification clicks
    notification.onclick = function(event) {
      event.preventDefault();
      window.focus();
      notification.close();
    };
  } else {
    console.log('Notification permission denied');
  }
}

// Mock OneSignal for development
const mockOneSignal = {
  Slidedown: {
    promptPush: async () => {
      console.log('Mock: promptPush called');
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Browser notification permission:', permission);
      }
      return Promise.resolve();
    }
  },
  User: {
    PushSubscription: {
      optIn: async () => {
        console.log('Mock: optIn called');
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          console.log('Browser notification permission:', permission);
        }
        return Promise.resolve();
      },
      optOut: async () => {
        console.log('Mock: optOut called');
        return Promise.resolve();
      },
      getSubscription: async () => {
        console.log('Mock: getSubscription called');
        const isSubscribed = Notification.permission === 'granted';
        return {
          optedIn: isSubscribed,
          token: isSubscribed ? 'mock-token' : null
        };
      },
      present: async () => {
        console.log('Mock: present called');
        const isSubscribed = Notification.permission === 'granted';
        return {
          optedIn: isSubscribed,
          token: isSubscribed ? 'mock-token' : null
        };
      },
      token: null as string | null,
      optedIn: Notification.permission === 'granted',
      addEventListener: (event: string, callback: (event: PushSubscriptionEvent) => void) => {
        console.log('Mock: addEventListener called for event:', event);
        if (event === 'change') {
          const isSubscribed = Notification.permission === 'granted';
          callback({
            current: {
              token: isSubscribed ? 'mock-token' : null,
              optedIn: isSubscribed
            },
            previous: {
              token: null,
              optedIn: false
            }
          });
        }
      }
    }
  },
  Notifications: {
    isSubscribed: async () => {
      console.log('Mock: isSubscribed called');
      return Notification.permission === 'granted';
    },
    permission: Notification.permission
  },
  init: async (config: {
    appId: string
    allowLocalhostAsSecureOrigin?: boolean
    promptOptions?: {
      slidedown?: {
        prompts: Array<{
          type: string
          autoPrompt?: boolean
          text: {
            actionMessage: string
            acceptButton: string
            cancelButton: string
            title: string
          }
        }>
      }
    }
  }) => {
    console.log('Mock: init called with config:', config);
    return Promise.resolve();
  }
};

/**
 * Service for managing notifications and alert preferences
 */
export const notificationService = {
  // Track current subscription state to prevent unnecessary updates
  currentSubscriptionState: {
    token: null as string | null,
    optedIn: false
  },

  /**
   * Wait for OneSignal to be available
   */
  async waitForOneSignal(): Promise<typeof window.OneSignal> {
    const isDevelopment = window.location.hostname === 'localhost';
    
    if (isDevelopment) {
      console.log('Using mock OneSignal for development');
      return mockOneSignal;
    }

    // Wait for OneSignal to be available (max 10 seconds)
    for (let i = 0; i < 100; i++) {
      if (window.OneSignal) {
        return window.OneSignal;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('OneSignal failed to initialize');
  },

  /**
   * Initialize OneSignal and request permission if needed
   */
  async initialize() {
    try {
      const OneSignal = await this.waitForOneSignal();
      
      // Get initial subscription state
      if (OneSignal.User?.PushSubscription) {
        const subscription = OneSignal.User.PushSubscription;
        this.currentSubscriptionState = {
          token: subscription.token,
          optedIn: subscription.optedIn
        };
      }

      // Add subscription change listener
      OneSignal.User?.PushSubscription?.addEventListener('change', (event) => {
        console.log('Push subscription changed:', event);
        this.currentSubscriptionState = {
          token: event.current.token,
          optedIn: event.current.optedIn
        };
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize OneSignal:', error);
      throw error;
    }
  },

  /**
   * Enable or disable push notifications
   */
  async updateSubscription(enabled: boolean) {
    try {
      const OneSignal = await this.waitForOneSignal();
      
      if (enabled) {
        // Show custom prompt
        await OneSignal.Slidedown.promptPush();
      } else if (OneSignal.User?.PushSubscription) {
        // Remove push subscription
        await OneSignal.User.PushSubscription.optOut();
      }

      console.log('Push subscription updated:', enabled);
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  },

  /**
   * Update user's alert preferences
   */
  async updatePreferences(preferences: AlertPreferences) {
    try {
      await axios.put('/users/update_profile/', preferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  },

  /**
   * Send a test notification
   */
  async sendTestNotification() {
    try {
      const isDevelopment = window.location.hostname === 'localhost';
      const OneSignal = await this.waitForOneSignal();
      
      // Show custom prompt if not subscribed
      const subscription = OneSignal.User.PushSubscription;
      if (!subscription.optedIn) {
        // Show custom prompt
        await OneSignal.Slidedown.promptPush();
        return;
      }

      // Send test notifications if already subscribed
      const response = await axios.post('/users/test_notification/');

      // In development, show browser notifications
      if (isDevelopment && response.data?.notifications) {
        for (const notification of response.data.notifications) {
          await showDevNotification(
            notification.title,
            notification.message
          );
        }
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  },

  /**
   * Get user's current alert preferences
   */
  async getPreferences(): Promise<AlertPreferences> {
    try {
      const response = await axios.get('/users/profile/');
      return {
        push_enabled: response.data.push_enabled,
        new_review_alerts: response.data.new_review_alerts,
        negative_review_alerts: response.data.negative_review_alerts,
        response_reminders: response.data.response_reminders,
        positive_review_alerts: response.data.positive_review_alerts,
        review_milestones: response.data.review_milestones,
        trend_alerts: response.data.trend_alerts,
        notification_frequency: response.data.notification_frequency,
        time_zone: response.data.time_zone,
        quiet_hours_start: response.data.quiet_hours_start,
        quiet_hours_end: response.data.quiet_hours_end
      };
    } catch (error) {
      console.error('Failed to get preferences:', error);
      throw error;
    }
  }
};

// Add OneSignal types
declare global {
  interface Window {
    OneSignal: {
      Slidedown: {
        promptPush(): Promise<void>
      }
      User: {
        PushSubscription: {
          optIn(): Promise<void>
          optOut(): Promise<void>
          getSubscription(): Promise<{ optedIn: boolean; token: string | null }>
          present(): Promise<{ optedIn: boolean; token: string | null }>
          token: string | null
          optedIn: boolean
          addEventListener(event: string, callback: (event: PushSubscriptionEvent) => void): void
        }
      }
      Notifications: {
        isSubscribed(): Promise<boolean>
        permission: NotificationPermission
      }
      init(config: {
        appId: string
        allowLocalhostAsSecureOrigin?: boolean
        promptOptions?: {
          slidedown?: {
            prompts: Array<{
              type: string
              autoPrompt?: boolean
              text: {
                actionMessage: string
                acceptButton: string
                cancelButton: string
                title: string
              }
            }>
          }
        }
      }): Promise<void>
    }
  }
}