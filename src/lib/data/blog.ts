import { marked } from "marked"
import { gobitData } from "@lib/gobit/client"
import { getCacheOptions } from "./cookies"
import { getLocaleSafe, pickTranslation } from "@lib/util/localize"

// dtm'nin yazı alanlarıyla aynı anahtarlar (excerpt, body).
interface BlogTranslation {
  title?: string
  excerpt?: string
  body?: string
}

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  image: string
  category?: string
  related_products: string[]
  content?: string
  contentHtml?: string
  translations?: Record<string, BlogTranslation> | null
}

// EN (vb.) için başlık/özet/içeriği translations'tan overlay eder; yoksa tr kalır.
function localizeBlogPost(post: BlogPost, locale: string): BlogPost {
  const tr = pickTranslation(post.translations, locale)
  if (!tr) return post
  return {
    ...post,
    title: tr.title || post.title,
    description: tr.excerpt || post.description,
    content: tr.body || post.content,
  }
}

// dtm'nin yazısı (/store/v1/dtm/posts), slug'la okunur. Kategori ("" = yok),
// ilgili ürünler (ürün adresleri) ve dil çevirileri (tr dışı) yazıyla gelir.
type DtmPost = {
  slug: string
  title: string
  excerpt: string
  body: string
  author: string
  cover_url: string
  category?: string
  related_products?: string[] | null
  translations?: Record<string, BlogTranslation> | null
  published_at: string | null
  created_at: string
}

export type BlogCategory = { category: string; posts: number }

const toBlogPost = (p: DtmPost): BlogPost => ({
  slug: p.slug,
  title: p.title,
  description: p.excerpt,
  date: p.published_at ?? p.created_at,
  author: p.author,
  image: p.cover_url,
  category: p.category?.trim() || undefined,
  related_products: p.related_products ?? [],
  content: p.body,
  translations: p.translations ?? null,
})

export const listBlogPosts = async (
  _countryCode?: string,
  category?: string
): Promise<BlogPost[]> => {
  const next = { ...(await getCacheOptions("blog")), revalidate: 300 }
  const locale = await getLocaleSafe()
  return gobitData<DtmPost[]>(`/store/v1/dtm/posts`, { query: { category: category || undefined }, next })
    .then((posts) => (posts || []).map(toBlogPost))
    .catch(() => [] as BlogPost[])
    .then((posts) =>
      locale === "tr" ? posts : posts.map((p) => localizeBlogPost(p, locale))
    )
}

export const getBlogPost = async (
  slug: string,
  _countryCode?: string
): Promise<BlogPost | null> => {
  const next = { ...(await getCacheOptions("blog")), revalidate: 300 }
  const post = await gobitData<DtmPost>(`/store/v1/dtm/posts/${encodeURIComponent(slug)}`, { next })
    .then(toBlogPost)
    .catch(() => null)

  if (!post) return null

  // Önce locale overlay (EN içerik), sonra markdown → HTML.
  const locale = await getLocaleSafe()
  const localized = locale === "tr" ? post : localizeBlogPost(post, locale)

  const contentHtml = await marked.parse(localized.content || "")
  return { ...localized, contentHtml }
}

/** Yayımlanmış yazıların kategorileri ve yazı sayıları, ada göre. */
export const listBlogCategories = async (): Promise<BlogCategory[]> => {
  const next = { ...(await getCacheOptions("blog")), revalidate: 300 }
  return gobitData<BlogCategory[]>(`/store/v1/dtm/post-categories`, { next })
    .then((cs) => (cs || []).filter((c) => c.category))
    .catch(() => [])
}
