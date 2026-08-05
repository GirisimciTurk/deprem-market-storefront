"use client"

import React, { useState } from "react"
import { Video, Maximize2, Eye, X } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { toReachableImageUrl } from "@lib/util/image-url"

interface ShowcaseProps {
  product: HttpTypes.StoreProduct
  images?: HttpTypes.StoreProductImage[]
}

type Spec = { label: string; value: string }
type Highlight = { desc: string; image: string }
/** Satıcının ürün formunda eklediği ham blok (metadata serbest biçimlidir). */
type RawContentBlock = { image?: unknown; text?: unknown }
type GalleryImage = { url: string }

/** Metadata'dan gelen değerleri güvenle metne çevirir (sayı/null/eksik olabilir). */
const asTrimmedString = (v: unknown): string =>
  typeof v === "string" ? v.trim() : ""

/**
 * Ürün detay sayfasının geniş tanıtım bölümü.
 *
 * KURAL: Burada YALNIZCA satıcının panelde girdiği veriler gösterilir. Sayfada
 * satıcının yazmadığı hiçbir metin, özellik ya da görsel olmamalı.
 *
 * Öncesinde bu bileşen `showcase-content.tsx` adlı elle yazılmış bir listeye
 * bakıyordu: ürün handle'ında bir alt dize geçiyorsa (ör. "battaniyesi") o ürüne
 * hazır bir tanıtım metni, teknik özellik tablosu, stok fotoğrafı ve video
 * basılıyordu. Bu, "yangın battaniyesi"ne hipotermi için üretilen termal
 * battaniyenin içeriğini (NASA/Mylar, 210x160 cm, 5'li paket) giydirdi — üstelik
 * eşleşme olduğunda satıcının kendi `content_blocks` içeriği hiç okunmuyordu.
 * Ayrıca eşleşme olmayan ürünlere de uydurma tanıtım blokları ("Güvenilir
 * Kalite", "Durum: Stokta Var / Orijinal" vb.) basılıyordu. Liste tamamen
 * kaldırıldı; kaldırıldığı sırada 10 kaydın 9'u zaten hiçbir ürüne uymuyordu ve
 * tek aktif eşleşme yanlıştı.
 *
 * Gösterilecek gerçek veri yoksa bölüm hiç render edilmez.
 */
