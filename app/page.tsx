"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { UserCard } from "@/components/verification/user-card"
import { ApprovalModal } from "@/components/modals/approval-modal"
import { financialUsers, mvdUsers, systemUsers, SystemUser } from "@/lib/mock-data"
import { VerificationUser, VerificationFilters } from "@/types/verification"
import { HiUsers, HiCheckCircle, HiXCircle, HiClock, HiLockClosed } from "react-icons/hi2"
import { HiSearch, HiLogout } from "react-icons/hi"
import { Shield } from "@/components/icons"
import Image from "next/image"

export default function VerificationPage() {
  const [filters, setFilters] = useState<VerificationFilters>({
    status: 'pending',
    search: ''
  })
  const [selectedUserForApproval, setSelectedUserForApproval] = useState<VerificationUser | null>(null)
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null)
  const [users, setUsers] = useState<VerificationUser[]>([])
  const [allUsers, setAllUsers] = useState<VerificationUser[]>([])

  // Initialize user and data on component mount
  useEffect(() => {
    // Check if user is logged in (in real app, this would be from localStorage/session)
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      
      // Initialize all users data
      const allUsersData = [...financialUsers, ...mvdUsers]
      setAllUsers(allUsersData)
      
      // Set users based on role - each department sees their own users
      if (user.role === 'financial') {
        // Financial department sees financial users
        setUsers(financialUsers.filter((u: VerificationUser) => u.status === filters.status))
      } else if (user.role === 'mvd') {
        // MVD sees MVD users
        setUsers(mvdUsers.filter((u: VerificationUser) => u.status === filters.status))
      }
    } else {
      // Redirect to login if no user
      window.location.href = '/login'
    }
  }, [filters.status])

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

  const filteredUsers = users.filter(user => {
    const matchesSearch = !filters.search || 
      user.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.phone.includes(filters.search) ||
      user.iin.includes(filters.search) ||
      user.passportNumber.includes(filters.search)
    
    return matchesSearch
  })

  // Функция для подсчета пользователей по статусу
  const getUsersCount = (status: 'pending' | 'approved' | 'rejected') => {
    if (currentUser?.role === 'financial') {
      return financialUsers.filter((u: VerificationUser) => u.status === status).length
    } else if (currentUser?.role === 'mvd') {
      return mvdUsers.filter((u: VerificationUser) => u.status === status).length
    }
    return 0
  }

  // Обновляем список пользователей при изменении фильтра статуса
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'financial') {
        // Финансовый отдел видит финансовых пользователей
        const filteredFinancialUsers = financialUsers.filter((u: VerificationUser) => u.status === filters.status)
        setUsers(filteredFinancialUsers)
      } else if (currentUser.role === 'mvd') {
        // МВД видит МВД пользователей
        const filteredMvdUsers = mvdUsers.filter((u: VerificationUser) => u.status === filters.status)
        setUsers(filteredMvdUsers)
      }
    }
  }, [filters.status, currentUser])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    window.location.href = '/login'
  }

  const handleApprove = (user: VerificationUser) => {
    setSelectedUserForApproval(user)
    setIsApprovalModalOpen(true)
  }

  const handleApproveUser = async (userId: string, accessClass?: 'A' | 'AB' | 'ABC', comment?: string) => {
    // В реальном приложении здесь будет API вызов
    console.log('Approving user:', userId, 'with access class:', accessClass, 'comment:', comment)
    
    // Обновляем статус пользователя в соответствующих данных
    if (currentUser?.role === 'financial') {
      // Обновляем в financialUsers
      const userIndex = financialUsers.findIndex((u: VerificationUser) => u.id === userId)
      if (userIndex !== -1) {
        const updatedUser = {
          ...financialUsers[userIndex],
          status: 'approved' as const,
          accessClass,
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser?.name || 'Модератор'
        }
        financialUsers[userIndex] = updatedUser
        
        // Обновляем текущий список пользователей
        const filteredUsers = financialUsers.filter((u: VerificationUser) => u.status === filters.status)
        setUsers(filteredUsers)
      }
    } else if (currentUser?.role === 'mvd') {
      // Обновляем в mvdUsers
      const userIndex = mvdUsers.findIndex((u: VerificationUser) => u.id === userId)
      if (userIndex !== -1) {
        const updatedUser = {
          ...mvdUsers[userIndex],
          status: 'approved' as const,
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser?.name || 'Модератор',
          ...(comment && { mvdComment: comment })
        }
        mvdUsers[userIndex] = updatedUser
        
        // Обновляем текущий список пользователей
        const filteredUsers = mvdUsers.filter((u: VerificationUser) => u.status === filters.status)
        setUsers(filteredUsers)
      }
    }
    
    setIsApprovalModalOpen(false)
    setSelectedUserForApproval(null)
  }

  const handleRejectUser = async (userId: string, reason: string) => {
    // В реальном приложении здесь будет API вызов
    console.log('Rejecting user:', userId, 'with reason:', reason)
    
    // Обновляем статус пользователя в соответствующих данных
    if (currentUser?.role === 'financial') {
      // Обновляем в financialUsers
      const userIndex = financialUsers.findIndex((u: VerificationUser) => u.id === userId)
      if (userIndex !== -1) {
        financialUsers[userIndex] = {
          ...financialUsers[userIndex],
          status: 'rejected' as const,
          rejectionReason: reason,
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser?.name || 'Модератор'
        }
        
        // Обновляем текущий список пользователей
        const filteredUsers = financialUsers.filter((u: VerificationUser) => u.status === filters.status)
        setUsers(filteredUsers)
      }
    } else if (currentUser?.role === 'mvd') {
      // Обновляем в mvdUsers
      const userIndex = mvdUsers.findIndex((u: VerificationUser) => u.id === userId)
      if (userIndex !== -1) {
        mvdUsers[userIndex] = {
          ...mvdUsers[userIndex],
          status: 'rejected' as const,
          rejectionReason: reason,
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser?.name || 'Модератор'
        }
        
        // Обновляем текущий список пользователей
        const filteredUsers = mvdUsers.filter((u: VerificationUser) => u.status === filters.status)
        setUsers(filteredUsers)
      }
    }
    
    setIsApprovalModalOpen(false)
    setSelectedUserForApproval(null)
  }


  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* User Info Header - Mobile Only */}
      {currentUser && (
        <div className="block lg:hidden bg-[#191919] text-white px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {currentUser.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium">{currentUser.name}</div>
                <div className="text-xs text-white/70">{currentUser.position}</div>
              </div>
            </div>
            <div className="text-xs text-white/70">
              {currentUser.department}
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
                    {currentUser?.department || 'azvmotors'}
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
                  {currentUser?.name}
                </div>
                <button
                  onClick={handleLogout}
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

        {/* Segmented Control for Status */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-2 rounded-xl shadow-sm">
            {/* Mobile: Horizontal scroll */}
            <div className="block sm:hidden">
              <div className="flex bg-[#F4F4F4] rounded-full gap-1 p-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                {/* Left padding for better scroll experience */}
                
                {[
                  { value: 'pending', label: 'Новые заявки', count: getUsersCount('pending') },
                  { value: 'approved', label: 'Одобренные', count: getUsersCount('approved') },
                  { value: 'rejected', label: 'Отклонённые', count: getUsersCount('rejected') }
                ].map(({ value, label, count }) => (
                  <button
                    key={value}
                    onClick={() => setFilters(prev => ({ ...prev, status: value as any }))}
                    className={`flex-shrink-0 py-3 px-5 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-20 snap-center ${
                      filters.status === value
                        ? "bg-[#191919] text-white transform scale-[0.98] shadow-sm"
                        : "bg-transparent text-[#191919] hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap">{label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                        filters.status === value
                          ? "bg-white/20 text-white"
                          : "bg-[#191919]/10 text-[#191919]"
                      }`}>
                        {count}
                      </span>
                    </div>
                  </button>
                ))}
                {/* Right padding for better scroll experience */}
                
              </div>
            </div>
            
            {/* Desktop: Normal flex */}
            <div className="hidden sm:block">
              <div className="flex bg-[#F4F4F4] rounded-full gap-1 p-1">
                {[
                  { value: 'pending', label: 'Новые заявки', count: getUsersCount('pending') },
                  { value: 'approved', label: 'Одобренные', count: getUsersCount('approved') },
                  { value: 'rejected', label: 'Отклонённые', count: getUsersCount('rejected') }
                ].map(({ value, label, count }) => (
                  <button
                    key={value}
                    onClick={() => setFilters(prev => ({ ...prev, status: value as any }))}
                    className={`flex-1 py-3 px-4 lg:px-6 rounded-full text-sm lg:text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-20 ${
                      filters.status === value
                        ? "bg-[#191919] text-white transform scale-[0.98] shadow-sm"
                        : "bg-transparent text-[#191919] hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="truncate">{label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                        filters.status === value
                          ? "bg-white/20 text-white"
                          : "bg-[#191919]/10 text-[#191919]"
                      }`}>
                        {count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-4 sm:space-y-6">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
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
                    Нет пользователей
                  </h3>
                  <p className="text-sm sm:text-base text-[#666666]">
                    В выбранных фильтрах пока нет пользователей
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
        user={selectedUserForApproval}
        userRole={currentUser?.role || 'financial'}
        onApprove={handleApproveUser}
      />
    </div>
  )
}