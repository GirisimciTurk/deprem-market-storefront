import "server-only"
import { headers as nextHeaders } from "next/headers"

// gobit'in vitrin API'si (depremtek arka ucu). Veri katmanı (lib/data) buradan
// okur; kayıtlar vitrinin tiplerine (types/store.ts) adapt.ts ve cart.ts'te çevrilir.

export const GOBIT_BACKEND_URL =
  process.env.GOBIT_BACKEND_URL ||
  process.env.NEXT_PUBLIC_GOBIT_BACKEND_URL ||
  "http://localhost:9100"

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_GOBIT_PUBLISHABLE_KEY || ""

// Ürün listesi satış kanalı yolunun altında: /store/v1/sales-channels/{id}/products.
export const SALES_CHANNEL_ID = process.env.GOBIT_SALES_CHANNEL_ID || ""

export class GobitError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    /** Retry-After, saniye: gobit "bekle" dediğinde. */
    public retryAfter?: number
  ) {
    super(message)
  }
}

type Query = Record<string, string | number | boolean | undefined | null | (string | number)[]>

export type GobitInit = {
  method?: string
  query?: Query
  body?: unknown
  /** Çok parçalı gövde (dosya yükleme); verilirse body yok sayılır. */
  form?: FormData
  headers?: Record<string, string>
  next?: NextFetchRequestConfig
  cache?: RequestCache
}

function search(query?: Query) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v === undefined || v === null || v === "") continue
    if (Array.isArray(v)) v.forEach((x) => p.append(k, String(x)))
    else p.append(k, String(v))
  }
  const s = p.toString()
  return s ? `?${s}` : ""
}

// gobit istek sınırlarını müşterinin adresine göre sayar; vitrin isteği vekil
// olarak ilettiği için adresi X-Forwarded-For ile geçirir (gobit güvendiği
// vekil sayısına, TRUSTED_PROXY_HOPS, göre okur). Yalnız yazmalarda ve
// önbelleğe alınmayan okumalarda: önbellekli bir okumada istek başlıklarını
// okumak sayfayı dinamik yapar, onlar da zaten herkes için ortaktır.
async function forwardedFor(init: GobitInit): Promise<Record<string, string>> {
  const write = !!init.method && init.method !== "GET"
  if (!write && init.cache !== "no-store") return {}
  try {
    const h = await nextHeaders()
    const chain = h.get("x-forwarded-for") || h.get("x-real-ip")
    return chain ? { "X-Forwarded-For": chain } : {}
  } catch {
    // İstek bağlamı dışında (derleme, zamanlanmış iş) iletilecek adres yok.
    return {}
  }
}

/** gobit'e bir istek; yanıtın kendisi (başlıkları okunacaksa). */
export async function gobitResponse(path: string, init: GobitInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    "x-publishable-api-key": PUBLISHABLE_KEY,
    Accept: "application/json",
    ...(await forwardedFor(init)),
    ...(init.headers ?? {}),
  }
  // FormData'da Content-Type'ı (sınır dizgesiyle) fetch kendisi yazar.
  if (init.body !== undefined && !init.form) headers["Content-Type"] = "application/json"

  return fetch(`${GOBIT_BACKEND_URL}${path}${search(init.query)}`, {
    method: init.method ?? "GET",
    headers,
    body: init.form ?? (init.body === undefined ? undefined : JSON.stringify(init.body)),
    next: init.next,
    cache: init.cache ?? (init.method && init.method !== "GET" ? "no-store" : undefined),
  })
}

/** gobit'e bir istek; JSON gövdeyi olduğu gibi döner ({data, count, ...}). */
export async function gobitFetch<T>(path: string, init: GobitInit = {}): Promise<T> {
  const res = await gobitResponse(path, init)
  if (res.status === 204) return undefined as T
  const text = await res.text()
  const json = text ? JSON.parse(text) : undefined
  if (!res.ok) {
    const err = json?.error ?? {}
    const retry = Number(res.headers.get("Retry-After"))
    throw new GobitError(
      res.status,
      err.code ?? "",
      err.message ?? `gobit ${res.status} ${path}`,
      Number.isFinite(retry) && retry > 0 ? retry : undefined
    )
  }
  return json as T
}

/** Yanıtın `data` alanı. */
export async function gobitData<T>(path: string, init: GobitInit = {}): Promise<T> {
  return (await gobitFetch<{ data: T }>(path, init)).data
}
