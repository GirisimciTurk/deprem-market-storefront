"use client"

import React, { useState } from "react"
import { startConversation } from "@lib/data/messages"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type SellerContactProps = {
  sellerHandle: string
}

export default function SellerContact({ sellerHandle }: SellerContactProps) {
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || submitting) return

    setSubmitting(true)
    setError(null)
    setNeedsLogin(false)

    const res = await startConversation({
      seller_handle: sellerHandle,
      subject: subject.trim() || undefined,
      message: message.trim(),
    })
    setSubmitting(false)

    if (!res.success) {
      // 401 → giriş yapılmamış
      if (res.error && /401|Unauthorized|yetki|oturum/i.test(res.error)) {
        setNeedsLogin(true)
        return
      }
      setError("Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin.")
      return
    }

    setSubject("")
    setMessage("")
    setSuccess(true)
  }

  return (
    <div className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 mt-12 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-6 gap-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-x-2">
            <span>✉️</span> Satıcıya Sor
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ürünler veya siparişiniz hakkında satıcıya doğrudan soru sorun.
          </p>
        </div>
        {!showForm && !success && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-650 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-all duration-200 shadow-sm cursor-pointer hover:-translate-y-0.5"
          >
            Satıcıya Soru Sor
          </button>
        )}
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-xl text-sm font-semibold flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2 text-base text-green-700">
            <svg className="w-6 h-6 text-green-600 fill-current" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Mesajınız iletildi
          </div>
          <p className="text-xs text-green-600 font-medium ml-8">
            <LocalizedClientLink
              href="/account/mesajlarim"
              className="underline font-bold hover:text-green-800"
            >
              Mesajlarım
            </LocalizedClientLink>{" "}
            sayfasından takip edebilirsiniz.
          </p>
        </div>
      ) : needsLogin ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-xl text-sm font-semibold">
          Mesaj göndermek için{" "}
          <LocalizedClientLink
            href="/account"
            className="underline font-bold hover:text-amber-900"
          >
            giriş yapın
          </LocalizedClientLink>
          .
        </div>
      ) : showForm ? (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Konu (opsiyonel)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Örn: Kargo süresi hakkında"
              className="w-full bg-white border border-gray-250 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Mesajınız
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Satıcıya sormak istediğinizi yazın..."
              className="w-full bg-white border border-gray-250 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none font-medium text-slate-850"
            />
          </div>

          {error && (
            <p className="text-sm font-semibold text-brand-600">{error}</p>
          )}

          <div className="flex justify-end gap-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-white border border-gray-250 text-gray-700 hover:bg-gray-50 font-bold py-2 px-4 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-650 hover:bg-orange-700 text-white font-extrabold py-2 px-6 rounded-lg text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Gönderiliyor..." : "Gönder"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
