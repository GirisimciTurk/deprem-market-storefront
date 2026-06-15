"use client"

import React, { useState, useEffect } from "react"
import { Truck, CreditCard, MapPin, X, ChevronRight } from "lucide-react"
import { TR_CITIES_DISTRICTS } from "@lib/util/tr-cities-districts"
import { sdk } from "@lib/config"

type InstallmentCargoInfoProps = {
  price: number // Base price in Liras (e.g. 1500)
}

type InstallmentData = {
  INSTALLMENT: number
  COMMISSION: string
  CARD_TRX_TYPE: string
  MERCHANT_COMMISSION: number
}

type BankCommission = {
  CODE: string
  KEY: string
  DATA: InstallmentData[]
}

const BANK_NAMES: Record<string, { name: string; color: string; bg: string }> =
  {
    BONUS: {
      name: "Bonus (Garanti)",
      color: "text-green-700 border-green-200",
      bg: "bg-green-50",
    },
    AXESS: {
      name: "Axess (Akbank)",
      color: "text-brand-600 border-brand-200",
      bg: "bg-brand-50",
    },
    WORLD: {
      name: "World (Yapı Kredi)",
      color: "text-blue-600 border-blue-200",
      bg: "bg-blue-50",
    },
    MAXIMUM: {
      name: "Maximum (İş Bankası)",
      color: "text-pink-600 border-pink-200",
      bg: "bg-pink-50",
    },
    BANKKART: {
      name: "Bankkart (Ziraat)",
      color: "text-brand-700 border-brand-200",
      bg: "bg-brand-50",
    },
    CARDFINANS: {
      name: "CardFinans (QNB)",
      color: "text-sky-700 border-sky-200",
      bg: "bg-sky-50",
    },
    PARAF: {
      name: "Paraf (Halkbank)",
      color: "text-teal-700 border-teal-200",
      bg: "bg-teal-50",
    },
    SAGLAMKART: {
      name: "Sağlam Kart (Kuveyt Türk)",
      color: "text-amber-700 border-amber-200",
      bg: "bg-amber-50",
    },
    OTHERS: {
      name: "Diğer Kartlar",
      color: "text-gray-600 border-gray-200",
      bg: "bg-gray-50",
    },
  }

