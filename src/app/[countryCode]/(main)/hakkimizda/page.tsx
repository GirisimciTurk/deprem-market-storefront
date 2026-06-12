import { Metadata } from "next"
import { getLocale } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Hakkımızda | EKYP Deprem Market",
  description: "EKYP Deprem Market olarak amacımız, afet öncesi ve sonrasında ailelerimizin ihtiyaç duyacağı her türlü güvenlik ekipmanını sağlamaktır.",
}

export default async function HakkimizdaPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          About Us
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            EKYP Disaster Technologies is dedicated to offering premium quality emergency kit systems and survival equipment to guarantee safety during and after critical seismic events.
          </p>
          <p>
            Managed by <strong>DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</strong>.
          </p>
          <div className="pt-8">
            <LocalizedClientLink href="/" className="text-rose-600 hover:underline font-semibold">
              &larr; Return to Home Page
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden mb-12 bg-gradient-to-r from-red-800 to-red-650 p-8 sm:p-12 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400 via-red-900 to-black"></div>
        <div className="relative z-10">
          <span className="text-amber-400 text-xs font-semibold tracking-wider uppercase bg-red-900/50 px-3 py-1 rounded-full border border-red-700/50">Biz Kimiz?</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-4 mb-2">
            EKYP Deprem Market
          </h1>
          <p className="text-red-100 text-sm sm:text-base max-w-xl">
            Güvenli yarınlar ve afet bilinci yüksek bir toplum için, deprem hazırlığında en güvenilir ortağınızız.
          </p>
        </div>
      </div>

      <div className="text-ui-fg-subtle space-y-8 text-sm sm:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">Misyonumuz</h2>
          <p>
            EKYP Deprem Market olarak, Türkiye'nin deprem kuşağında yer alan bir ülke olduğu gerçeğinden yola çıkarak, her hanenin ve iş yerinin deprem ile diğer doğal afetlere karşı hazırlıklı olmasını sağlamayı kendimize görev ediniyoruz. En kritik ilk 72 saatte hayatta kalmayı ve ihtiyaç duyulan malzemelere erişimi kolaylaştırmak için çalışıyoruz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">Neden EKYP?</h2>
          <p className="mb-4">
            Ürün yelpazemizde yer alan tüm acil durum malzemeleri, ilk yardım kitleri ve arama-kurtarma ekipmanları; kalite standartları yüksek, dayanıklı ve zorlu koşullarda test edilmiş malzemelerden seçilmektedir.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="border border-ui-border-base p-5 rounded-xl bg-ui-bg-subtle hover:shadow-md transition-shadow">
              <span className="text-2xl mb-2 block">🛡️</span>
              <h3 className="font-bold text-ui-fg-base text-sm mb-1">Premium Kalite</h3>
              <p className="text-xs text-ui-fg-muted">
                Afet anında yarı yolda bırakmayacak, dayanıklılığı yüksek profesyonel ekipmanlar.
              </p>
            </div>
            <div className="border border-ui-border-base p-5 rounded-xl bg-ui-bg-subtle hover:shadow-md transition-shadow">
              <span className="text-2xl mb-2 block">📦</span>
              <h3 className="font-bold text-ui-fg-base text-sm mb-1">Eksiksiz Setler</h3>
              <p className="text-xs text-ui-fg-muted">
                Uzman ekipler tarafından planlanmış, ilk 72 saatlik tüm ihtiyaçları kapsayan zengin içerikli çantalar.
              </p>
            </div>
            <div className="border border-ui-border-base p-5 rounded-xl bg-ui-bg-subtle hover:shadow-md transition-shadow">
              <span className="text-2xl mb-2 block">🤝</span>
              <h3 className="font-bold text-ui-fg-base text-sm mb-1">Sosyal Sorumluluk</h3>
              <p className="text-xs text-ui-fg-muted">
                Toplumu afetler konusunda bilgilendirmeyi, bilinç düzeyini ve dayanıklılığı artırmayı hedefliyoruz.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">Şirket Bilgileri</h2>
          <p>
            EKYP Deprem Market, Türkiye'nin öncü e-ticaret platformlarından biri olarak <strong>DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</strong> iştiraki olarak faaliyetlerini yürütmektedir.
          </p>
        </section>

        <div className="pt-8 border-t">
          <LocalizedClientLink href="/" className="text-rose-600 hover:underline font-semibold">
            &larr; Ana Sayfaya Dön
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
