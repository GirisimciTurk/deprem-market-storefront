import { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata")
  return {
    title: t("kvkkTitle"),
    description: t("kvkkDescription"),
  }
}

export default async function KVKKPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const isTr = (await getLocale()) === "tr"

  if (!isTr) {
    return (
      <div className="content-container max-w-4xl py-16 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ui-fg-base tracking-tight mb-8">
          Personal Data Protection Law (KVKK) Disclosure Text
        </h1>
        <div className="prose prose-slate max-w-none text-ui-fg-subtle space-y-6">
          <p>
            This website is managed by <strong>DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</strong> (the &ldquo;Company&rdquo;), acting as the Data Controller in accordance with the Law on Protection of Personal Data No. 6698 (KVKK).
          </p>
          <p>
            For any inquiries regarding your personal data under the KVKK, please contact us at:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Email:</strong> bilgi@girisimciturk.com</li>
            <li><strong>Phone:</strong> +90 850 241 70 00</li>
            <li><strong>Address:</strong> Karşıyaka Mahallesi 612 Cadde No:50, 06830 Gölbaşı/Ankara, Turkey</li>
          </ul>
          <p>
            Turkish citizens and residents can request the full Turkish version of the KVKK Disclosure Text by changing the language selector to Turkish.
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
        Kişisel Verilerin Korunması Kanunu (KVKK)
      </h1>
      <p className="text-ui-fg-muted mb-8 text-sm">Aydınlatma Metni ve Veri Politikası</p>
      
      <div className="text-ui-fg-subtle space-y-6 text-sm sm:text-base leading-relaxed">
        <section className="bg-ui-bg-subtle p-6 rounded-lg border border-ui-border-base mb-6">
          <h2 className="text-lg font-bold text-ui-fg-base mb-3">Veri Sorumlusu Kimliği</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla <strong>DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</strong> (&ldquo;EKYP Deprem Market&rdquo; veya &ldquo;Şirket&rdquo;) tarafından aşağıda açıklanan kapsamda işlenebilecektir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">1. Kişisel Verilerinizin İşlenme Amacı</h2>
          <p className="mb-3">
            Toplanan kişisel verileriniz, Kanun&rsquo;da öngörülen temel ilkelere uygun olarak ve Kanun&rsquo;un 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları dahilinde, Şirketimiz tarafından sunulan ürün ve hizmetlerden sizleri faydalandırmak için gerekli çalışmaların iş birimlerimiz tarafından yapılması ve ilgili iş süreçlerinin yürütülmesi amaçlarıyla işlenmektedir:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>E-ticaret platformumuz üzerinden siparişlerin oluşturulması, faturalandırılması ve gönderimi,</li>
            <li>Müşteri ilişkileri yönetimi süreçlerinin planlanması ve icrası,</li>
            <li>Sözleşme süreçlerinin takibi, hukuki işlemlerin tesisi ve takibi,</li>
            <li>Bilgi güvenliği süreçlerinin planlanması, denetlenmesi ve icrası,</li>
            <li>Müşteri talep ve şikayetlerinin takibi ve sonuçlandırılması,</li>
            <li>Platformda paylaşılan yorum, fotoğraf ve ürün ilanlarının; uygunsuz, yanıltıcı veya hukuka aykırı içeriklerden arındırılması amacıyla yapay zekâ destekli otomatik sistemlerle moderasyondan geçirilmesi.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">2. İşlenen Kişisel Verilerin Aktarıldığı Taraflar ve Aktarım Amacı</h2>
          <p>
            Elde edilen kişisel verileriniz; yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda, iş ortaklarımıza, tedarikçilerimize (kargo/lojistik firmaları, ödeme altyapısı sağlayıcıları, bulut ve yapay zekâ hizmeti sağlayıcıları vb.), kanunen yetkili kamu kurumlarına ve özel kişilere, KVKK&rsquo;nın 8. ve 9. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları çerçevesinde aktarılabilecektir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">2.1. Yapay Zekâ Destekli Otomatik Moderasyon ve Yurt Dışı Aktarım</h2>
          <p className="mb-3">
            Platform güvenliğini ve içerik kalitesini sağlamak amacıyla; tarafınızca paylaşılan ürün
            yorumları, yüklediğiniz fotoğraflar ve (satıcıysanız) ürün ilanlarınız, uygunsuz, yanıltıcı,
            hukuka aykırı veya spam içerikleri tespit etmek için yapay zekâ destekli otomatik
            değerlendirme sistemlerinden geçirilebilmektedir.
          </p>
          <p className="mb-3">
            Bu otomatik moderasyon, hizmet sağlayıcımız <strong>Google LLC (Gemini API)</strong> aracılığıyla
            gerçekleştirilmektedir. Bu kapsamda ilgili içerikler (yorum metni, görseller ve ilan bilgileri),
            değerlendirme amacıyla yurt dışında bulunan sunuculara aktarılabilmektedir. Söz konusu aktarım,
            KVKK&rsquo;nın 9. maddesinde öngörülen şartlar çerçevesinde yapılır. Otomatik değerlendirme
            yalnızca içerik uygunluğunun kontrolüne yöneliktir; nihai kararlarda gerektiğinde insan denetimi
            uygulanır ve Kanun&rsquo;un 11. maddesi kapsamındaki haklarınız saklıdır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">3. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h2>
          <p>
            Kişisel verileriniz, Şirketimiz tarafından e-ticaret web sitemiz, mobil uygulamamız, çağrı merkezimiz veya e-posta gibi elektronik ortamlar vasıtasıyla toplanmaktadır. Söz konusu kişisel verileriniz; bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması, Şirketimizin hukuki yükümlülüğünü yerine getirebilmesi ve sizlerin temel hak ve özgürlüklerine zarar vermemek kaydıyla Şirketimizin meşru menfaatleri için veri işlenmesinin zorunlu olması hukuki sebeplerine dayanılarak işlenmektedir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ui-fg-base mb-3 border-b pb-2">4. Kişisel Veri Sahibinin Kanun&rsquo;un 11. Maddesinde Sayılan Hakları</h2>
          <p className="mb-3">
            Kişisel veri sahibi olarak Kanun&rsquo;un 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</li>
            <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme,</li>
            <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
            <li>Kanun&rsquo;un 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme,</li>
            <li>Kişisel verilerinizin düzeltilmesi, silinmesi veya yok edilmesi taleplerinin, verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
            <li>İşlenen verilerinizin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
            <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
          </ul>
          <p className="mt-3">
            Bu haklarınıza ilişkin başvurularınızı yazılı olarak veya kayıtlı elektronik posta (KEP) adresi, güvenli elektronik imza vasıtasıyla Şirketimizin <strong>bilgi@girisimciturk.com</strong> e-posta adresine iletebilirsiniz. Başvurunuz en geç 30 gün içinde sonuçlandırılacaktır.
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
