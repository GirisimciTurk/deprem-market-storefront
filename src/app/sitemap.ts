import { MetadataRoute } from "next"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { PRIMARY_REGION } from "@lib/util/seo"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://depremmarket.com"

/**
 * Sitemap YALNIZ birincil bölge önekini listeler.
 *
 * Önceden her Medusa bölgesinin her ülke kodu için ayrı URL üretiliyordu
 * (canlıda dk/fr/de/it/es/se/gb/tr → 8 kopya, 14 ürün için 112 URL, toplam 649).
 * Ülke öneki DİL değil bölge; hepsi aynı Türkçe içeriği sunuyor. Google'a
 * 8 ayrı kopya göndermek sıralama sinyallerini böler ve tarama bütçesini
 * harcar. Canonical'lar da aynı bölgeye sabitlendi (bkz. @lib/util/seo).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await listCategories().catch(() => [])

  const countryCodes = [PRIMARY_REGION]

  // Ürünleri birincil bölge bağlamında bir kez çek.
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
