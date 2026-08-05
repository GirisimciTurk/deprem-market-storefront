import { listCategories } from "@lib/data/categories";
import { listCollections } from "@lib/data/collections";
import { Text, clx } from "@modules/common/components/ui";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Logo from "@modules/layout/components/logo";
import CookieConsentTrigger from "@modules/layout/components/cookie-consent-trigger";
import LocaleSwitcher from "@modules/layout/components/locale-switcher";
import TrustBadges from "@modules/layout/components/trust-badges";
import NewsletterSignup from "@modules/layout/components/newsletter-signup";
import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  });
  const productCategories = await listCategories();
  const t = await getTranslations("footer");

  // Footer'da en fazla 5 bağlantı: yalnız üst düzey kategoriler, alt kategoriler yok.
  // listCategories düz liste döndürür (alt kategoriler dahil), o yüzden ÖNCE süzüp
  // SONRA kesiyoruz — tersi, ilk 5'in çoğu alt kategori olduğunda neredeyse hiçbir
  // kategori kalmamasına yol açıyordu.
  //
  // Bağlantılar `/categories/<handle>` DEĞİL `/store?categoryId=<id>`: eski hedef
  // ayrı bir şablon (CategoryTemplate) açıyordu — sol panelde kategori ağacı yok,
  // farklı başlık/breadcrumb düzeni. Artık mağazanın kendi sol kategori menüsünden
  // seçim yapılmış gibi davranıyor (kategori seçili gelir, diğer filtreler yerinde).
  // /kategoriler indeks sayfası da aynı formatı kullanıyor.
  const footerCategories = (productCategories ?? [])
    .filter((c) => !c.parent_category)
    .slice(0, 5);

  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">
        <div className="pt-12">
          <NewsletterSignup />
        </div>
        <div className="flex flex-col gap-y-6 xsmall:flex-row xsmall:gap-x-12 md:gap-x-24 items-start justify-between py-16">
          <div>
            <LocalizedClientLink
              href="/"
              className="hover:opacity-90 transition-opacity"
            >
              <Logo className="!h-12 sm:!h-14" />
            </LocalizedClientLink>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-4">
            {footerCategories.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Kategoriler
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {footerCategories.map((c) => (
                    <li
                      className="flex flex-col gap-2 text-ui-fg-subtle txt-small"
                      key={c.id}
                    >
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base"
                        href={`/store?categoryId=${c.id}`}
                        data-testid="category-link"
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Koleksiyonlar
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Legal Policies — en fazla 5 bağlantı. Çerez politikası/tercihleri
                alt yasal banda taşındı; kalanlar (SSS, Blog, Bilgi Merkezi,
                Uzman/Bayi Olun, Üyelik Paketleri) yalnız header/sayfa içinden erişilir. */}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Destek & Bilgi</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <LocalizedClientLink href="/siparis-takip" className="hover:text-ui-fg-base font-semibold text-brand-600">
                    Sipariş Takip & Kargo
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/mesafeli-satis-sozlesmesi" className="hover:text-ui-fg-base">
                    Mesafeli Satış Sözleşmesi
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/teslimat-ve-iade" className="hover:text-ui-fg-base">
                    İptal ve İade Şartları
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/gizlilik-ve-guvenlik" className="hover:text-ui-fg-base">
                    Gizlilik ve Güvenlik
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/iletisim" className="hover:text-ui-fg-base">
                    İletişim
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Corporate Links */}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Deprem Teknolojileri</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <a
                    href="https://girisimciturk.com/ekyp/deprem-teknolojileri/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    Hakkımızda
                  </a>
                </li>
                <li>
                  <a
                    href="https://girisimciturk.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    Girişimci Türk
                  </a>
                </li>
                <li>
                  <a
                    href="https://girisimciturk.com/iletisim/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    İletişim
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Ödeme & güven bandı (kart logoları + SSL + ETBİS) */}
        <TrustBadges />
        <div className="flex flex-col gap-y-4 md:flex-row w-full mb-8 justify-between items-center text-ui-fg-muted border-t border-ui-border-base pt-6">
          <div className="flex flex-col gap-y-1">
            <Text className="txt-compact-small">
              © {new Date().getFullYear()} depremTek Market. Tüm hakları saklıdır.
            </Text>
            <span className="text-xs text-ui-fg-subtle">
              Bu e-ticaret sitesi bir <strong>DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</strong> iştirakidir.
            </span>
            {/* Çerez bağlantıları burada: CookieConsentTrigger sitedeki TEK çerez
                tercihi giriş noktası, kolon 5'e indirilirken düşürülemezdi. */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ui-fg-subtle">
              {/* Hakkımızda burada: Destek kolonu beşe indirilirken düştü ve
                  /hakkimizda sitedeki TEK bağlantısını kaybetti (header, side-menu
                  ve category-drawer'da yok; "Deprem Teknolojileri" kolonundaki
                  Hakkımızda dış siteye gidiyor). Kolonu altıya çıkarmadan
                  erişilebilirliği geri veriyor. */}
              <LocalizedClientLink href="/hakkimizda" className="hover:text-ui-fg-base">
                Hakkımızda
              </LocalizedClientLink>
              <LocalizedClientLink href="/cerez-politikasi" className="hover:text-ui-fg-base">
                Çerez Politikası
              </LocalizedClientLink>
              <CookieConsentTrigger />
            </div>
          </div>
          <div className="w-full md:w-auto">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
