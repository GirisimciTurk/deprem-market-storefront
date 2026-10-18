// Vitrinin veri şekilleri. gobit kayıtları bunlara lib/gobit/adapt.ts,
// lib/gobit/cart.ts ve lib/data/* içinde çevrilir; bileşenler yalnız bunları
// okur. Tutarlar en küçük para birimiyle (kuruş).

export type Metadata = Record<string, unknown>

// --- Bölge -----------------------------------------------------------------

export type StoreRegionCountry = {
  id: string
  /** Küçük harfli ISO 3166-1 alpha-2 (tr). */
  iso_2: string
  name: string
  display_name: string
}

export type StoreRegion = {
  id: string
  name: string
  /** Küçük harfli (try). */
  currency_code: string
  countries?: StoreRegionCountry[]
}

// --- Ürün ------------------------------------------------------------------

export type StoreProductImage = {
  id: string
  url: string
  rank?: number
}

export type StoreProductOptionValue = {
  id: string
  value: string
  option_id?: string | null
  option?: { id: string; title: string } | null
}

export type StoreProductOption = {
  id: string
  title: string
  values?: StoreProductOptionValue[]
}

/** Varyantın bölge para birimindeki fiyatı (gobit fiyat listesinden). */
export type StoreCalculatedPrice = {
  id?: string
  calculated_amount: number
  original_amount: number
  currency_code: string
  calculated_price?: { price_list_type?: string | null }
  original_price?: { price_list_type?: string | null }
}

export type StoreVariant = {
  id: string
  title: string | null
  sku?: string | null
  barcode?: string | null
  product_id?: string
  product?: StoreProduct | null
  manage_inventory?: boolean | null
  allow_backorder?: boolean | null
  inventory_quantity?: number | null
  variant_rank?: number | null
  metadata?: Metadata | null
  options?: StoreProductOptionValue[] | null
  images?: StoreProductImage[] | null
  calculated_price?: StoreCalculatedPrice | null
}

export type StoreProductCategory = {
  id: string
  name: string
  handle: string
  description: string
  rank: number
  parent_category_id: string | null
  parent_category: StoreProductCategory | null
  category_children: StoreProductCategory[]
  products?: StoreProduct[]
  metadata?: Metadata | null
}

/** Ürünün bağlı olduğu kategori (ağaç alanları olmadan). */
export type StoreProductCategoryRef = Pick<StoreProductCategory, "id" | "name" | "handle" | "parent_category_id">

export type StoreCollection = {
  id: string
  title: string
  handle: string
  metadata?: Metadata | null
  products?: StoreProduct[]
}

export type StoreProductTag = { id: string; value: string }

/** Kartta ve ürün sayfasında gösterilen mağaza (dtm /product-cards). */
export type StoreProductSeller = {
  id: string
  handle: string
  name: string
  rating_sum: number
  rating_count: number
  rating_avg: number | null
  trusted: boolean
}

export type StoreProduct = {
  id: string
  title: string
  handle: string
  subtitle: string | null
  description: string | null
  thumbnail: string | null
  status?: string
  metadata?: Metadata | null
  created_at?: string
  updated_at?: string
  images: StoreProductImage[] | null
  options: StoreProductOption[] | null
  variants: StoreVariant[] | null
  categories?: StoreProductCategoryRef[] | null
  tags?: StoreProductTag[] | null
  collection_id?: string | null
  collection?: StoreCollection | null
  seller?: StoreProductSeller | null
  // gobit bunları göndermez; ürün bilgisi sekmesi varsa gösterir.
  type?: { id: string; value: string } | null
  material?: string | null
  origin_country?: string | null
  weight?: number | null
  length?: number | null
  height?: number | null
  width?: number | null
}

/** Ürün listesinin süzgeçleri (lib/data/products.ts gobit sorgusuna çevirir). */
export type StoreProductListParams = {
  limit?: number
  offset?: number
  q?: string
  id?: string | string[]
  handle?: string | string[]
  category_id?: string | string[]
  collection_id?: string | string[]
  tag_id?: string | string[]
  region_id?: string
  order?: string
  fields?: string
  is_giftcard?: boolean
}

// --- Adres ve müşteri ------------------------------------------------------

export type StoreAddress = {
  id?: string
  first_name?: string | null
  last_name?: string | null
  company?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country_code?: string | null
  phone?: string | null
  metadata?: Metadata | null
}

export type StoreCustomerAddress = StoreAddress & {
  id: string
  address_name?: string | null
  is_default_shipping?: boolean
  is_default_billing?: boolean
}

export type StoreCustomer = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  has_account?: boolean
  addresses: StoreCustomerAddress[]
  created_at?: string
  updated_at?: string
  metadata?: Metadata | null
}

