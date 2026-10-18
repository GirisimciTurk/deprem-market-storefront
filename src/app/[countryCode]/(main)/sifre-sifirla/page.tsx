import { Metadata } from "next"
import ResetPasswordForm from "./reset-form"

export const metadata: Metadata = {
  title: "Şifre Sıfırlama",
  robots: { index: false, follow: false },
}

/** {STOREFRONT_URL}/sifre-sifirla?token=…&email=… (gobit'in sıfırlama e-postası). */
export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string | string[]; email?: string | string[] }>
}) {
  const sp = await props.searchParams
  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? ""

  return <ResetPasswordForm token={first(sp.token).trim()} email={first(sp.email).trim()} />
}
