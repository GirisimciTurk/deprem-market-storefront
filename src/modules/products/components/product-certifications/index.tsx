import { HttpTypes } from "@medusajs/types"
import { ShieldCheck, FileText } from "lucide-react"
import { toReachableImageUrl } from "@lib/util/image-url"

/**
 * Ürün metadata'sındaki yapılandırılmış sertifika/belge listesi.
 * Kaynak: product.metadata.certifications = [{ label, authority?, verified?, document_url? }]
 *
 * DÜRÜSTLÜK KURALI: Yalnız `verified === true` olan (admin tarafından belgeyle
 * doğrulanmış) sertifikalar "Doğrulanmış" yeşil rozetiyle gösterilir. Doğrulanmamış
 * olanlar "Üretici beyanı" olarak nötr biçimde etiketlenir — resmi sertifika gibi
 * sunulmaz. Böylece belgeye dayanmayan otorite iddiası yapılmaz.
 */
export type ProductCertification = {
  label: string
  authority?: string | null
  verified?: boolean
  document_url?: string | null
}

function parseCertifications(product: HttpTypes.StoreProduct): ProductCertification[] {
  const raw = (product.metadata as any)?.certifications
  if (!Array.isArray(raw)) return []
  return raw
    .map((c: any): ProductCertification | null => {
      const label = typeof c?.label === "string" ? c.label.trim() : ""
      if (!label) return null
      return {
        label,
        authority: typeof c?.authority === "string" ? c.authority.trim() : null,
        verified: c?.verified === true,
        document_url:
          typeof c?.document_url === "string" && c.document_url.trim()
            ? c.document_url.trim()
            : null,
      }
    })
    .filter((c): c is ProductCertification => c !== null)
}

export default function ProductCertifications({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const certs = parseCertifications(product)
  if (certs.length === 0) return null

  return (
    <div className="border border-gray-150 rounded-xl p-4 bg-white">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-x-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Sertifikalar & Belgeler
      </h3>
      <ul className="flex flex-wrap gap-2">
        {certs.map((c, i) => {
          const doc = c.document_url ? toReachableImageUrl(c.document_url) : null
          const title = c.authority ? `${c.label} · ${c.authority}` : c.label
          if (c.verified) {
            const inner = (
              <>
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-bold">{title}</span>
                <span className="text-green-700/80 font-semibold">· Doğrulanmış</span>
                {doc && <FileText className="w-3 h-3 flex-shrink-0 opacity-70" />}
              </>
            )
            return (
              <li key={i}>
                {doc ? (
                  <a
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-x-1.5 bg-green-50 border border-green-200 text-green-700 text-xs px-2.5 py-1 rounded-full hover:bg-green-100 transition-colors"
                    title={`${title} — belgeyi görüntüle`}
                  >
                    {inner}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-x-1.5 bg-green-50 border border-green-200 text-green-700 text-xs px-2.5 py-1 rounded-full select-none">
                    {inner}
                  </span>
                )}
              </li>
            )
          }
          // Doğrulanmamış: üretici beyanı — resmi sertifika gibi sunulmaz.
          return (
            <li key={i}>
              <span
                className="inline-flex items-center gap-x-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs px-2.5 py-1 rounded-full select-none"
                title="Üretici beyanı — bağımsız belgeyle doğrulanmamıştır"
              >
                <span className="font-semibold">{title}</span>
                <span className="text-gray-400 font-medium">· Üretici beyanı</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