/** Müşteri profilinde değiştirilebilen alanlar. */
export type StoreCustomerUpdate = {
  first_name?: string
  last_name?: string
  phone?: string
  metadata?: Metadata
}

// --- Sepet -----------------------------------------------------------------

export type StoreCartLineItem = {
  id: string
  cart_id?: string
  title: string
  subtitle?: string | null
  variant_title?: string | null
  quantity: number
  unit_price: number
  subtotal: number
  tax_total: number
  discount_total: number
  total: number
  original_total: number
  thumbnail?: string | null
  product_id?: string
  product_title?: string | null
  product_handle?: string | null
  variant_id?: string | null
  variant?: StoreVariant
  product?: StoreProduct | null
  metadata?: Metadata | null
  is_tax_inclusive?: boolean
  created_at?: string
}

export type StoreShippingMethod = {
  id: string
  name: string
  amount: number
  total: number
  subtotal: number
  shipping_option_id?: string
}

export type StorePromotion = {
  id: string
  code: string
  is_automatic?: boolean
  /** gobit sepeti yalnız kodu döner; indirimin türü ve değeri varsa gösterilir. */
  application_method?: { type: string; value: string | number; currency_code?: string }
}

export type StorePaymentSession = {
  id: string
  provider_id: string
  status: string
  amount: number
  data: Record<string, unknown>
}

/** Seçilen ödeme yöntemi; PayTR oturumu son adımda açılır (lib/gobit/cart.ts). */
export type StorePaymentCollection = {
  id: string
  amount: number
  currency_code: string
  payment_sessions?: StorePaymentSession[]
}

export type StoreCart = {
  id: string
  region_id: string
  region?: StoreRegion
  currency_code: string
  email?: string
  customer_id?: string
  items: StoreCartLineItem[]
  shipping_address?: StoreAddress
  billing_address?: StoreAddress
  shipping_methods: StoreShippingMethod[]
  promotions: StorePromotion[]
  subtotal: number
  item_total: number
  item_subtotal: number
  item_tax_total: number
  tax_total: number
  discount_total: number
  shipping_total: number
  shipping_subtotal: number
  total: number
  original_total: number
  gift_card_total: number
  payment_collection?: StorePaymentCollection
  metadata?: Metadata | null
}

/** Sepete yazılan alanlar (lib/data/cart.ts updateCart). */
export type StoreCartUpdate = {
  email?: string
  customer_id?: string
  shipping_address?: StoreAddress
  billing_address?: StoreAddress
  promo_codes?: string[]
  metadata?: Metadata
}

/** Eşik kuralı (ücretsiz kargo): `attribute` `operator` `value`. */
export type StorePriceRule = { attribute: string; operator: string; value: string }

export type StoreShippingPrice = {
  id: string
  amount: number
  currency_code: string
  price_rules?: StorePriceRule[]
}

/** gobit kargo seçeneği: sabit fiyatlı, kuralsız. */
export type StoreCartShippingOption = {
  id: string
  name: string
  amount: number
  price_type: "flat" | "calculated"
  prices: StoreShippingPrice[]
  calculated_price?: { calculated_amount: number; currency_code: string }
  insufficient_inventory: boolean
  service_zone?: {
    fulfillment_set?: { type?: string; location?: { address: StoreAddress } }
  }
}

export type StorePaymentProvider = { id: string; is_enabled: boolean }

// --- Sipariş ---------------------------------------------------------------

export type StoreOrderLineItem = StoreCartLineItem & {
  detail?: { fulfilled_quantity: number; shipped_quantity: number; delivered_quantity: number }
}

export type StorePayment = {
  id: string
  provider_id: string
  amount: number
  created_at: string
  data: Record<string, unknown>
}

export type StoreOrder = {
  id: string
  display_id: number
  email: string
  status: string
  fulfillment_status: string
  payment_status: string
  /** dtm'nin siparişe verdiği aşamanın Türkçe adı ("Kargoya Verildi"); okunamadıysa yok. */
  stage_label?: string | null
  region_id: string
  currency_code: string
  created_at: string
  items: StoreOrderLineItem[]
  shipping_address?: StoreAddress | null
  billing_address?: StoreAddress | null
  shipping_methods: StoreShippingMethod[]
  fulfillments?: { id: string; created_at?: string; shipped_at?: string | null; delivered_at?: string | null }[]
  subtotal: number
  item_total: number
  item_subtotal: number
  item_tax_total: number
  tax_total: number
  shipping_total: number
  shipping_subtotal: number
  discount_total: number
  gift_card_total: number
  total: number
  original_total: number
  payment_collections: {
    id: string
    amount: number
    currency_code: string
    payments: StorePayment[]
  }[]
  metadata?: Metadata | null
}
