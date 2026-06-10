"use client"

import React, { useState, useEffect } from "react"
import { trackOrder } from "@lib/data/orders"
import { convertToLocale } from "@lib/util/money"
import { getCarrierName, getTrackingUrl } from "@lib/util/cargo"
import {
  Button,
  Input,
  Heading,
  Text,
  Badge,
} from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type TrackingClientProps = {
  customer: any | null
  initialOrders: any[]
}

export default function TrackingClient({
  customer,
  initialOrders,
}: TrackingClientProps) {
  const [displayId, setDisplayId] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Auto-fill form and search if displayId and email are passed from query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const qId = params.get("id")
    const qEmail = params.get("email")
    if (qId && qEmail) {
      setDisplayId(qId)
      setEmail(qEmail)
      handleSearch(null, qId, qEmail)
    }
  }, [])

  const handleSearch = async (
    e: React.FormEvent | null,
    searchId = displayId,
    searchEmail = email
  ) => {
    if (e) e.preventDefault()
    if (!searchId || !searchEmail) {
      setError("Lütfen sipariş numarasını ve e-posta adresinizi girin.")
      return
    }

    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      const result = await trackOrder(searchId, searchEmail)
      if (result) {
        setOrder(result)
        // Update URL query parameters for shareability
        const url = new URL(window.location.href)
        url.searchParams.set("id", searchId)
        url.searchParams.set("email", searchEmail)
        window.history.pushState({}, "", url.toString())
      } else {
        setError("Sipariş bulunamadı. Lütfen bilgilerinizi kontrol edin.")
      }
    } catch (err: any) {
      setError(err?.message || "Sipariş sorgulanırken bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickTrack = (ord: any) => {
    setDisplayId(ord.display_id.toString())
    setEmail(ord.email)
    handleSearch(null, ord.display_id.toString(), ord.email)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Map Medusa fulfillment and payment status to Turkish user-friendly labels
  const getFulfillmentLabel = (status: string) => {
    switch (status) {
      case "not_fulfilled":
        return { text: "Hazırlanıyor", color: "orange" as const }
      case "partially_fulfilled":
        return { text: "Kısmen Hazırlandı", color: "blue" as const }
      case "fulfilled":
        return { text: "Hazırlandı", color: "blue" as const }
      case "partially_shipped":
        return { text: "Kısmen Kargolandı", color: "blue" as const }
      case "shipped":
        return { text: "Kargoya Verildi", color: "green" as const }
      case "delivered":
        return { text: "Teslim Edildi", color: "green" as const }
      case "canceled":
        return { text: "İptal Edildi", color: "red" as const }
      default:
        return { text: "Hazırlanıyor", color: "orange" as const }
    }
  }

  const getPaymentLabel = (status: string) => {
    switch (status) {
      case "not_paid":
        return { text: "Ödeme Bekleniyor", color: "orange" as const }
      case "awaiting":
        return { text: "Onay Bekleniyor", color: "orange" as const }
      case "captured":
        return { text: "Ödendi", color: "green" as const }
      case "refunded":
        return { text: "İade Edildi", color: "grey" as const }
      case "canceled":
        return { text: "İptal Edildi", color: "red" as const }
      default:
        return { text: status, color: "grey" as const }
    }
  }

  const getStatusSteps = (orderObj: any) => {
    const isCanceled = orderObj.status === "canceled"
    const fStatus = orderObj.fulfillment_status

    type TrackingStep = {
      title: string
      desc: string
      date: string | null
      completed: boolean
      active: boolean
      isError?: boolean
    }

    const steps: TrackingStep[] = [
      {
        title: "Sipariş Alındı",
        desc: "Siparişiniz başarıyla alındı ve onaylandı.",
        date: new Date(orderObj.created_at).toLocaleDateString("tr-TR"),
        completed: true,
        active: false,
      },
      {
        title: "Hazırlanıyor",
        desc: "Siparişiniz paketleniyor ve faturası düzenleniyor.",
        date: null as string | null,
        completed: false,
        active: false,
      },
      {
        title: "Kargoya Verildi",
        desc: "Siparişiniz kargo firmasına teslim edilmiştir.",
        date: null as string | null,
        completed: false,
        active: false,
      },
      {
        title: "Teslim Edildi",
        desc: "Siparişiniz başarıyla teslim edilmiştir.",
        date: null as string | null,
        completed: false,
        active: false,
      },
    ]

    if (isCanceled) {
      return {
        currentStep: -1,
        isCanceled: true,
        steps: [
          {
            title: "Sipariş Alındı",
            desc: "Siparişiniz alındı.",
            date: new Date(orderObj.created_at).toLocaleDateString("tr-TR"),
            completed: true,
            active: false,
          },
          {
            title: "İptal Edildi",
            desc: "Bu sipariş iptal edilmiştir.",
            date: null,
            completed: true,
            active: true,
            isError: true,
          },
        ] as TrackingStep[],
      }
    }

    // Mark Preparing
    if (fStatus === "not_fulfilled") {
      steps[1].completed = true
      steps[1].active = true
      return { currentStep: 1, isCanceled: false, steps }
    }

    // Mark Shipped
    if (["fulfilled", "partially_shipped", "shipped"].includes(fStatus)) {
      steps[1].completed = true
      steps[2].completed = true
      steps[2].active = true
      if (orderObj.fulfillments && orderObj.fulfillments.length > 0) {
        const lastF = orderObj.fulfillments[orderObj.fulfillments.length - 1]
        if (lastF.shipped_at) {
          steps[2].date = new Date(lastF.shipped_at).toLocaleDateString("tr-TR")
        }
      }
    }

    // Mark Delivered
    if (fStatus === "delivered" || orderObj.status === "completed") {
      steps[1].completed = true
      steps[2].completed = true
      steps[3].completed = true
      steps[3].active = true
      if (orderObj.fulfillments && orderObj.fulfillments.length > 0) {
        const lastF = orderObj.fulfillments[orderObj.fulfillments.length - 1]
        if (lastF.delivered_at) {
          steps[3].date = new Date(lastF.delivered_at).toLocaleDateString(
            "tr-TR"
          )
        }
      }
      return { currentStep: 3, isCanceled: false, steps }
    }

    return { currentStep: 2, isCanceled: false, steps }
  }

  const { steps, currentStep, isCanceled } = order
    ? getStatusSteps(order)
    : { steps: [], currentStep: 0, isCanceled: false }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Premium Header */}
      <div className="text-center mb-10">
        <Heading
          level="h1"
          className="text-4xl font-extrabold tracking-tight text-gray-900 mb-3"
        >
          Sipariş Takip & Kargo Sorgulama
        </Heading>
        <Text className="text-gray-500 max-w-xl mx-auto">
          Sipariş kodunuz ve e-posta adresinizle anlık kargo durumunuzu
          sorgulayabilir veya üye girişi yaparak geçmiş siparişlerinizi
          yönetebilirsiniz.
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left/Main column - Inquiry Form & Search Results */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Inquiry Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Sipariş Koduyla Sorgula
            </h2>

            <form
              onSubmit={(e) => handleSearch(e)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end"
            >
              <div>
                <label
                  htmlFor="displayId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Sipariş Numarası
                </label>
                <Input
                  id="displayId"
                  type="text"
                  placeholder="Örn: 5"
                  value={displayId}
                  onChange={(e) =>
                    setDisplayId(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full h-11 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-xl"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  E-posta Adresi
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 border-gray-200 focus:border-red-500 focus:ring-red-500 rounded-xl"
                  required
                />
              </div>

              <div className="md:col-span-2 mt-2">
                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-red-100 flex items-center justify-center gap-2"
                >
                  {!loading && (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                  Sorgula
                </Button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-red-500 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Shimmer loading skeleton */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-pulse flex flex-col gap-6">
              <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
              <div className="flex gap-4">
                <div className="h-10 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="border-t border-gray-100 pt-6">
                <div className="h-20 bg-gray-100 rounded-xl"></div>
              </div>
            </div>
          )}

          {/* Order Details Result */}
          {order && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col gap-6">
              {/* Result Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl font-bold text-gray-900">
                      Sipariş #{order.display_id}
                    </span>
                    <Badge
                      color={
                        getFulfillmentLabel(order.fulfillment_status).color
                      }
                    >
                      {getFulfillmentLabel(order.fulfillment_status).text}
                    </Badge>
                    <Badge color={getPaymentLabel(order.payment_status).color}>
                      {getPaymentLabel(order.payment_status).text}
                    </Badge>
                  </div>
                  <Text className="text-sm text-gray-500">
                    Sipariş Tarihi:{" "}
                    {new Date(order.created_at).toLocaleString("tr-TR")}
                  </Text>
                </div>

                <div className="flex items-center gap-2 self-stretch md:self-auto">
                  <div className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-mono select-all shrink-0">
                    ID: {order.id}
                  </div>
                  <button
                    onClick={() => copyToClipboard(order.id, "id")}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                    title="Sipariş ID'sini kopyala"
                  >
                    {copiedId === "id" ? (
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress Steps / Stepper */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-6">
                  Kargo Durumu
                </h3>

                {/* Horizontal Stepper for Desktop, Vertical for Mobile */}
                <div className="hidden md:flex justify-between items-center relative mb-8">
                  {/* Background Line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gray-100 top-5 -z-1"></div>

                  {/* Active Line Progress */}
                  <div
                    className="absolute left-0 h-0.5 bg-green-500 top-5 -z-1 transition-all duration-500"
                    style={{
                      width: isCanceled
                        ? "100%"
                        : `${(currentStep / (steps.length - 1)) * 100}%`,
                    }}
                  ></div>

                  {steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center flex-1 relative z-10"
                    >
                      {/* Step Circle */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                          step.completed
                            ? step.isError
                              ? "bg-red-50 border-red-500 text-red-600"
                              : "bg-green-50 border-green-500 text-green-600"
                            : "bg-white border-gray-200 text-gray-400"
                        } ${
                          step.active && !step.isError
                            ? "ring-4 ring-green-100"
                            : ""
                        }`}
                      >
                        {step.completed && !step.isError ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : step.isError ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold mt-2 ${
                          step.completed ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </span>
                      {step.date && (
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {step.date}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Vertical Stepper for Mobile */}
                <div className="flex md:hidden flex-col gap-6 relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                  {steps.map((step, idx) => {
                    const isStepCompleted = step.completed
                    return (
                      <div
                        key={idx}
                        className="relative flex items-start gap-4"
                      >
                        {/* Step Marker */}
                        <div
                          className={`absolute -left-6 w-4 h-4 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                            isStepCompleted
                              ? step.isError
                                ? "bg-red-500 border-red-500 text-white"
                                : "bg-green-500 border-green-500 text-white"
                              : "bg-white border-gray-300 text-gray-400"
                          }`}
                        >
                          {isStepCompleted && !step.isError && (
                            <svg
                              className="w-2.5 h-2.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                          {step.isError && (
                            <svg
                              className="w-2.5 h-2.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 -mt-1">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm font-bold ${
                                isStepCompleted
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {step.title}
                            </h4>
                            {step.date && (
                              <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                                {step.date}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Fulfillments / Cargo Tracking Link */}
              {order.fulfillments && order.fulfillments.length > 0 && (
                <div className="bg-red-50/50 rounded-xl border border-red-100/60 p-5">
                  <h3 className="font-bold text-red-900 text-sm mb-3 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                    Kargo Takip Bilgileri
                  </h3>
                  {order.fulfillments.map((fulfillment: any, fIdx: number) => {
                    // Takip bilgisi fulfillment.labels'tan gelir (tracking_number/tracking_url).
                    const labels = fulfillment.labels || []
                    const trackingNumbers = labels
                      .map((l: any) => l?.tracking_number)
                      .filter(Boolean)
                    const trackingLinks = labels.map((l: any) => l?.tracking_url)
                    return (
                      <div key={fulfillment.id} className="flex flex-col gap-3">
                        <div className="text-xs text-red-700 font-medium">
                          Paket #{fIdx + 1} - Kargo Firması:{" "}
                          {getCarrierName(fulfillment.provider_id)}
                        </div>
                        {trackingNumbers.length > 0 ? (
                          trackingNumbers.map((num: string, nIdx: number) => {
                            const link =
                              trackingLinks[nIdx] ||
                              getTrackingUrl(num, fulfillment.provider_id) ||
                              `https://kargotakip.araskargo.com.tr/?gonderitakipno=${num}`
                            return (
                              <div
                                key={nIdx}
                                className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-red-100"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-semibold text-gray-700">
                                    Takip Numarası:
                                  </span>
                                  <span className="font-mono text-sm text-gray-900 font-bold select-all">
                                    {num}
                                  </span>
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        num,
                                        `track-${fIdx}-${nIdx}`
                                      )
                                    }
                                    className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                                    title="Takip kodunu kopyala"
                                  >
                                    {copiedId === `track-${fIdx}-${nIdx}` ? (
                                      <svg
                                        className="w-3.5 h-3.5 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                        />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
                                >
                                  Kargom Nerede?
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              </div>
                            )
                          })
                        ) : (
                          <div className="text-xs text-gray-500 bg-white p-3 rounded-lg border border-gray-100 italic">
                            Kargo takip numarası henüz girilmemiş. Siparişiniz
                            kargoya verildiğinde takip linki burada
                            görünecektir.
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Items List */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Sipariş İçeriği
                </h3>
                <div className="flex flex-col gap-4">
                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex gap-4 items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100/40"
                    >
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg bg-gray-100 border border-gray-200 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {item.title}
                        </h4>
                        <Text className="text-xs text-gray-500 mt-0.5">
                          Miktar: {item.quantity} adet
                        </Text>
                      </div>
                      <div className="text-sm font-bold text-gray-900 font-mono">
                        {convertToLocale({
                          amount: item.unit_price * item.quantity,
                          currency_code: order.currency_code,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">
                    Teslimat Adresi
                  </h4>
                  <div className="text-xs text-gray-600 flex flex-col gap-1">
                    <span className="font-bold">
                      {order.shipping_address?.first_name}{" "}
                      {order.shipping_address?.last_name}
                    </span>
                    <span>
                      {order.shipping_address?.address_1}{" "}
                      {order.shipping_address?.address_2}
                    </span>
                    <span>
                      {order.shipping_address?.postal_code}{" "}
                      {order.shipping_address?.city} /{" "}
                      {order.shipping_address?.country_code?.toUpperCase()}
                    </span>
                    {order.shipping_address?.phone && (
                      <span>Tel: {order.shipping_address?.phone}</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">
                    Kargo Yöntemi
                  </h4>
                  <div className="text-xs text-gray-600 flex flex-col gap-1">
                    <span className="font-semibold">
                      {order.shipping_methods?.[0]?.name || "Standart Kargo"}
                    </span>
                    <span>
                      Kargo Ücreti:{" "}
                      {order.shipping_methods?.[0]?.amount !== undefined
                        ? convertToLocale({
                            amount: order.shipping_methods[0].amount,
                            currency_code: order.currency_code,
                          })
                        : "Ücretsiz"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column - Logged-in Customer orders */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {customer ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  {customer.first_name
                    ? customer.first_name[0].toUpperCase()
                    : "U"}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Merhaba, {customer.first_name}
                  </h3>
                  <p className="text-xs text-gray-500">{customer.email}</p>
                </div>
              </div>

              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-4">
                Son Siparişleriniz
              </h4>

              {initialOrders.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {initialOrders.map((ord) => {
                    const fLabel = getFulfillmentLabel(ord.fulfillment_status)
                    return (
                      <div
                        key={ord.id}
                        onClick={() => handleQuickTrack(ord)}
                        className="p-3 bg-gray-50 hover:bg-red-50/40 hover:border-red-200/50 rounded-xl border border-gray-100 cursor-pointer transition-all flex flex-col gap-2 group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                            Sipariş #{ord.display_id}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(ord.created_at).toLocaleDateString(
                              "tr-TR"
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <Badge
                            color={fLabel.color}
                            className="py-0.5 px-2 text-[10px]"
                          >
                            {fLabel.text}
                          </Badge>
                          <span className="font-mono font-bold text-gray-700">
                            {convertToLocale({
                              amount: ord.items.reduce(
                                (acc: number, item: any) =>
                                  acc + item.unit_price * item.quantity,
                                0
                              ),
                              currency_code: ord.currency_code,
                            })}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Text className="text-xs text-gray-400 italic">
                  Henüz bir siparişiniz bulunmuyor.
                </Text>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/4">
                <svg
                  className="w-40 h-40"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <h3 className="font-bold text-lg mb-3">Hesabınız Var mı?</h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-5">
                Üye girişi yaparak tüm siparişlerinizi toplu listeleyebilir,
                kargo durumlarını anlık takip edebilir ve adres bilgilerinizi
                kolayca yönetebilirsiniz.
              </p>

              <LocalizedClientLink
                href="/account"
                className="w-full h-11 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl transition-all shadow-md flex items-center justify-center text-sm gap-2"
              >
                Giriş Yap / Üye Ol
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </LocalizedClientLink>
            </div>
          )}

          {/* Quick Info Box */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
            <h3 className="font-bold text-gray-800 text-sm">
              Yardım ve Destek
            </h3>
            <div className="flex flex-col gap-3 text-xs text-gray-600">
              <div className="flex gap-2">
                <svg
                  className="w-4 h-4 text-red-600 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Sipariş numarası size e-posta ile iletilen{" "}
                  <b>Sipariş Onayı</b> mesajında yer almaktadır.
                </span>
              </div>
              <div className="flex gap-2">
                <svg
                  className="w-4 h-4 text-red-600 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>
                  Sorularınız veya teslimat değişiklik talepleriniz için{" "}
                  <LocalizedClientLink
                    href="/iletisim"
                    className="text-red-600 font-semibold hover:underline"
                  >
                    Müşteri Hizmetleri
                  </LocalizedClientLink>{" "}
                  ile iletişime geçebilirsiniz.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
