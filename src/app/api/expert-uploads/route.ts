import { NextRequest, NextResponse } from "next/server"
import { getAuthHeaders } from "@lib/data/cookies"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

/**
 * POST /api/expert-uploads  { files: [{ filename, mime_type, data(base64) }] }
 *
 * Uzman kartının fotoğraf ve belge yüklemesini backend'in /store/expert-uploads
 * ucuna aktarır. O uç müşteri girişi ister; oturum jetonu httpOnly çerezde
 * durduğundan tarayıcı yetki başlığını kendisi kuramaz. Bu rota yalnız çerezdeki
 * jetonu başlığa çevirir: gövdeyi doğrulamaz, boyut/tür sınırlarını backend uygular.
 */
export async function POST(req: NextRequest) {
  const auth = await getAuthHeaders()
  if (!("authorization" in auth)) {
    return NextResponse.json(
      { message: "Dosya yüklemek için giriş yapmalısınız." },
      { status: 401 }
    )
  }

  const body = await req.text()
  try {
    const res = await fetch(`${BACKEND_URL}/store/expert-uploads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
        authorization: auth.authorization,
      },
      body,
      cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json(
      { message: "Dosya yüklenemedi. Lütfen tekrar deneyin." },
      { status: 502 }
    )
  }
}
