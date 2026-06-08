"use client"

import React, { useState, useEffect, useMemo } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ResellerApplication = {
  id: string
  companyName: string
  taxOfficeNumber?: string
  contactName: string
  email: string
  phone: string
  city: string
  message?: string
  date: string
  status: "pending" | "approved" | "rejected"
}

export default function BayilikOnayClient() {
  const [applications, setApplications] = useState<ResellerApplication[]>([])
  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "rejected"
  >("pending")
  const [searchTerm, setSearchTerm] = useState("")
  const [notif, setNotif] = useState<string | null>(null)

  // Load applications from localStorage
  const loadApplications = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("reseller-applications") || "[]"
      )
      setApplications(saved)
    } catch (e) {
      console.error("Failed to load reseller applications in admin", e)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  // Show a small notification toast
  const triggerNotif = (msg: string) => {
    setNotif(msg)
    setTimeout(() => setNotif(null), 3000)
  }

  // Update status of an application
  const updateStatus = (id: string, newStatus: "approved" | "rejected") => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("reseller-applications") || "[]"
      )
      const updated = saved.map((app: any) => {
        if (app.id === id) {
          return { ...app, status: newStatus }
        }
        return app
      })
      localStorage.setItem("reseller-applications", JSON.stringify(updated))
      loadApplications()
      triggerNotif(
        newStatus === "approved"
          ? "Bayilik başvurusu onaylandı!"
          : "Bayilik başvurusu reddedildi."
      )
    } catch (e) {
      console.error(e)
    }
  }

  // Delete an application completely
  const handleDelete = (id: string) => {
    if (!confirm("Bu başvuruyu tamamen silmek istediğinizden emin misiniz?"))
      return
    try {
      const saved = JSON.parse(
        localStorage.getItem("reseller-applications") || "[]"
      )
      const updated = saved.filter((app: any) => app.id !== id)
      localStorage.setItem("reseller-applications", JSON.stringify(updated))
      loadApplications()
      triggerNotif("Başvuru sistemden silindi.")
    } catch (e) {
      console.error(e)
    }
  }

  // Pre-calculate and memoize counts to avoid repeating array filters during rendering
  const counts = useMemo(() => {
    return {
      pending: applications.filter((app) => app.status === "pending").length,
      approved: applications.filter((app) => app.status === "approved").length,
      rejected: applications.filter((app) => app.status === "rejected").length,
    }
  }, [applications])

  // Filter list based on active tab and search term
  const filteredList = useMemo(() => {
    const s = searchTerm.toLowerCase().trim()
    return applications.filter((app) => {
      const matchesTab = app.status === activeTab
      if (!s) return matchesTab

      return (
        matchesTab &&
        (app.companyName.toLowerCase().includes(s) ||
          app.contactName.toLowerCase().includes(s) ||
          app.email.toLowerCase().includes(s) ||
          app.city.toLowerCase().includes(s))
      )
    })
  }, [applications, activeTab, searchTerm])

  return (
    <div className="content-container max-w-6xl py-12 px-4">
      {/* Toast Notification */}
      {notif && (
        <div className="fixed top-6 right-6 bg-gray-900 text-white text-sm font-semibold py-3 px-5 rounded-lg shadow-xl z-50 animate-bounce border border-gray-800">
          {notif}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-6 mb-8 gap-y-4">
        <div>
          <span className="text-red-600 text-xs font-bold tracking-wider uppercase bg-red-50 px-3 py-1 rounded-full border border-red-100">
            Yönetim Paneli
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-3">
            Bayilik Başvuruları Yönetim Paneli
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Deprem malzemeleri tedarik ortaklığı ve kurumsal bayilik ön
            başvurularını denetleyin.
          </p>
        </div>
        <div className="flex gap-2">
          <LocalizedClientLink
            href="/admin"
            className="text-sm text-gray-700 hover:text-red-600 font-bold border border-gray-250 py-2 px-4 rounded-lg transition-colors bg-white hover:bg-gray-50 shadow-sm"
          >
            &larr; Yönetim Paneline Dön
          </LocalizedClientLink>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold block">
              Bekleyen Başvurular
            </span>
            <span className="text-xl font-extrabold text-gray-900 mt-1">
              {counts.pending}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-50 text-green-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold block">
              Onaylanan Bayiler
            </span>
            <span className="text-xl font-extrabold text-gray-900 mt-1">
              {counts.approved}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-red-50 text-red-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold block">
              Reddedilen Başvurular
            </span>
            <span className="text-xl font-extrabold text-gray-900 mt-1">
              {counts.rejected}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Firma adı, yetkili, şehir veya e-posta ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 mb-6 gap-x-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-4 text-sm font-bold border-b-2 transition-all relative ${
            activeTab === "pending"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Bekleyenler
          {counts.pending > 0 && (
            <span className="ml-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {counts.pending}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`pb-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === "approved"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Onaylananlar ({counts.approved})
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`pb-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === "rejected"
              ? "border-red-550 text-red-550"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Reddedilenler ({counts.rejected})
        </button>
      </div>

      {/* List */}
      {filteredList.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 border border-gray-150 rounded-2xl text-gray-500 font-bold text-sm">
          Bu grupta aranan kriterlere uygun bayilik başvurusu bulunmamaktadır.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-6"
            >
              <div className="flex-1 space-y-3">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded">
                    {app.city}
                  </span>
                  {app.taxOfficeNumber && (
                    <span className="text-xs font-semibold bg-gray-100 text-gray-655 px-2 py-0.5 rounded">
                      VD/No: {app.taxOfficeNumber}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 font-semibold ml-auto">
                    {app.date}
                  </span>
                </div>

                {/* Company & Contact Names */}
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">
                    {app.companyName}
                  </h3>
                  <p className="text-sm font-bold text-gray-655 mt-0.5">
                    Yetkili: {app.contactName}
                  </p>
                </div>

                {/* Contact Coordinates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50/50 p-2.5 rounded-lg">
                  <div>
                    <span className="font-bold text-gray-400 uppercase tracking-wider block text-[9px] mb-0.5">
                      E-Posta
                    </span>
                    <a
                      href={`mailto:${app.email}`}
                      className="text-red-650 hover:underline"
                    >
                      {app.email}
                    </a>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400 uppercase tracking-wider block text-[9px] mb-0.5">
                      Telefon
                    </span>
                    <a
                      href={`tel:${app.phone}`}
                      className="text-red-650 hover:underline"
                    >
                      {app.phone}
                    </a>
                  </div>
                </div>

                {/* Message */}
                {app.message && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Başvuru Mesajı
                    </span>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed bg-gray-50/20 p-2 border border-gray-100 rounded-lg italic">
                      "{app.message}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col justify-end items-stretch gap-2 shrink-0 w-full md:w-36 self-center">
                {app.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(app.id, "approved")}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors shadow-sm text-center"
                    >
                      Başvuruyu Onayla
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, "rejected")}
                      className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-2 px-4 rounded-lg text-xs transition-colors text-center"
                    >
                      Başvuruyu Reddet
                    </button>
                  </>
                )}

                {app.status === "approved" && (
                  <button
                    onClick={() => updateStatus(app.id, "rejected")}
                    className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-2 px-4 rounded-lg text-xs transition-colors text-center"
                  >
                    Redde Taşı
                  </button>
                )}

                {app.status === "rejected" && (
                  <button
                    onClick={() => updateStatus(app.id, "approved")}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors shadow-sm text-center"
                  >
                    Onayla
                  </button>
                )}

                <button
                  onClick={() => handleDelete(app.id)}
                  className="bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 font-bold py-2 px-4 rounded-lg text-xs transition-colors text-center"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
