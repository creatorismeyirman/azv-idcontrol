"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { UserCard } from "@/components/verification/user-card"
import { ApprovalModal } from "@/components/modals/approval-modal"
import { useAuth } from "@/contexts/AuthContext"
import { Application, UserRole } from "@/types/api"
import { HiUsers } from "react-icons/hi2"
import { HiSearch, HiLogout } from "react-icons/hi"
import Image from "next/image"
import apiClient from "@/lib/api"

type ApplicationStatus = 'pending' | 'approved' | 'rejected'

interface ApplicationFilters {
  status: ApplicationStatus
  search: string
}

export default function VerificationPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  
  const [filters, setFilters] = useState<ApplicationFilters>({
    status: 'pending',
    search: ''
  })
  const [selectedUserForApproval, setSelectedUserForApproval] = useState<Application | null>(null)
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoadingApplications, setIsLoadingApplications] = useState(false)
  const [error, setError] = useState("")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Load applications when user or filters change
  useEffect(() => {
    if (user && isAuthenticated) {
      loadApplications()
    }
  }, [user, filters.status, filters.search])

  const loadApplications = async () => {
    if (!user) return

    setIsLoadingApplications(true)
    setError("")

    try {
      let response
      
      if (user.role === UserRole.FINANCIER) {
        switch (filters.status) {
          case 'pending':
            response = await apiClient.getFinancierPending(filters.search)
            break
          case 'approved':
            response = await apiClient.getFinancierApproved(filters.search)
            break
          case 'rejected':
            response = await apiClient.getFinancierRejected(filters.search)
            break
        }
      } else if (user.role === UserRole.MVD) {
        switch (filters.status) {
          case 'pending':
            response = await apiClient.getMvdPending(filters.search)
            break
          case 'approved':
            response = await apiClient.getMvdApproved(filters.search)
            break
          case 'rejected':
            response = await apiClient.getMvdRejected(filters.search)
            break
        }
      }

      if (response?.statusCode === 200 && response.data) {
        setApplications(response.data.applications)
      } else {
        setError(response?.error || "Ошибка загрузки заявок")
      }
    } catch (error) {
      console.error('Error loading applications:', error)
      setError("Произошла ошибка при загрузке заявок")
    } finally {
      setIsLoadingApplications(false)
    }
  }

  // Block page scroll when modal is open
  useEffect(() => {
    if (isApprovalModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isApprovalModalOpen])

  const handleApprove = (application: Application) => {
    setSelectedUserForApproval(application)
    setIsApprovalModalOpen(true)
  }

  const handleApproveUser = async (applicationId: number, accessClass?: 'A' | 'AB' | 'ABC', comment?: string) => {
    if (!user) return

    try {
      let response
      
      if (user.role === UserRole.FINANCIER) {
        response = await apiClient.approveFinancierApplication(applicationId, accessClass || 'A')
      } else if (user.role === UserRole.MVD) {
        response = await apiClient.approveMvdApplication(applicationId)
      }

      if (response?.statusCode === 200) {
        // Reload applications to get updated data
        await loadApplications()
        setIsApprovalModalOpen(false)
        setSelectedUserForApproval(null)
      } else {
        setError(response?.error || "Ошибка при одобрении заявки")
      }
    } catch (error) {
      console.error('Error approving application:', error)
      setError("Произошла ошибка при одобрении заявки")
    }
  }

  const handleRejectUser = async (applicationId: number, reason: string) => {
    if (!user) return

    try {
      let response
      
      if (user.role === UserRole.FINANCIER) {
        response = await apiClient.rejectFinancierApplication(applicationId)
      } else if (user.role === UserRole.MVD) {
        response = await apiClient.rejectMvdApplication(applicationId)
      }

      if (response?.statusCode === 200) {
        // Reload applications to get updated data
        await loadApplications()
        setIsApprovalModalOpen(false)
        setSelectedUserForApproval(null)
      } else {
        setError(response?.error || "Ошибка при отклонении заявки")
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
      setError("Произошла ошибка при отклонении заявки")
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#191919] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#666666]">Загрузка...</p>
        </div>
      </div>
    )
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return null
  }


  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* User Info Header - Mobile Only */}
      {user && (
        <div className="block lg:hidden bg-[#191919] text-white px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {user.first_name[0]}{user.last_name[0]}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium">{user.first_name} {user.last_name}</div>
                <div className="text-xs text-white/70">
                  {user.role === UserRole.FINANCIER ? 'Финансист' : 'МВД'}
                </div>
              </div>
            </div>
            <div className="text-xs text-white/70">
              {user.role === UserRole.FINANCIER ? 'Финансовый отдел' : 'МВД'}
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 py-4 ">
            {/* Logo and Title Section */}
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#191919] flex items-center justify-center flex-shrink-0 overflow-hidden">
                <Image 
                  src="/logo-nbg.png" 
                  alt="AZV Logo" 
                  width={48} 
                  height={48} 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-1">
                  <h1 className="text-xl lg:text-2xl font-bold text-[#191919] leading-tight">
                    Верификация пользователей
                  </h1>
                  <span className="text-sm font-medium text-[#666666] bg-[#F4F4F4] px-3 py-1 rounded-full self-start xs:self-auto">
                    {user?.role === UserRole.FINANCIER ? 'Финансовый отдел' : 'МВД'}
                  </span>
                </div>
                <p className="text-sm text-[#666666] hidden xs:block">
                  Управление заявками на верификацию документов
                </p>
              </div>
            </div>
            
            {/* Search and User Section */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]">
                  <HiSearch className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Поиск по имени, телефону, ИИН..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full lg:w-80 pl-12 pr-4 py-3 bg-[#F8F8F8] border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#191919]/20 focus:border-[#191919] transition-all duration-300 placeholder:text-[#999999] text-[#191919] text-base"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-[#666666] hidden sm:block">
                  {user?.first_name} {user?.last_name}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 text-[#666666] hover:text-[#191919] hover:bg-[#F4F4F4] rounded-lg transition-colors"
                >
                  <HiLogout className="w-4 h-4" /> Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6 pt-4 sm:pt-8">

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Segmented Control for Status */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-2 rounded-xl shadow-sm">
            {/* Mobile: Horizontal scroll */}
            <div className="block sm:hidden">
              <div className="flex bg-[#F4F4F4] rounded-full gap-1 p-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                {[
                  { value: 'pending', label: 'Новые заявки' },
                  { value: 'approved', label: 'Одобренные' },
                  { value: 'rejected', label: 'Отклонённые' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setFilters(prev => ({ ...prev, status: value as ApplicationStatus }))}
                    className={`flex-shrink-0 py-3 px-5 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-20 snap-center ${
                      filters.status === value
                        ? "bg-[#191919] text-white transform scale-[0.98] shadow-sm"
                        : "bg-transparent text-[#191919] hover:bg-gray-200"
                    }`}
                  >
                    <span className="whitespace-nowrap">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Desktop: Normal flex */}
            <div className="hidden sm:block">
              <div className="flex bg-[#F4F4F4] rounded-full gap-1 p-1">
                {[
                  { value: 'pending', label: 'Новые заявки' },
                  { value: 'approved', label: 'Одобренные' },
                  { value: 'rejected', label: 'Отклонённые' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setFilters(prev => ({ ...prev, status: value as ApplicationStatus }))}
                    className={`flex-1 py-3 px-4 lg:px-6 rounded-full text-sm lg:text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-20 ${
                      filters.status === value
                        ? "bg-[#191919] text-white transform scale-[0.98] shadow-sm"
                        : "bg-transparent text-[#191919] hover:bg-gray-200"
                    }`}
                  >
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4 sm:space-y-6">
            {isLoadingApplications ? (
              <Card>
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="w-8 h-8 border-2 border-[#191919] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[#666666]">Загрузка заявок...</p>
                </CardContent>
              </Card>
            ) : applications.length > 0 ? (
              applications.map((application) => (
                <UserCard
                  key={application.application_id}
                  application={application}
                  onApprove={handleApprove}
                  onReject={handleRejectUser}
                  showActions={filters.status === 'pending'}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 sm:p-12 text-center">
                  <HiUsers className="w-10 h-10 sm:w-12 sm:h-12 text-[#666666] mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-[#191919] mb-2">
                    Нет заявок
                  </h3>
                  <p className="text-sm sm:text-base text-[#666666]">
                    В выбранных фильтрах пока нет заявок
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false)
          setSelectedUserForApproval(null)
        }}
        application={selectedUserForApproval}
        userRole={user?.role || UserRole.FINANCIER}
        onApprove={handleApproveUser}
      />
    </div>
  )
}