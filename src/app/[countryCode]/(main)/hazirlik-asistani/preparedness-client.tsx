"use client"

import { useState } from "react"
import { Sparkles, ShoppingCart, Check, Lightbulb, ShieldAlert, MessageSquare } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getPreparednessKit, type KitItem } from "@lib/data/preparedness-kit"
import { addMultipleToCart } from "@lib/data/cart"

export default function PreparednessClient({
  region,
  countryCode,
}: {
  region: HttpTypes.StoreRegion | null
  countryCode: string
}) {
  const t = useTranslations("preparedness")
  const [need, setNeed] = useState("")
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState("")
  const [items, setItems] = useState<KitItem[]>([])
  const [recommendSurvey, setRecommendSurvey] = useState(false)
  const [surveyReason, setSurveyReason] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addedAll, setAddedAll] = useState(false)

  const presets = [
    t("presets.home2"),
    t("presets.family4"),
    t("presets.baby"),
    t("presets.elderly"),
    t("presets.pet"),
    t("presets.car"),
    t("presets.office"),
  ]

  const addPreset = (p: string) => {
    setNeed((prev) => {
      const cur = prev.trim()
      if (!cur) return p
      if (cur.toLocaleLowerCase("tr").includes(p.toLocaleLowerCase("tr"))) return cur
      return `${cur}, ${p}`
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (need.trim().length < 3) return
    setLoading(true)
    setMessage(null)
    setAddedAll(false)
    try {
      const res = await getPreparednessKit(need.trim(), countryCode)
      setAnswer(res.answer)
      setItems(res.items)
      setRecommendSurvey(res.recommendSurvey)
      setSurveyReason(res.surveyReason)
      setSearched(true)
      if (!res.answer && res.items.length === 0) {
        setMessage(res.disabled ? t("disabled") : res.error ? res.error : t("noResults"))
      }
    } catch {
      setAnswer("")
      setItems([])
      setSearched(true)
      setMessage(t("error"))
    } finally {
      setLoading(false)
    }
  }

  const addAll = async () => {
    const lineItems = items
      .filter((i) => i.product.variants?.[0]?.id)
      .map((i) => ({ variantId: i.product.variants![0].id!, quantity: i.quantity }))
    if (lineItems.length === 0) return
    setAdding(true)
    try {
      await addMultipleToCart({ items: lineItems, countryCode })
      setAddedAll(true)
      setTimeout(() => setAddedAll(false), 2500)
    } catch {
      setMessage(t("addError"))
    } finally {
      setAdding(false)
    }
  }

  const hasResult = answer || items.length > 0 || recommendSurvey

  return (
    <div className="content-container py-10">
      {/* Başlık */}
      <div className="flex items-start gap-3 mb-6">
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-brand-600">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl small:text-3xl font-bold text-slate-900">{t("title")}</h1>
          <p className="mt-1 text-ui-fg-subtle max-w-2xl">{t("subtitle")}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-ui-border-base p-5 bg-white">
        <label className="block text-sm font-semibold text-slate-700 mb-2">{t("label")}</label>
        <textarea
          value={need}
          onChange={(e) => setNeed(e.target.value)}
          rows={3}
          placeholder={t("placeholder")}
          className="w-full rounded-lg border border-ui-border-base p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => addPreset(p)}
              className="rounded-full border border-ui-border-base px-3 py-1 text-xs text-slate-600 hover:border-brand-600 hover:text-brand-600 transition-colors"
            >
              + {p}
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading || need.trim().length < 3}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? t("searching") : t("submit")}
          </button>
        </div>
      </form>

      {/* Sonuç */}
      {searched && hasResult && (
        <div className="mt-8 space-y-6">
          {/* Asistan yanıtı */}
          {answer && (
            <div className="flex items-start gap-3 rounded-lg bg-slate-50 border border-ui-border-base p-4">
              <MessageSquare className="h-5 w-5 shrink-0 mt-0.5 text-brand-600" />
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">{answer}</p>
            </div>
          )}

          {/* Yapısal endişe → keşif/güçlendirme hizmetine yönlendir */}
          {recommendSurvey && (
            <LocalizedClientLink
              href="/hizmetler/karbon-fiber"
              className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 hover:bg-amber-100 transition-colors"
            >
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <div className="font-semibold text-amber-900">{t("surveyTitle")}</div>
                {surveyReason && <p className="mt-0.5 text-sm text-amber-800">{surveyReason}</p>}
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-amber-700">
                  {t("surveyCta")} →
                </span>
              </div>
            </LocalizedClientLink>
          )}

          {/* Önerilen ürünler */}
          {items.length > 0 && region && (
            <div>
              <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">{t("resultsTitle", { count: items.length })}</h2>
                <button
                  onClick={addAll}
                  disabled={adding}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white transition-colors ${
                    addedAll ? "bg-emerald-600" : "bg-brand-600 hover:bg-brand-700"
                  } disabled:opacity-50`}
                >
                  {addedAll ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                  {addedAll ? t("addedAll") : adding ? t("adding") : t("addAll")}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                {items.map((item) => (
                  <div key={item.product.id} className="flex flex-col">
                    <div className="mb-2 flex items-start gap-2 text-xs text-slate-500">
                      <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-brand-600" />
                      <span>
                        {item.reason}
                        {item.quantity > 1 && (
                          <span className="ml-1 font-semibold text-slate-700">· {t("suggestedQty", { qty: item.quantity })}</span>
                        )}
                      </span>
                    </div>
                    <ProductPreview product={item.product} region={region} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sorumluluk reddi */}
          <p className="text-xs text-ui-fg-muted border-t border-ui-border-base pt-3">{t("disclaimer")}</p>

          {message && <p className="text-sm text-rose-600">{message}</p>}
        </div>
      )}

      {/* Boş / hata */}
      {searched && !hasResult && (
        <div className="mt-8 rounded-lg border border-ui-border-base p-8 text-center text-ui-fg-subtle">
          {message || t("noResults")}
        </div>
      )}
    </div>
  )
}
