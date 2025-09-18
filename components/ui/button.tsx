import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "icon" | "danger" | "success"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-full text-base font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#191919] focus-visible:ring-opacity-20 disabled:pointer-events-none disabled:opacity-50 active:scale-95"
    
    const variantClasses = {
      primary: "bg-white text-black hover:bg-gray-100",
      secondary: "bg-black text-white hover:bg-gray-800",
      outline: "bg-[#F4F4F4] text-black border border-[#E8E8E8] hover:bg-gray-100",
      icon: "bg-white text-black rounded-full w-10 h-10 flex items-center justify-center p-0 hover:bg-gray-100",
      danger: "bg-red-500 text-white hover:bg-red-600",
      success: "bg-green-500 text-white hover:bg-green-600",
    }
    
    const sizeClasses = {
      default: "h-14 px-6 py-3",
      sm: "h-10 px-4 py-2 text-sm",
      lg: "h-16 px-8 py-4 text-lg",
      icon: "h-10 w-10",
    }

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
