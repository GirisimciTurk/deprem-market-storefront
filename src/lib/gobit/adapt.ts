import type { StoreProduct, StoreProductCategory, StoreRegion } from "types/store"

// gobit kayıtlarını vitrinin tiplerine (types/store.ts) çevirir. Tutarlar iki
// tarafta da en küçük birimle (kuruş).

export type GobitRegion = {
  id: string
  name: string
  currency_code: string
  currency?: { code: string; decimal_digits: number }
  countries?: { code: string; name: string }[]
}

export type GobitPrice = {
  amount: number
  currency_code: string
  min_quantity?: number | null
  price_list_id?: string | null
  /** "sale": satıcı kampanyasının indirimli fiyatı (yalnız kampanya süresince gelir). */
  price_list_type?: string | null
}

export type GobitVariant = {
  id: string
  title: string
  sku?: string
  barcode?: string | null
  metadata?: Record<string, unknown> | null
  manage_inventory?: boolean
  allow_backorder?: boolean
  rank?: number
  option_values?: { id: string; option_id: string; value: string; option_title?: string }[]
  price_set?: { prices?: GobitPrice[] }
  inventory_item?: { available_quantity?: number }
  in_stock?: boolean
}

export type GobitProduct = {
  id: string
  title: string
  handle: string
  /** Vitrinde "Marka" olarak görünür (satıcının seçtiği markanın adı). */
  subtitle?: string | null
  description?: string
  thumbnail?: string | null
  material?: string | null
  weight?: number | null
  length?: number | null
  height?: number | null
  width?: number | null
  tags?: { id: string; value: string }[]
  status?: string
  metadata?: Record<string, unknown> | null
  created_at?: string
  updated_at?: string
  images?: { id: string; url: string; rank?: number }[]
  options?: { id: string; title: string; values?: { id: string; value: string }[] }[]
  categories?: { id: string; name: string; handle: string; parent_id?: string | null }[]
  variants?: GobitVariant[]
  in_stock?: boolean
}

export type CardSeller = {
  handle: string
  name: string
  rating_avg: number | null
  review_count: number
  trusted: boolean
  follower_count: number
}

export function toRegion(r: GobitRegion): StoreRegion {
  return {
    id: r.id,
    name: r.name,
    currency_code: r.currency_code.toLowerCase(),
    countries: (r.countries ?? []).map((c) => ({
      id: c.code.toLowerCase(),
      iso_2: c.code.toLowerCase(),
      name: c.name,
      display_name: c.name,
    })),
  }
}

function priceOf(v: GobitVariant, region?: GobitRegion | null) {
  const currency = (region?.currency_code ?? "TRY").toUpperCase()
  const single = (v.price_set?.prices ?? []).filter(
    (p) => p.currency_code.toUpperCase() === currency && (p.min_quantity ?? 1) <= 1
  )
  const base = single.filter((p) => !p.price_list_id)
  if (!base.length) return null
  // Vitrin tutarı en küçük birimle (kuruş) bekler (lib/util/money.ts böler);
  // gobit de kuruş tutar: çevrim yok.
  const original = Math.min(...base.map((p) => p.amount))
  // Kampanya fiyatı yalnız kampanya açıkken gelir; sepet de onu tahsil eder.
  const sale = single.filter((p) => p.price_list_type === "sale" && p.amount < original)
  const amount = sale.length ? Math.min(...sale.map((p) => p.amount)) : original

  return {
    id: `${v.id}-price`,
    calculated_amount: amount,
    original_amount: original,
    currency_code: currency.toLowerCase(),
    calculated_price: { price_list_type: sale.length ? "sale" : null },
    original_price: {},
  }
}

export function toProduct(
  p: GobitProduct,
  region?: GobitRegion | null,
  seller?: CardSeller | null
): StoreProduct {
  const options = (p.options ?? []).map((o) => ({
    id: o.id,
    title: o.title,
    values: (o.values ?? []).map((x) => ({ id: x.id, value: x.value, option_id: o.id })),
  }))
  const variants = (p.variants ?? []).map((v) => ({
    id: v.id,
    title: v.title,
    sku: v.sku || null,
    barcode: v.barcode ?? null,
    product_id: p.id,
    manage_inventory: v.manage_inventory ?? true,
    allow_backorder: v.allow_backorder ?? false,
    inventory_quantity: v.inventory_item?.available_quantity ?? (v.in_stock ? 1 : 0),
    variant_rank: v.rank ?? 0,
    // Varyantın "İndirimsiz Fiyat"ı (compare_at_price) burada gelir.
    metadata: v.metadata ?? {},
    options: (v.option_values ?? []).map((ov) => ({
      id: ov.id,
      value: ov.value,
      option_id: ov.option_id,
      option: { id: ov.option_id, title: ov.option_title ?? "" },
    })),
    calculated_price: priceOf(v, region),
  }))
  const images = [...(p.images ?? [])].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    subtitle: p.subtitle ?? null,
    description: p.description ?? null,
    material: p.material ?? null,
    weight: p.weight ?? null,
    length: p.length ?? null,
    height: p.height ?? null,
    width: p.width ?? null,
    thumbnail: p.thumbnail ?? images[0]?.url ?? null,
    status: p.status ?? "published",
    metadata: p.metadata ?? {},
    created_at: p.created_at,
    updated_at: p.updated_at,
    images: images.map((im, i) => ({ id: im.id, url: im.url, rank: im.rank ?? i })),
    options,
    variants,
    categories: (p.categories ?? []).map((c) => ({ id: c.id, name: c.name, handle: c.handle, parent_category_id: c.parent_id ?? null })),
    tags: (p.tags ?? []).map((t) => ({ id: t.id, value: t.value })),
    collection_id: null,
    collection: null,
    // Kartta ve ürün sayfasında mağaza: dtm'nin /product-cards okuması.
    seller: seller
      ? {
          id: seller.handle,
          handle: seller.handle,
          name: seller.name,
          rating_sum: seller.rating_avg != null ? seller.rating_avg * seller.review_count : 0,
          rating_count: seller.review_count,
          rating_avg: seller.rating_avg,
          trusted: seller.trusted,
        }
      : null,
  }
}

