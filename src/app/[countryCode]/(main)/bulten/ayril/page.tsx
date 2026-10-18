import { Metadata } from "next"
import UnsubscribeForm from "@modules/common/components/unsubscribe-form"

export const metadata: Metadata = {
  title: "Bültenden Ayrıl",
  robots: { index: false, follow: false },
}

/**
 * Bülten satırının jetonuyla ayrılma (/{ülke}/bulten/ayril?token=<unsubscribe_token>).
 * gobit'in pazarlama e-postaları /abonelik-iptal'e gelir; bu adres bülten
 * listesinin kendi jetonu için kalır. Ayrılma bir düğmeyle onaylanır:
 * bağlantıyı önceden açan e-posta tarayıcıları kişiyi listeden düşürmesin.
 */
export default async function NewsletterUnsubscribePage(props: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const { token } = await props.searchParams
  const value = Array.isArray(token) ? token[0] : token

  return (
    <div className="content-container py-24 flex flex-col items-center text-center max-w-md mx-auto">
      <UnsubscribeForm kind="newsletter" token={value ?? ""} />
    </div>
  )
}
