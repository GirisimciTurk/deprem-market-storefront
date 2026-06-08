import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Gizlilik ve Güvenlik Politikası | EKYP Deprem Market",
  description: "Müşteri gizliliği ve veri güvenliği standartlarımıza ilişkin bilgiler.",
}

export default async function GizlilikGuvenlikPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const isTr = countryCode === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Privacy and Security Policy
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            Your security is our top priority. We use SSL encryption and industry-standard payment gateways.
          </p>
          <p>
            Managed by <strong>DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</strong>.
          </p>
          <p>
            Please switch to Turkish to read the detailed policy.
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
        Gizlilik ve Güvenlik Politikası
      </h1>
      <p className="text-ui-fg-muted mb-8 text-sm">Veri Güvenliği ve Alışveriş Güvencesi</p>

      <div className="text-ui-fg-subtle space-y-6 text-sm sm:text-base leading-relaxed">
        <section>
          <p>
            <strong>EKYP Deprem Market</strong> (DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.) olarak, müşterilerimizin kişisel bilgilerinin gizliliği ve güvenliği bizler için en üst düzeyde önem taşımaktadır. Bu politika, sitemizi ziyaret ederken ve alışveriş yaparken verilerinizin nasıl korunduğunu açıklamaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">Kredi Kartı ve Ödeme Güvenliği</h2>
          <p className="mb-3">
            Sitemiz üzerinden gerçekleştirdiğiniz tüm sipariş ve ödeme işlemleri, veri kaybını ve yetkisiz erişimi engellemek amacıyla endüstri standardı olan <strong>SSL (Secure Sockets Layer)</strong> şifreleme teknolojisiyle korunmaktadır.
          </p>
          <p>
            Ödeme esnasında girdiğiniz kredi/banka kartı bilgileri kesinlikle tarafımızca kaydedilmemekte, depolanmamakta ve sunucularımızda barındırılmamaktadır. Kart verileri, doğrudan bankacılık sistemine (BDDK lisanslı ödeme aracı kurumları vasıtasıyla) kriptolu protokollerle iletilerek işleminiz güvenli bir şekilde sonuçlandırılmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">Bilgi Güvenliği Tedbirlerimiz</h2>
          <p>
            Şirketimiz, kişisel verilerinizin gizliliğini, bütünlüğünü ve güvenliğini sağlamak için gerekli tüm teknik ve idari güvenlik önlemlerini (erişim yetkilendirmesi, düzenli sızma testleri, güncel güvenlik duvarları ve yazılım güncellemeleri) uygulamaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">Üyelik ve Hesap Güvenliği</h2>
          <p>
            Hesap oluştururken belirlemiş olduğunuz şifrelerin güvenliği kullanıcının kendi sorumluluğundadır. Güçlü ve benzersiz bir şifre seçmenizi ve hesap bilgilerinizi üçüncü şahıslarla paylaşmamanızı önemle rica ederiz. Herhangi bir güvenlik ihlali şüphenizde bizimle iletişime geçmeniz gerekmektedir.
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
