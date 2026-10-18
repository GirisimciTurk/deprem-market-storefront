import { NextRequest, NextResponse } from "next/server"
import { foldHandle } from "@lib/gobit/adapt"
import {
  ORDER_TOKENS_COOKIE,
  ORDER_TOKENS_MAX_AGE,
  confirmedOrderId,
  withOrderToken,
} from "@lib/util/order-tokens"

const BACKEND_URL = process.env.NEXT_PUBLIC_GOBIT_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_GOBIT_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "tr"

// Ülke kodu → gobit bölgesi; yalnız hangi ülkelerin satışta olduğunu bilmek için.
type RegionRef = { id: string }

const regionMapCache = {
  regionMap: new Map<string, RegionRef>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Define the NEXT_PUBLIC_GOBIT_BACKEND_URL environment variable and make sure gobit has at least one region."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Bölgeler gobit'ten doğrudan fetch ile okunur: middleware Edge'de çalışır, lib/gobit/client yalnız sunucuda (server-only).
    const response = await fetch(`${BACKEND_URL}/store/v1/regions`, {
      method: "GET",
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: [`regions-${cacheId}`],
      },
      cache: "force-cache",
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const json = await response.json()

    // gobit: {data: [{id, countries: [{code: "TR"}]}]}
    const regions = json.data as { id: string; countries?: { code: string }[] }[]

    if (!regions?.length) {
      return new Map<string, RegionRef>()
    }

    // Create a map of country codes to regions.
    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.code.toLowerCase(), region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * İsteğin ülke kodunu seçer: adresteki, Cloudflare/Vercel başlığındaki ya da varsayılan.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, RegionRef>
) {
  let countryCode

  const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

  // Cloudflare Workers provides country via request.cf.country
  const cloudflareCountryCode = (request as { cf?: { country?: string } }).cf?.country?.toLowerCase()

  // Vercel provides x-vercel-ip-country header
  const vercelCountryCode = request.headers
    .get("x-vercel-ip-country")
    ?.toLowerCase()

  if (urlCountryCode && regionMap.has(urlCountryCode)) {
    countryCode = urlCountryCode
  } else if (cloudflareCountryCode && regionMap.has(cloudflareCountryCode)) {
    countryCode = cloudflareCountryCode
  } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
    countryCode = vercelCountryCode
  } else if (regionMap.has(DEFAULT_REGION)) {
    countryCode = DEFAULT_REGION
  } else if (regionMap.keys().next().value) {
    countryCode = regionMap.keys().next().value
  }

  return countryCode
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const cacheIdCookie = request.cookies.get("_dt_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)
  const countryCode = await getCountryCode(request, regionMap)

  // if the country code is available, use it, otherwise use the default region
  const country = countryCode || DEFAULT_REGION
  const firstPathSegment = request.nextUrl.pathname.split("/")[1]?.toLowerCase()
  const urlHasCountry = firstPathSegment === country.toLowerCase()

  // Eski kategori adresleri Türkçe harfliydi (/tr/categories/eğitim-ve-planlama);
  // kategori adresleri artık ASCII. Dizinlenmiş eski bağlantı yeni adrese kalıcı yönlenir.
  const categoryPath = request.nextUrl.pathname.match(/^\/([^/]+)\/categories\/(.+)$/)
  if (urlHasCountry && categoryPath) {
    const segments = categoryPath[2].split("/").map((seg) => {
      try {
        return decodeURIComponent(seg)
      } catch {
        return seg
      }
    })
    const folded = segments.map(foldHandle)
    if (folded.join("/") !== segments.join("/")) {
      const url = request.nextUrl.clone()
      url.pathname = `/${categoryPath[1]}/categories/${folded.join("/")}`
      return NextResponse.redirect(url, 301)
    }
  }

  // E-postadaki sipariş bağlantısı (/{ülke}/order/{id}/confirmed?token=…):
  // gobit'in sipariş jetonu bir kez okunur, sipariş jetonları çerezine yazılır
  // ve jetonsuz adrese yönlenilir; jeton adres çubuğunda, geçmişte ve üçüncü
  // taraf betiklerin gördüğü URL'de kalmaz (gobit ADR 0439). Sipariş sayfası
  // ve iade/kargo okumaları jetonu çerezden X-Order-Token olarak geçirir.
  const mailedOrder = urlHasCountry ? confirmedOrderId(request.nextUrl.pathname) : null
  const mailedToken = request.nextUrl.searchParams.get("token")?.trim()
  if (mailedOrder && mailedToken) {
    const url = request.nextUrl.clone()
    url.searchParams.delete("token")
    const response = NextResponse.redirect(url, 303)
    response.headers.set("Referrer-Policy", "no-referrer")
    response.cookies.set(
      ORDER_TOKENS_COOKIE,
      withOrderToken(request.cookies.get(ORDER_TOKENS_COOKIE)?.value, mailedOrder, mailedToken),
      {
        maxAge: ORDER_TOKENS_MAX_AGE,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      }
    )
    return response
  }

  if (urlHasCountry) {
    const response = NextResponse.next()
    if (!cacheIdCookie) {
      response.cookies.set("_dt_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
    }

    // Sipariş onay sayfasında sepet çerezi silinmez: tamamlama (cart.ts
    // settle, ödeme sonucu) çerezi zaten siler, tamamlanmış sepeti de
    // retrieveCart düşürür. Sayfa artık sipariş e-postasından da açıldığı
    // için burada silmek, o sırada doldurulan yeni sepeti kaybettirirdi.

    return response
  }

  // if the url doesn't have the country, redirect to it
  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
  const queryString = request.nextUrl.search || ""
  const redirectUrl = `${request.nextUrl.origin}/${country}${redirectPath}${queryString}`

  return NextResponse.redirect(redirectUrl, 307)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon|manifest|sitemap|robots|sw.js|offline|screenshots|splash|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
