"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Application } from "@/types/api"
import { 
  HiEye, 
  HiCheck, 
  HiClock, 
  HiUser, 
  HiPhone, 
  HiCreditCard,
  HiCheckCircle,
  HiXCircle,
  HiChevronDown,
  HiCalendar,
  HiDocument,
  HiEnvelope,
  HiShieldCheck
} from "react-icons/hi2"
import { HiX } from "react-icons/hi"
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2"
import Image from "next/image"

interface UserCardProps {
  application: Application
  onApprove: (application: Application) => void
  onReject: (applicationId: number, reason: string, reasonType?: 'financial' | 'documents' | 'certificates') => void
  showActions?: boolean
  forceStatus?: 'pending' | 'approved' | 'rejected'  // Explicit status override
  userRole?: 'financier' | 'mvd'  // Add user role to determine rejection type
}

export function UserCard({ 
  application, 
  onApprove, 
  onReject, 
  showActions = true,
  forceStatus,
  userRole
}: UserCardProps) {
  const [showDocuments, setShowDocuments] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectionReasonType, setRejectionReasonType] = useState<'financial' | 'documents' | 'certificates' | null>(null)
  const [showAllDocuments, setShowAllDocuments] = useState(false)
  const [showCarousel, setShowCarousel] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Block page scroll when any modal is open
  useEffect(() => {
    const isModalOpen = showDocuments || showRejectModal || showCarousel
    
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showDocuments, showRejectModal, showCarousel])

  // Determine status based on application data
  const getApplicationStatus = (): 'pending' | 'approved' | 'rejected' => {
    // If forceStatus is provided, use it (this overrides automatic detection)
    if (forceStatus) return forceStatus
    
    
    // Check if application is rejected by either financier or MVD
    if (application.rejected_at || application.mvd_rejected_at) return 'rejected'
    // Check if application is approved (approved_at field exists)
    if (application.approved_at) return 'approved'
    // If neither rejected nor approved, it's pending
    return 'pending'
  }

  const getStatusIcon = () => {
    const status = getApplicationStatus()
    switch (status) {
      case 'approved':
        return <HiCheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <HiXCircle className="w-5 h-5 text-red-500" />
      default:
        return <HiClock className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusText = () => {
    const status = getApplicationStatus()
    switch (status) {
      case 'approved':
        return 'Одобрено'
      case 'rejected':
        return 'Отклонено'
      default:
        return 'На рассмотрении'
    }
  }

  const getStatusColor = () => {
    const status = getApplicationStatus()
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50'
      case 'rejected':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  // Helper function to format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Не указано'
    try {
      return new Date(dateString).toLocaleDateString('ru-RU')
    } catch {
      return 'Неверная дата'
    }
  }

  // Helper function to check if document is expired or expiring soon
  const getDocumentStatus = (expiryDate: string | null) => {
    if (!expiryDate) return { status: 'unknown', color: 'text-gray-600', text: 'Не указано' }
    
    try {
      const expiry = new Date(expiryDate)
      const now = new Date()
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry < 0) {
        return { status: 'expired', color: 'text-red-600', text: 'Истек' }
      } else if (daysUntilExpiry <= 30) {
        return { status: 'expiring', color: 'text-orange-600', text: `Истекает через ${daysUntilExpiry} дн.` }
      } else {
        return { status: 'valid', color: 'text-green-600', text: 'Действителен' }
      }
    } catch {
      return { status: 'unknown', color: 'text-gray-600', text: 'Неверная дата' }
    }
  }

  // const formatLastOnline = (dateString: string) => {
  //   const date = new Date(dateString)
  //   const now = new Date()
  //   const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  //   
  //   if (diffInHours < 1) return 'Был в сети только что'
  //   if (diffInHours < 24) return `Был в сети ${diffInHours} ч. назад`
  //   return `Был в сети ${date.toLocaleDateString('ru-RU')} в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
  // }

  const handleApprove = () => {
    onApprove(application)
  }

  const handleReject = () => {
    if (rejectionReason.trim()) {
      // For financier, require reason type selection
      if (userRole === 'financier' && !rejectionReasonType) {
        return
      }
      onReject(application.application_id, rejectionReason, rejectionReasonType || undefined)
      setShowRejectModal(false)
      setRejectionReason("")
      setRejectionReasonType(null)
    }
  }

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index)
    setShowCarousel(true)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % documentTypes.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + documentTypes.length) % documentTypes.length)
  }

  const documentTypes = [
    { key: 'id_card_front_url', label: 'Удостоверение личности (лицевая сторона)' },
    { key: 'id_card_back_url', label: 'Удостоверение личности (оборотная сторона)' },
    { key: 'drivers_license_url', label: 'Водительское удостоверение' },
    { key: 'selfie_url', label: 'Селфи (портрет)' },
    { key: 'selfie_with_license_url', label: 'Селфи с водительским удостоверением' }
  ] as const

  // Function to handle image URLs - convert relative paths to absolute URLs
  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '/api/placeholder/200/150'
    
    // If it's already an absolute URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // If it's a relative path starting with uploads/, make it absolute
    if (url.startsWith('uploads/') || url.startsWith('/uploads/')) {
      const cleanUrl = url.startsWith('/') ? url : `/${url}`
      return `https://api.azvmotors.kz${cleanUrl}`
    }
    
    // If it starts with /, return as is (assuming it's a valid path)
    if (url.startsWith('/')) {
      return url
    }
    
    // If it's a relative path without uploads/, try to construct a valid URL
    if (url.includes('/') && !url.startsWith('http')) {
      return `https://api.azvmotors.kz/${url}`
    }
    
    // For any other case, return placeholder
    return '/api/placeholder/200/150'
  }

  // Function to check if URL is external (needs regular img tag instead of Next.js Image)
  const isExternalUrl = (url: string): boolean => {
    return url.startsWith('http://') || url.startsWith('https://')
  }

  // Component for conditional image rendering
  const ConditionalImage = ({ 
    src, 
    alt, 
    width, 
    height, 
    className, 
    onError 
  }: {
    src: string | null
    alt: string
    width: number
    height: number
    className: string
    onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
  }) => {
    const imageUrl = getImageUrl(src)
    
    if (isExternalUrl(imageUrl)) {
      return (
        <img
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          className={className}
          onError={onError}
        />
      )
    }
    
    return (
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={onError}
      />
    )
  }

  return (
    <>
      <Card className="w-full hover:shadow-lg transition-shadow">
        <CardContent className="p-3 sm:p-6">
          {/* Header with profile info */}
          <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6 pt-2 sm:pt-4">
            {/* Profile Picture */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[#F4F4F4] flex items-center justify-center flex-shrink-0">
              <HiUser className="w-8 h-8 sm:w-10 sm:h-10 text-[#191919]" />
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h3 className="text-xl sm:text-2xl font-bold text-[#191919] leading-tight">
                  <span className="block sm:inline text-[#191919]">{application.first_name}</span>
                  <span className="block sm:inline sm:ml-1 text-[#191919]">{application.last_name}</span>
                </h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                  </span>
                </div>
              </div>
              
              {/* Application date */}
              <p className="text-xs sm:text-sm text-[#666666] mb-2">
                Подано: {new Date(application.created_at).toLocaleDateString('ru-RU')}
              </p>
              
            </div>
            
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <HiPhone className="w-4 h-4 text-[#666666] flex-shrink-0" />
              <span className="text-xs sm:text-sm text-[#191919] truncate">{application.phone_number}</span>
            </div>
            {application.email && (
              <div className="flex items-center gap-2">
                <HiEnvelope className="w-4 h-4 text-[#666666] flex-shrink-0" />
                <span className="text-xs sm:text-sm text-[#191919] truncate">{application.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <HiCreditCard className="w-4 h-4 text-[#666666] flex-shrink-0" />
              <span className="text-xs sm:text-sm text-[#191919] truncate">
                {application.iin ? `ИИН: ${application.iin}` : `Паспорт: ${application.passport_number || 'Не указан'}`}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
              <HiClock className="w-4 h-4 text-[#666666] flex-shrink-0" />
              <span className="text-xs sm:text-sm text-[#191919]">
                Обновлено: {new Date(application.updated_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

          {/* Additional Identity Information */}
          {(application.iin && application.passport_number) && (
            <div className="mb-4 sm:mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <HiCreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      ИИН: {application.iin}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiCreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Паспорт: {application.passport_number}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Personal Information and Document Expiry */}
          <div className="mb-4 sm:mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
              <h4 className="text-sm font-medium text-gray-800 mb-3">Личная информация и документы</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Birth Date */}
                <div className="flex items-center gap-2">
                  <HiCalendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-600 block">Дата рождения</span>
                    <span className="text-sm font-medium text-gray-800">
                      {formatDate(application.birth_date)}
                    </span>
                  </div>
                </div>

                {/* ID Card Expiry */}
                <div className="flex items-center gap-2">
                  <HiDocument className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-600 block">Удостоверение личности</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-800">
                        {formatDate(application.id_card_expiry)}
                      </span>
                      <span className={`text-xs font-medium ${getDocumentStatus(application.id_card_expiry).color}`}>
                        ({getDocumentStatus(application.id_card_expiry).text})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Driver's License Expiry */}
                <div className="flex items-center gap-2">
                  <HiDocument className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-600 block">Водительское удостоверение</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-800">
                        {formatDate(application.drivers_license_expiry)}
                      </span>
                      <span className={`text-xs font-medium ${getDocumentStatus(application.drivers_license_expiry).color}`}>
                        ({getDocumentStatus(application.drivers_license_expiry).text})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Citizenship Status */}
                <div className="flex items-center gap-2">
                  <HiShieldCheck className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-600 block">Гражданство РК</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-medium ${application.is_citizen_kz ? 'text-green-600' : 'text-gray-800'}`}>
                        {application.is_citizen_kz ? '✓ Да' : 'Нет'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificates Section - Only show for KZ citizens */}
          {application.is_citizen_kz && (
            <div className="mb-4 sm:mb-6">
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 sm:p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <HiDocument className="w-4 h-4" />
                  Сертификаты для граждан РК
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {/* Psych/Neurology Certificate */}
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2 sm:p-3 hover:border-gray-400 transition-colors">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <HiDocument className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 truncate">
                        Психиатр/Невропатолог
                      </span>
                    </div>
                    {application.certificates.psych_neurology_certificate_url ? (
                      <a
                        href={getImageUrl(application.certificates.psych_neurology_certificate_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 flex-shrink-0 text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium underline"
                      >
                        Открыть
                      </a>
                    ) : (
                      <span className="ml-2 flex-shrink-0 text-xs text-gray-400">Не загружен</span>
                    )}
                  </div>

                  {/* Narcology Certificate */}
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2 sm:p-3 hover:border-gray-400 transition-colors">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <HiDocument className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 truncate">
                        Нарколог
                      </span>
                    </div>
                    {application.certificates.narcology_certificate_url ? (
                      <a
                        href={getImageUrl(application.certificates.narcology_certificate_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 flex-shrink-0 text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium underline"
                      >
                        Открыть
                      </a>
                    ) : (
                      <span className="ml-2 flex-shrink-0 text-xs text-gray-400">Не загружен</span>
                    )}
                  </div>

                  {/* Pension Contributions Certificate */}
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2 sm:p-3 hover:border-gray-400 transition-colors">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <HiDocument className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 truncate">
                        Пенсионные отчисления
                      </span>
                    </div>
                    {application.certificates.pension_contributions_certificate_url ? (
                      <a
                        href={getImageUrl(application.certificates.pension_contributions_certificate_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 flex-shrink-0 text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium underline"
                      >
                        Открыть
                      </a>
                    ) : (
                      <span className="ml-2 flex-shrink-0 text-xs text-gray-400">Не загружен</span>
                    )}
                  </div>

                  {/* Criminal Record Certificate */}
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2 sm:p-3 hover:border-gray-400 transition-colors">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <HiDocument className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 truncate">
                        Справка о судимости
                      </span>
                    </div>
                    {application.certificates.criminal_record_certificate_url ? (
                      <a
                        href={getImageUrl(application.certificates.criminal_record_certificate_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 flex-shrink-0 text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium underline"
                      >
                        Открыть
                      </a>
                    ) : (
                      <span className="ml-2 flex-shrink-0 text-xs text-gray-400">Не загружен</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Document Expiry Warnings */}
          {(() => {
            const idCardStatus = getDocumentStatus(application.id_card_expiry)
            const driversLicenseStatus = getDocumentStatus(application.drivers_license_expiry)
            
            const expiredDocs = []
            const expiringDocs = []
            
            if (idCardStatus.status === 'expired') expiredDocs.push('Удостоверение личности')
            if (idCardStatus.status === 'expiring') expiringDocs.push('Удостоверение личности')
            
            if (driversLicenseStatus.status === 'expired') expiredDocs.push('Водительское удостоверение')
            if (driversLicenseStatus.status === 'expiring') expiringDocs.push('Водительское удостоверение')
            
            if (expiredDocs.length > 0 || expiringDocs.length > 0) {
              return (
                <div className="mb-4 sm:mb-6">
                  {expiredDocs.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                      <div className="flex items-center gap-2">
                        <HiXCircle className="w-4 h-4 text-red-600" />
                        <div>
                          <span className="text-sm font-medium text-red-800 block">
                            Истекшие документы:
                          </span>
                          <span className="text-sm text-red-700">
                            {expiredDocs.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {expiringDocs.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <HiClock className="w-4 h-4 text-orange-600" />
                        <div>
                          <span className="text-sm font-medium text-orange-800 block">
                            Документы истекают в ближайшее время:
                          </span>
                          <span className="text-sm text-orange-700">
                            {expiringDocs.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            }
            return null
          })()}

          {/* Documents Preview */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h4 className="text-sm font-medium text-[#191919]">Документы</h4>
              <button
                onClick={() => setShowAllDocuments(!showAllDocuments)}
                className="flex items-center gap-1 text-xs text-[#666666] hover:text-[#191919]"
              >
                {showAllDocuments ? 'Скрыть' : 'Показать все'}
                <HiChevronDown className={`w-3 h-3 transition-transform ${showAllDocuments ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {documentTypes.slice(0, showAllDocuments ? documentTypes.length : 3).map((doc, index) => (
                <div key={doc.key} className="relative group">
                  <div 
                    className="aspect-[4/3] bg-[#F8F8F8] rounded-lg overflow-hidden border border-[#E5E5E5] cursor-pointer hover:border-[#191919] transition-all duration-200"
                    onClick={() => handleImageClick(index)}
                  >
                    <ConditionalImage
                      src={application.documents[doc.key]}
                      alt={doc.label}
                      width={200}
                      height={150}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://via.placeholder.com/200x150/f0f0f0/666666?text=${encodeURIComponent(doc.label)}`
                      }}
                    />
                  </div>
                  <p className="text-xs text-[#666666] mt-1 line-clamp-2">
                    {doc.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Status Information */}
          {application.auto_class && application.auto_class.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <HiCheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Класс допуска: {application.auto_class.join(', ')}
                </span>
              </div>
            </div>
          )}

          {application.approved_at && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <HiCheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Одобрено: {new Date(application.approved_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          )}

          {(application.rejected_at || application.mvd_rejected_at) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <HiXCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Отклонено: {new Date(application.rejected_at || application.mvd_rejected_at!).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          )}

          {/* Rejection Reasons */}
          {(application.reason || application.financier_reason || application.mvd_reason) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <HiXCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  {(application.reason || application.financier_reason) && (
                    <div>
                      <span className="text-sm font-medium text-red-800 block mb-1">
                        Причина отклонения (Финансист):
                      </span>
                      <span className="text-sm text-red-700">
                        {application.reason || application.financier_reason}
                      </span>
                    </div>
                  )}
                  {application.mvd_reason && (
                    <div>
                      <span className="text-sm font-medium text-red-800 block mb-1">
                        Причина отклонения (МВД):
                      </span>
                      <span className="text-sm text-red-700">
                        {application.mvd_reason}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* Actions */}
          {showActions && getApplicationStatus() === 'pending' && (
            <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-[#E5E5E5]">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                <Button
                  variant="success"
                  onClick={handleApprove}
                  className="flex-1 py-2 sm:py-3 text-xs sm:text-sm lg:text-base"
                >
                  <HiCheck className="w-4 h-4 mr-1 sm:mr-2" />
                  Одобрить
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 py-2 sm:py-3 text-xs sm:text-sm lg:text-base"
                >
                  <HiX className="w-4 h-4 mr-1 sm:mr-2" />
                  Отклонить
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer Modal */}
      {showDocuments && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 mb-0">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#191919] flex items-center justify-center flex-shrink-0">
                  <HiEye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-[#191919] leading-tight">
                    <span className="block sm:inline text-[#191919]">{application.first_name}</span>
                    <span className="block sm:inline sm:ml-1 text-[#191919]">{application.last_name}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#666666]">
                    Просмотр документов
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-[#666666]">
                      {application.iin ? `ИИН: ${application.iin}` : `Паспорт: ${application.passport_number || 'Не указан'}`}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDocuments(false)}
                className="p-2 hover:bg-[#F8F8F8] rounded-lg transition-colors flex-shrink-0"
              >
                <HiX className="w-5 h-5 text-[#666666]" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {documentTypes.map((doc) => (
                <div key={doc.key} className="space-y-2 sm:space-y-3">
                  <h4 className="text-sm font-medium text-[#191919]">
                    {doc.label}
                  </h4>
                  <div className="aspect-[4/3] bg-[#F8F8F8] rounded-lg sm:rounded-xl overflow-hidden border border-[#E5E5E5]">
                    <ConditionalImage
                      src={application.documents[doc.key]}
                      alt={doc.label}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://via.placeholder.com/400x300/f0f0f0/666666?text=${encodeURIComponent(doc.label)}`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 mb-0">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#D32F2F] flex items-center justify-center flex-shrink-0">
                <HiXCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[#191919]">
                Причина отклонения
              </h3>
            </div>
            
            <div className="mb-4 sm:mb-6">
              {/* Reason Type Selection for Financier */}
              {userRole === 'financier' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#191919] mb-2">
                    Тип причины отклонения
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setRejectionReasonType('financial')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        rejectionReasonType === 'financial'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          rejectionReasonType === 'financial'
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                        }`}>
                          {rejectionReasonType === 'financial' && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">Финансы</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setRejectionReasonType('documents')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        rejectionReasonType === 'documents'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          rejectionReasonType === 'documents'
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                        }`}>
                          {rejectionReasonType === 'documents' && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">Документы</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setRejectionReasonType('certificates')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        rejectionReasonType === 'certificates'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          rejectionReasonType === 'certificates'
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                        }`}>
                          {rejectionReasonType === 'certificates' && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">Справки РК</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
              
              <label className="block text-sm font-medium text-[#191919] mb-2">
                Укажите причину отклонения заявки
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Введите причину отклонения..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E5E5E5] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all duration-300 resize-none text-sm sm:text-base text-black placeholder:text-[#191919]"
                rows={4}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:space-x-0">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2.5 sm:py-3 border border-[#E5E5E5] text-[#191919] rounded-lg sm:rounded-xl hover:bg-[#F8F8F8] transition-all duration-300 font-medium text-sm sm:text-base"
              >
                Отмена
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || (userRole === 'financier' && !rejectionReasonType)}
                className={`flex-1 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                  rejectionReason.trim() && (!userRole || userRole !== 'financier' || rejectionReasonType)
                    ? "bg-[#D32F2F] text-white hover:bg-[#F44336]"
                    : "bg-[#E5E5E5] text-[#999999] cursor-not-allowed"
                }`}
              >
                Отклонить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Carousel Modal */}
      {showCarousel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 mb-0">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#191919] flex items-center justify-center flex-shrink-0">
                  <HiEye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#191919] leading-tight">
                  {documentTypes[currentImageIndex]?.label}
                </h3>
              </div>
              <button
                onClick={() => setShowCarousel(false)}
                className="p-2 hover:bg-[#F8F8F8] rounded-lg transition-colors flex-shrink-0"
              >
                <HiX className="w-5 h-5 text-[#666666]" />
              </button>
            </div>

            {/* Image Container */}
            <div className="relative">
              <img
                src={getImageUrl(application.documents[documentTypes[currentImageIndex]?.key])}
                alt={documentTypes[currentImageIndex]?.label}
                className="w-full h-[50vh] sm:h-[60vh] object-contain bg-[#F8F8F8]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = `https://via.placeholder.com/800x600/f0f0f0/666666?text=${encodeURIComponent(documentTypes[currentImageIndex]?.label || '')}`
                }}
              />

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
              >
                <HiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#191919]" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
              >
                <HiChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#191919]" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="p-4 sm:p-6 border-t border-[#E5E5E5]">
              <div className="flex gap-2 sm:gap-3 overflow-x-auto">
                {documentTypes.map((doc, index) => (
                  <button
                    key={doc.key}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      currentImageIndex === index
                        ? "border-[#191919]"
                        : "border-[#E5E5E5] hover:border-[#191919]/50"
                    }`}
                  >
                    <ConditionalImage
                      src={application.documents[doc.key]}
                      alt={doc.label}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://via.placeholder.com/80x80/f0f0f0/666666?text=${encodeURIComponent(doc.label)}`
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}