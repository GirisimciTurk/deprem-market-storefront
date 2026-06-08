import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { listBlogPosts } from "@lib/data/blog"

export async function generateMetadata(props: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const params = await props.params
  const isTr = params.countryCode === "tr"
  return {
    title: isTr ? "Deprem Hazırlık Rehberi | Deprem Market" : "Earthquake Preparedness Guides | Emergency Store",
    description: isTr
      ? "Deprem öncesi, anı ve sonrasında yapılması gerekenler, deprem çantası hazırlama rehberi ve bilgilendirici makaleler."
      : "What to do before, during, and after an earthquake, survival kit guides, and informational articles.",
  }
}

export default async function BlogPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const isTr = countryCode === "tr"
  
  const posts = await listBlogPosts(countryCode)

  return (
    <div className="bg-ui-bg-subtle min-h-screen py-16">
      <div className="content-container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-wider text-orange-600 uppercase px-3 py-1 bg-orange-100 rounded-full dark:bg-orange-900/30 dark:text-orange-400">
            {isTr ? "FARKINDALIK VE HAZIRLIK" : "AWARENESS & PREPAREDNESS"}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-ui-fg-base mt-4 tracking-tight leading-none">
            {isTr ? "Deprem Hazırlık Rehberleri" : "Earthquake Preparation Guides"}
          </h1>
          <p className="text-lg text-ui-fg-subtle mt-4 leading-relaxed">
            {isTr
              ? "Afet bilinci edinmek ve acil durumlara eksiksiz hazırlanmak için uzman ekibimiz tarafından hazırlanan hayati rehberleri inceleyin."
              : "Read vital guides compiled by our experts to raise awareness and ensure you are fully prepared for emergency situations."}
          </p>
        </div>

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-ui-border-base p-8 shadow-sm">
            <p className="text-ui-fg-subtle">
              {isTr ? "Henüz rehber yazı eklenmedi." : "No guides added yet."}
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
                      {new Date(post.date).toLocaleDateString(isTr ? "tr-TR" : "en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span>•</span>
                    <span className="font-medium text-ui-fg-base">{post.author}</span>
                  </div>

                  <h2 className="text-xl font-bold text-ui-fg-base group-hover:text-orange-600 transition-colors duration-200 line-clamp-2 leading-snug">
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
                      className="inline-flex items-center text-sm font-semibold text-orange-600 hover:text-orange-700 gap-1 group/btn"
                    >
                      {isTr ? "Detayları Oku" : "Read Full Guide"}
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
