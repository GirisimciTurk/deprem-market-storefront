import { HttpTypes } from "@medusajs/types"

type ProductJsonLdProps = {
  product: HttpTypes.StoreProduct
  url: string
}

export default function ProductJsonLd({ product, url }: ProductJsonLdProps) {
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
      name: "EKYP Deprem Market",
    },
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
              name: "EKYP Deprem Market",
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

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "EKYP Deprem Market",
    alternateName: "EKYP Deprem Teknolojileri",
    url: "https://depremmarket.com",
    logo: "https://depremmarket.com/icon",
    description:
      "Türkiye'nin öncü afet ve acil durum hazırlık marketi. Profesyonel deprem çantaları, ilk yardım setleri ve hayati acil durum ekipmanları.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "TR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+90-539-574-1904",
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
