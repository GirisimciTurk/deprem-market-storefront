import { Metadata } from "next"
import ExpertAuth from "@modules/experts/components/auth"
import ExpertResetForm from "@modules/experts/components/auth/reset-form"

export const metadata: Metadata = {
  title: "Uzman Hesabı Şifre Sıfırlama",
  robots: { index: false, follow: false },
}

/** {STOREFRONT_URL}/uzman/sifre-sifirla?token=…&email=… (dtm'nin uzman sıfırlama e-postası). */
export default async function ExpertResetPage(props: {
  searchParams: Promise<{ token?: string | string[]; email?: string | string[] }>
}) {
  const sp = await props.searchParams
  const first = (v?: string | string[]) => ((Array.isArray(v) ? v[0] : v) ?? "").trim()
  const token = first(sp.token)

  return token ? <ExpertResetForm token={token} email={first(sp.email)} /> : <ExpertAuth initial="sifre" />
}
