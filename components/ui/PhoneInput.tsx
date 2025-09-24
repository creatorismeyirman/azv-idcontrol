"use client"

import React, { useState, useEffect } from "react"

interface PhoneInputProps {
  onPhoneChange: (phone: string) => void
  disabled?: boolean
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  onPhoneChange,
  disabled = false
}) => {
  const [phone, setPhone] = useState("")

  useEffect(() => {
    onPhoneChange(phone)
  }, [phone, onPhoneChange])

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")
    
    // Limit to 10 digits (without country code)
    const limitedDigits = digits.slice(0, 10)
    
    // Format as (XXX) XXX - XX - XX
    if (limitedDigits.length === 0) return ""
    if (limitedDigits.length <= 3) return `(${limitedDigits}`
    if (limitedDigits.length <= 6) return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`
    if (limitedDigits.length <= 8) return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)} - ${limitedDigits.slice(6)}`
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)} - ${limitedDigits.slice(6, 8)} - ${limitedDigits.slice(8, 10)}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  const isValid = phone.replace(/\D/g, "").length === 10

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 w-full bg-[#292929] rounded-xl h-14 text-white border border-white/10 hover:border-white/20 transition-colors">
        <div className="p-4 pl-6">
          <span className="text-white/60 text-base">+7</span>
        </div>
        <div className="h-8 w-[1px] bg-white/10"></div>
        <input
          type="tel"
          className="w-full outline-none bg-transparent p-4 text-base text-white placeholder:text-white/30"
          placeholder="(747) 206 - 10 - 55"
          value={phone}
          onChange={handleChange}
          disabled={disabled}
          maxLength={20} // Account for formatting characters
        />
      </div>
      
      {phone && !isValid && (
        <p className="text-red-400 text-sm">
          Введите корректный номер телефона
        </p>
      )}
    </div>
  )
}

