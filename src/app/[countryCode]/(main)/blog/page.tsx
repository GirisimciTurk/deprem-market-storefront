import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { listBlogCategories, listBlogPosts } from "@lib/data/blog"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(_props: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const t = await getTranslations("blog")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

export default async function BlogPage(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ kategori?: string | string[] }>
}) {
  const params = await props.params
  const { countryCode } = params
  const { kategori } = await props.searchParams
  const t = await getTranslations("blog")

  const categories = await listBlogCategories()
  const wanted = (Array.isArray(kategori) ? kategori[0] : kategori)?.trim() || ""
  // Bilinmeyen kategori süzgeci tüm yazılara düşer.
  const active = categories.some((c) => c.category === wanted) ? wanted : ""
  const posts = await listBlogPosts(countryCode, active || undefined)
  const chip = (on: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
      on
        ? "bg-brand-600 border-brand-600 text-white"
        : "bg-white border-ui-border-base text-ui-fg-subtle hover:border-brand-500 hover:text-brand-600"
    }`

  return (
    <div className="bg-ui-bg-subtle min-h-screen py-16">
      <div className="content-container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-wider text-brand-600 uppercase px-3 py-1 bg-brand-100 rounded-full dark:bg-brand-900/30 dark:text-brand-400">
            {t("eyebrow")}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-ui-fg-base mt-4 tracking-tight leading-none">
            {t("heading")}
          </h1>
          <p className="text-lg text-ui-fg-subtle mt-4 leading-relaxed">
            {t("intro")}
          </p>
        </div>

        {/* Kategori süzgeci */}
        {categories.length > 0 && (
          <nav aria-label={t("categoriesLabel")} className="flex flex-wrap justify-center gap-2 mb-10">
            <Link href={`/${countryCode}/blog`} className={chip(!active)} aria-current={!active ? "page" : undefined}>
              {t("allCategories")}
            </Link>
            {categories.map((c) => (
              <Link
                key={c.category}
                href={`/${countryCode}/blog?kategori=${encodeURIComponent(c.category)}`}
                className={chip(active === c.category)}
                aria-current={active === c.category ? "page" : undefined}
              >
                {c.category} <span className="opacity-70">({c.posts})</span>
              </Link>
            ))}
          </nav>
        )}

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-ui-border-base p-8 shadow-sm">
            <p className="text-ui-fg-subtle">
              {t("empty")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-ui-border-base transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Post Cover Image */}
                {post.image && (
                  <div className="relative aspect-video w-full overflow-hidden bg-ui-bg-subtle">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}

                {/* Post Info */}
                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-x-3 text-xs text-ui-fg-subtle mb-3">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString(t("dateLocale"), {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span>•</span>
                    <span className="font-medium text-ui-fg-base">{post.author}</span>
                    {post.category && (
                      <>
                        <span>•</span>
                        <Link
                          href={`/${countryCode}/blog?kategori=${encodeURIComponent(post.category)}`}
                          className="text-brand-600 hover:underline"
                        >
                          {post.category}
                        </Link>
                      </>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-ui-fg-base group-hover:text-brand-600 transition-colors duration-200 line-clamp-2 leading-snug">
                    <Link href={`/${countryCode}/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-sm text-ui-fg-subtle mt-3 line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>

                  <div className="mt-auto pt-6 border-t border-ui-border-base flex items-center justify-between">
                    <Link
                      href={`/${countryCode}/blog/${post.slug}`}
                      className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 gap-1 group/btn"
                    >
                      {t("readMore")}
                      <span className="transition-transform duration-200 group-hover/btn:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
