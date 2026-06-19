export type ReviewPhoto = { preview: string; filename: string; mime_type: string; data: string }

export type Review = {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  verified: boolean
  approved: boolean
  images?: string[]
}

export const MAX_PHOTOS = 6

// Seçilen fotoğrafı tarayıcıda en fazla 1280px'e küçültüp JPEG base64 üretir.
// Böylece yükleme boyutu küçük kalır (telefon fotoğrafları MB'larca olabiliyor).
export async function fileToResizedPhoto(file: File): Promise<ReviewPhoto> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(file)
  })
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = dataUrl
  })
  const MAX = 1280
  let { width, height } = img
  if (width > MAX || height > MAX) {
    if (width >= height) {
      height = Math.round((height * MAX) / width)
      width = MAX
    } else {
      width = Math.round((width * MAX) / height)
      height = MAX
    }
  }
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    // Canvas yoksa orijinal data URL'i kullan.
    const base = dataUrl.split(",")[1] ?? ""
    return { preview: dataUrl, filename: file.name, mime_type: file.type || "image/jpeg", data: base }
  }
  ctx.drawImage(img, 0, 0, width, height)
  const out = canvas.toDataURL("image/jpeg", 0.82)
  const base = out.split(",")[1] ?? ""
  const safeName = (file.name || "foto").replace(/\.[^.]+$/, "") + ".jpg"
  return { preview: out, filename: safeName, mime_type: "image/jpeg", data: base }
}
