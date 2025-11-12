"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { UserCard } from "@/components/verification/user-card"
import { ApprovalModal } from "@/components/modals/approval-modal"
import { useAuth } from "@/contexts/AuthContext"
import { Application, UserRole } from "@/types/api"
import { HiUsers, HiChevronLeft, HiChevronRight, HiArrowsUpDown, HiClipboardDocumentCheck } from "react-icons/hi2"
import { HiSearch, HiLogout, HiSortAscending, HiSortDescending } from "react-icons/hi"
import Image from "next/image"
import apiClient from "@/lib/api"

type ApplicationStatus = 'pending' | 'approved' | 'rejected'
type SortField = 'updated_at' | 'created_at' | 'phone_number' | 'iin'
type SortOrder = 'asc' | 'desc'

interface ApplicationFilters {
  status: ApplicationStatus
  search: string
  sortBy: SortField
  sortOrder: SortOrder
}

export default function VerificationPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  
  const [filters, setFilters] = useState<ApplicationFilters>({
    status: 'pending',
    search: '',
    sortBy: 'updated_at',
    sortOrder: 'desc'
  })
  const [selectedUserForApproval, setSelectedUserForApproval] = useState<Application | null>(null)
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoadingApplications, setIsLoadingApplications] = useState(false)
  const [error, setError] = useState("")
  
  // Recheck modal state
  const [isRecheckModalOpen, setIsRecheckModalOpen] = useState(false)
  const [selectedApplicationForRecheck, setSelectedApplicationForRecheck] = useState<number | null>(null)
  const [isRecheckLoading, setIsRecheckLoading] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  const loadApplications = useCallback(async () => {
    if (!user) return

    setIsLoadingApplications(true)
    setError("")

    try {
      let response
      
      if (user.role === UserRole.FINANCIER) {
        switch (filters.status) {
          case 'pending':
            response = await apiClient.getFinancierPending(filters.search, currentPage, perPage)
            break
          case 'approved':
            response = await apiClient.getFinancierApproved(filters.search, currentPage, perPage)
            break
          case 'rejected':
            response = await apiClient.getFinancierRejected(filters.search, currentPage, perPage)
            break
        }
      } else if (user.role === UserRole.MVD) {
        switch (filters.status) {
          case 'pending':
            response = await apiClient.getMvdPending(filters.search, currentPage, perPage)
            break
          case 'approved':
            response = await apiClient.getMvdApproved(filters.search, currentPage, perPage)
            break
          case 'rejected':
            response = await apiClient.getMvdRejected(filters.search, currentPage, perPage)
            break
        }
      }

      if (response?.statusCode === 200 && response.data) {
        setApplications(response.data.applications || [])
        setTotalItems(response.data.pagination?.total || 0)
        setTotalPages(response.data.pagination?.total_pages || 0)
        setCurrentPage(response.data.pagination?.page || 1)
      } else {
        setApplications([])
        setTotalItems(0)
        setTotalPages(0)
        setError(response?.error || "Ошибка загрузки заявок")
      }
    } catch (error) {
      console.error('Error loading applications:', error)
      setApplications([])
      setTotalItems(0)
      setTotalPages(0)
      setError("Произошла ошибка при загрузке заявок")
    } finally {
      setIsLoadingApplications(false)
    }
  }, [user, filters.status, filters.search, currentPage, perPage])

  // Reset to page 1 when status or search changes (но не при изменении сортировки)
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.status, filters.search])

  // Load applications when dependencies change
  useEffect(() => {
    if (user && isAuthenticated) {
      loadApplications()
    }
  }, [user, isAuthenticated, loadApplications])

  // Сортировка на фронтенде - применяется локально без запросов к бэкенду
  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      let aValue: number | string
      let bValue: number | string
      
      switch (filters.sortBy) {
        case 'updated_at':
          aValue = new Date(a.updated_at || 0).getTime()
          bValue = new Date(b.updated_at || 0).getTime()
          break
        case 'created_at':
          aValue = new Date(a.created_at || 0).getTime()
          bValue = new Date(b.created_at || 0).getTime()
          break
        case 'phone_number':
          aValue = a.phone_number || ''
          bValue = b.phone_number || ''
          break
        case 'iin':
          aValue = a.iin || a.passport_number || ''
          bValue = b.iin || b.passport_number || ''
          break
        default:
          aValue = new Date(a.updated_at || 0).getTime()
          bValue = new Date(b.updated_at || 0).getTime()
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })
  }, [applications, filters.sortBy, filters.sortOrder])

  // Block page scroll when modal is open
  useEffect(() => {
    if (isApprovalModalOpen || isRecheckModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isApprovalModalOpen, isRecheckModalOpen])

  const handleApprove = (application: Application) => {
    setSelectedUserForApproval(application)
    setIsApprovalModalOpen(true)
  }

  const handleApproveUser = async (applicationId: number, accessClass?: 'A' | 'AB' | 'ABC') => {
    if (!user) return

    try {
      let response
      
      if (user.role === UserRole.FINANCIER) {
        // Convert class format to comma-separated format as required by Swagger
        const classMapping: Record<string, string> = {
          'A': 'A',
          'AB': 'A, B',
          'ABC': 'A, B, C'
        }
        const mappedClass = classMapping[accessClass || 'A']
        response = await apiClient.approveFinancierApplication(applicationId, mappedClass)
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

  const handleRejectUser = async (applicationId: number, reason: string, reasonType?: 'financial' | 'documents' | 'certificates') => {
    if (!user) return

    try {
      let response
      
      if (user.role === UserRole.FINANCIER) {
        response = await apiClient.rejectFinancierApplication(applicationId, reason, reasonType)
      } else if (user.role === UserRole.MVD) {
        response = await apiClient.rejectMvdApplication(applicationId, reason)
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

  const handleRecheckDocuments = (applicationId: number) => {
    if (!user || user.role !== UserRole.FINANCIER) return
    setSelectedApplicationForRecheck(applicationId)
    setIsRecheckModalOpen(true)
  }

  const confirmRecheck = async () => {
    if (!selectedApplicationForRecheck) return

    setIsRecheckLoading(true)
    try {
      const response = await apiClient.recheckFinancierApplication(selectedApplicationForRecheck)

      if (response?.statusCode === 200) {
        // Reload applications to get updated data
        await loadApplications()
        setIsRecheckModalOpen(false)
        setSelectedApplicationForRecheck(null)
      } else {
        setError(response?.error || "Ошибка при запросе повторной проверки")
      }
    } catch (error) {
      console.error('Error requesting recheck:', error)
      setError("Произошла ошибка при запросе повторной проверки")
    } finally {
      setIsRecheckLoading(false)
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
                  placeholder="Поиск по имени, телефону, ИИН, паспорту..."
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

          {/* Sort Controls */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-[#666666]">
                <HiArrowsUpDown className="w-5 h-5" />
                <span className="font-medium">Сортировка:</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
                {/* Sort Field Selector */}
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as SortField }))}
                  className="flex-1 px-4 py-2.5 border border-[#E5E5E5] rounded-lg bg-white text-[#191919] focus:ring-2 focus:ring-[#191919]/20 focus:border-[#191919] transition-all text-sm"
                >
                  <option value="updated_at">По времени обновления</option>
                  <option value="created_at">По дате добавления</option>
                  <option value="phone_number">По номеру телефона</option>
                  <option value="iin">По ИИН/Паспорту</option>
                </select>
                
                {/* Sort Order Toggle */}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E5E5E5] rounded-lg bg-white text-[#191919] hover:bg-[#F8F8F8] hover:border-[#191919] transition-all text-sm font-medium min-w-[140px]"
                >
                  {filters.sortOrder === 'asc' ? (
                    <>
                      <HiSortAscending className="w-5 h-5" />
                      <span>По возрастанию</span>
                    </>
                  ) : (
                    <>
                      <HiSortDescending className="w-5 h-5" />
                      <span>По убыванию</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Pagination Controls - Top */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm">
              <div className="text-sm text-[#666666]">
                Показано {((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, totalItems)} из {totalItems}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all ${
                    currentPage === 1
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-[#E5E5E5] text-[#191919] hover:bg-[#F8F8F8] hover:border-[#191919]'
                  }`}
                >
                  <HiChevronLeft className="w-5 h-5" />
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg border transition-all ${
                          currentPage === pageNum
                            ? 'bg-[#191919] border-[#191919] text-white font-medium'
                            : 'bg-white border-[#E5E5E5] text-[#191919] hover:bg-[#F8F8F8] hover:border-[#191919]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-[#E5E5E5] text-[#191919] hover:bg-[#F8F8F8] hover:border-[#191919]'
                  }`}
                >
                  <HiChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              {/* Per Page Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#666666]">На странице:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white text-[#191919] focus:ring-2 focus:ring-[#191919]/20 focus:border-[#191919] transition-all"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          )}

          {/* Applications List */}
          <div className="space-y-4 sm:space-y-6">
            {isLoadingApplications ? (
              <Card>
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="w-8 h-8 border-2 border-[#191919] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[#666666]">Загрузка заявок...</p>
                </CardContent>
              </Card>
            ) : sortedApplications && sortedApplications.length > 0 ? (
              <>
                {sortedApplications.map((application) => (
                  <UserCard
                    key={application.application_id}
                    application={application}
                    onApprove={handleApprove}
                    onReject={handleRejectUser}
                    onRecheck={handleRecheckDocuments}
                    showActions={filters.status === 'pending'}
                    forceStatus={filters.status}  // Force the status based on current tab
                    userRole={user?.role === UserRole.FINANCIER ? 'financier' : user?.role === UserRole.MVD ? 'mvd' : undefined}
                  />
                ))}
              </>
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

          {/* Pagination Controls - Bottom */}
          {totalPages > 1 && !isLoadingApplications && sortedApplications && sortedApplications.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm">
              <div className="text-sm text-[#666666]">
                Показано {((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, totalItems)} из {totalItems}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all ${
                    currentPage === 1
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-[#E5E5E5] text-[#191919] hover:bg-[#F8F8F8] hover:border-[#191919]'
                  }`}
                >
                  <HiChevronLeft className="w-5 h-5" />
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className={`w-10 h-10 rounded-lg border transition-all ${
                          currentPage === pageNum
                            ? 'bg-[#191919] border-[#191919] text-white font-medium'
                            : 'bg-white border-[#E5E5E5] text-[#191919] hover:bg-[#F8F8F8] hover:border-[#191919]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                {/* Next Button */}
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.min(totalPages, prev + 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-[#E5E5E5] text-[#191919] hover:bg-[#F8F8F8] hover:border-[#191919]'
                  }`}
                >
                  <HiChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              {/* Per Page Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#666666]">На странице:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value))
                    setCurrentPage(1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="px-3 py-2 border border-[#E5E5E5] rounded-lg bg-white text-[#191919] focus:ring-2 focus:ring-[#191919]/20 focus:border-[#191919] transition-all"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          )}
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

      {/* Recheck Documents Confirmation Modal */}
      {isRecheckModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#FF9800]/10 flex items-center justify-center flex-shrink-0">
                <HiClipboardDocumentCheck className="w-6 h-6 text-[#FF9800]" />
              </div>
              <h3 className="text-xl font-bold text-[#191919]">
                Запросить повторную проверку?
              </h3>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-[#666666] text-sm leading-relaxed">
                При подтверждении:
              </p>
              <ul className="space-y-2 text-sm text-[#666666]">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF9800] mt-0.5">•</span>
                  <span>Заявка будет переведена в статус <strong>PENDINGTOFIRST</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF9800] mt-0.5">•</span>
                  <span>Все одобрения (финансиста и МВД) будут сняты</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF9800] mt-0.5">•</span>
                  <span>Пользователю придется заново загрузить документы</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF9800] mt-0.5">•</span>
                  <span>Пользователь получит уведомление</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsRecheckModalOpen(false)
                  setSelectedApplicationForRecheck(null)
                }}
                disabled={isRecheckLoading}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[#E5E5E5] text-[#666666] font-medium hover:bg-[#F8F8F8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Отмена
              </button>
              <button
                onClick={confirmRecheck}
                disabled={isRecheckLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-[#FF9800] text-white font-medium hover:bg-[#F57C00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRecheckLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Отправка...
                  </>
                ) : (
                  'Подтвердить'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}