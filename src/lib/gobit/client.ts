import "server-only"

// gobit'in vitrin API'si (depremtek arka ucu). Medusa SDK'sının yerini veri
// katmanında alır; bileşenler Medusa tiplerini görmeye devam eder (bkz. adapt.ts).

export const GOBIT_BACKEND_URL =
  process.env.GOBIT_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9100"

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

// Ürün listesi satış kanalı yolunun altında: /store/v1/sales-channels/{id}/products.
export const SALES_CHANNEL_ID = process.env.GOBIT_SALES_CHANNEL_ID || ""

export class GobitError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
  }
}

type Query = Record<string, string | number | boolean | undefined | null | (string | number)[]>

export type GobitInit = {
  method?: string
  query?: Query
  body?: unknown
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

/** gobit'e bir istek; yanıtın kendisi (başlıkları okunacaksa). */
export async function gobitResponse(path: string, init: GobitInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    "x-publishable-api-key": PUBLISHABLE_KEY,
    Accept: "application/json",
    ...(init.headers ?? {}),
  }
  if (init.body !== undefined) headers["Content-Type"] = "application/json"

  return fetch(`${GOBIT_BACKEND_URL}${path}${search(init.query)}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
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
    throw new GobitError(res.status, err.code ?? "", err.message ?? `gobit ${res.status} ${path}`)
  }
  return json as T
}

/** Yanıtın `data` alanı. */
export async function gobitData<T>(path: string, init: GobitInit = {}): Promise<T> {
  return (await gobitFetch<{ data: T }>(path, init)).data
}
