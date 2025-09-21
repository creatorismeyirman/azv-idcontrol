import { 
  ApiResponse, 
  SendSmsRequest, 
  VerifySmsRequest, 
  AuthTokens, 
  User, 
  FinancierPendingResponse,
  FinancierApprovedResponse,
  FinancierRejectedResponse,
  ApproveApplicationRequest,
  ApproveApplicationResponse,
  RejectApplicationResponse,
  MvdPendingResponse,
  MvdApprovedResponse,
  MvdRejectedResponse,
  MvdApproveResponse,
  MvdRejectResponse,
  SearchParams
} from '@/types/api'

const API_BASE_URL = 'https://api.azvmotors.kz'

class ApiClient {
  private baseURL: string
  private accessToken: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.loadTokenFromStorage()
  }

  private loadTokenFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token')
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`
    }

    return headers
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          statusCode: response.status,
          error: data.detail || 'Произошла ошибка',
          data: data
        }
      }

      return {
        statusCode: response.status,
        data: data
      }
    } catch (error) {
      console.error('API Request Error:', error)
      return {
        statusCode: 500,
        error: 'Ошибка сети или сервера'
      }
    }
  }

  // Auth Methods
  async sendSms(phoneNumber: string): Promise<ApiResponse> {
    const request: SendSmsRequest = {
      phone_number: phoneNumber
    }

    return this.request('/auth/send_sms/', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  async verifySms(phoneNumber: string, smsCode: string): Promise<ApiResponse<AuthTokens>> {
    const request: VerifySmsRequest = {
      phone_number: phoneNumber,
      sms_code: smsCode
    }

    const response = await this.request<AuthTokens>('/auth/verify_sms/', {
      method: 'POST',
      body: JSON.stringify(request)
    })

    if (response.data) {
      this.accessToken = response.data.access_token
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('refresh_token', response.data.refresh_token)
      }
    }

    return response
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/user/me')
  }

  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refresh_token') 
      : null

    if (!refreshToken) {
      return {
        statusCode: 401,
        error: 'Refresh token not found'
      }
    }

    const response = await this.request<AuthTokens>('/auth/refresh_token/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    })

    if (response.data) {
      this.accessToken = response.data.access_token
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('refresh_token', response.data.refresh_token)
      }
    }

    return response
  }

  // Financier Methods
  async getFinancierPending(search?: string): Promise<ApiResponse<FinancierPendingResponse>> {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    
    return this.request<FinancierPendingResponse>(`/financier/pending?${params.toString()}`)
  }

  async getFinancierApproved(search?: string): Promise<ApiResponse<FinancierApprovedResponse>> {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    
    return this.request<FinancierApprovedResponse>(`/financier/approved?${params.toString()}`)
  }

  async getFinancierRejected(search?: string): Promise<ApiResponse<FinancierRejectedResponse>> {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    
    return this.request<FinancierRejectedResponse>(`/financier/rejected?${params.toString()}`)
  }

  async approveFinancierApplication(
    applicationId: number, 
    autoClass: string
  ): Promise<ApiResponse<ApproveApplicationResponse>> {
    return this.request<ApproveApplicationResponse>(
      `/financier/approve/${applicationId}?auto_class=${encodeURIComponent(autoClass)}`,
      { method: 'POST' }
    )
  }

  async rejectFinancierApplication(
    applicationId: number
  ): Promise<ApiResponse<RejectApplicationResponse>> {
    return this.request<RejectApplicationResponse>(
      `/financier/reject/${applicationId}`,
      { method: 'POST' }
    )
  }

  // MVD Methods
  async getMvdPending(search?: string): Promise<ApiResponse<MvdPendingResponse>> {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    
    return this.request<MvdPendingResponse>(`/mvd/pending?${params.toString()}`)
  }

  async getMvdApproved(search?: string): Promise<ApiResponse<MvdApprovedResponse>> {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    
    return this.request<MvdApprovedResponse>(`/mvd/approved?${params.toString()}`)
  }

  async getMvdRejected(search?: string): Promise<ApiResponse<MvdRejectedResponse>> {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    
    return this.request<MvdRejectedResponse>(`/mvd/rejected?${params.toString()}`)
  }

  async approveMvdApplication(
    applicationId: number
  ): Promise<ApiResponse<MvdApproveResponse>> {
    return this.request<MvdApproveResponse>(
      `/mvd/approve/${applicationId}`,
      { method: 'POST' }
    )
  }

  async rejectMvdApplication(
    applicationId: number
  ): Promise<ApiResponse<MvdRejectResponse>> {
    return this.request<MvdRejectResponse>(
      `/mvd/reject/${applicationId}`,
      { method: 'POST' }
    )
  }

  // Utility Methods
  setTokens(accessToken: string, refreshToken: string, userRole?: string) {
    this.accessToken = accessToken
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
      if (userRole) {
        localStorage.setItem('user_role', userRole)
      }
    }
  }

  getUserRole(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_role')
    }
    return null
  }

  logout() {
    this.accessToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_role')
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient
