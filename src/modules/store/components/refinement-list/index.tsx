"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useTransition,
  Fragment,
} from "react"
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react"
import { ChevronDown, Loader2, SlidersHorizontal, X } from "lucide-react"
import SortProducts, { SortOptions } from "./sort-products"
import { SHOWCASE_CATEGORIES, isShowcaseKey } from "@lib/showcase"
import { clx } from "@modules/common/components/ui"

type RefinementListProps = {
  sortBy: SortOptions
  categoryId?: string
  minPrice?: string
  maxPrice?: string
  inStock?: string
  showcase?: string
  categories?: any[]
  'data-testid'?: string
}

const RefinementList = ({
  sortBy,
  categoryId,
  minPrice,
  maxPrice,
  inStock,
  showcase,
  categories = [],
  'data-testid': dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Panelin görsel durumu SUNUCU prop'undan geliyordu; sunucu turu bitene kadar
  // tıklamanın hiçbir izi görünmüyor, "sayfa cevap vermiyor" hissi doğuyordu.
  // Çözüm: gezinme uçuştayken URL'in İYİMSER (optimistic) hâlini göster.
  //  - pendingQuery: router.push'a verilen son query string (commit'te bırakılır)
  //  - isPending: gezinme sürüyor mu (bekleme göstergeleri için)
  const [isPending, startTransition] = useTransition()
  const [pendingQuery, setPendingQuery] = useState<string | null>(null)
  const urlQuery = searchParams.toString()

  useEffect(() => {
    if (pendingQuery === null) return
    // Gezinme commit oldu (URL yetişti) ya da transition bitti → iyimser durumu bırak.
    if (!isPending || urlQuery === pendingQuery) setPendingQuery(null)
  }, [isPending, urlQuery, pendingQuery])

  // Ekranda gösterilecek filtre durumu: bekleyen gezinme varsa onun query'si,
  // yoksa sunucudan gelen (commit edilmiş) prop'lar.
  const view = useMemo(() => {
    if (pendingQuery === null) {
      return {
        categoryIds: categoryId ? categoryId.split(",").filter(Boolean) : [],
        showcase: showcase,
        inStock: inStock,
        minPrice: minPrice,
        maxPrice: maxPrice,
        sortBy: sortBy,
      }
    }
    const p = new URLSearchParams(pendingQuery)
    const nextShowcase = p.get("showcase") ?? undefined
    return {
      categoryIds: (p.get("categoryId") ?? "").split(",").filter(Boolean),
      showcase: isShowcaseKey(nextShowcase) ? nextShowcase : undefined,
      inStock: p.get("inStock") ?? undefined,
      minPrice: p.get("minPrice") ?? undefined,
      maxPrice: p.get("maxPrice") ?? undefined,
      sortBy: (p.get("sortBy") as SortOptions) || sortBy,
    }
  }, [pendingQuery, categoryId, showcase, inStock, minPrice, maxPrice, sortBy])

  const [minInput, setMinInput] = useState(minPrice || "")
  const [maxInput, setMaxInput] = useState(maxPrice || "")
  // Mobil filtre çekmecesi açık/kapalı + aktif filtre rozeti.
  const [mobileOpen, setMobileOpen] = useState(false)
  // Kategori çoklu seçim: URL'de virgülle ayrılmış id listesi (cat_1,cat_2).
  const selectedCategoryIds = view.categoryIds

  // Kategori ağacı: parent_category_id ile kökler + çocuk haritası. Parent'ı
  // listede olmayan kategori (ör. limit dışı) de kök sayılır ki kaybolmasın.
  const { rootCategories, childrenMap } = useMemo(() => {
    const byId = new Map(categories.map((c) => [c.id, c]))
    const childrenMap = new Map<string, any[]>()
    const roots: any[] = []
    for (const c of categories) {
      const pid = c.parent_category_id ?? c.parent_category?.id
      if (pid && byId.has(pid)) {
        const arr = childrenMap.get(pid) ?? []
        arr.push(c)
        childrenMap.set(pid, arr)
      } else {
        roots.push(c)
      }
    }
    return { rootCategories: roots, childrenMap }
  }, [categories])

  // Kullanıcının açtığı dallar. Seçili bir alt kategori içeren dal her zaman açık
  // görünür (aşağıdaki hasSelectedDescendant), böylece seçim gizli kalmaz.
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set())
  const toggleExpand = (id: string) =>
    setExpandedCats((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const activeCount =
    (view.minPrice ? 1 : 0) +
    (view.maxPrice ? 1 : 0) +
    (view.inStock === "true" ? 1 : 0) +
    selectedCategoryIds.length +
    (view.showcase ? 1 : 0)

  useEffect(() => {
    setMinInput(view.minPrice || "")
  }, [view.minPrice])

  useEffect(() => {
    setMaxInput(view.maxPrice || "")
  }, [view.maxPrice])

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      // Temel HER ZAMAN en son push edilen query — bekleyen gezinme varken
      // `searchParams` bayat kalıyor ve ikinci tıklama ilkini geri alıyordu
      // (ör. "Seçimleri Temizle" → hemen kategori seç → silinen filtreler geri gelirdi).
      const params = new URLSearchParams(pendingQuery ?? searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      params.delete("page")
      const nextQuery = params.toString()
      setPendingQuery(nextQuery)
      startTransition(() => {
        // scroll:false → panel sayfanın altındayken (ana sayfa) her filtre
        // tıklamasında belge en üste zıplıyordu; kullanıcı hem paneli hem
        // sonucu kaybediyordu.
        router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
          scroll: false,
        })
      })
    },
    [pendingQuery, searchParams, pathname, router]
  )

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault()
    updateQueryParams({
      minPrice: minInput ? minInput : null,
      maxPrice: maxInput ? maxInput : null,
    })
  }

  const handlePriceClear = () => {
    setMinInput("")
    setMaxInput("")
    updateQueryParams({
      minPrice: null,
      maxPrice: null,
    })
  }

  // Bir kategorinin (herhangi bir derinlikte) atası seçili mi? Seçim sunucuda
  // alt ağacıyla genişletiliyor (bkz. category-tree), yani atası seçiliyse bu
  // kategori zaten DAHİL. Arayüz bunu göstermezse kullanıcı alt kategoriye
  // tıklıyor ve hiçbir şeyin değişmediğini görüyor.
  const parentOf = (id: string): string | undefined => {
    const c = categories.find((x) => x.id === id)
    return c?.parent_category_id ?? c?.parent_category?.id ?? undefined
  }
  const hasSelectedAncestor = (id: string): boolean => {
    const seen = new Set<string>()
    let pid = parentOf(id)
    while (pid && !seen.has(pid)) {
      if (selectedCategoryIds.includes(pid)) return true
      seen.add(pid)
      pid = parentOf(pid)
    }
    return false
  }

  const handleCategoryToggle = (id: string) => {
    let next: string[]
    if (selectedCategoryIds.includes(id)) {
      next = selectedCategoryIds.filter((c) => c !== id)
    } else {
      // Üst kategori seçilince altındaki seçimler gereksizleşir; listede
      // bırakmak URL'i şişirir ve "kaldır"ı iki adıma çıkarırdı.
      next = [
        ...selectedCategoryIds.filter((c) => !isDescendantOf(c, id)),
        id,
      ]
    }
    updateQueryParams({ categoryId: next.length ? next.join(",") : null })
  }

  const isDescendantOf = (id: string, ancestorId: string): boolean => {
    const seen = new Set<string>()
    let pid = parentOf(id)
    while (pid && !seen.has(pid)) {
      if (pid === ancestorId) return true
      seen.add(pid)
      pid = parentOf(pid)
    }
    return false
  }

  const handleStockToggle = () => {
    updateQueryParams({
      inStock: view.inStock === "true" ? null : "true",
    })
  }

  const handleShowcaseToggle = (key: string) => {
    updateQueryParams({ showcase: view.showcase === key ? null : key })
  }

  // Tüm filtre seçimlerini tek seferde kaldır (sıralama korunur).
  // Mobilde çekmece de kapanır: sonuç zaten güncelleniyordu ama tam ekran
  // çekmecenin arkasında kalıyordu; kullanıcı ancak boşluğa dokunup çekmeceyi
  // kapatınca "cevap verdi" sanıyordu.
  const handleClearAll = () => {
    setMinInput("")
    setMaxInput("")
    setMobileOpen(false)
    updateQueryParams({
      categoryId: null,
      showcase: null,
      minPrice: null,
      maxPrice: null,
      inStock: null,
    })
  }

  // SortProducts callback'i (name, value) imzasıyla çağırır → gerçek sıralama
  // değeri İKİNCİ argümandır. Önceden ilk argüman ("sortBy") alınıyordu, bu yüzden
  // URL'e sortBy=sortBy yazılıp sıralama hiç uygulanmıyordu.
  const handleSortChange = (_name: string, value: string) => {
    updateQueryParams({ sortBy: value })
  }

  // Bir kategorinin altında (herhangi bir derinlikte) seçili kategori var mı?
  const hasSelectedDescendant = (id: string): boolean => {
    const kids = childrenMap.get(id) ?? []
    return kids.some(
      (k) => selectedCategoryIds.includes(k.id) || hasSelectedDescendant(k.id)
    )
  }

  // Kategori ağacını özyinelemeli çiz. İsim = filtre seç/kaldır; chevron = dal aç/kapa.
  const renderCategoryNodes = (nodes: any[], depth: number): React.ReactNode =>
    nodes.map((cat) => {
      const kids = childrenMap.get(cat.id) ?? []
      const hasKids = kids.length > 0
      const isSelected = selectedCategoryIds.includes(cat.id)
      // Atası seçiliyse bu kategori sonuçlara zaten dahil.
      const isIncluded = !isSelected && hasSelectedAncestor(cat.id)
      const isOpen = expandedCats.has(cat.id) || hasSelectedDescendant(cat.id)
      return (
        <div key={cat.id}>
          <div
            className={`flex items-center rounded-xl transition-all duration-200 ${
              isSelected
                ? "bg-brand-600 text-white font-semibold shadow-sm"
                : isIncluded
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            style={{ paddingLeft: depth * 14 }}
          >
            <button
              onClick={() => handleCategoryToggle(cat.id)}
              className="flex-1 flex items-center justify-between text-left text-sm py-2 px-3 select-none"
            >
              <span>{cat.name}</span>
              {isSelected && (
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-bold">
                  Aktif
                </span>
              )}
              {isIncluded && (
                <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-md font-bold">
                  Dahil
                </span>
              )}
            </button>
            {hasKids && (
              <button
                type="button"
                onClick={() => toggleExpand(cat.id)}
                aria-label={isOpen ? "Alt kategorileri gizle" : "Alt kategorileri göster"}
                aria-expanded={isOpen}
                className="p-2 mr-1 shrink-0 rounded-lg hover:bg-black/5"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  } ${isSelected ? "text-white" : "text-slate-400"}`}
                />
              </button>
            )}
          </div>
          {hasKids && isOpen && (
            <div className="mt-1 flex flex-col gap-y-1">
              {renderCategoryNodes(kids, depth + 1)}
            </div>
          )}
        </div>
      )
    })

  const filters = (
    <>
      {/* 0. Seçimleri Temizle — en üstte, yalnız aktif filtre varken. Ne seçildiği
          burada ÖZETLENMEZ; seçili durum ilgili bölümlerde zaten vurgulanıyor. */}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={handleClearAll}
          disabled={isPending}
          aria-busy={isPending}
          className="flex items-center justify-center gap-x-2 w-full py-2.5 rounded-2xl border border-brand-200 bg-brand-50/60 text-sm font-semibold text-brand-700 hover:bg-brand-100/60 transition-all duration-200 disabled:cursor-progress"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
          {isPending ? "Güncelleniyor…" : "Seçimleri Temizle"}
        </button>
      )}

      {/* 1. Sıralama Seçenekleri */}
      <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-200/60">
        <SortProducts sortBy={view.sortBy} setQueryParams={handleSortChange} data-testid={dataTestId} />
      </div>

      {/* 2. Kategoriler */}
      {categories.length > 0 && (
        <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-200/60 flex flex-col gap-y-3">
          <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">Kategoriler</span>
          <div className="flex flex-col gap-y-1 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
            {renderCategoryNodes(rootCategories, 0)}
          </div>
        </div>
      )}

      {/* Hızlı Filtreler (sabit vitrin etiketleri) — gerçek kategori değil, pazarlama
          rozeti. Kategori listesiyle karışmasın diye yatay "chip" olarak gösterilir.
          Tekli seç/kaldır → ?showcase=<key> */}
      <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-200/60 flex flex-col gap-y-3">
        <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">Hızlı Filtreler</span>
        <div className="flex flex-wrap gap-2">
          {SHOWCASE_CATEGORIES.map((sc) => {
            const isSelected = view.showcase === sc.key
            return (
              <button
                key={sc.key}
                onClick={() => handleShowcaseToggle(sc.key)}
                aria-pressed={isSelected}
                className={`flex items-center gap-x-1.5 text-sm py-1.5 px-3 rounded-full border transition-all duration-200 select-none ${
                  isSelected
                    ? "bg-brand-600 border-brand-600 text-white font-semibold shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700"
                }`}
              >
                <span>{sc.emoji}</span>
                <span>{sc.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Fiyat Filtresi */}
      <div className="bg-slate-50/40 p-5 rounded-2xl border border-slate-200/60 flex flex-col gap-y-3">
        <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">Fiyat Aralığı</span>
        <form onSubmit={handlePriceApply} className="flex flex-col gap-y-3">
          <div className="flex items-center gap-x-2">
            <input
              type="number"
              placeholder="En az"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 placeholder-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-slate-600">-</span>
            <input
              type="number"
              placeholder="En çok"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 placeholder-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="flex gap-x-2">
            <button
              type="submit"
              className="flex-1 text-xs font-semibold py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all duration-200 shadow-sm"
            >
              Uygula
            </button>
            {(view.minPrice || view.maxPrice) && (
              <button
                type="button"
                onClick={handlePriceClear}
                className="text-xs font-semibold py-2.5 px-3 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl transition-all duration-200"
              >
                Temizle
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 4. Stok Durumu — tek bir switch buton (önceden onClick'li div içinde
          pointer-events-none buton vardı: klavye/ekran okuyucuyla kullanılamıyordu). */}
      <button
        type="button"
        role="switch"
        aria-checked={view.inStock === "true"}
        onClick={handleStockToggle}
        className="w-full bg-slate-50/40 p-5 rounded-2xl border border-slate-200/60 flex items-center justify-between select-none text-left"
      >
        <span className="text-sm font-semibold text-slate-700">Sadece Stoktakiler</span>
        <span
          aria-hidden="true"
          className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-all duration-300 ${
            view.inStock === "true" ? "bg-brand-600 justify-end" : "bg-slate-300 justify-start"
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
        </span>
      </button>
    </>
  )

  return (
    <>
      {/* Mobil: "Filtrele" butonu (yalnız mobilde; masaüstünde panel inline) */}
      <div className="small:hidden px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-300 rounded-xl bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          data-testid="mobile-filter-button"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filtrele ve Sırala
          {activeCount > 0 && (
            <span className="ml-1 bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Masaüstü: inline panel */}
      <div
        aria-busy={isPending}
        className={clx(
          "hidden small:flex flex-col gap-y-6 py-4 mb-8 pl-6 pr-0 min-w-[280px] w-[280px] shrink-0",
          "transition-opacity duration-200",
          isPending && "opacity-70"
        )}
      >
        {filters}
      </div>

      {/* Mobil: soldan açılan filtre çekmecesi */}
      <Transition show={mobileOpen} as={Fragment}>
        <Dialog onClose={setMobileOpen} className="relative z-[70] small:hidden">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-y-0 left-0 flex max-w-full">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <DialogPanel className="flex h-full w-screen max-w-sm flex-col bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <DialogTitle className="text-base font-bold text-slate-800">
                      Filtrele &amp; Sırala
                    </DialogTitle>
                    <button
                      onClick={() => setMobileOpen(false)}
                      aria-label="Kapat"
                      className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div
                    aria-busy={isPending}
                    className={clx(
                      "flex-1 overflow-y-auto overscroll-contain transition-opacity duration-200",
                      isPending && "opacity-70"
                    )}
                  >
                    <div className="flex flex-col gap-y-6 p-4">{filters}</div>
                  </div>
                  <div className="border-t border-slate-200 p-4">
                    <button
                      onClick={() => setMobileOpen(false)}
                      className={clx(
                        "flex w-full items-center justify-center gap-x-2 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white",
                        "transition-colors hover:bg-brand-700"
                      )}
                    >
                      {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isPending ? "Güncelleniyor…" : "Sonuçları Gör"}
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default RefinementList
