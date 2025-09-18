import { VerificationUser } from "@/types/verification"

// Пользователи для финансового отдела (заявки на кредитование)
export const financialUsers: VerificationUser[] = [
  {
    id: "fin_1",
    firstName: "Айдар",
    lastName: "Нурланов",
    phone: "+7 777 123 4567",
    iin: "123456789012",
    passportNumber: "N1234567",
    documents: {
      idFront: "/api/placeholder/400/300",
      idBack: "/api/placeholder/400/300",
      driverLicense: "/api/placeholder/400/300",
      selfie: "/api/placeholder/400/300",
      selfieWithLicense: "/api/placeholder/400/300"
    },
    status: "pending",
    submittedAt: "2024-01-15T10:30:00Z",
    roles: {
      financial: true,
      mvd: false
    },
    lastOnline: "2024-01-15T12:28:00Z",
    rating: 4.8,
    reviewsCount: 12,
    loanAmount: 5000000,
    monthlyIncome: 450000,
    creditScore: 750,
    employment: "ТОО 'Астана Моторс'",
    position: "Менеджер по продажам"
  },
  {
    id: "fin_2",
    firstName: "Асель",
    lastName: "Касымова",
    phone: "+7 777 234 5678",
    iin: "234567890123",
    passportNumber: "N2345678",
    documents: {
      idFront: "/api/placeholder/400/300",
      idBack: "/api/placeholder/400/300",
      driverLicense: "/api/placeholder/400/300",
      selfie: "/api/placeholder/400/300",
      selfieWithLicense: "/api/placeholder/400/300"
    },
    status: "approved",
    submittedAt: "2024-01-14T14:20:00Z",
    reviewedAt: "2024-01-14T16:45:00Z",
    reviewedBy: "Айгуль Нурланова",
    accessClass: "ABC",
    roles: {
      financial: true,
      mvd: false
    },
    lastOnline: "2024-01-15T09:15:00Z",
    rating: 5.0,
    reviewsCount: 7,
    loanAmount: 3000000,
    monthlyIncome: 320000,
    creditScore: 820,
    employment: "АО 'Халык Банк'",
    position: "Специалист по работе с клиентами"
  },
  {
    id: "fin_3",
    firstName: "Ерлан",
    lastName: "Сейтжанов",
    phone: "+7 777 345 6789",
    iin: "345678901234",
    passportNumber: "N3456789",
    documents: {
      idFront: "/api/placeholder/400/300",
      idBack: "/api/placeholder/400/300",
      driverLicense: "/api/placeholder/400/300",
      selfie: "/api/placeholder/400/300",
      selfieWithLicense: "/api/placeholder/400/300"
    },
    status: "approved",
    submittedAt: "2024-01-12T16:20:00Z",
    reviewedAt: "2024-01-12T18:10:00Z",
    reviewedBy: "Айгуль Нурланова",
    accessClass: "AB",
    roles: {
      financial: true,
      mvd: false
    },
    lastOnline: "2024-01-15T14:30:00Z",
    rating: 4.9,
    reviewsCount: 15,
    loanAmount: 7500000,
    monthlyIncome: 680000,
    creditScore: 780,
    employment: "ТОО 'Казахтелеком'",
    position: "Ведущий инженер"
  },
  {
    id: "fin_4",
    firstName: "Жанар",
    lastName: "Тулегенова",
    phone: "+7 777 456 7890",
    iin: "456789012345",
    passportNumber: "N4567890",
    documents: {
      idFront: "/api/placeholder/400/300",
      idBack: "/api/placeholder/400/300",
      driverLicense: "/api/placeholder/400/300",
      selfie: "/api/placeholder/400/300",
      selfieWithLicense: "/api/placeholder/400/300"
    },
    status: "rejected",
    submittedAt: "2024-01-16T08:45:00Z",
    reviewedAt: "2024-01-16T10:30:00Z",
    reviewedBy: "Айгуль Нурланова",
    rejectionReason: "Недостаточный доход для кредитования",
    roles: {
      financial: true,
      mvd: false
    },
    lastOnline: "2024-01-16T11:20:00Z",
    rating: 4.5,
    reviewsCount: 8,
    loanAmount: 8000000,
    monthlyIncome: 180000,
    creditScore: 650,
    employment: "ИП 'Тулегенова Ж.'",
    position: "Частный предприниматель"
  },
  {
    id: "fin_5",
    firstName: "Алмаз",
    lastName: "Кенжебаев",
    phone: "+7 777 567 8901",
    iin: "567890123456",
    passportNumber: "N5678901",
    documents: {
      idFront: "/api/placeholder/400/300",
      idBack: "/api/placeholder/400/300",
      driverLicense: "/api/placeholder/400/300",
      selfie: "/api/placeholder/400/300",
      selfieWithLicense: "/api/placeholder/400/300"
    },
    status: "pending",
    submittedAt: "2024-01-17T09:15:00Z",
    roles: {
      financial: true,
      mvd: false
    },
    lastOnline: "2024-01-17T11:45:00Z",
    rating: 4.2,
    reviewsCount: 5,
    loanAmount: 4000000,
    monthlyIncome: 280000,
    creditScore: 720,
    employment: "ТОО 'Астана Строй'",
    position: "Прораб"
  }
]

