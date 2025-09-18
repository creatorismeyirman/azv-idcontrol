export interface VerificationUser {
  id: string
  firstName: string
  lastName: string
  phone: string
  iin: string
  passportNumber: string
  documents: {
    idFront: string
    idBack: string
    driverLicense: string
    selfie: string
    selfieWithLicense: string
  }
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
  accessClass?: 'A' | 'AB' | 'ABC'
  mvdComment?: string
  roles: {
    financial: boolean
    mvd: boolean
  }
  lastOnline?: string
  rating?: number
  reviewsCount?: number
  
  // Финансовые поля (для кредитования)
  loanAmount?: number
  monthlyIncome?: number
  creditScore?: number
  employment?: string
  position?: string
  
  // МВД поля (для водительских прав)
  licenseCategory?: string
  medicalCertificate?: boolean
  drivingSchool?: string
  examScore?: number
  violations?: number
  experience?: string
}

export interface VerificationFilters {
  status: 'pending' | 'approved' | 'rejected'
  search: string
}

export type VerificationType = 'financial' | 'mvd'
