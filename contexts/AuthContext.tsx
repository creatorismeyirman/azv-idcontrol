"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User, UserRole } from '@/types/api'
import apiClient from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (phoneNumber: string, smsCode: string) => Promise<boolean>
  sendSms: (phoneNumber: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
  getUserRole: () => string | null
  checkAccess: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  // Function to check if user has access (financier or mvd)
  const checkAccess = (): boolean => {
    const userRole = getUserRole()
    const hasAccess = userRole === 'financier' || userRole === 'mvd'
    
    if (!hasAccess && userRole) {
      // Clear localStorage and redirect to login
      apiClient.logout()
      setUser(null)
      router.push('/login?message=access_denied')
      return false
    }
    
    return hasAccess
  }

  useEffect(() => {
    // Check if user is already authenticated on mount
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const response = await apiClient.getCurrentUser()
          if (response.statusCode === 200 && response.data) {
            setUser(response.data)
            // Ensure user role is saved to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('user_role', response.data.role)
            }
            // Check access after setting user
            checkAccess()
          } else {
            // Token might be expired, try to refresh
            const refreshResponse = await apiClient.refreshToken()
            if (refreshResponse.statusCode === 200 && refreshResponse.data) {
              const userResponse = await apiClient.getCurrentUser()
              if (userResponse.statusCode === 200 && userResponse.data) {
                setUser(userResponse.data)
                // Save user role to localStorage after refresh
                if (typeof window !== 'undefined') {
                  localStorage.setItem('user_role', userResponse.data.role)
                }
                // Check access after setting user
                checkAccess()
              } else {
                apiClient.logout()
              }
            } else {
              apiClient.logout()
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          apiClient.logout()
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const sendSms = async (phoneNumber: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await apiClient.sendSms(phoneNumber)
      return response.statusCode === 200
    } catch (error) {
      console.error('Send SMS failed:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (phoneNumber: string, smsCode: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await apiClient.verifySms(phoneNumber, smsCode)
      
      if (response.statusCode === 200 && response.data) {
        // Get user data after successful login
        const userResponse = await apiClient.getCurrentUser()
        if (userResponse.statusCode === 200 && userResponse.data) {
          setUser(userResponse.data)
          // Save user role to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_role', userResponse.data.role)
            console.log('User role saved to localStorage:', userResponse.data.role)
          }
          // Check access after login
          const hasAccess = checkAccess()
          return hasAccess
        }
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    apiClient.logout()
  }

  const refreshUser = async () => {
    try {
      const response = await apiClient.getCurrentUser()
      if (response.statusCode === 200 && response.data) {
        setUser(response.data)
        // Save user role to localStorage after refresh
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_role', response.data.role)
        }
        // Check access after refresh
        checkAccess()
      }
    } catch (error) {
      console.error('Refresh user failed:', error)
    }
  }

  const getUserRole = (): string | null => {
    return apiClient.getUserRole()
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    sendSms,
    logout,
    refreshUser,
    getUserRole,
    checkAccess
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
