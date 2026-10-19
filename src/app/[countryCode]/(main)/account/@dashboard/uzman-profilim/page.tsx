import { redirect } from "next/navigation"

/** Uzman paneli müşteri hesabından ayrıldı (/uzman/panel); eski adres oraya gider. */
export default async function MovedExpertProfilePage(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
  redirect(`/${countryCode}/uzman/panel`)
}
