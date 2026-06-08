import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getBlogPost } from "@lib/data/blog"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"

import { HttpTypes } from "@medusajs/types"

export async function generateMetadata(props: {
  params: Promise<{ slug: string; countryCode: string }>
}): Promise<Metadata> {
  const params = await props.params
  const post = await getBlogPost(params.slug, params.countryCode)
  if (!post) return {}

  return {
    title: `${post.title} | Deprem Market`,
    description: post.description,
  }
}

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string; countryCode: string }>
}) {
  const params = await props.params
  const { slug, countryCode } = params
  const isTr = countryCode === "tr"

  const post = await getBlogPost(slug, countryCode)
  if (!post) {
    notFound()
  }

  const region = await getRegion(countryCode)
  
  // Fetch related products linked in markdown frontmatter
  let relatedProducts: HttpTypes.StoreProduct[] = []
  if (post.related_products && post.related_products.length > 0 && region) {
    try {
      const { response } = await listProducts({
        countryCode,
        queryParams: {
          handle: post.related_products,
        },
      })
      relatedProducts = response.products
    } catch (e) {
      console.error("Error fetching related products for blog", e)
    }
  }

  return (
    <div className="bg-white min-h-screen py-12">
      <article className="content-container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <nav className="text-sm text-ui-fg-subtle mb-8 flex items-center gap-x-2">
          <Link href={`/${countryCode}`} className="hover:text-orange-600 transition-colors">
            {isTr ? "Ana Sayfa" : "Home"}
          </Link>
          <span>/</span>
          <Link href={`/${countryCode}/blog`} className="hover:text-orange-600 transition-colors">
            {isTr ? "Rehberler" : "Guides"}
          </Link>
          <span>/</span>
          <span className="text-ui-fg-base font-medium truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Post Title & Meta */}
        <header className="mb-10 text-center md:text-left">
          <span className="text-sm font-semibold tracking-wider text-orange-600 uppercase px-3 py-1 bg-orange-100 rounded-full dark:bg-orange-900/30 dark:text-orange-400">
            {isTr ? "Rehber" : "Guide"}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-ui-fg-base mt-4 tracking-tight leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-6 text-sm text-ui-fg-subtle border-y border-ui-border-base py-4">
            <div className="flex items-center gap-x-2">
              <span className="font-semibold text-ui-fg-base">{post.author}</span>
            </div>
            <span className="hidden md:inline">•</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString(isTr ? "tr-TR" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </header>

        {/* Big Cover Image */}
        {post.image && (
          <div className="relative aspect-video w-full mb-10 overflow-hidden rounded-2xl border border-ui-border-base shadow-lg bg-ui-bg-subtle">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 800px"
            />
          </div>
        )}

        {/* Render HTML content with custom prose styles */}
        <div 
          className="blog-content prose max-w-none text-ui-fg-base"
          dangerouslySetInnerHTML={{ __html: post.contentHtml || "" }}
        />

        {/* Related Products Section */}
        {relatedProducts.length > 0 && region && (
          <section className="mt-16 pt-12 border-t border-ui-border-base">
            <div className="flex flex-col gap-2 mb-8 text-center md:text-left">
              <span className="text-xs font-semibold tracking-wider text-orange-600 uppercase">
                {isTr ? "ACİL DURUM İHTİYAÇLARI" : "EMERGENCY NEEDS"}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-ui-fg-base mt-0 border-b-0 pb-0">
                {isTr ? "Afet Çantası İçin Önerilen Malzemeler" : "Recommended Survival Supplies"}
              </h2>
              <p className="text-sm text-ui-fg-subtle">
                {isTr
                  ? "Yukarıdaki rehberde belirtilen ve acil durum çantanızda bulunması önerilen sertifikalı ürünlerimizi inceleyin:"
                  : "Explore our certified products mentioned in the guide above that are recommended for your emergency kit:"}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
              {relatedProducts.map((product) => (
                <div key={product.id} className="p-3 rounded-xl border border-ui-border-base bg-ui-bg-subtle/30 hover:bg-white hover:shadow-lg transition-all duration-300">
                  <ProductPreview product={product} region={region} />
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  )
}
