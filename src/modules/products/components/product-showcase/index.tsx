"use client"

import React, { useState } from "react"
import { Shield, Activity, CheckCircle, Video, Maximize2, Eye, X } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { getShowcaseContent, type ShowcaseContent } from "./showcase-content"

interface ShowcaseProps {
  product: HttpTypes.StoreProduct
  images?: HttpTypes.StoreProductImage[]
}

export default function ProductShowcase({ product, images }: ShowcaseProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null)

  if (!product) return null

  // Öne çıkan ürünlerin elle hazırlanmış tanıtım içeriği `showcase-content`
  // dosyasındadır; eşleşme yoksa ürün alanlarından dinamik fallback üretilir.
  const getProductData = (): ShowcaseContent => {
    const handle = product.handle || ""
    const matched = getShowcaseContent(handle)
    if (matched) return matched

    // --- Dynamic Fallback Generator ---
    const categoryNames = product.categories?.map((c: any) => c.name).join(", ") || "Deprem Hazırlığı"
    const parsedWeight = product.weight ? (product.weight >= 1000 ? (product.weight / 1000).toFixed(1) + " kg" : product.weight + " g") : ""
    const defaultSpecs = [
      { label: "Ürün Adı", value: product.title },
      ...(product.material ? [{ label: "Malzeme", value: product.material }] : []),
      ...(parsedWeight ? [{ label: "Ağırlık", value: parsedWeight }] : []),
      { label: "Kategori", value: categoryNames },
      { label: "Durum", value: "Stokta Var / Orijinal" }
    ]

    const fallbackFeatures = [
      {
        icon: <Shield className="w-8 h-8 text-brand-600" />,
        title: "Güvenilir Kalite",
        desc: "Afet ve acil durum koşulları göz önüne alınarak test edilmiş, dayanıklı malzemeden üretilmiştir."
      },
      {
        icon: <Activity className="w-8 h-8 text-emerald-600" />,
        title: "Afet Uyumlu Tasarım",
        desc: "Enkaz, deprem ve diğer acil durumlarda pratik, hızlı ve kolay kullanım sunacak şekilde tasarlanmıştır."
      },
      {
        icon: <CheckCircle className="w-8 h-8 text-amber-500" />,
        title: "Temel Yaşam Desteği",
        desc: "Afet sonrasındaki ilk kritik saatlerde güvenliğinizi ve hazırlığınızı artırmak için ideal bir yardımcıdır."
      }
    ]

    // Detaylı anlatım blokları (foto + yazı) — satıcının ürün formunda eklediği
    // metadata.content_blocks'tan gelir. Her blok bir foto + yazıdır. Blok yoksa
    // bu bölüm gizlenir (eski "Görsel 1/2/3 + tekrar eden açıklama" davranışı kaldırıldı).
    const blocks = ((product.metadata as any)?.content_blocks ?? []) as {
      image?: string | null
      text?: string | null
    }[]
    const contentHighlights = Array.isArray(blocks)
      ? blocks
          .filter((b) => (b?.text && b.text.trim()) || (b?.image && b.image.trim()))
          .map((b) => ({ title: "", desc: (b.text || "").trim(), image: (b.image || "").trim() }))
      : []

    return {
      tagline: "ACİL DURUM VE AFET HAZIRLIĞI",
      title: product.title,
      subtitle: product.subtitle || product.description || "Afet sonrasında güvenliğinizi ve hazırlığınızı en üst seviyeye çıkarmak için üretilmiştir.",
      videoUrl: (product.metadata as any)?.video_url || "",
      features: fallbackFeatures,
      specs: defaultSpecs,
      highlights: contentHighlights,
    }
  }

  const data = getProductData()
  if (!data) return null

  // Collect all images for the dynamic high-res gallery (product.images and images combined, filter duplicates)
  const allProductImages = [
    ...(product.thumbnail ? [{ url: product.thumbnail }] : []),
    ...(images || []),
    ...(product.images || [])
  ].reduce((acc: any[], current: any) => {
    const x = acc.find(item => item.url === current.url)
    if (!x && current.url) {
      return acc.concat([current])
    } else {
      return acc
    }
  }, [])

  return (
    <div className="bg-slate-50 border-t border-slate-200 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Banner Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-bold text-brand-600 tracking-widest uppercase block mb-3">
            {data.tagline}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-6 uppercase">
            {data.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {data.subtitle}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
          {data.features.map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200"
            >
              <div className="mb-5 inline-block bg-slate-50 p-3 rounded-xl">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Image / Text Highlights Section */}
        {data.highlights && data.highlights.length > 0 && (
          <div className="space-y-12 sm:space-y-16 mb-20">
            {data.highlights.map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                  idx % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {item.image && (
                  <div className="w-full lg:w-1/2">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm relative group">
                      <img
                        src={item.image}
                        alt={item.title || `İçerik görseli ${idx + 1}`}
                        className="w-full h-[300px] sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div
                        onClick={() => setActiveImage(item.image)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-300"
                      >
                        <button className="bg-white text-slate-900 px-4 py-2 rounded-full font-semibold flex items-center gap-x-2 text-sm shadow-lg">
                          <Maximize2 className="w-4 h-4" /> Büyük Resmi Gör
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className={`w-full ${item.image ? "lg:w-1/2" : ""} space-y-4 text-center lg:text-left`}>
                  {item.title && (
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase">
                      {item.title}
                    </h3>
                  )}
                  <p className="text-slate-600 leading-relaxed text-base sm:text-lg whitespace-pre-line">
                    {item.desc}
                  </p>
                  <div className="pt-2 flex justify-center lg:justify-start gap-x-2">
                    <div className="h-1 w-12 bg-brand-600 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Presentation Section */}
        {data.videoUrl && (
          <div className="mb-20 bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(244,63,94,0.08),transparent)] pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
              <div className="w-full lg:w-5/12 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-x-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 px-3 py-1 rounded-full text-xs font-semibold">
                  <Video className="w-3.5 h-3.5" /> GÖRSEL ANLATIM VE REHBER
                </div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  Nasıl Kullanılır ve Hazırlanır?
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Deprem ve afet çantasının doğru kullanımı, acil durumlarda saniyeler kazandırır. Uzmanlarımızın hazırladığı detaylı video rehberimizi izleyin.
                </p>
              </div>
              <div className="w-full lg:w-7/12">
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                  <iframe
                    className="w-full h-full"
                    src={data.videoUrl}
                    title="Ürün Kullanım Videosu"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Image Gallery Grid (farklı büyük resimlerini oluşturabilecek) */}
        {allProductImages.length > 0 && (
          <div className="mb-20">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-2">
                DETAYLI ÜRÜN GALERİSİ
              </h3>
              <p className="text-sm text-slate-500">
                Ekipman kalitesini, dikiş ve malzeme detaylarını yakından incelemek için resimlere tıklayarak büyütebilirsiniz.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {allProductImages.map((img: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(img.url)}
                  className="group relative cursor-pointer aspect-square bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
                >
                  <img
                    src={img.url}
                    alt={`${product.title} galeri görsel ${idx}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-slate-800 shadow">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Specs Table */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <h3 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight mb-6 pb-4 border-b border-slate-100">
            TEKNİK ÖZELLİKLER VE DETAYLAR
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {data.specs.map((spec, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-slate-100 text-sm sm:text-base"
              >
                <span className="font-semibold text-slate-500">{spec.label}</span>
                <span className="font-bold text-slate-900 text-right">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lightbox / Modal for Large Images */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300"
          onClick={() => setActiveImage(null)}
        >
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setActiveImage(null)}
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage}
              alt="Büyük ürün görseli"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-fade-in"
            />
          </div>
        </div>
      )}
    </div>
  )
}
