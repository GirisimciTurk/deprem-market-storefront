import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Çerez Politikası | EKYP Deprem Market",
  description: "Web sitemizde kullanılan çerezler ve gizlilik tercihlerinize ilişkin bilgiler.",
}

export default async function CerezPolitikasiPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const isTr = countryCode === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Cookie Policy
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            This website uses cookies to improve your user experience and gather statistics.
            By using this website, you consent to the use of cookies in accordance with this policy.
          </p>
          <p>
            Managed by <strong>DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</strong>.
          </p>
          <p>
            Please switch to Turkish to read the detailed policy under KVKK compliance.
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
      <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-2">
        Çerez Politikası
      </h1>
      <p className="text-ui-fg-muted mb-8 text-sm">Çerez Kullanım Bilgilendirmesi</p>

      <div className="text-ui-fg-subtle space-y-6 text-sm sm:text-base leading-relaxed">
        <section>
          <p>
            Bu Çerez Politikası, <strong>DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</strong> (&ldquo;EKYP Deprem Market&rdquo; veya &ldquo;Şirket&rdquo;) tarafından işletilen e-ticaret platformumuzda kullanılan çerezlerin (cookies) türlerini, amaçlarını ve çerez tercihlerinizi nasıl yönetebileceğinizi açıklamaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">Çerez (Cookie) Nedir?</h2>
          <p>
            Çerezler, bir web sitesini ziyaret ettiğinizde bilgisayarınıza veya mobil cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler, web sitesinin daha verimli çalışmasını sağlamak, kişiselleştirilmiş sayfalar sunmak ve kullanıcı deneyimini iyileştirmek amacıyla yaygın olarak kullanılmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">Kullanılan Çerez Türleri ve Amaçları</h2>
          <div className="space-y-4">
            <div className="border border-ui-border-base p-4 rounded-md bg-ui-bg-subtle">
              <h3 className="font-bold text-ui-fg-base text-sm mb-1">1. Zorunlu / Teknik Çerezler</h3>
              <p className="text-sm">
                Web sitemizin düzgün çalışması, güvenliğinin sağlanması ve alışveriş sepeti, üye girişi gibi temel işlevlerin yerine getirilmesi için kesinlikle gereklidir. Bu çerezler engellenemez.
              </p>
            </div>
            
            <div className="border border-ui-border-base p-4 rounded-md bg-ui-bg-subtle">
              <h3 className="font-bold text-ui-fg-base text-sm mb-1">2. Performans ve Analitik Çerezler</h3>
              <p className="text-sm">
                Ziyaretçi sayılarını ve trafik kaynaklarını belirlememize yardımcı olur. Böylece sitemizin performansını ölçebilir ve iyileştirebiliriz. Sitemizdeki en popüler ve en az popüler sayfaların hangileri olduğunu öğrenmemize katkıda bulunurlar.
              </p>
            </div>

            <div className="border border-ui-border-base p-4 rounded-md bg-ui-bg-subtle">
              <h3 className="font-bold text-ui-fg-base text-sm mb-1">3. İşlevsellik Çerezleri</h3>
              <p className="text-sm">
                Sitemizi ziyaret ettiğinizde tercih ettiğiniz dil, bölge seçimi gibi ayarlarınızı hatırlayarak size daha özelleştirilmiş ve kolay bir kullanıcı deneyimi sunmak amacıyla kullanılır.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">Çerezleri Nasıl Kontrol Edebilirsiniz?</h2>
          <p className="mb-3">
            Çerezlerin kullanılması web sitemizin daha iyi hizmet vermesini sağlamakla birlikte, isterseniz çerezlerin kullanımını engelleyebilirsiniz. Ancak çerezleri engellemeniz halinde web sitemizin tüm fonksiyonlarından tam olarak yararlanamayabileceğinizi hatırlatmak isteriz.
          </p>
          <p>
            Çerezleri kontrol etmek veya silmek için tarayıcınızın ayarlarını kullanabilirsiniz. Tarayıcı üreticileri kendi ürünlerinde çerez yönetimine ilişkin yardım sayfaları sunmaktadır:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Google Chrome</li>
            <li>Mozilla Firefox</li>
            <li>Safari</li>
            <li>Microsoft Edge</li>
          </ul>
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
