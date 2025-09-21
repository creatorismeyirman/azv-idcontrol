"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogIn, Phone } from "@/components/icons"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { PhoneInput } from "@/components/ui/PhoneInput"
import { OTPInput } from "@/components/ui/OtpInput"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, sendSms, isLoading, isAuthenticated } = useAuth()
  
  const [activeStep, setActiveStep] = useState(0)
  const [phone, setPhone] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [error, setError] = useState("")
  const [isSendingSms, setIsSendingSms] = useState(false)
  
  // Check for access denied message
  const accessDenied = searchParams.get('message') === 'access_denied'

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const isPhoneValid = phone.replace(/\D/g, "").length === 10
  const isOtpValid = otpCode.length === 4

  const stepText = [
    {
      title: "Введите номер телефона",
      description: "Мы отправим вам код подтверждения"
    },
    {
      title: "Введите код",
      description: `Код отправлен на номер +7 ${phone.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "($1) $2 - $3 - $4")}`
    }
  ]

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPhoneValid) return

    setError("")
    setIsSendingSms(true)

    try {
      const phoneNumber = "7" + phone.replace(/\D/g, "")
      const success = await sendSms(phoneNumber)
      
      if (success) {
        setActiveStep(1)
      } else {
        setError("Ошибка отправки SMS. Попробуйте еще раз.")
      }
    } catch {
      setError("Произошла ошибка. Попробуйте еще раз.")
    } finally {
      setIsSendingSms(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOtpValid) return

    setError("")

    try {
      const phoneNumber = "7" + phone.replace(/\D/g, "")
      const success = await login(phoneNumber, otpCode)
      
      if (success) {
        router.push('/')
      } else {
        setError("Неверный код. Попробуйте еще раз.")
      }
    } catch {
      setError("Произошла ошибка. Попробуйте еще раз.")
    }
  }

  const handleResendSms = async () => {
    try {
      const phoneNumber = "7" + phone.replace(/\D/g, "")
      await sendSms(phoneNumber)
    } catch {
      setError("Ошибка повторной отправки SMS")
    }
  }

  const handleBack = () => {
    if (activeStep === 0) {
      router.push('/')
    } else {
      setActiveStep(0)
      setOtpCode("")
      setError("")
    }
  }

  return (
    <article className="min-h-screen bg-[#191919]">
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        {/* Left Side - Branding & Info */}
        <div className="flex-1 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] flex flex-col justify-center items-center px-16 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-32 h-32 border border-white/10 rounded-full"></div>
            <div className="absolute top-40 right-32 w-24 h-24 border border-white/10 rounded-full"></div>
            <div className="absolute bottom-32 left-40 w-16 h-16 border border-white/10 rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-20 h-20 border border-white/10 rounded-full"></div>
          </div>
          
          <div className="relative z-10 text-center max-w-md">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 overflow-hidden">
              <Image 
                src="/logo-nbg.png" 
                alt="AZV Motors Logo" 
                width={80} 
                height={80} 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">azvmotors</h1>
            <p className="text-xl text-white/70 mb-8">Система верификации документов</p>
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Безопасная верификация документов</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Интеграция с государственными системами</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Многоуровневая система доступа</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex flex-col justify-center px-16 max-w-lg mx-auto">
          <div className="w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-white mb-3">
                {stepText[activeStep].title}
              </h2>
              <p className="text-lg text-white/70">
                {stepText[activeStep].description}
              </p>
            </div>

            {/* Access Denied Message */}
            {accessDenied && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-red-400 font-medium">Доступ ограничен</p>
                    <p className="text-red-300/80 text-sm mt-1">
                      У вас нет прав для доступа к системе. Доступ разрешен только для финансистов и сотрудников МВД.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 0 ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div className="space-y-5">
                  {/* Phone Input */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Номер телефона
                    </label>
                    <PhoneInput 
                      onPhoneChange={setPhone}
                      disabled={isLoading || isSendingSms}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-white text-[#191919] hover:bg-white/90 font-medium h-14 rounded-xl text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={!isPhoneValid || isLoading || isSendingSms}
                >
                  {isSendingSms ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#191919] border-t-transparent rounded-full animate-spin" />
                      Отправка...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Отправить код
                    </div>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-5">
                  {/* OTP Input */}
                  <div>
                    <OTPInput
                      onCodeChange={setOtpCode}
                      onResend={handleResendSms}
                      isLoading={isLoading}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Back Button */}
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full text-white/70 hover:text-white text-sm underline transition-colors"
                >
                  Изменить номер телефона
                </button>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-white text-[#191919] hover:bg-white/90 font-medium h-14 rounded-xl text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={!isOtpValid || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#191919] border-t-transparent rounded-full animate-spin" />
                      Проверка...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-5 h-5" />
                      Войти
                    </div>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-screen py-10 pb-5 bg-[#191919]">
        {/* Header */}
        <div className="px-6 flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#191919] rounded-full flex items-center justify-center overflow-hidden">
              <Image 
                src="/logo-nbg.png" 
                alt="AZV Motors Logo" 
                width={48} 
                height={48} 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-white text-xl font-medium">azvmotors</h1>
              <p className="text-white/60 text-sm">Система верификации</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 flex flex-col justify-between h-full mt-[5%] text-white">
          <section>
            <h2 className="text-[28px] font-medium mb-2">
              {stepText[activeStep].title}
            </h2>
            <p className="text-[18px] text-white/70 mb-8">
              {stepText[activeStep].description}
            </p>

            {/* Access Denied Message */}
            {accessDenied && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-red-400 font-medium">Доступ ограничен</p>
                    <p className="text-red-300/80 text-sm mt-1">
                      У вас нет прав для доступа к системе. Доступ разрешен только для финансистов и сотрудников МВД.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 0 ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Phone Input */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Номер телефона
                    </label>
                    <PhoneInput 
                      onPhoneChange={setPhone}
                      disabled={isLoading || isSendingSms}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-white text-[#191919] hover:bg-white/90 font-medium h-[60px] rounded-[20px] text-[16px] transition-all duration-200"
                  disabled={!isPhoneValid || isLoading || isSendingSms}
                >
                  {isSendingSms ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#191919] border-t-transparent rounded-full animate-spin" />
                      Отправка...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Отправить код
                    </div>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* OTP Input */}
                  <div>
                    <OTPInput
                      onCodeChange={setOtpCode}
                      onResend={handleResendSms}
                      isLoading={isLoading}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Back Button */}
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full text-white/70 hover:text-white text-sm underline transition-colors"
                >
                  Изменить номер телефона
                </button>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-white text-[#191919] hover:bg-white/90 font-medium h-[60px] rounded-[20px] text-[16px] transition-all duration-200"
                  disabled={!isOtpValid || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#191919] border-t-transparent rounded-full animate-spin" />
                      Проверка...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-5 h-5" />
                      Войти
                    </div>
                  )}
                </Button>
              </form>
            )}
          </section>
        </div>
      </div>
    </article>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <div className="text-white text-lg">Загрузка...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
