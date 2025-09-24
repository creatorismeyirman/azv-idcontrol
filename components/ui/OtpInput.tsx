"use client"

import React, { useState, useRef, useEffect } from "react"

interface OTPInputProps {
  onCodeChange: (code: string) => void
  onResend: () => void
  isLoading?: boolean
  disabled?: boolean
}

const OTP_LENGTH = 4

export const OTPInput: React.FC<OTPInputProps> = ({
  onCodeChange,
  onResend,
  isLoading = false,
  disabled = false
}) => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""))
  const [timer, setTimer] = useState(59)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return // только цифры или пусто
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    onCodeChange(newOtp.join(""))

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleResend = () => {
    onResend()
    setOtp(Array(OTP_LENGTH).fill(""))
    setTimer(59)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={disabled || isLoading}
            className="w-14 h-14 text-center text-xl font-semibold bg-[#292929] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ))}
      </div>

      <div className="text-center">
        {timer > 0 ? (
          <p className="text-white/70 text-sm">
            Отправить код повторно через {timer} сек
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={disabled || isLoading}
            className="text-white/70 hover:text-white text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отправить код повторно
          </button>
        )}
      </div>
    </div>
  )
}

