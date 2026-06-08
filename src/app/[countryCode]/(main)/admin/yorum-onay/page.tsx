"use client"

import React, { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ReviewItem = {
  productHandle: string
  id: string
  name: string
  rating: number
  comment: string
  date: string
  verified: boolean
  approved: boolean
}

interface RawReview {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  verified: boolean
  approved: boolean
}

const productNameMap: Record<string, string> = {
  "profesyonel-deprem-cantasi": "Profesyonel Deprem Çantası (4 Kişilik)",
  "mini-deprem-cantasi": "Bireysel Mini Deprem Çantası",
  "sarj-edilebilir-fener": "Güneş Enerjili Deprem Feneri & Güç Kaynağı",
  "ilk-yardim-kiti": "Kapsamlı Acil İlk Yardım Kiti",
}

export default function YorumOnayPage() {
  const [allReviews, setAllReviews] = useState<ReviewItem[]>([])
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending")
  const [notif, setNotif] = useState<string | null>(null)

  // Load reviews from localStorage
  const loadReviews = () => {
    try {
      const items: ReviewItem[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("product-reviews-")) {
          const productHandle = key.replace("product-reviews-", "")
          const reviewsData = JSON.parse(localStorage.getItem(key) || "[]") as RawReview[]
          reviewsData.forEach((r) => {
            items.push({
              productHandle,
              ...r,
            })
          })
        }
      }
      // Sort: newest first
      items.sort((a, b) => b.id.localeCompare(a.id))
      setAllReviews(items)
    } catch (e) {
      console.error("Failed to load reviews in admin", e)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  // Show a small notification toast
  const triggerNotif = (msg: string) => {
    setNotif(msg)
    setTimeout(() => setNotif(null), 3000)
  }

  // Approve a review
  const handleApprove = (productHandle: string, reviewId: string) => {
    try {
      const key = `product-reviews-${productHandle}`
      const reviewsData = JSON.parse(localStorage.getItem(key) || "[]") as RawReview[]
      const updated = reviewsData.map((r) => {
        if (r.id === reviewId) {
          return { ...r, approved: true }
        }
        return r
      })
      localStorage.setItem(key, JSON.stringify(updated))
      loadReviews()
      triggerNotif("Yorum onaylandı ve yayına alındı!")
    } catch (e) {
      console.error(e)
    }
  }

  // Reject / Delete a review
  const handleDelete = (productHandle: string, reviewId: string) => {
    if (!confirm("Bu yorumu tamamen silmek istediğinizden emin misiniz?")) return
    try {
      const key = `product-reviews-${productHandle}`
      const reviewsData = JSON.parse(localStorage.getItem(key) || "[]") as RawReview[]
      const updated = reviewsData.filter((r) => r.id !== reviewId)
      localStorage.setItem(key, JSON.stringify(updated))
      loadReviews()
      triggerNotif("Yorum sistemden silindi.")
    } catch (e) {
      console.error(e)
    }
  }

  // Unapprove / Unpublish a review
  const handleUnpublish = (productHandle: string, reviewId: string) => {
    try {
      const key = `product-reviews-${productHandle}`
      const reviewsData = JSON.parse(localStorage.getItem(key) || "[]") as RawReview[]
      const updated = reviewsData.map((r) => {
        if (r.id === reviewId) {
          return { ...r, approved: false }
        }
        return r
      })
      localStorage.setItem(key, JSON.stringify(updated))
      loadReviews()
      triggerNotif("Yorum yayından kaldırıldı ve onay bekleyenlere taşındı.")
    } catch (e) {
      console.error(e)
    }
  }

  // Filter lists based on active tab
  const pendingList = allReviews.filter((r) => !r.approved)
  const approvedList = allReviews.filter((r) => r.approved)
  const activeList = activeTab === "pending" ? pendingList : approvedList

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
          <span className="text-orange-655 text-xs font-bold tracking-wider uppercase bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            Yönetim Paneli
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-3">
            Yorum Onay & Denetleme Paneli
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Müşterilerinizin yazdığı yorumları onaylayabilir, reddedebilir veya yayından kaldırabilirsiniz.
          </p>
        </div>
        <LocalizedClientLink
          href="/"
          className="text-sm text-gray-500 hover:text-orange-600 font-bold border border-gray-250 py-2 px-4 rounded-lg transition-colors bg-white hover:bg-gray-50 shadow-sm"
        >
          &larr; Mağazaya Dön
        </LocalizedClientLink>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 mb-6 gap-x-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-4 text-sm font-bold border-b-2 transition-all relative ${
            activeTab === "pending"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Onay Bekleyenler
          {pendingList.length > 0 && (
            <span className="ml-2 bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingList.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`pb-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === "approved"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Yayındakiler ({approvedList.length})
        </button>
      </div>

      {/* Content Table / List */}
      {activeList.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 border border-gray-150 rounded-2xl text-gray-550 font-bold text-sm">
          {activeTab === "pending"
            ? "Onay bekleyen herhangi bir yorum bulunmamaktadır."
            : "Yayında onaylanmış herhangi bir yorum bulunmamaktadır."}
        </div>
      ) : (
        <div className="space-y-4">
          {activeList.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-6"
            >
              <div className="flex-1 space-y-3">
                {/* Product Reference */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {productNameMap[item.productHandle] || item.productHandle}
                  </span>
                  {item.verified && (
                    <span className="bg-green-50 border border-green-150 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      Satın Almış Müşteri
                    </span>
                  )}
                  {!item.verified && (
                    <span className="bg-gray-50 border border-gray-200 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      Ziyaretçi (Giriş Yapılmamış)
                    </span>
                  )}
                </div>

                {/* Review Title & Stars */}
                <div className="flex items-center gap-x-2">
                  <span className="font-extrabold text-gray-900 text-base">{item.name}</span>
                  <div className="flex text-yellow-400 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < item.rating ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 font-semibold">{item.date}</span>
                </div>

                {/* Comment Content */}
                <p className="text-sm text-gray-650 leading-relaxed font-medium">
                  {item.comment}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col justify-end items-end gap-2 shrink-0 self-center">
                {activeTab === "pending" ? (
                  <>
                    <button
                      onClick={() => handleApprove(item.productHandle, item.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg text-xs transition-colors shadow-sm"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => handleDelete(item.productHandle, item.id)}
                      className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-2 px-5 rounded-lg text-xs transition-colors"
                    >
                      Reddet & Sil
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleUnpublish(item.productHandle, item.id)}
                      className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold py-2 px-5 rounded-lg text-xs transition-colors"
                    >
                      Yayından Kaldır
                    </button>
                    <button
                      onClick={() => handleDelete(item.productHandle, item.id)}
                      className="w-full bg-white hover:bg-red-50 text-red-650 border border-red-200 font-bold py-2 px-5 rounded-lg text-xs transition-colors"
                    >
                      Sil
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
