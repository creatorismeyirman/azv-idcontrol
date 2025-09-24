// API Response Types
export interface ApiResponse<T = unknown> {
  statusCode: number
  data?: T
  error?: string
  message?: string
}

// Auth Types
export interface SendSmsRequest {
  phone_number: string
}

export interface VerifySmsRequest {
  phone_number: string
  sms_code: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

// User Types
export interface User {
  id: number
  phone_number: string
  first_name: string
  last_name: string
  role: UserRole
  wallet_balance: number
  current_rental: unknown | null
  owned_cars: unknown[]
  locale: string
  unread_message: number
  documents: UserDocuments
}

export interface UserDocuments {
  documents_verified: boolean
  selfie_with_license_url: string | null
  selfie_url: string | null
  drivers_license: {
    url: string | null
    expiry: string | null
  }
  id_card: {
    front_url: string | null
    back_url: string | null
    expiry: string | null
  }
}

export enum UserRole {
  USER = "user",
  FINANCIER = "financier",
  MVD = "mvd",
  ADMIN = "admin",
  REJECTED = "rejected"
}

// Application Types
export interface Application {
  application_id: number
  user_id: number
  first_name: string
  last_name: string
  phone_number: string
  iin: string | null
  passport_number: string | null
  birth_date: string | null
  id_card_expiry: string | null
  drivers_license_expiry: string | null
  documents: {
    id_card_front_url: string | null
    id_card_back_url: string | null
    drivers_license_url: string | null
    selfie_url: string | null
    selfie_with_license_url: string | null
  }
  auto_class: string[] | null
  approved_at: string | null
  rejected_at?: string | null  // For financier rejected applications
  mvd_rejected_at?: string | null  // For MVD rejected applications
  created_at: string
  updated_at: string
  financier_reason?: string | null
  mvd_reason?: string | null
}

export interface ApplicationsResponse {
  applications: Application[]
}

// Financier API Types
export type FinancierPendingResponse = ApplicationsResponse
export type FinancierApprovedResponse = ApplicationsResponse
export type FinancierRejectedResponse = ApplicationsResponse

export interface ApproveApplicationRequest {
  auto_class: string
}

export interface ApproveApplicationResponse {
  message: string
  application_id: number
  auto_class: string
  user_id: number
}

export interface RejectApplicationResponse {
  message: string
  application_id: number
  user_id: number
  reason?: string
}

// MVD API Types
export type MvdPendingResponse = ApplicationsResponse
export type MvdApprovedResponse = ApplicationsResponse
export type MvdRejectedResponse = ApplicationsResponse

export interface MvdApproveResponse {
  message: string
  application_id: number
  user_id: number
}

export interface MvdRejectResponse {
  message: string
  application_id: number
  user_id: number
  reason?: string
}

// Error Types
export interface ApiError {
  detail: string
  status_code?: number
}

// Search and Filter Types
export interface SearchParams {
  search?: string
}

// Auto Class Types
export type AutoClass = 'A' | 'AB' | 'ABC'

export const AUTO_CLASS_OPTIONS: { value: AutoClass; label: string }[] = [
  { value: 'A', label: 'Класс A' },
  { value: 'AB', label: 'Класс AB' },
  { value: 'ABC', label: 'Класс ABC' }
]
