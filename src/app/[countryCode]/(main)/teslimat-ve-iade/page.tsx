import { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("deliveryReturnsTitle"),
    description: t("deliveryReturnsDescription"),
  }
}

export default async function TeslimatIadePage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Teslimat ve İade
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            Siparişleri hızlıca işleme alıyoruz. İadeler, teslim tarihinden itibaren 14 gün içinde kabul edilir.
          </p>
          <p>
            <strong>DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</strong> tarafından yönetilmektedir.
          </p>
          <p>
            Detaylı koşulları görüntülemek için lütfen Türkçe diline geçin.
          </p>
          <div className="pt-8">
            <LocalizedClientLink href="/" className="text-brand-600 hover:underline font-semibold">
              &larr; Ana Sayfaya Dön
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-2">
        Teslimat ve İade Koşulları
      </h1>
      <p className="text-ui-fg-muted mb-8 text-sm">Kargo Süreçleri ve İade Hakkı Bilgilendirmesi</p>

      <div className="text-ui-fg-subtle space-y-6 text-sm sm:text-base leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">1. Teslimat Süreçleri</h2>
          <p className="mb-2">
            Siparişleriniz onaylandıktan sonra en geç <strong>1-3 iş günü</strong> içinde hazırlanarak anlaşmalı kargo firmamıza teslim edilir. Özel kampanya veya mücbir sebep durumlarında bu süre değişiklik gösterebilir.
          </p>
          <p>
            Kargoya teslim edilen siparişlerin takibi için sisteme kayıtlı e-posta adresinize bir kargo takip bağlantısı gönderilmektedir. Ayrıca hesabınız üzerinden sipariş geçmişinizi ziyaret ederek de kargo durumunuzu kontrol edebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">2. Sipariş İptali</h2>
          <p>
            Kargoya henüz teslim edilmemiş olan siparişlerinizi tamamen veya kısmen iptal edebilirsiniz. İptal talebinizi <strong>bilgi@girisimciturk.com</strong> e-posta adresi üzerinden sipariş numaranızla birlikte bize iletmeniz yeterlidir. İptal edilen siparişlerin iadesi 1-3 iş günü içerisinde ödeme yaptığınız karta aktarılacaktır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">3. İade Koşulları (Cayma Hakkı)</h2>
          <p className="mb-3">
            Tüketici Kanunu gereği, satın aldığınız ürünleri teslim aldığınız tarihten itibaren <strong>14 gün</strong> içerisinde hiçbir gerekçe göstermeksizin iade edebilirsiniz. İade sürecinin sorunsuz tamamlanabilmesi için aşağıdaki kurallara dikkat edilmesi gerekmektedir:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>İade edilecek ürünün orijinal kutusu, ambalajı ve aksesuarları eksiksiz ve hasarsız olmalıdır.</li>
            <li>Kullanılmış, hijyenik yapısı bozulmuş veya tahrip olmuş ürünlerin iadesi kabul edilmemektedir.</li>
            <li>İade gönderimi anlaşmalı kargo firmamız üzerinden yapıldığında kargo ücreti tarafımıza aittir. Diğer kargo firmaları ile gönderilen iadelerin kargo ücreti göndericiye aittir.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">4. Hasarlı Ürün Teslimatı</h2>
          <p>
            Kargo paketini teslim alırken kontrol etmenizi önemle rica ederiz. Eğer pakette veya üründe dışarıdan görünen bir hasar mevcut ise, kargo görevlisine <strong>Hasar Tespit Tutanağı</strong> hazırlatmalı ve paketi teslim almadan geri göndermelisiniz. Hasarlı paket teslim alındığında kargo firmasının sorumluluğu sona ermektedir.
          </p>
        </section>

        <div className="pt-8 border-t">
          <LocalizedClientLink href="/" className="text-brand-600 hover:underline font-semibold">
            &larr; Ana Sayfaya Dön
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
