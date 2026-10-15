import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"
import { foldHandle } from "@lib/gobit/adapt"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "tr"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
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
      return new Map<string, HttpTypes.StoreRegion>()
    }

    // Create a map of country codes to regions.
    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.code.toLowerCase(), region as unknown as HttpTypes.StoreRegion)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
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

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)
  const countryCode = await getCountryCode(request, regionMap)

  // if the country code is available, use it, otherwise use the default region
  const country = countryCode || DEFAULT_REGION
  const firstPathSegment = request.nextUrl.pathname.split("/")[1]?.toLowerCase()
  const urlHasCountry = firstPathSegment === country.toLowerCase()

  // Medusa'dan kalma Türkçe kategori adresi (/tr/categories/eğitim-ve-planlama):
  // göç aracı adresi ASCII'ye katladı; eski bağlantı yeni adrese kalıcı yönlenir.
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

  if (urlHasCountry) {
    const response = NextResponse.next()
    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
    }

    // Clear completed cart cookie if we are on the order confirmation page
    const pathname = request.nextUrl.pathname
    if (/\/order\/[^\/]+\/confirmed/.test(pathname)) {
      response.cookies.set("_medusa_cart_id", "", { maxAge: -1 })
    }

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
