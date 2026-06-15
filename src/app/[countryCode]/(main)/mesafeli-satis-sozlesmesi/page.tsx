import { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("distanceSalesTitle"),
    description: t("distanceSalesDescription"),
  }
}

export default async function MesafeliSatisPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Distance Selling Agreement
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            This agreement applies to all international purchases on our storefront.
          </p>
          <p>
            Seller: <strong>DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</strong>.
          </p>
          <p>
            Please switch to Turkish to read the official regulatory terms.
          </p>
          <div className="pt-8">
            <LocalizedClientLink href="/" className="text-brand-600 hover:underline font-semibold">
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
        Mesafeli Satış Sözleşmesi
      </h1>
      <p className="text-ui-fg-muted mb-8 text-sm">Alışveriş ve Satış Sözleşmesi Şartları</p>

      <div className="text-ui-fg-subtle space-y-6 text-sm sm:text-base leading-relaxed">
        <section className="bg-ui-bg-subtle p-6 rounded-lg border border-ui-border-base mb-6 space-y-3">
          <h2 className="text-lg font-bold text-ui-fg-base">1. Taraflar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-bold text-ui-fg-base mb-1">SATICI</p>
              <p><strong>Unvan:</strong> DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</p>
              <p><strong>Adres:</strong> Karşıyaka Mah. 612 Cad. No:50, Gölbaşı/Ankara</p>
              <p><strong>Telefon:</strong> +90 850 241 70 00</p>
              <p><strong>E-posta:</strong> bilgi@girisimciturk.com</p>
            </div>
            <div>
              <p className="font-bold text-ui-fg-base mb-1">ALICI</p>
              <p>Sitemiz üzerinden sipariş formunu doldurarak ödeme gerçekleştiren gerçek veya tüzel kişidir.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">2. Sözleşmenin Konusu</h2>
          <p>
            Bu sözleşmenin konusu, ALICI&rsquo;nın SATICI&rsquo;ya ait e-ticaret web sitesi üzerinden elektronik ortamda siparişini verdiği, sözleşmede nitelikleri ve satış fiyatı belirtilen ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">3. Sipariş ve Ödeme Koşulları</h2>
          <p>
            Sözleşme konusu ürün/hizmetin fiyatı sitemizde yayınlandığı şekildedir. İlan edilen fiyatlar ve vaatler güncelleme yapılana ve değiştirilene kadar geçerlidir. Süreli olarak ilan edilen fiyatlar ise belirtilen süre sonuna kadar geçerlidir. Sipariş onaylandığında ürünlerin fiyatı, kargo ücreti ve vergiler dahil toplam tutar ALICI&rsquo;nın seçtiği ödeme aracından tahsil edilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">4. Teslimat Koşulları</h2>
          <p>
            Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak kaydıyla siparişte belirtilen ALICI adresine veya gösterdiği adresteki kişi/kuruluşa teslim edilir. Teslimat kargo firmaları aracılığıyla yapılmakta olup, aksi belirtilmedikçe kargo ücreti ALICI&rsquo;ya aittir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">5. Cayma Hakkı</h2>
          <p className="mb-2">
            ALICI; ürün teslim tarihinden itibaren <strong>14 (on dört) gün</strong> içinde hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkını kullanabilir. Cayma hakkının kullanılması için bu süre içinde SATICI&rsquo;ya yazılı bildirimde bulunulması (e-posta veya fiziksel posta yoluyla) ve ürünün kullanılmamış, ambalajının zarar görmemiş olması gerekmektedir.
          </p>
          <p>
            Cayma hakkı kullanıldığında, ürünün SATICI&rsquo;ya iade kargo ücreti, SATICI&rsquo;nın anlaşmalı kargo firmasıyla gönderilmesi durumunda SATICI&rsquo;ya aittir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">6. Yetkili Mahkeme</h2>
          <p>
            Bu sözleşmenin uygulanmasında, Gümrük ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri ile ALICI&rsquo;nın veya SATICI&rsquo;nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.
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