export type GobitCategory = {
  id: string
  name: string
  handle: string
  description?: string | null
  parent_id?: string | null
  is_active?: boolean
  is_internal?: boolean
  rank?: number
}

/** Düz kategori listesinden kategori ağacının alanlarını kurar. */
export function toCategories(flat: GobitCategory[]): StoreProductCategory[] {
  const byId = new Map<string, any>()
  for (const c of flat) {
    byId.set(c.id, {
      id: c.id,
      name: c.name,
      handle: c.handle,
      description: c.description ?? "",
      rank: c.rank ?? 0,
      parent_category_id: c.parent_id ?? null,
      parent_category: null,
      category_children: [],
      products: [],
      metadata: {},
    })
  }
  for (const c of Array.from(byId.values())) {
    const parent = c.parent_category_id ? byId.get(c.parent_category_id) : null
    if (parent) {
      c.parent_category = parent
      parent.category_children.push(c)
    }
  }
  for (const c of Array.from(byId.values())) c.category_children.sort((a: any, b: any) => a.rank - b.rank || a.name.localeCompare(b.name, "tr"))

  return Array.from(byId.values()) as StoreProductCategory[]
}

/**
 * Eski, Türkçe harfli kategori adresini gobit'in aldığı ASCII biçime katlar;
 * göç aracının FoldHandle'ıyla aynı kural (internal/migrate/categories.go).
 */
export function foldHandle(handle: string): string {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" }
  let out = ""
  let dash = true
  for (const ch of handle.trim().toLowerCase()) {
    if (ch === "̇") continue
    const r = map[ch] ?? ch
    if (/^[a-z0-9]$/.test(r)) {
      out += r
      dash = false
    } else if (!dash) {
      out += "-"
      dash = true
    }
  }

  return out.replace(/-+$/, "")
}

/** dtm'nin /store/v1/dtm/product-cards satırı: kartın mağazası ve ürün puanı. */
export type ProductCard = {
  product_id: string
  seller: CardSeller | null
  /** Onaylı yorumların ortalaması (bir ondalık); yorum yoksa null. */
  rating: number | null
  review_count: number
}

/**
 * Kartın puanını ürünün metadata'sına yazar (product-preview metadata.rating /
 * review_count okur). Puan yoksa ürün olduğu gibi döner.
 */
export function withCardRating(p: GobitProduct, card?: ProductCard | null): GobitProduct {
  if (!card || card.rating == null) return p
  return { ...p, metadata: { ...(p.metadata ?? {}), rating: card.rating, review_count: card.review_count } }
}

/** Müşterinin kendi bayilik/firma başvurusu (hesap > satıcı sayfası). */
export interface MyResellerApplication {
  companyName: string
  contactName: string
  taxOfficeNumber?: string
  email: string
  phone: string
  city: string
  message?: string
  date: string
  status: "pending" | "approved" | "rejected" | "suspended"
  applicationType: "bayi" | "firma"
}

/** dtm başvurusu (/store/v1/dtm/reseller-applications/me satırı). */
export type GobitApplication = {
  id: string
  kind: string
  company_name: string
  contact_name: string
  contact_email: string
  contact_phone: string
  tax_id?: string
  tax_office?: string
  city?: string
  note?: string
  status: string
  created_at: string
}

const APPLICATION_STATUSES = ["pending", "approved", "rejected", "suspended"] as const

export function toMyResellerApplication(a: GobitApplication): MyResellerApplication {
  const status = (APPLICATION_STATUSES as readonly string[]).includes(a.status)
    ? (a.status as MyResellerApplication["status"])
    : "pending"
  const tax = [a.tax_office, a.tax_id].filter(Boolean).join(" / ")

  return {
    companyName: a.company_name,
    contactName: a.contact_name,
    taxOfficeNumber: tax || undefined,
    email: a.contact_email,
    phone: a.contact_phone || "",
    city: a.city || "",
    message: a.note || undefined,
    date: new Date(a.created_at).toLocaleDateString("tr-TR"),
    status,
    applicationType: a.kind === "company" ? "firma" : "bayi",
  }
}