// Пользователи для МВД (заявки на получение водительских прав)
export const mvdUsers: VerificationUser[] = [
  {
    id: "mvd_1",
    firstName: "Данияр",
    lastName: "Ахметов",
    phone: "+7 777 678 9012",
    iin: "678901234567",
    passportNumber: "N6789012",
    documents: {
      idFront: "/api/placeholder/400/300",
      idBack: "/api/placeholder/400/300",
      driverLicense: "/api/placeholder/400/300",
      selfie: "/api/placeholder/400/300",
      selfieWithLicense: "/api/placeholder/400/300"
    },
    status: "approved",
    submittedAt: "2024-01-13T09:15:00Z",
    reviewedAt: "2024-01-13T11:30:00Z",
    reviewedBy: "Данияр Ахметов",
    accessClass: "A",
    roles: {
      financial: false,
      mvd: true
    },
    lastOnline: "2024-01-15T10:45:00Z",
    rating: 4.7,
    reviewsCount: 9,
    licenseCategory: "B",
    medicalCertificate: true,
    drivingSchool: "Автошкола 'Стрела'",
    examScore: 95,
    violations: 0,
    experience: "Новый водитель"
  },
  {
    id: "mvd_2",
    firstName: "Куралай",
    lastName: "Муканова",
    phone: "+7 777 789 0123",
    iin: "789012345678",
    passportNumber: "N7890123",
    documents: {
      idFront: "/api/placeholder/400/300",
      idBack: "/api/placeholder/400/300",
      driverLicense: "/api/placeholder/400/300",
      selfie: "/api/placeholder/400/300",
      selfieWithLicense: "/api/placeholder/400/300"
    },
    status: "rejected",
    submittedAt: "2024-01-11T12:30:00Z",
    reviewedAt: "2024-01-11T14:15:00Z",
    reviewedBy: "Данияр Ахметов",
    rejectionReason: "Нарушение правил дорожного движения",
    roles: {
      financial: false,
      mvd: true
    },
    lastOnline: "2024-01-11T13:00:00Z",
    rating: 2.1,
    reviewsCount: 1,
    licenseCategory: "B",
    medicalCertificate: true,
    drivingSchool: "Автошкола 'Волга'",
    examScore: 65,
    violations: 3,
    experience: "Повторная сдача"
  },
  {
    id: "mvd_3",
    firstName: "Нурлан",
    lastName: "Бекжанов",
    phone: "+7 777 890 1234",
    iin: "890123456789",
    passportNumber: "N8901234",
    documents: {
      idFront: "/api/placeholder/400/300",
      idBack: "/api/placeholder/400/300",
      driverLicense: "/api/placeholder/400/300",
      selfie: "/api/placeholder/400/300",
      selfieWithLicense: "/api/placeholder/400/300"
    },
    status: "pending",
    submittedAt: "2024-01-18T14:20:00Z",
    roles: {
      financial: false,
      mvd: true
    },
    lastOnline: "2024-01-18T16:30:00Z",
    rating: 4.3,
    reviewsCount: 6,
    licenseCategory: "C",
    medicalCertificate: true,
    drivingSchool: "Автошкола 'Транспорт'",
    examScore: 88,
    violations: 1,
    experience: "Опытный водитель"
  },
  {
    id: "mvd_4",
    firstName: "Айгуль",
    lastName: "Садыкова",
    phone: "+7 777 901 2345",
    iin: "901234567890",
    passportNumber: "N9012345",
    documents: {
      idFront: "/api/placeholder/400/300",
      idBack: "/api/placeholder/400/300",
      driverLicense: "/api/placeholder/400/300",
      selfie: "/api/placeholder/400/300",
      selfieWithLicense: "/api/placeholder/400/300"
    },
    status: "approved",
    submittedAt: "2024-01-10T11:45:00Z",
    reviewedAt: "2024-01-10T13:20:00Z",
    reviewedBy: "Данияр Ахметов",
    accessClass: "ABC",
    roles: {
      financial: false,
      mvd: true
    },
    lastOnline: "2024-01-15T08:15:00Z",
    rating: 4.8,
    reviewsCount: 12,
    licenseCategory: "B",
    medicalCertificate: true,
    drivingSchool: "Автошкола 'Экспресс'",
    examScore: 92,
    violations: 0,
    experience: "Новый водитель"
  },
  {
    id: "mvd_5",
    firstName: "Темирлан",
    lastName: "Омаров",
    phone: "+7 777 012 3456",
    iin: "012345678901",
    passportNumber: "N0123456",
    documents: {
      idFront: "/api/placeholder/400/300",
      idBack: "/api/placeholder/400/300",
      driverLicense: "/api/placeholder/400/300",
      selfie: "/api/placeholder/400/300",
      selfieWithLicense: "/api/placeholder/400/300"
    },
    status: "rejected",
    submittedAt: "2024-01-09T16:30:00Z",
    reviewedAt: "2024-01-09T18:00:00Z",
    reviewedBy: "Данияр Ахметов",
    rejectionReason: "Нарушение ПДД в прошлом",
    roles: {
      financial: false,
      mvd: true
    },
    lastOnline: "2024-01-09T17:30:00Z",
    rating: 3.5,
    reviewsCount: 3,
    licenseCategory: "B",
    medicalCertificate: false,
    drivingSchool: "Автошкола 'Старт'",
    examScore: 70,
    violations: 5,
    experience: "Лишен прав ранее"
  }
]

// Объединенный список для обратной совместимости
export const mockUsers: VerificationUser[] = [...financialUsers, ...mvdUsers]

// Пользователи системы (для авторизации)
export const systemUsers = [
  {
    username: "fin_user",
    password: "fin123",
    role: "financial" as const,
    name: "Айгуль Нурланова",
    department: "Финансовый отдел",
    position: "Специалист по кредитованию",
    avatar: "/api/placeholder/40/40",
    permissions: ["view_financial", "approve_loans", "reject_loans", "view_reports"]
  },
  {
    username: "mvd_user", 
    password: "mvd123",
    role: "mvd" as const,
    name: "Данияр Ахметов",
    department: "МВД",
    position: "Инспектор ГИБДД",
    avatar: "/api/placeholder/40/40",
    permissions: ["view_mvd", "approve_licenses", "reject_licenses", "view_violations"]
  }
]

// Типы для TypeScript
export type SystemUser = typeof systemUsers[0]
