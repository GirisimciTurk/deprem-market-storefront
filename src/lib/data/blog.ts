import { marked } from "marked"
import { gobitData } from "@lib/gobit/client"
import { getCacheOptions } from "./cookies"
import { getLocaleSafe, pickTranslation } from "@lib/util/localize"

interface BlogTranslation {
  title?: string
  summary?: string
  content?: string
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
    description: tr.summary ?? post.description,
    content: tr.content ?? post.content,
  }
}

// dtm'nin yazısı (/store/v1/dtm/posts): göç aracı Medusa'nın blog_post'unu
// aynı slug'la taşır; kategori, ilgili ürünler ve çeviriler taşınmadı.
type DtmPost = {
  slug: string
  title: string
  excerpt: string
  body: string
  author: string
  cover_url: string
  published_at: string | null
  created_at: string
}

const toBlogPost = (p: DtmPost): BlogPost => ({
  slug: p.slug,
  title: p.title,
  description: p.excerpt,
  date: p.published_at ?? p.created_at,
  author: p.author,
  image: p.cover_url,
  related_products: [],
  content: p.body,
  translations: null,
})

export const listBlogPosts = async (
  _countryCode?: string
): Promise<BlogPost[]> => {
  const next = { ...(await getCacheOptions("blog")), revalidate: 300 }
  const locale = await getLocaleSafe()
  return gobitData<DtmPost[]>(`/store/v1/dtm/posts`, { next })
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
