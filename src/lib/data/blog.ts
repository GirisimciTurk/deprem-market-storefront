import { marked } from "marked"
import { sdk } from "@lib/config"
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

/**
 * Blog yazıları artık backend `blog` modülünden (admin panelden yönetilen) gelir.
 * Eskiden content/blog/*.md dosyalarından okunuyordu; tek kaynak olması için
 * /store/blog API'sine taşındı. countryCode imza uyumluluğu için korunur.
 */
export const listBlogPosts = async (
  _countryCode?: string
): Promise<BlogPost[]> => {
  const next = { ...(await getCacheOptions("blog")) }
  // Locale'i fetch'ten ÖNCE (doğrudan request scope'ta) oku; cache'li promise
  // zincirinin .then microtask'ında cookies() scope'u kaybolabiliyor.
  const locale = await getLocaleSafe()
  return sdk.client
    .fetch<{ posts: BlogPost[] }>(`/store/blog`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ posts }) => posts || [])
    .catch(() => [])
    .then((posts) =>
      locale === "tr" ? posts : posts.map((p) => localizeBlogPost(p, locale))
    )
}

export const getBlogPost = async (
  slug: string,
  _countryCode?: string
): Promise<BlogPost | null> => {
  const next = { ...(await getCacheOptions("blog")) }
  const post = await sdk.client
    .fetch<{ post: BlogPost }>(`/store/blog/${slug}`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ post }) => post)
    .catch(() => null)

  if (!post) return null

  // Önce locale overlay (EN içerik), sonra markdown → HTML.
  const locale = await getLocaleSafe()
  const localized = locale === "tr" ? post : localizeBlogPost(post, locale)

  const contentHtml = await marked.parse(localized.content || "")
  return { ...localized, contentHtml }
}
