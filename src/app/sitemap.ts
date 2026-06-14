import { MetadataRoute } from "next"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://depremmarket.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch regions and categories in parallel
  const [regions, categories] = await Promise.all([
    listRegions().catch(() => []),
    listCategories().catch(() => []),
  ])

  const countryCodes = (regions
    .flatMap((r) => r.countries?.map((c) => c.iso_2) || [])
    .filter(Boolean) as string[])
    .map((code) => code.toLowerCase())

  // Fetch products for all regions in parallel
  const regionProductsList = await Promise.all(
    countryCodes.map((code) =>
      listProducts({ countryCode: code, queryParams: { limit: 100 } })
        .then(({ response }) => ({ code, products: response.products || [] }))
        .catch(() => ({ code, products: [] }))
    )
  )

  const sitemaps: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ]

  for (const code of countryCodes) {
    const langPath = `/${code}`

    sitemaps.push(
      {
        url: `${baseUrl}${langPath}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseUrl}${langPath}/store`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}${langPath}/mesafeli-satis-sozlesmesi`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${baseUrl}${langPath}/teslimat-ve-iade`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${baseUrl}${langPath}/gizlilik-ve-guvenlik`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${baseUrl}${langPath}/cerez-politikasi`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${baseUrl}${langPath}/satici-ol`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${baseUrl}${langPath}/sikca-sorulan-sorular`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      },
      {
        url: `${baseUrl}${langPath}/hakkimizda`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${baseUrl}${langPath}/iletisim`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${baseUrl}${langPath}/blog`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      }
    )

    // Add category URLs
    categories.forEach((cat) => {
      sitemaps.push({
        url: `${baseUrl}${langPath}/categories/${cat.handle}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      })
    })

    // Add product URLs
    const products = regionProductsList.find((rp) => rp.code === code)?.products || []
    products.forEach((prod) => {
      sitemaps.push({
        url: `${baseUrl}${langPath}/products/${prod.handle}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      })
    })
  }

  return sitemaps
}
