import { Metadata } from "next"
import MarketerAuth from "@modules/marketers/components/auth"
import MarketerPasswordForm from "@modules/marketers/components/password-form"

export const metadata: Metadata = {
  title: "Pazarlamacı Hesabı Şifre",
  robots: { index: false, follow: false },
}

/** {STOREFRONT_URL}/pazarlamaci/sifre?token=…&email=… (dtm'nin davet ya da sıfırlama e-postası). */
export default async function MarketerPasswordPage(props: {
  searchParams: Promise<{ token?: string | string[]; email?: string | string[] }>
}) {
  const sp = await props.searchParams
  const first = (v?: string | string[]) => ((Array.isArray(v) ? v[0] : v) ?? "").trim()
  const token = first(sp.token)

  return token ? <MarketerPasswordForm token={token} email={first(sp.email)} /> : <MarketerAuth initial="sifre" />
}
