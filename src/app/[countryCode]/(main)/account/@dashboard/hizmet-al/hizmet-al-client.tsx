"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { ArrowLeft, HardHat, Wrench, ChevronRight, Search } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ServiceRequestButton from "@modules/products/components/product-actions/service-request-button"
import { toReachableImageUrl } from "@lib/util/image-url"

type Props = {
  products: HttpTypes.StoreProduct[]
  defaultName?: string
  defaultEmail?: string
  defaultPhone?: string
}

type Mode = "menu" | "uzman" | "bayi"

/**
 * Hesap panelindeki "Hizmet Al" akışı:
 *  - Uzman/Mühendislik → mevcut uzman & güçlendirme (keşifli) sayfalarına yönlendirir.
 *  - Bayi/Montaj → hizmete uygun (is_serviceable) ürünleri listeler; üründen talep açılır.
 */
export default function HizmetAlClient({
  products,
  defaultName,
  defaultEmail,
  defaultPhone,
}: Props) {
  const [mode, setMode] = useState<Mode>("menu")

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ui-fg-base">
          🛠️ Hizmet Al
        </h1>
        <p className="mt-1 text-xs text-ui-fg-muted">
          İhtiyacınıza göre uzman mühendislik hizmeti alın ya da bir ürün için bayi
          montaj/uygulama talebi başlatın.
        </p>
      </div>

      {/* ── Seçim ekranı ─────────────────────────────────────────────────── */}
      {mode === "menu" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("uzman")}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-ui-border-base bg-white p-5 text-left shadow-sm transition-all hover:border-brand-400 hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <HardHat className="h-6 w-6" />
            </span>
            <span className="text-base font-bold text-ui-fg-base">Uzman / Mühendislik</span>
            <span className="text-sm text-ui-fg-subtle">
              Bina risk tespiti, kolon güçlendirme ve keşif gerektiren işler için
              doğrulanmış inşaat mühendisleri.
            </span>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:gap-1.5">
              Devam et <ChevronRight className="h-4 w-4" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode("bayi")}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-ui-border-base bg-white p-5 text-left shadow-sm transition-all hover:border-brand-400 hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Wrench className="h-6 w-6" />
            </span>
            <span className="text-base font-bold text-ui-fg-base">Bayi / Montaj</span>
            <span className="text-sm text-ui-fg-subtle">
              Hizmete uygun bir ürün seçin; bayilerimiz yerinde montaj/uygulama için
              fiyat versin, en uygun teklifi size iletelim.
            </span>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:gap-1.5">
              Ürün seç <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      )}

      {/* ── Uzman: mevcut sayfalara yönlendirme ─────────────────────────── */}
      {mode === "uzman" && (
        <div className="space-y-4">
          <BackButton onClick={() => setMode("menu")} />
          <div className="rounded-2xl border border-ui-border-base bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-ui-fg-base">Uzman / Mühendislik Hizmetleri</h2>
            <p className="mt-1 text-sm text-ui-fg-subtle">
              Keşif gerektiren işler doğrulanmış mühendisler tarafından yürütülür. Aşağıdan
              ilerleyin.
            </p>
            <ul className="mt-4 flex flex-col divide-y divide-ui-border-base">
              <ServiceLink
                href="/uzmanlar"
                title="Uzman / Mühendis Bul"
                desc="Doğrulanmış inşaat mühendislerini inceleyin, iletişime geçin."
              />
              <ServiceLink
                href="/hizmetler/karbon-fiber"
                title="Karbon Fiber Kolon Güçlendirme"
                desc="Keşif talebi bırakın: keşif → teklif → onay → montaj akışı."
              />
              <ServiceLink
                href="/uzman-paketleri"
                title="Uzman Paketleri"
                desc="Hazır mühendislik hizmet paketlerini görüntüleyin."
              />
            </ul>
          </div>
        </div>
      )}

      {/* ── Bayi: hizmete uygun ürünler ──────────────────────────────────── */}
      {mode === "bayi" && (
        <div className="space-y-4">
          <BackButton onClick={() => setMode("menu")} />
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ui-border-base bg-ui-bg-subtle/40 p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-ui-fg-muted shadow-sm">
                <Search className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-ui-fg-base">
                Şu an hizmete uygun ürün bulunmuyor
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-ui-fg-muted">
                Montaj/uygulama hizmeti verilebilen ürünler eklendiğinde burada listelenecek.
                Dilerseniz mağazadan ürünlere göz atabilirsiniz.
              </p>
              <LocalizedClientLink
                href="/store"
                className="mt-4 inline-flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-700"
              >
                Mağazaya git
              </LocalizedClientLink>
            </div>
          ) : (
            <>
              <p className="text-sm text-ui-fg-subtle">
                Montaj/uygulama hizmeti almak istediğiniz ürünü seçip talep oluşturun.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {products.map((product) => {
                  const meta = (product.metadata ?? {}) as Record<string, unknown>
                  const desc =
                    typeof meta.service_description === "string" ? meta.service_description : ""
                  const thumb = product.thumbnail
                    ? toReachableImageUrl(product.thumbnail)
                    : null
                  return (
                    <div
                      key={product.id}
                      className="flex flex-col gap-3 rounded-2xl border border-ui-border-base bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ui-bg-subtle">
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt={product.title ?? ""}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-ui-fg-muted">
                              <Wrench className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <LocalizedClientLink
                            href={`/products/${product.handle}`}
                            className="line-clamp-2 text-sm font-bold text-ui-fg-base hover:text-brand-700"
                          >
                            {product.title}
                          </LocalizedClientLink>
                          {desc && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-ui-fg-muted">{desc}</p>
                          )}
                        </div>
                      </div>
                      <ServiceRequestButton
                        product={product}
                        defaultName={defaultName}
                        defaultEmail={defaultEmail}
                        defaultPhone={defaultPhone}
                      />
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-ui-fg-subtle transition-colors hover:text-ui-fg-base"
    >
      <ArrowLeft className="h-4 w-4" /> Geri
    </button>
  )
}

function ServiceLink({
  href,
  title,
  desc,
}: {
  href: string
  title: string
  desc: string
}) {
  return (
    <li>
      <LocalizedClientLink
        href={href}
        className="group flex items-center justify-between gap-3 py-3 transition-colors"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ui-fg-base group-hover:text-brand-700">
            {title}
          </span>
          <span className="block text-xs text-ui-fg-muted">{desc}</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-ui-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
      </LocalizedClientLink>
    </li>
  )
}
