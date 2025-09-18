"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VerificationUser } from "@/types/verification"
import { 
  HiEye, 
  HiCheck, 
  HiClock, 
  HiUser, 
  HiPhone, 
  HiCreditCard,
  HiCheckCircle,
  HiXCircle,
  HiChevronDown
} from "react-icons/hi2"
import { HiX } from "react-icons/hi"
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2"
import Image from "next/image"

interface UserCardProps {
  user: VerificationUser
  onApprove: (user: VerificationUser) => void
  onReject: (userId: string, reason: string) => void
  showActions?: boolean
}

export function UserCard({ 
  user, 
  onApprove, 
  onReject, 
  showActions = true
}: UserCardProps) {
  const [showDocuments, setShowDocuments] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
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

  const getStatusIcon = () => {
    switch (user.status) {
      case 'approved':
        return <HiCheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <HiXCircle className="w-5 h-5 text-red-500" />
      default:
        return <HiClock className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusText = () => {
    switch (user.status) {
      case 'approved':
        return 'Одобрено'
      case 'rejected':
        return 'Отклонено'
      default:
        return 'На рассмотрении'
    }
  }

  const getStatusColor = () => {
    switch (user.status) {
      case 'approved':
        return 'text-green-600 bg-green-50'
      case 'rejected':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  const formatLastOnline = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Был в сети только что'
    if (diffInHours < 24) return `Был в сети ${diffInHours} ч. назад`
    return `Был в сети ${date.toLocaleDateString('ru-RU')} в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
  }

  const handleApprove = () => {
    onApprove(user)
  }

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(user.id, rejectionReason)
      setShowRejectModal(false)
      setRejectionReason("")
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
    { key: 'idFront', label: 'Удостоверение личности (лицевая сторона)' },
    { key: 'idBack', label: 'Удостоверение личности (оборотная сторона)' },
    { key: 'driverLicense', label: 'Водительское удостоверение' },
    { key: 'selfie', label: 'Селфи (портрет)' },
    { key: 'selfieWithLicense', label: 'Селфи с водительским удостоверением' }
  ] as const

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
                  <span className="block sm:inline text-[#191919]">{user.firstName}</span>
                  <span className="block sm:inline sm:ml-1 text-[#191919]">{user.lastName}</span>
                </h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                  </span>
                </div>
              </div>
              
              {/* Online status */}
              {user.lastOnline && (
                <p className="text-xs sm:text-sm text-[#666666] mb-2">
                  {formatLastOnline(user.lastOnline)}
                </p>
              )}
              
            </div>
            
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <HiPhone className="w-4 h-4 text-[#666666] flex-shrink-0" />
              <span className="text-xs sm:text-sm text-[#191919] truncate">{user.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <HiCreditCard className="w-4 h-4 text-[#666666] flex-shrink-0" />
              <span className="text-xs sm:text-sm text-[#191919] truncate">
                {user.iin ? `ИИН: ${user.iin}` : `Паспорт: ${user.passportNumber}`}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
              <HiClock className="w-4 h-4 text-[#666666] flex-shrink-0" />
              <span className="text-xs sm:text-sm text-[#191919]">
                Подано: {new Date(user.submittedAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

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
                    <Image
                      src={user.documents[doc.key]}
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
          {user.accessClass && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <HiCheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Класс допуска: {user.accessClass}
                </span>
              </div>
            </div>
          )}

          {user.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <HiXCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Причина отклонения: {user.rejectionReason}
                </span>
              </div>
            </div>
          )}

          {user.mvdComment && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <HiCheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Комментарий МВД: {user.mvdComment}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && user.status === 'pending' && (
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
                    <span className="block sm:inline text-[#191919]">{user.firstName}</span>
                    <span className="block sm:inline sm:ml-1 text-[#191919]">{user.lastName}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#666666]">
                    Просмотр документов
                  </p>
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
                    <Image
                      src={user.documents[doc.key]}
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
              <label className="block text-sm font-medium text-[#191919] mb-2">
                Укажите причину отклонения заявки
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Введите причину отклонения..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#E5E5E5] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all duration-300 resize-none text-sm sm:text-base placeholder:text-[#191919]"
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
                disabled={!rejectionReason.trim()}
                className={`flex-1 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                  rejectionReason.trim()
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
                src={user.documents[documentTypes[currentImageIndex]?.key]}
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
                    <img
                      src={user.documents[doc.key]}
                      alt={doc.label}
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