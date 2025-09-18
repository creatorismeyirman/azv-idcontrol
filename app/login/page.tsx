"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, LogIn, User, Shield, Lock } from "@/components/icons"
import Image from "next/image"
import { systemUsers, SystemUser } from "@/lib/mock-data"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    // В реальном приложении здесь будет API вызов
    console.log('Login attempt:', formData)
    
    // Симуляция загрузки
    setTimeout(() => {
      // Проверяем учетные данные
      const user = systemUsers.find((u: SystemUser) => u.username === formData.username && u.password === formData.password)
      
      if (user) {
        // Сохраняем пользователя в localStorage
        localStorage.setItem('currentUser', JSON.stringify(user))
        // Перенаправление на главную страницу верификации
        window.location.href = '/'
      } else {
        setError('Неверные учетные данные')
        setIsLoading(false)
      }
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const handleDemoLogin = (username: string, password: string) => {
    setFormData({ username, password })
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
                Вход в систему
              </h2>
              <p className="text-lg text-white/70">
                Войдите в панель управления верификацией
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                {/* Username Input */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">
                    Имя пользователя
                  </label>
                  <div className="flex items-center gap-3 w-full bg-[#292929] rounded-xl h-14 text-white border border-white/10 hover:border-white/20 transition-colors">
                    <div className="p-4 pl-6">
                      <User className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="h-8 w-[1px] bg-white/10"></div>
                    <input
                      className="w-full outline-none bg-transparent p-4 text-base text-white placeholder:text-white/30"
                      placeholder="Введите имя пользователя"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">
                    Пароль
                  </label>
                  <div className="flex items-center gap-3 w-full bg-[#292929] rounded-xl h-14 text-white border border-white/10 hover:border-white/20 transition-colors">
                    <div className="p-4 pl-6">
                      <Lock className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="h-8 w-[1px] bg-white/10"></div>
                    <input
                      className="w-full outline-none bg-transparent p-4 text-base text-white placeholder:text-white/30"
                      type={showPassword ? "text" : "password"}
                      placeholder="Введите пароль"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-4 pr-6 text-white/60 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-white bg-[#292929] border-white/20 rounded focus:ring-white/50 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-white/70">
                    Запомнить меня
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-white/70 hover:text-white hover:underline transition-colors"
                >
                  Забыли пароль?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-white text-[#191919] hover:bg-white/90 font-medium h-14 rounded-xl text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading || !formData.username || !formData.password}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#191919] border-t-transparent rounded-full animate-spin" />
                    Вход...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Войти
                  </div>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Демо-доступ:
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => handleDemoLogin('fin_user', 'fin123')}
                    className="flex items-center justify-between p-4 bg-[#292929] rounded-lg hover:bg-[#333333] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-white rounded flex items-center justify-center overflow-hidden">
                        <Image 
                          src="/logo-nbg.png" 
                          alt="AZV Motors Logo" 
                          width={20} 
                          height={20} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-white">Финансовый отдел</div>
                        <div className="text-xs text-white/60">fin_user / fin123</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/40 group-hover:text-white/60">
                      Нажмите
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleDemoLogin('mvd_user', 'mvd123')}
                    className="flex items-center justify-between p-4 bg-[#292929] rounded-lg hover:bg-[#333333] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-400" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-white">МВД</div>
                        <div className="text-xs text-white/60">mvd_user / mvd123</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/40 group-hover:text-white/60">
                      Нажмите
                    </div>
                  </button>
                </div>
              </div>
            </div>
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
              Вход в систему
            </h2>
            <p className="text-[18px] text-white/70 mb-8">
              Войдите в панель управления верификацией документов
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Имя пользователя
                  </label>
                  <div className="flex items-center gap-2 w-full bg-[#292929] rounded-[20px] h-[60px] text-white border border-white/10">
                    <div className="p-4 pl-6">
                      <User className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="h-full w-[1px] bg-white/10"></div>
                    <input
                      className="w-full outline-none bg-transparent p-4 text-[16px] text-white placeholder:text-white/30"
                      placeholder="Введите имя пользователя"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Пароль
                  </label>
                  <div className="flex items-center gap-2 w-full bg-[#292929] rounded-[20px] h-[60px] text-white border border-white/10">
                    <div className="p-4 pl-6">
                      <Lock className="w-5 h-5 text-white/60" />
                    </div>
                    <div className="h-full w-[1px] bg-white/10"></div>
                    <input
                      className="w-full outline-none bg-transparent p-4 text-[16px] text-white placeholder:text-white/30"
                      type={showPassword ? "text" : "password"}
                      placeholder="Введите пароль"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-4 pr-6 text-white/60 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-white bg-[#292929] border-white/20 rounded focus:ring-white/50 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-white/70">
                    Запомнить меня
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-white/70 hover:text-white hover:underline transition-colors"
                >
                  Забыли пароль?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-white text-[#191919] hover:bg-white/90 font-medium h-[60px] rounded-[20px] text-[16px] transition-all duration-200"
                disabled={isLoading || !formData.username || !formData.password}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#191919] border-t-transparent rounded-full animate-spin" />
                    Вход...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Войти
                  </div>
                )}
              </Button>
            </form>
          </section>

          {/* Demo Credentials */}
          <section className="mt-8 space-y-4">
            <div className="bg-white/5 rounded-[20px] p-6 border border-white/10">
              <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Демо-доступ:
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleDemoLogin('fin_user', 'fin123')}
                  className="w-full flex items-center justify-between p-3 bg-[#292929] rounded-[12px] hover:bg-[#333333] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-white rounded flex items-center justify-center overflow-hidden">
                      <Image 
                        src="/logo-nbg.png" 
                        alt="AZV Motors Logo" 
                        width={20} 
                        height={20} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-white">Финансовый отдел</div>
                      <div className="text-xs text-white/60">fin_user / fin123</div>
                    </div>
                  </div>
                  <div className="text-xs text-white/40 group-hover:text-white/60">
                    Нажмите
                  </div>
                </button>
                
                <button
                  onClick={() => handleDemoLogin('mvd_user', 'mvd123')}
                  className="w-full flex items-center justify-between p-3 bg-[#292929] rounded-[12px] hover:bg-[#333333] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-white rounded flex items-center justify-center overflow-hidden">
                      <Image 
                        src="/logo-nbg.png" 
                        alt="AZV Motors Logo" 
                        width={20} 
                        height={20} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-white">МВД</div>
                      <div className="text-xs text-white/60">mvd_user / mvd123</div>
                    </div>
                  </div>
                  <div className="text-xs text-white/40 group-hover:text-white/60">
                    Нажмите
                  </div>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </article>
  )
}