export default function InstallmentCargoInfo({
  price,
}: InstallmentCargoInfoProps) {
  // Cargo Location State
  const [city, setCity] = useState("Ankara")
  const [district, setDistrict] = useState("Gölbaşı")
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  // Installment State
  const [installmentList, setInstallmentList] = useState<BankCommission[]>([])
  const [loading, setLoading] = useState(true)
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false)
  const [selectedBank, setSelectedBank] = useState<string>("BONUS")

  // Load saved location on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCity = localStorage.getItem("user_city")
      const savedDistrict = localStorage.getItem("user_district")
      if (savedCity) setCity(savedCity)
      if (savedDistrict) setDistrict(savedDistrict)
    }
  }, [])

  // Fetch Installment Data
  useEffect(() => {
    async function fetchInstallments() {
      try {
        setLoading(true)
        const response = await sdk.client.fetch<any>("/store/installments")
        if (response && response.success && response.data?.COMMISSION_LIST) {
          setInstallmentList(response.data.COMMISSION_LIST)
          // Find first bank in commission list to set as default select
          if (response.data.COMMISSION_LIST.length > 0) {
            setSelectedBank(response.data.COMMISSION_LIST[0].CODE)
          }
        }
      } catch (error) {
        console.error("Error fetching installments:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchInstallments()
  }, [])

  // Location selector change handler
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value
    setCity(newCity)
    const districts = TR_CITIES_DISTRICTS[newCity] || []
    setDistrict(districts[0] || "")
  }

  const saveLocation = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user_city", city)
      localStorage.setItem("user_district", district)
    }
    setIsLocationModalOpen(false)
  }

  // Calculate dynamic delivery date: June 12 is Friday, 6 days from local time 2026-06-06
  const getDeliveryDateString = () => {
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + 6)

    const months = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ]
    const days = [
      "Pazar",
      "Pazartesi",
      "Salı",
      "Çarşamba",
      "Perşembe",
      "Cuma",
      "Cumartesi",
    ]

    const day = deliveryDate.getDate()
    const month = months[deliveryDate.getMonth()]
    const dayOfWeek = days[deliveryDate.getDay()]

    return `${day} ${month} ${dayOfWeek}`
  }

  // Get lowest monthly payment start option
  const getStartingInstallmentText = () => {
    if (loading || installmentList.length === 0) {
      // Return a calculated mock/estimate if loading
      const estMonthly = (price * 1.05) / 12
      return `Aylık ${estMonthly.toFixed(2)} TL'den başlayan taksit fırsatları`
    }

    let minMonthly = Infinity

    installmentList.forEach((bank) => {
      bank.DATA.forEach((item) => {
        if (item.INSTALLMENT > 1) {
          const comm = parseFloat(item.COMMISSION) || 0
          const total = price * (1 + comm / 100)
          const monthly = total / item.INSTALLMENT
          if (monthly < minMonthly) {
            minMonthly = monthly
          }
        }
      })
    })

    if (minMonthly === Infinity) {
      return "12 aya varan taksit fırsatları"
    }

    return `Aylık ${minMonthly.toFixed(2)} TL'den başlayan ödeme fırsatları`
  }

  const selectedBankData = installmentList.find((b) => b.CODE === selectedBank)

  return (
    <div className="flex flex-col gap-y-4 my-2 select-none">
      {/* 1. Cargo Delivery Widget */}
      <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 flex flex-col gap-y-3 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-x-3 text-sm text-gray-700">
          <div className="bg-white p-1.5 rounded-lg border border-gray-200 shadow-xs">
            <Truck className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <span className="font-semibold text-gray-900 block">
              Tahmini Kargoya Teslim
            </span>
            <span className="text-gray-500 text-xs">4 gün içinde kargoda</span>
          </div>
        </div>

        <div className="border-t border-gray-200/60 my-1"></div>

        <div
          onClick={() => setIsLocationModalOpen(true)}
          className="flex items-center justify-between cursor-pointer hover:bg-gray-100/60 p-2 -mx-2 rounded-lg transition-colors duration-150"
        >
          <div className="flex items-center gap-x-3 text-sm">
            <div className="bg-white p-1 rounded-md border border-gray-150">
              <span className="text-xs font-bold text-brand-600 px-1">aras</span>
            </div>
            <div>
              <span className="text-gray-800 font-medium text-xs block">
                Tahmini Teslimat:
              </span>
              <span className="text-emerald-600 font-semibold text-sm">
                {getDeliveryDateString()} kapında!
              </span>
            </div>
          </div>
          <div className="flex items-center gap-x-1 text-xs text-brand-600 font-semibold bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100 hover:bg-brand-100">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {district}/{city}
            </span>
            <ChevronRight className="w-3 h-3 ml-0.5" />
          </div>
        </div>
      </div>

      {/* 2. Payment Options Widget */}
      <div className="flex flex-col gap-y-2.5">
        <span className="text-sm font-semibold text-gray-800">
          Ödeme Seçenekleri:
        </span>

        <div className="grid grid-cols-1 gap-y-3">
          {/* Card 2: Installments */}
          <div
            onClick={() => setIsInstallmentModalOpen(true)}
            className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center justify-between shadow-xs hover:border-orange-500 hover:shadow-sm cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center gap-x-3">
              <div className="bg-brand-50 p-2 rounded-lg border border-brand-100">
                <CreditCard className="w-5 h-5 text-brand-600" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-gray-900 text-sm block">
                  Taksit Seçenekleri
                </span>
                <span className="text-gray-500 text-xs font-medium block">
                  {getStartingInstallmentText()}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-orange-600 font-bold" />
          </div>
        </div>
      </div>

      {/* 3. Cargo Location Selector Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-150 flex items-center justify-between">
              <span className="font-bold text-gray-900 text-base">
                Teslimat Adresi Seçin
              </span>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-150 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-1.5 text-left">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  İl Seçin
                </label>
                <select
                  value={city}
                  onChange={handleCityChange}
                  className="w-full h-11 border border-gray-250 rounded-xl px-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-shadow bg-white"
                >
                  {Object.keys(TR_CITIES_DISTRICTS).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-y-1.5 text-left">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  İlçe Seçin
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-11 border border-gray-250 rounded-xl px-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-shadow bg-white"
                >
                  {(TR_CITIES_DISTRICTS[city] || []).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={saveLocation}
                className="w-full h-11 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-colors mt-2"
              >
                Konumu Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Installment Table Modal */}
      {isInstallmentModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-150 flex items-center justify-between shrink-0">
              <span className="font-bold text-gray-900 text-base flex items-center gap-x-2">
                <CreditCard className="w-5 h-5 text-brand-600" />
                Taksit Seçenekleri
              </span>
              <button
                onClick={() => setIsInstallmentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-150 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-1 overflow-hidden min-h-0">
              {/* Left Column: Bank Selection Tabs */}
              <div className="w-1/3 border-r border-gray-150 bg-gray-50 overflow-y-auto p-3 flex flex-col gap-y-1.5">
                {installmentList.map((bank) => {
                  const bMeta = BANK_NAMES[bank.CODE] || {
                    name: bank.CODE,
                    color: "text-gray-700",
                    bg: "bg-gray-100",
                  }
                  const isSelected = selectedBank === bank.CODE
                  return (
                    <button
                      key={bank.CODE}
                      onClick={() => setSelectedBank(bank.CODE)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all duration-150 ${
                        isSelected
                          ? `bg-white border-orange-500 shadow-xs text-orange-600`
                          : `bg-transparent border-transparent text-gray-600 hover:bg-gray-150`
                      }`}
                    >
                      {bMeta.name}
                    </button>
                  )
                })}
                {installmentList.length === 0 && (
                  <span className="text-gray-400 text-xs text-center py-6">
                    Yükleniyor...
                  </span>
                )}
              </div>

              {/* Right Column: Installment Table */}
              <div className="w-2/3 p-6 overflow-y-auto flex flex-col">
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4 text-xs text-orange-700 font-medium text-left">
                  Mevcut ürün fiyatı:{" "}
                  <span className="font-bold text-orange-950 text-sm">
                    ₺
                    {price.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs flex-1">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                        <th className="px-4 py-3 font-semibold">
                          Taksit Sayısı
                        </th>
                        <th className="px-4 py-3 font-semibold">Aylık Ödeme</th>
                        <th className="px-4 py-3 font-semibold text-right">
                          Toplam Fiyat
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {selectedBankData?.DATA.map((item, idx) => {
                        const comm = parseFloat(item.COMMISSION) || 0
                        const total = price * (1 + comm / 100)
                        const monthly = total / item.INSTALLMENT
                        return (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              {item.INSTALLMENT === 1 ? (
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                  Tek Çekim
                                </span>
                              ) : (
                                <span className="font-bold text-gray-900">
                                  {item.INSTALLMENT} Taksit
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-950 font-semibold">
                              ₺
                              {monthly.toLocaleString("tr-TR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-900 font-bold">
                              ₺
                              {total.toLocaleString("tr-TR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        )
                      })}
                      {(!selectedBankData ||
                        selectedBankData.DATA.length === 0) && (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-8 text-center text-gray-400"
                          >
                            Taksit seçeneği bulunmuyor.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 border-t border-gray-150 flex justify-end shrink-0">
              <button
                onClick={() => setIsInstallmentModalOpen(false)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-lg transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
