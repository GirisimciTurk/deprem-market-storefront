import { Metadata } from "next"
import Image from "next/image"
import { getLocale } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listBlogPosts, type BlogPost } from "@lib/data/blog"
import {
  Sparkles,
  Newspaper,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Bilgi & Eğitim Merkezi — Deprem Hazırlığı Rehberleri | depremTek Market",
  description:
    "Deprem öncesi hazırlık, aile afet planı, çanta hazırlama ve bina güvenliği üzerine doğrulanmış rehberler, eğitim içerikleri ve uzman önerileri.",
}

const QUICK_LINKS = [
  {
    href: "/hazirlik-asistani",
    icon: Sparkles,
    title: "Hazırlık Asistanı",
    desc: "Eve ve aileye özel kişisel deprem hazırlık planı oluşturun.",
  },
  {
    href: "/blog",
    icon: Newspaper,
    title: "Tüm Rehberler",
    desc: "Deprem güvenliği üzerine tüm yazı ve rehberlere göz atın.",
  },
  {
    href: "/uzmanlar",
    icon: ShieldCheck,
    title: "Uzman & Uygulayıcı Dizini",
    desc: "Doğrulanmış mühendis ve uygulayıcılara ulaşın.",
  },
  {
    href: "/sikca-sorulan-sorular",
    icon: HelpCircle,
    title: "Sıkça Sorulan Sorular",
    desc: "Alışveriş, uzman olmak ve uygulayıcılık hakkında yanıtlar.",
  },
]

export default async function BilgiMerkeziPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const isTr = (await getLocale()) === "tr"
  const posts = await listBlogPosts(countryCode)

  // Kategoriye göre grupla (blog modülünün category alanı üstüne).
  const byCategory = new Map<string, BlogPost[]>()
  for (const p of posts) {
    const c = (p.category || "Genel").trim() || "Genel"
    if (!byCategory.has(c)) byCategory.set(c, [])
    byCategory.get(c)!.push(p)
  }
  const categories = Array.from(byCategory.entries())
  const featured = posts.slice(0, 1)[0]

  return (
    <div className="bg-ui-bg-subtle min-h-screen">
      {/* Hero */}
      <div className="content-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold tracking-wider text-orange-600 uppercase px-3 py-1 bg-orange-100 rounded-full">
            {isTr ? "Bilgilen · Hazırlan · Koru" : "Learn · Prepare · Protect"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ui-fg-base mt-4 tracking-tight">
            {isTr ? "Bilgi & Eğitim Merkezi" : "Knowledge & Education Center"}
          </h1>
          <p className="text-base text-ui-fg-subtle mt-3 leading-relaxed">
            {isTr
              ? "Deprem öncesi hazırlıktan bina güvenliğine kadar; doğru, anlaşılır ve uygulanabilir bilgiler tek yerde."
              : "From pre-earthquake preparation to building safety — accurate, clear, actionable knowledge in one place."}
          </p>
        </div>
      </div>

      <div className="content-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
        {/* Hızlı erişim */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map((q) => {
            const Icon = q.icon
            return (
              <LocalizedClientLink
                key={q.href}
                href={q.href}
                className="group block bg-white rounded-2xl border border-ui-border-base p-5 hover:border-brand-400 hover:shadow-md transition-all"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600 mb-3">
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-ui-fg-base text-sm group-hover:text-brand-700 transition-colors">
                  {q.title}
                </h3>
                <p className="text-xs text-ui-fg-muted mt-1 leading-relaxed">{q.desc}</p>
              </LocalizedClientLink>
            )
          })}
        </div>

        {/* Öne çıkan rehber */}
        {featured && (
          <LocalizedClientLink
            href={`/blog/${featured.slug}`}
            className="group grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-2xl border border-ui-border-base overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="relative aspect-video md:aspect-auto md:min-h-[240px] bg-ui-bg-subtle">
              {featured.image ? (
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-brand-200">
                  <Newspaper className="w-16 h-16" />
                </div>
              )}
            </div>
            <div className="p-6 sm:p-8 flex flex-col justify-center">
              <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">
                {isTr ? "Öne Çıkan Rehber" : "Featured Guide"}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-ui-fg-base group-hover:text-brand-700 transition-colors">
                {featured.title}
              </h2>
              <p className="text-sm text-ui-fg-subtle mt-2 leading-relaxed line-clamp-3">
                {featured.description}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 mt-4">
                {isTr ? "Okumaya başla" : "Start reading"}{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </LocalizedClientLink>
        )}

        {/* Kategorilere göre */}
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-ui-border-base">
            <p className="text-ui-fg-subtle">
              {isTr
                ? "Eğitim içerikleri çok yakında burada olacak."
                : "Educational content will be here soon."}
            </p>
          </div>
        ) : (
          categories.map(([category, items]) => (
            <section key={category}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-ui-fg-base">{category}</h2>
                <LocalizedClientLink
                  href="/blog"
                  className="text-sm font-semibold text-brand-600 hover:underline inline-flex items-center gap-1"
                >
                  {isTr ? "Tümü" : "All"} <ArrowRight className="w-3.5 h-3.5" />
                </LocalizedClientLink>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.slice(0, 3).map((post) => (
                  <LocalizedClientLink
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-ui-border-base hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    {post.image && (
                      <div className="relative aspect-video w-full overflow-hidden bg-ui-bg-subtle">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-ui-fg-base text-sm group-hover:text-brand-700 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-ui-fg-muted mt-2 leading-relaxed line-clamp-3 flex-1">
                        {post.description}
                      </p>
                      {post.author && (
                        <span className="text-[0.7rem] text-ui-fg-muted mt-3">
                          {post.author}
                        </span>
                      )}
                    </div>
                  </LocalizedClientLink>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
