import axios from '@/lib/axios'

export interface BackupInfo {
  filename: string
  size: string
  created_at: string
}

export interface ApiResponse {
  status: 'success' | 'error'
  message?: string
  operation_id?: string
}

export interface BackupListResponse extends ApiResponse {
  backups: BackupInfo[]
}

export interface OperationStage {
  stage: string
  timestamp: string
  details?: string
}

export interface DatabaseHealth {
  status: 'connected' | 'disconnected'
  latency: number
}

export interface DatabaseOperation {
  operation_id: string
  operation_type: 'backup' | 'restore'
  started_at: string
  completed_at?: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  user: {
    id: number
    username: string
  }
  file_name?: string
  file_size?: number
  formatted_size?: string
  error_message?: string
  stages: OperationStage[]
  duration?: number
}

export const databaseService = {
  /**
   * Create a new database backup
   */
  async createBackup(): Promise<ApiResponse> {
    const response = await axios.post('/database/backup/')
    return response.data
  },

  /**
   * Restore database from backup
   * @param filename The backup file to restore from
   */
  async restoreBackup(filename: string): Promise<ApiResponse> {
    const response = await axios.post('/database/restore/', {
      filename: filename
    })
    return response.data
  },

  /**
   * Delete a backup file
   * @param filename The backup file to delete
   */
  async deleteBackup(filename: string): Promise<ApiResponse> {
    const response = await axios.delete(`/database/backup/${filename}/`)
    return response.data
  },

  /**
   * List all available backups
   */
  async listBackups(): Promise<BackupListResponse> {
    const response = await axios.get('/database/backup/')
    return response.data
  },

  /**
   * List database operations with pagination
   * @param page The page number to fetch (1-based)
   * @param limit The number of items per page
   */
  async listOperations(page: number = 1, limit: number = 10): Promise<DatabaseOperation[] | {
    operations: DatabaseOperation[];
    total: number;
  }> {
    const response = await axios.get('/database/logs/', {
      params: {
        page,
        limit
      }
    })
    return response.data
  },

  /**
   * Get detailed information about a specific operation
   * @param operationId The UUID of the operation
   */
  async getOperationDetail(operationId: string): Promise<DatabaseOperation> {
    const response = await axios.get(`/database/logs/${operationId}/`)
    return response.data
  },

  /**
   * Check database connection health
   */
  async checkHealth(): Promise<DatabaseHealth> {
    const start = performance.now()
    try {
      // Use existing backup endpoint as health check
      await axios.get('/database/backup/')
      const latency = Math.round(performance.now() - start)
      return { status: 'connected', latency }
    } catch (error) {
      return { status: 'disconnected', latency: 0 }
    }
  },

  /**
   * Delete a specific operation log
   * @param operationId The UUID of the operation to delete
   */
  async deleteOperation(operationId: string): Promise<ApiResponse> {
    const response = await axios.delete(`/database/logs/${operationId}/`)
    return response.data
  },

  /**
   * Delete multiple operation logs
   * @param operationIds Array of operation UUIDs to delete
   */
  async bulkDeleteOperations(operationIds: string[]): Promise<ApiResponse & { deleted_count: number }> {
    const response = await axios.delete('/database/logs/', {
      data: { operation_ids: operationIds }
    })
    return response.data
  }
}

export default databaseService