export default function ProductShowcase({ product, images }: ShowcaseProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null)

  if (!product) return null

  const meta = (product.metadata ?? {}) as Record<string, unknown>

  // 1) Satıcının detaylı anlatım blokları: her biri bir foto + yazı.
  const rawBlocks: RawContentBlock[] = Array.isArray(meta.content_blocks)
    ? (meta.content_blocks as RawContentBlock[])
    : []
  const highlights: Highlight[] = rawBlocks
    .map((b) => {
      const image = asTrimmedString(b?.image)
      return {
        desc: asTrimmedString(b?.text),
        image: image ? toReachableImageUrl(image) ?? "" : "",
      }
    })
    .filter((b) => b.desc || b.image)

  // 2) Satıcının yüklediği tanıtım videosu.
  const rawVideo = asTrimmedString(meta.video_url)
  const videoUrl = rawVideo ? toReachableImageUrl(rawVideo) ?? "" : ""

  // 3) Teknik özellikler — SADECE ürün üzerinde gerçekten dolu olan alanlar.
  //    Boş alan "-" ile doldurulmaz, satır hiç basılmaz; uydurma değer yok.
  const weightLabel = product.weight
    ? product.weight >= 1000
      ? `${(product.weight / 1000).toFixed(1)} kg`
      : `${product.weight} g`
    : ""
  const dimensions =
    product.length && product.width && product.height
      ? `${product.length} x ${product.width} x ${product.height} cm`
      : ""

  const specs: Spec[] = [
    { label: "Malzeme", value: product.material ?? "" },
    { label: "Ağırlık", value: weightLabel },
    { label: "Boyutlar", value: dimensions },
    { label: "Üretim Ülkesi", value: product.origin_country ?? "" },
    { label: "Tür", value: product.type?.value ?? "" },
  ].filter((s): s is Spec => Boolean(s.value && String(s.value).trim()))

  // 4) Galeri — ürünün gerçek görselleri (thumbnail + varyant/ürün görselleri).
  const gallery: GalleryImage[] = [
    ...(product.thumbnail ? [{ url: product.thumbnail }] : []),
    ...(images ?? []),
    ...(product.images ?? []),
  ]
    .reduce((acc: GalleryImage[], current) => {
      const url = current?.url
      if (url && !acc.some((i) => i.url === url)) {
        acc.push({ url })
      }
      return acc
    }, [])
    .map((im) => ({ url: toReachableImageUrl(im.url) ?? im.url }))

  // Gösterilecek gerçek bir şey yoksa bölümü hiç açma.
  const hasContent =
    highlights.length > 0 || Boolean(videoUrl) || specs.length > 0 || gallery.length > 0
  if (!hasContent) return null

  return (
    <div className="bg-slate-50 border-t border-slate-200 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Satıcının detaylı anlatımı (foto + yazı blokları) */}
        {highlights.length > 0 && (
          <div className="space-y-12 sm:space-y-16 mb-20">
            {highlights.map((item, idx) => (
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
                        alt={`${product.title} içerik görseli ${idx + 1}`}
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
                {item.desc && (
                  <div
                    className={`w-full ${
                      item.image ? "lg:w-1/2" : ""
                    } space-y-4 text-center lg:text-left`}
                  >
                    <p className="text-slate-600 leading-relaxed text-base sm:text-lg whitespace-pre-line">
                      {item.desc}
                    </p>
                    <div className="pt-2 flex justify-center lg:justify-start gap-x-2">
                      <div className="h-1 w-12 bg-brand-600 rounded-full" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Satıcının yüklediği tanıtım videosu. Başlık ÜRÜNE göre kuruluyor;
            eskiden buradaki metin her üründe "deprem çantasının kullanımı"ndan
            bahsediyordu (kask, yangın söndürücü fark etmeksizin). */}
        {videoUrl && (
          <div className="mb-20 bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(244,63,94,0.08),transparent)] pointer-events-none" />
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
              <div className="w-full lg:w-5/12 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-x-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 px-3 py-1 rounded-full text-xs font-semibold">
                  <Video className="w-3.5 h-3.5" /> ÜRÜN VİDEOSU
                </div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  {product.title}
                </h3>
              </div>
              <div className="w-full lg:w-7/12">
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                  <iframe
                    className="w-full h-full"
                    src={videoUrl}
                    title={`${product.title} ürün videosu`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ürünün gerçek görselleri */}
        {gallery.length > 0 && (
          <div className="mb-20">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-2">
                DETAYLI ÜRÜN GALERİSİ
              </h3>
              <p className="text-sm text-slate-500">
                Görselleri büyütmek için üzerlerine tıklayabilirsiniz.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(img.url)}
                  className="group relative cursor-pointer aspect-square bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
                >
                  <img
                    src={img.url}
                    alt={`${product.title} galeri görseli ${idx + 1}`}
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

        {/* Teknik özellikler — yalnız dolu alanlar */}
        {specs.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight mb-6 pb-4 border-b border-slate-100">
              TEKNİK ÖZELLİKLER VE DETAYLAR
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {specs.map((spec, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-slate-100 text-sm sm:text-base"
                >
                  <span className="font-semibold text-slate-500">{spec.label}</span>
                  <span className="font-bold text-slate-900 text-right">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Büyük görsel için lightbox */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300"
          onClick={() => setActiveImage(null)}
        >
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setActiveImage(null)}
              aria-label="Kapat"
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
              alt={`${product.title} büyük görsel`}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-fade-in"
            />
          </div>
        </div>
      )}
    </div>
  )
}
