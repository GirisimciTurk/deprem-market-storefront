import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"

/**
 * POST /api/revalidate?secret=...&tags=products,sellers,categories
 *
 * Backend (Medusa) bir ürün/mağaza güncellendiğinde bu ucu çağırır ve ilgili statik
 * cache tag'lerini temizler → mağazadaki resim/bilgi ANINDA tazelenir. Ürün
 * fetch'leri force-cache yerine bu tag'leri + zaman-bazlı revalidate (≤30sn) kullanır.
 *
 * REVALIDATE_SECRET tanımlı değilse uç kapalıdır (401) — webhook yoksa yine de
 * 30 sn'lik ISR tazeliği devrededir.
 */
const ALLOWED_TAGS = new Set(["products", "sellers", "categories"])

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  const expected = process.env.REVALIDATE_SECRET

  if (!expected || secret !== expected) {
    return NextResponse.json({ ok: false, message: "Yetkisiz." }, { status: 401 })
  }

  const tagsParam = req.nextUrl.searchParams.get("tags") || "products,sellers,categories"
  const tags = tagsParam
    .split(",")
    .map((t) => t.trim())
    .filter((t) => ALLOWED_TAGS.has(t))

  for (const t of tags) revalidateTag(t)

  return NextResponse.json({ ok: true, revalidated: tags, now: Date.now() })
}
