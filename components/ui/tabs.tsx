"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
  activeTab: string
  onTabChange: (tab: string) => void
} | undefined>(undefined)

const useTabsContext = () => {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("Tab components must be used within a Tabs component")
  }
  return context
}

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value, onValueChange, children, className }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")

    const activeTab = value ?? internalValue
    const handleTabChange = (tab: string) => {
      if (onValueChange) {
        onValueChange(tab)
      } else {
        setInternalValue(tab)
      }
    }

    return (
      <TabsContext.Provider value={{ activeTab, onTabChange: handleTabChange }}>
        <div ref={ref} className={cn("w-full", className)}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

interface TabsListProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "rounded" | "pills"
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className, variant = "default" }, ref) => {
    const variantClasses = {
      default: "flex bg-[#F4F4F4] rounded-full gap-2 p-1",
      rounded: "flex bg-gray-100 rounded-xl p-1",
      pills: "flex gap-2",
    }

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], className)}
      >
        {children}
      </div>
    )
  }
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children, className, disabled = false }, ref) => {
    const { activeTab, onTabChange } = useTabsContext()
    const isActive = activeTab === value

    return (
      <button
        ref={ref}
        onClick={() => !disabled && onTabChange(value)}
        disabled={disabled}
        className={cn(
          "flex-1 py-3 px-6 rounded-full text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#191919] focus:ring-opacity-20",
          isActive
            ? "bg-[#191919] text-white transform scale-[0.98]"
            : "bg-transparent text-[#191919] hover:bg-gray-200",
          disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
          className
        )}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
  forceMount?: boolean
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, children, className, forceMount = false }, ref) => {
    const { activeTab } = useTabsContext()
    const isActive = activeTab === value

    if (!isActive && !forceMount) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "focus:outline-none",
          !isActive && forceMount && "hidden",
          className
        )}
        role="tabpanel"
        tabIndex={0}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
