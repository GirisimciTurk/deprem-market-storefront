"use client"

import React, { useEffect, useState } from "react"
import {
  listProductQuestions,
  submitProductQuestion,
  StoreQuestion,
} from "@lib/data/product-questions"

type Props = {
  productHandle: string
  isLoggedIn: boolean
}

function formatDate(d?: string | null): string {
  if (!d) return ""
  try {
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
  } catch {
    return ""
  }
}

export default function ProductQuestions({ productHandle, isLoggedIn: _isLoggedIn }: Props) {
  const [questions, setQuestions] = useState<StoreQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [question, setQuestion] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    let active = true
    listProductQuestions(productHandle).then((qs) => {
      if (active) {
        setQuestions(qs)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [productHandle])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (question.trim().length < 5 || name.trim().length < 1) {
      setResult({ ok: false, msg: "Lütfen adınızı ve en az 5 karakterlik bir soru girin." })
      return
    }
    setSubmitting(true)
    setResult(null)
    const res = await submitProductQuestion({
      product_handle: productHandle,
      question: question.trim(),
      name: name.trim(),
    })
    setSubmitting(false)
    if (res.success) {
      setResult({
        ok: true,
        msg: "Sorunuz alındı! Satıcı yanıtladığında bu sayfada yayınlanacaktır.",
      })
      setQuestion("")
      setName("")
      setShowForm(false)
    } else {
      setResult({ ok: false, msg: "Soru gönderilemedi. Lütfen tekrar deneyin." })
    }
  }

  return (
    <div className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 mt-12 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-6 gap-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-x-2">
            <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
            </svg>
            Soru &amp; Cevap
          </h2>
          <p className="text-sm text-gray-500 mt-1">Bu ürün hakkında satıcıya soru sorun, yanıtlanan soruları inceleyin.</p>
        </div>
        <button
          onClick={() => {
            setShowForm((s) => !s)
            setResult(null)
          }}
          className="bg-brand-650 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-all duration-200 shadow-sm cursor-pointer hover:-translate-y-0.5"
        >
          {showForm ? "Vazgeç" : "Soru Sor"}
        </button>
      </div>

      {result && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-semibold ${
            result.ok
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-brand-50 border border-brand-200 text-brand-700"
          }`}
        >
          {result.msg}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
          <h3 className="font-bold text-gray-900 mb-4 text-base">Sorunuz</h3>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Adınız</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              placeholder="Adınız"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Sorunuz</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Ürün hakkında merak ettiğinizi yazın..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-650 hover:bg-brand-700 disabled:opacity-60 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-all cursor-pointer"
          >
            {submitting ? "Gönderiliyor..." : "Soruyu Gönder"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-400 py-6 text-center">Sorular yükleniyor...</p>
      ) : questions.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          Bu ürün için henüz yanıtlanmış soru yok. İlk soruyu siz sorun!
        </p>
      ) : (
        <ul className="space-y-5">
          {questions.map((q) => (
            <li key={q.id} className="border-b border-gray-100 last:border-0 pb-5 last:pb-0">
              <div className="flex items-start gap-x-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center mt-0.5">
                  S
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{q.question}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {q.customer_name} · {formatDate(q.created_at)}
                  </p>
                </div>
              </div>
              {q.answer && (
                <div className="flex items-start gap-x-3 mt-3 ml-3 pl-3 border-l-2 border-green-200">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center mt-0.5">
                    C
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{q.answer}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Satıcı yanıtı · {formatDate(q.answered_at)}
                    </p>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
