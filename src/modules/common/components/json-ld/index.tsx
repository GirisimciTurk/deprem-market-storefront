import { HttpTypes } from "@medusajs/types"
import { SITE_CONTACT } from "@lib/config/contact"

type ProductJsonLdProps = {
  product: HttpTypes.StoreProduct
  url: string
  /** Onaylı yorumlardan hesaplanan ortalama/sayı. reviewCount>0 ise schema'ya eklenir. */
  aggregateRating?: { ratingValue: number; reviewCount: number }
}

export default function ProductJsonLd({ product, url, aggregateRating }: ProductJsonLdProps) {
  const cheapestVariant = product.variants?.reduce(
    (min, v) => {
      const price = (v as any).calculated_price?.calculated_amount
      if (price && (!min || price < min)) return price
      return min
    },
    null as number | null
  )

  const currency =
    (product.variants?.[0] as any)?.calculated_price?.currency_code?.toUpperCase() || "TRY"

  const hasStock = product.variants?.some(
    (v: any) => (v.inventory_quantity ?? 0) > 0 || v.manage_inventory === false
  )

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.subtitle || product.title,
    image: product.thumbnail
      ? [product.thumbnail]
      : product.images?.map((img) => img.url) || [],
    url,
    sku: product.variants?.[0]?.sku || product.id,
    brand: {
      "@type": "Brand",
      name: "depremTek Market",
    },
    ...(aggregateRating && aggregateRating.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: aggregateRating.ratingValue,
            reviewCount: aggregateRating.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(cheapestVariant
      ? {
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: currency,
            price: cheapestVariant.toFixed(2),
            availability: hasStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            seller: {
              "@type": "Organization",
              name: "depremTek Market",
            },
          },
        }
      : {}),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function OrganizationJsonLd({ baseUrl }: { baseUrl: string }) {
  const site = baseUrl.replace(/\/$/, "")
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "depremTek Market",
    alternateName: "Deprem Teknolojileri",
    url: site,
    logo: `${site}/icon`,
    description:
      "Türkiye'nin öncü afet ve acil durum hazırlık marketi. Profesyonel deprem çantaları, ilk yardım setleri ve hayati acil durum ekipmanları.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "TR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE_CONTACT.schemaTelephone,
      contactType: "customer service",
      availableLanguage: ["Turkish", "English"],
    },
    sameAs: [
      "https://girisimciturk.com/ekyp/deprem-teknolojileri/",
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[]
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
