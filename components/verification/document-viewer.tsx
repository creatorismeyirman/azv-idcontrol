"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VerificationUser } from "@/types/verification"
import { X, ChevronLeft, ChevronRight, Download } from "@/components/icons"

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  user: VerificationUser
}

const documentTypes = [
  { key: 'idFront', label: 'Удостоверение личности (лицевая сторона)' },
  { key: 'idBack', label: 'Удостоверение личности (оборотная сторона)' },
  { key: 'driverLicense', label: 'Водительское удостоверение' },
  { key: 'selfie', label: 'Селфи (портрет)' },
  { key: 'selfieWithLicense', label: 'Селфи с водительским удостоверением' }
] as const

export function DocumentViewer({ isOpen, onClose, user }: DocumentViewerProps) {
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0)

  if (!isOpen) return null

  const currentDocument = documentTypes[currentDocumentIndex]
  const currentImage = user.documents[currentDocument.key]

  const nextDocument = () => {
    setCurrentDocumentIndex((prev) => 
      prev < documentTypes.length - 1 ? prev + 1 : 0
    )
  }

  const prevDocument = () => {
    setCurrentDocumentIndex((prev) => 
      prev > 0 ? prev - 1 : documentTypes.length - 1
    )
  }

  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = currentImage
    link.download = `${user.firstName}_${user.lastName}_${currentDocument.key}.jpg`
    link.click()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">
              {user.firstName} {user.lastName}
            </CardTitle>
            <p className="text-sm text-[#666666]">
              {currentDocument.label}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadImage}
            >
              <Download className="w-4 h-4 mr-2" />
              Скачать
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Document Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={prevDocument}
              disabled={documentTypes.length <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Предыдущий
            </Button>
            
            <div className="flex gap-2">
              {documentTypes.map((doc, index) => (
                <Button
                  key={doc.key}
                  variant={index === currentDocumentIndex ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setCurrentDocumentIndex(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextDocument}
              disabled={documentTypes.length <= 1}
            >
              Следующий
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Document Image */}
          <div className="relative bg-[#F8F8F8] rounded-lg overflow-hidden">
            <img
              src={currentImage}
              alt={currentDocument.label}
              className="w-full h-auto max-h-[60vh] object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://via.placeholder.com/800x600/f0f0f0/666666?text=${encodeURIComponent(currentDocument.label)}`
              }}
            />
          </div>

          {/* Document Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-[#191919]">ИИН:</span>
              <span className="ml-2 text-[#666666]">{user.iin}</span>
            </div>
            <div>
              <span className="font-medium text-[#191919]">Паспорт:</span>
              <span className="ml-2 text-[#666666]">{user.passportNumber}</span>
            </div>
            <div>
              <span className="font-medium text-[#191919]">Телефон:</span>
              <span className="ml-2 text-[#666666]">{user.phone}</span>
            </div>
            <div>
              <span className="font-medium text-[#191919]">Дата подачи:</span>
              <span className="ml-2 text-[#666666]">
                {new Date(user.submittedAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
