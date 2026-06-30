import { listCategories } from "@lib/data/categories";
import { listCollections } from "@lib/data/collections";
import { Text, clx } from "@modules/common/components/ui";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Logo from "@modules/layout/components/logo";
import CookieConsentTrigger from "@modules/layout/components/cookie-consent-trigger";
import LocaleSwitcher from "@modules/layout/components/locale-switcher";
import TrustBadges from "@modules/layout/components/trust-badges";
import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  });
  const productCategories = await listCategories();
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-16">
          <div>
            <LocalizedClientLink
              href="/"
              className="hover:opacity-90 transition-opacity"
            >
              <Logo className="!h-20 sm:!h-24" />
            </LocalizedClientLink>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-4">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Kategoriler
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return;
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null;

                    return (
                      <li
                        className="flex flex-col gap-2 text-ui-fg-subtle txt-small"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-ui-fg-base",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="hover:text-ui-fg-base"
                                    href={`/categories/${child.handle}`}
                                    data-testid="category-link"
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
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
            {/* Legal Policies */}
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
                  <LocalizedClientLink href="/cerez-politikasi" className="hover:text-ui-fg-base">
                    Çerez Politikası
                  </LocalizedClientLink>
                </li>
                <li>
                  <CookieConsentTrigger />
                </li>
                <li>
                  <LocalizedClientLink href="/uzman-ol" className="hover:text-ui-fg-base">
                    Uzman Olun (Mühendis)
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/satici-ol" className="hover:text-ui-fg-base">
                    Bayi / Satıcı Olun
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/uzman-paketleri" className="hover:text-ui-fg-base">
                    Üyelik Paketleri
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/sikca-sorulan-sorular" className="hover:text-ui-fg-base">
                    Sıkça Sorulan Sorular
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/hakkimizda" className="hover:text-ui-fg-base">
                    Hakkımızda
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/iletisim" className="hover:text-ui-fg-base">
                    İletişim
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/bilgi-merkezi" className="hover:text-ui-fg-base">
                    Bilgi & Eğitim Merkezi
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/blog" className="hover:text-ui-fg-base">
                    Blog
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* EKYP Corporate Links */}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">EKYP Deprem Teknolojileri</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <a
                    href="https://girisimciturk.com/ekyp/deprem-teknolojileri/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    EKYP Hakkımızda
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
              © {new Date().getFullYear()} EKYP Deprem Market. Tüm hakları saklıdır.
            </Text>
            <span className="text-xs text-ui-fg-subtle">
              Bu e-ticaret sitesi bir <strong>DEV YAPIMCILIK YAYINCILIK SAN. TİC. LTD. ŞTİ.</strong> iştirakidir.
            </span>
          </div>
          <div className="w-full md:w-auto">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
