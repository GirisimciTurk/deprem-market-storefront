import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import HomeFeatures from "@modules/home/components/features"
import CorporateSection from "@modules/home/components/corporate"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  }
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
