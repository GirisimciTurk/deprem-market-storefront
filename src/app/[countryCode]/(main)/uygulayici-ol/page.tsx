import { redirect } from "next/navigation"

/**
 * "Uygulayıcı = Bayi" birleştirmesi: ayrı uygulayıcı (implementer) kaydı kaldırıldı.
 * Uygulama/montaj işi tamamen bayi (satıcı) üzerinden yürür (service_request ataması
 * zaten bayiye yapılır). Bu eski sayfa bayi başvurusuna yönlendirir.
 */
export default async function UygulayiciOlPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  redirect(`/${countryCode}/satici-ol`)
}
