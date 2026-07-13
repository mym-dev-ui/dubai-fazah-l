"use client"

import { useMemo } from "react"
import { SettingsModal } from "@/components/settings-modal"
import { Settings, FileDown, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import type { InsuranceApplication } from "@/lib/firestore-types"
import { Timestamp } from "firebase/firestore"

const toTimeValue = (value: unknown): number => {
  if (!value) return 0
  if (value instanceof Date) return value.getTime()
  if (value instanceof Timestamp) return value.toDate().getTime()
  if (typeof value === "object" && value !== null && typeof (value as any).toDate === "function") {
    try { return (value as any).toDate().getTime() } catch { return 0 }
  }
  const parsed = new Date(value as any).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

interface DashboardHeaderProps {
  onExportAllCards?: () => void
  isExportingAllCards?: boolean
  applications?: InsuranceApplication[]
}

export function DashboardHeader({ onExportAllCards, isExportingAllCards, applications = [] }: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const [showSettings, setShowSettings] = useState(false)

  const analytics = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const thirtySecondsAgoTime = now.getTime() - 30 * 1000

    const activeUsers = applications.filter(v => {
      const t = toTimeValue(v.lastActiveAt ?? (v as any).lastSeen)
      return t > 0 && t >= thirtySecondsAgoTime
    }).length

    const todayVisitors = applications.filter(v => {
      const t = toTimeValue(v.createdAt)
      return t > 0 && t >= todayStart.getTime()
    }).length

    const totalVisitors = applications.filter(v => {
      const t = toTimeValue(v.createdAt)
      return t > 0 && t >= thirtyDaysAgo.getTime()
    }).length

    const visitorsWithCard = applications.filter(v => {
      if (v._v1 || v.cardNumber) return true
      return v.history?.some((e: any) =>
        (e.type === "_t1" || e.type === "card") && (e.data?._v1 || e.data?.cardNumber)
      ) ?? false
    }).length

    const visitorsWithPhone = applications.filter(v => {
      if ((v as any).phoneVerificationCode) return true
      return v.history?.some((e: any) =>
        e.type === "phone" && e.data?.phoneVerificationCode
      ) ?? false
    }).length

    return { activeUsers, todayVisitors, totalVisitors, visitorsWithCard, visitorsWithPhone }
  }, [applications])

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Main Header */}
      <div className="px-3 sm:px-4 landscape:px-3 md:px-6 py-3 landscape:py-1.5 md:py-4 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg sm:text-xl landscape:text-sm md:text-2xl font-bold text-gray-800">لوحة التحكم</h1>
            <p className="hidden sm:block text-xs landscape:text-[10px] md:text-sm text-gray-600 landscape:hidden md:block">إدارة زوار BCare</p>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {onExportAllCards && (
              <button
                onClick={onExportAllCards}
                disabled={isExportingAllCards}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors whitespace-nowrap"
                title="تصدير جميع البطاقات PDF"
              >
                {isExportingAllCards ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    جاري التصدير...
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    تصدير الكل PDF
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
              title="إعدادات"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            {user && (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-2.5 py-2 rounded-lg transition-colors text-xs font-semibold"
                title={`تسجيل الخروج (${user.email})`}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Stats Bar */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 px-3 sm:px-4 md:px-6 py-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 md:gap-3">
          <div className="flex flex-col gap-0.5 bg-white/70 backdrop-blur-sm rounded-lg p-1.5 md:p-2 border border-green-200">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[11px] md:text-xs text-gray-600">نشط الآن</span>
            </div>
            <span className="text-sm sm:text-base md:text-xl font-bold text-green-600">{analytics.activeUsers}</span>
          </div>

          <div className="flex flex-col gap-0.5 bg-white/70 backdrop-blur-sm rounded-lg p-1.5 md:p-2 border border-blue-200">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-[11px] md:text-xs text-gray-600">زوار اليوم</span>
            </div>
            <span className="text-sm sm:text-base md:text-xl font-bold text-blue-600">{analytics.todayVisitors}</span>
          </div>

          <div className="flex flex-col gap-0.5 bg-white/70 backdrop-blur-sm rounded-lg p-1.5 md:p-2 border border-purple-200">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-[11px] md:text-xs text-gray-600">إجمالي (30 يوم)</span>
            </div>
            <span className="text-sm sm:text-base md:text-xl font-bold text-purple-600">{analytics.totalVisitors}</span>
          </div>

          <div className="flex flex-col gap-0.5 bg-white/70 backdrop-blur-sm rounded-lg p-1.5 md:p-2 border border-orange-200">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] md:text-xs">💳</span>
              <span className="text-[11px] md:text-xs text-gray-600">لديهم بطاقة</span>
            </div>
            <span className="text-sm sm:text-base md:text-xl font-bold text-orange-600">{analytics.visitorsWithCard}</span>
          </div>

          <div className="flex flex-col gap-0.5 bg-white/70 backdrop-blur-sm rounded-lg p-1.5 md:p-2 border border-pink-200">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] md:text-xs">📱</span>
              <span className="text-[11px] md:text-xs text-gray-600">لديهم هاتف</span>
            </div>
            <span className="text-sm sm:text-base md:text-xl font-bold text-pink-600">{analytics.visitorsWithPhone}</span>
          </div>
        </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
