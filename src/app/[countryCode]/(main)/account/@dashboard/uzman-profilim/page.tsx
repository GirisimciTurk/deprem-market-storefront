import { Metadata } from "next"

import { retrieveCustomer } from "@lib/data/customer"
import { getExpertInbox, getMyExpert, listMyExpertReviews } from "@lib/data/my-expert"
import MyExpertProfile from "@modules/experts/components/my-profile"
import ExpertInbox from "@modules/experts/components/my-profile/inbox"
import MyReviews from "@modules/experts/components/my-profile/my-reviews"

export const metadata: Metadata = {
  title: "Uzman Profilim",
  description: "Uzman dizinindeki kartınızı düzenleyin, yayınlayın; gelen talepleri ve değerlendirmeleri yönetin.",
  robots: { index: false },
}

export default async function MyExpertProfilePage() {
  const [card, customer] = await Promise.all([getMyExpert(), retrieveCustomer().catch(() => null)])
  const [inbox, reviews] = card
    ? await Promise.all([getExpertInbox(), listMyExpertReviews()])
    : [{ items: [], new: 0 }, []]
  const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ")

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-ui-fg-base">Uzman Profilim</h1>
        <p className="mt-1 max-w-2xl text-xs text-ui-fg-muted">
          {card
            ? "Ziyaretçiler sizi bu bilgilerle bulur ve size doğrudan ulaşır. Yayınladığınız kart otomatik olarak kontrol edilir; uygun bulunan kart hemen dizine girer."
            : "İnşaat mühendisi olarak dizinde yer almak için profilinizi doldurun ve yayınlayın. Ücretsizdir; kartınız otomatik olarak kontrol edilir."}
        </p>
        {inbox.new > 0 && (
          <a href="#talepler" className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:underline">
            {inbox.new} yeni talebiniz var →
          </a>
        )}
      </div>

      <MyExpertProfile initial={card} defaults={{ name, email: customer?.email ?? "" }}>
        {card && (
          <>
            <ExpertInbox initial={inbox.items} />
            <MyReviews initial={reviews} />
          </>
        )}
      </MyExpertProfile>
    </div>
  )
}
