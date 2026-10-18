import { Metadata } from "next"
import UnsubscribeForm from "@modules/common/components/unsubscribe-form"

export const metadata: Metadata = {
  title: "E-posta Aboneliğinden Çık",
  robots: { index: false, follow: false },
}

/**
 * Pazarlama e-postalarının (kampanya, sepet hatırlatma) ayrılma bağlantısı ve
 * List-Unsubscribe adresi: {STOREFRONT_URL}/abonelik-iptal?token=…. Jeton
 * gobit'e (POST /store/v1/dtm/marketing/unsubscribe) yalnız düğmeyle gider:
 * bağlantıyı önceden açan e-posta tarayıcıları kişiyi listeden düşürmesin.
 */
export default async function MarketingUnsubscribePage(props: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const { token } = await props.searchParams
  const value = Array.isArray(token) ? token[0] : token

  return (
    <div className="content-container py-24 flex flex-col items-center text-center max-w-md mx-auto">
      <UnsubscribeForm kind="marketing" token={value ?? ""} />
    </div>
  )
}
