import { Clock, MessageSquare, CheckCircle } from 'lucide-vue-next'
import type { FunctionalComponent } from 'vue'

interface StatusConfig {
  color: string
  icon: FunctionalComponent
}

export function useStatusUtils() {
  const statusConfig: Record<string, StatusConfig> = {
    'Pending': {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: Clock
    },
    'In Progress': {
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: MessageSquare
    },
    'Resolved': {
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: CheckCircle
    }
  }

  const getStatusColor = (status: string): string => {
    return statusConfig[status]?.color || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getStatusIcon = (status: string): FunctionalComponent | null => {
    return statusConfig[status]?.icon || null
  }

  return {
    statusConfig,
    getStatusColor,
    getStatusIcon
  }
}