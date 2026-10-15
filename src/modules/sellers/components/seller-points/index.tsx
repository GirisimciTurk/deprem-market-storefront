import { SellerPoint } from "@lib/data/sellers"

const KIND_LABEL: Record<string, string> = { sales: "Satış", showroom: "Teşhir", installation: "Uygulama" }

// Mağazanın fiziksel noktaları: adres, saatler ve haritada aç bağlantısı.
export default function SellerPoints({ points }: { points: SellerPoint[] }) {
  if (!points.length) return null

  return (
    <section id="noktalar" className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Fiziksel noktalar</h2>
      <ul className="grid grid-cols-1 small:grid-cols-2 gap-3">
        {points.map((p) => {
          const map =
            p.latitude != null && p.longitude != null
              ? `https://www.openstreetmap.org/?mlat=${p.latitude}&mlon=${p.longitude}#map=17/${p.latitude}/${p.longitude}`
              : `https://www.openstreetmap.org/search?query=${encodeURIComponent([p.address, p.district, p.city].filter(Boolean).join(", "))}`
          return (
            <li key={p.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-gray-900">
                  {p.name}
                  {p.is_primary && <span className="ml-2 text-[10px] font-semibold text-brand-700">Merkez</span>}
                </p>
                <div className="flex flex-wrap gap-1">
                  {p.kinds.map((k) => (
                    <span key={k} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                      {KIND_LABEL[k] ?? k}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-600">{[p.address, p.district, p.city].filter(Boolean).join(", ")}</p>
              {p.hours && <p className="mt-1 text-xs text-gray-500">Çalışma saatleri: {p.hours}</p>}
              <div className="mt-2 flex gap-4 text-sm">
                <a href={map} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 hover:underline">
                  Haritada aç
                </a>
                {p.phone && (
                  <a href={`tel:${p.phone}`} className="text-gray-700 hover:underline">
                    {p.phone}
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
