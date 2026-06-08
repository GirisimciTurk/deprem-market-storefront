import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import HomeFeatures from "@modules/home/components/features"
import CorporateSection from "@modules/home/components/corporate"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "EKYP Deprem Hazırlık Market | Güvenli Yarınlar İçin Şimdiden Hazırlanın",
  description:
    "EKYP Deprem Teknolojileri güvencesiyle sertifikalı deprem hazırlık setleri, ilk yardım çantaları ve acil durum ekipmanları e-ticaret platformu.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero countryCode={countryCode} />
      <HomeFeatures countryCode={countryCode} />
      <div className="py-12 bg-ui-bg-subtle">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
      <CorporateSection countryCode={countryCode} />
    </>
  )
}
