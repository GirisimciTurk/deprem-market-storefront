import { Metadata } from "next"
import { redirect } from "next/navigation"
import { retrieveMarketerStatement } from "@lib/data/marketer"
import MarketerAuth from "@modules/marketers/components/auth"

export const metadata: Metadata = {
  title: "Pazarlamacı Girişi",
  robots: { index: false, follow: false },
}

/** /pazarlamaci/giris; oturumu olan pazarlamacı panele gider. */
export default async function MarketerSignInPage(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
  if (await retrieveMarketerStatement().catch(() => null)) redirect(`/${countryCode}/pazarlamaci`)

  return <MarketerAuth initial="giris" />
}
