"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, CheckCircle } from "@/components/icons"
import { Application, UserRole } from "@/types/api"

interface ApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  application: Application | null
  userRole: UserRole
  onApprove: (applicationId: number, accessClass?: 'A' | 'AB' | 'ABC', comment?: string) => void
}

export function ApprovalModal({ 
  isOpen, 
  onClose, 
  application, 
  userRole, 
  onApprove 
}: ApprovalModalProps) {
  const [selectedAccessClass, setSelectedAccessClass] = useState<'A' | 'AB' | 'ABC' | null>(null)
  const [mvdComment, setMvdComment] = useState("")
  const [isApproving, setIsApproving] = useState(false)

  if (!isOpen || !application) return null

  const handleApprove = async () => {
    if (userRole === UserRole.FINANCIER && !selectedAccessClass) return
    
    setIsApproving(true)
    try {
      if (userRole === UserRole.FINANCIER) {
        await onApprove(application.application_id, selectedAccessClass!)
      } else {
        await onApprove(application.application_id, undefined, mvdComment)
      }
      handleClose()
    } finally {
      setIsApproving(false)
    }
  }

  const handleClose = () => {
    setSelectedAccessClass(null)
    setMvdComment("")
    setIsApproving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              userRole === UserRole.FINANCIER ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              {userRole === UserRole.FINANCIER ? (
                <CheckCircle className="w-5 h-5 text-blue-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {userRole === UserRole.FINANCIER ? 'Одобрить заявку' : 'Одобрить заявку'}
              </h2>
              <p className="text-sm text-gray-600">
                {userRole === UserRole.FINANCIER 
                  ? 'Выберите класс доступа для пользователя' 
                  : 'Добавьте комментарий (необязательно)'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-600">
                {application.first_name[0]}{application.last_name[0]}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {application.first_name} {application.last_name}
              </h3>
              <p className="text-sm text-gray-600">{application.phone_number}</p>
              <p className="text-sm text-gray-500">ИИН: {application.iin}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {userRole === UserRole.FINANCIER ? (
            /* Financial Department - Access Class Selection */
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Выберите класс доступа к автомобилю
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'A', label: 'Класс A', description: 'машины до 25млн' },
                  { value: 'AB', label: 'Класс AB', description: 'машины от 25млн до 40млн' },
                  { value: 'ABC', label: 'Класс ABC', description: 'машины от 40млн+' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedAccessClass(option.value as 'A' | 'AB' | 'ABC')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedAccessClass === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedAccessClass === option.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedAccessClass === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* MVD Department - Comment Field */
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Добавить комментарий (необязательно)
              </h4>
              <textarea
                value={mvdComment}
                onChange={(e) => setMvdComment(e.target.value)}
                placeholder="Введите комментарий к одобрению..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder:text-gray-500 text-black"
                rows={4}
              />
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0 min-h-[80px]">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isApproving}
          >
            Отмена
          </Button>
          
          <Button
            onClick={handleApprove}
            disabled={
              isApproving || 
              (userRole === UserRole.FINANCIER && !selectedAccessClass)
            }
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
            style={{ 
              backgroundColor: isApproving || (userRole === UserRole.FINANCIER && !selectedAccessClass) 
                ? '#9ca3af' 
                : '#16a34a', 
              borderColor: isApproving || (userRole === UserRole.FINANCIER && !selectedAccessClass)
                ? '#9ca3af'
                : '#16a34a',
              color: 'white'
            }}
          >
            {isApproving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {userRole === UserRole.FINANCIER ? 'Одобрить' : 'Одобрить'}
          </Button>
        </div>
      </div>
    </div>
  )
}
