/**
 * Uzman kartı dosya yüklemesi (profil fotoğrafı ve doğrulama belgeleri).
 *
 * Backend'in /store/expert-uploads ucu müşteri girişi ister; oturum jetonu
 * httpOnly çerezde durduğu için tarayıcı onu doğrudan gönderemez. Dosyalar
 * bu yüzden /api/expert-uploads üzerinden gider: rota çerezi okuyup isteği
 * yetki başlığıyla backend'e aktarır. (Server action'ın 1 MB gövde sınırı
 * belgeler için dar kaldığı için rota tercih edildi.)
 */

export const EXPERT_UPLOAD_MAX_FILES = 5
export const EXPERT_UPLOAD_MAX_BYTES = 10 * 1024 * 1024
export const EXPERT_DOC_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
export const EXPERT_PHOTO_MIME = ["image/jpeg", "image/png", "image/webp"]

type Payload = { filename: string; mime_type: string; data: string }

function toPayload(file: File): Promise<Payload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        filename: file.name,
        mime_type: file.type,
        // Data URL önekini at: backend saf base64 bekler.
        data: String(reader.result).split(",")[1] || "",
      })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** Dosyaları yükler, sırasıyla public URL'leri döndürür; hata iletisini fırlatır. */
export async function uploadExpertFiles(
  files: File[],
  allowed: string[] = EXPERT_DOC_MIME
): Promise<string[]> {
  for (const f of files) {
    if (!allowed.includes(f.type)) {
      throw new Error(
        allowed.includes("application/pdf")
          ? "Yalnızca görsel (JPEG/PNG/WebP) veya PDF yüklenebilir."
          : "Yalnızca JPEG, PNG veya WebP görsel yüklenebilir."
      )
    }
    if (f.size > EXPERT_UPLOAD_MAX_BYTES) {
      throw new Error("Her dosya en fazla 10 MB olabilir.")
    }
  }
  const payload = await Promise.all(files.map(toPayload))
  const res = await fetch("/api/expert-uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ files: payload }),
  })
  const data = (await res.json().catch(() => ({}))) as {
    urls?: string[]
    message?: string
  }
  if (!res.ok) throw new Error(data.message || "Dosya yüklenemedi.")
  return data.urls ?? []
}
