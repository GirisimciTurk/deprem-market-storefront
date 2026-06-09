import { marked } from "marked"
import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

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
  return sdk.client
    .fetch<{ posts: BlogPost[] }>(`/store/blog`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ posts }) => posts || [])
    .catch(() => [])
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

  // İçerik markdown olabilir → HTML'e çevir.
  const contentHtml = await marked.parse(post.content || "")
  return { ...post, contentHtml }
}
