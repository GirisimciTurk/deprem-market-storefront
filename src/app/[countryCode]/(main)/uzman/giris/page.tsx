import { Metadata } from "next"
import { redirect } from "next/navigation"
import { retrieveExpertAccount } from "@lib/data/expert-auth"
import ExpertAuth from "@modules/experts/components/auth"

export const metadata: Metadata = {
  title: "Uzman Girişi",
  description: "Uzman hesabınızla giriş yapın ya da ücretsiz uzman hesabı açın.",
  robots: { index: false },
}

/** /uzman/giris; ?kayit=1 hesap açma formuyla açılır. Oturumu olan uzman panele gider. */
export default async function ExpertSignInPage(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ kayit?: string }>
}) {
  const [{ countryCode }, sp] = await Promise.all([props.params, props.searchParams])
  if (await retrieveExpertAccount().catch(() => null)) redirect(`/${countryCode}/uzman/panel`)

  return <ExpertAuth initial={sp.kayit ? "kayit" : "giris"} />
}
