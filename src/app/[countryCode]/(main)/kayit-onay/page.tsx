import { Metadata } from "next"
import VerifyRegistration from "./verify-registration"

export const metadata: Metadata = {
  title: "Üyelik Onayı",
  robots: { index: false, follow: false },
}

/**
 * Üyelik doğrulama: gobit'in doğrulama e-postasındaki bağlantı buraya gelir
 * ({STOREFRONT_URL}/kayit-onay?token=…); kayıt formu da "?gonderildi=1" ile
 * buraya yönlenir.
 */
export default async function KayitOnayPage(props: {
  searchParams: Promise<{ token?: string | string[]; gonderildi?: string | string[] }>
}) {
  const sp = await props.searchParams
  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? ""

  return <VerifyRegistration token={first(sp.token)} sent={first(sp.gonderildi) === "1"} />
}
