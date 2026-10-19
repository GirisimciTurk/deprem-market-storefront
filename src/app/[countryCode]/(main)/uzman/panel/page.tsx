import { Metadata } from "next"
import { redirect } from "next/navigation"
import { retrieveExpertAccount } from "@lib/data/expert-auth"
import { getExpertInbox, getMyExpert, listMyExpertReviews } from "@lib/data/my-expert"
import ExpertAccountBar from "@modules/experts/components/auth/account-bar"
import MyExpertProfile from "@modules/experts/components/my-profile"
import ExpertInbox from "@modules/experts/components/my-profile/inbox"
import MyReviews from "@modules/experts/components/my-profile/my-reviews"

export const metadata: Metadata = {
  title: "Uzman Paneli",
  description: "Uzman dizinindeki kartınızı düzenleyin, yayınlayın; gelen talepleri ve değerlendirmeleri yönetin.",
  robots: { index: false },
}

export const dynamic = "force-dynamic"

/** Uzman hesabının paneli; müşteri hesabından ayrıdır, oturum yoksa Uzman Girişi'ne gider. */
export default async function ExpertPanelPage(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
  const account = await retrieveExpertAccount().catch(() => null)
  if (!account) redirect(`/${countryCode}/uzman/giris?redirect=${encodeURIComponent(`/${countryCode}/uzman/panel`)}`)

  const card = await getMyExpert()
  const [inbox, reviews] = card
    ? await Promise.all([getExpertInbox(), listMyExpertReviews()])
    : [{ items: [], new: 0 }, []]

  return (
    <div className="content-container max-w-5xl py-10 small:py-14 space-y-6">
      <ExpertAccountBar email={account.email} />
      <div className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-ui-fg-base">Uzman Paneli</h1>
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

      <MyExpertProfile initial={card} defaults={{ name: "", email: account.email }}>
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
