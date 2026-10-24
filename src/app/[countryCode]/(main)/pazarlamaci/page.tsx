import { Metadata } from "next"
import { redirect } from "next/navigation"
import { retrieveMarketerStatement } from "@lib/data/marketer"
import { getBaseURL } from "@lib/util/env"
import { convertToLocale } from "@lib/util/money"
import MarketerPanelBar from "@modules/marketers/components/panel-bar"

export const metadata: Metadata = {
  title: "Pazarlamacı Paneli",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

const money = (amount: number) => (amount < 0 ? "−" : "") + convertToLocale({ amount: Math.abs(amount), currency_code: "try" })
const pct = (bps: number) => "%" + (bps / 100).toLocaleString("tr-TR", { maximumFractionDigits: 2 })
const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
const monthLabel = (m: string) => `${MONTHS[Number(m.slice(5)) - 1]} ${m.slice(0, 4)}`
const day = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })

/**
 * Pazarlamacının paneli: referans kodu ve satıcı başvuru bağlantısı, getirdiği satıcılar, aylık hak ediş, ödemeler ve
 * bakiye. Hak ediş platformun satıcıdan aldığı komisyonun payıdır; satıcının ödemesi olgunlaşınca kesinleşir.
 */
export default async function MarketerPanelPage(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
  const data = await retrieveMarketerStatement().catch(() => null)
  if (!data) redirect(`/${countryCode}/pazarlamaci/giris?redirect=${encodeURIComponent(`/${countryCode}/pazarlamaci`)}`)
  const { marketer: m, statement: st } = data
  const link = `${getBaseURL()}/${countryCode}/firma-ol?ref=${m.ref_code}`
  const card = "rounded-xl border border-ui-border-base bg-white p-5"

  return (
    <div className="content-container max-w-5xl py-10 small:py-14 space-y-6">
      <MarketerPanelBar email={m.email} link={link} />
      <div className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-ui-fg-base">Pazarlamacı Paneli</h1>
        <p className="mt-1 max-w-2xl text-xs text-ui-fg-muted">
          Referans kodunuz <strong className="font-mono text-ui-fg-base">{m.ref_code}</strong>. Bağlantınızla gelen ya da
          başvurusuna kodunuzu yazan satıcı, başvurusu onaylanınca {m.link_months} ay size bağlanır; bu sürede platformun o
          satıcıdan aldığı komisyonun payı size yazılır.
        </p>
        {!m.active && (
          <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs font-semibold text-amber-800">
            Pazarlamacı yetkiniz kaldırıldı: kodunuz artık geçerli değil, yeni sipariş size yazılmaz. Kalan bakiyeniz
            ödenene kadar burada görünür.
          </p>
        )}
      </div>

      <div className="grid gap-4 small:grid-cols-4">
        {(
          [
            ["Bekleyen", st.pending, "Satıcının ödemesi henüz olgunlaşmadı"],
            ["Kesinleşen", st.settled, "Ödenebilir hak ediş"],
            ["Ödenen", st.paid, "Size yapılan ödemeler"],
            ["Bakiye", st.balance, "Kesinleşen − ödenen"],
          ] as const
        ).map(([label, value, hint]) => (
          <div key={label} className={card}>
            <div className="text-xs font-bold uppercase tracking-wider text-ui-fg-muted">{label}</div>
            <div className={`mt-1 text-xl font-extrabold ${value < 0 ? "text-red-600" : "text-ui-fg-base"}`}>{money(value)}</div>
            <div className="mt-1 text-[11px] text-ui-fg-muted">{hint}</div>
          </div>
        ))}
      </div>

      <section className={card}>
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-ui-fg-base">Satıcılarım ({st.sellers.length})</h2>
        {st.sellers.length === 0 ? (
          <p className="text-sm text-ui-fg-muted">Henüz size bağlı satıcı yok. Bağlantınızı satıcı adaylarıyla paylaşın.</p>
        ) : (
          <ul className="divide-y divide-ui-border-base">
            {st.sellers.map((s) => (
              <li key={s.seller_id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm">
                <span>
                  <strong>{s.name}</strong>{" "}
                  <span className="text-xs text-ui-fg-muted">
                    · pay {pct(s.rate_bps ?? m.rate_bps)} · {day(s.expires_at)} tarihine kadar · {s.orders} sipariş
                  </span>
                </span>
                <strong>{money(s.earned)}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={card}>
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-ui-fg-base">Aylık hak ediş</h2>
        {st.months.length === 0 ? (
          <p className="text-sm text-ui-fg-muted">Henüz sipariş yok.</p>
        ) : (
          <ul className="divide-y divide-ui-border-base">
            {st.months.map((mo) => (
              <li key={mo.month} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm">
                <span>
                  {monthLabel(mo.month)}{" "}
                  <span className="text-xs text-ui-fg-muted">
                    · {mo.orders} sipariş · kesinleşen {money(mo.settled)}
                  </span>
                </span>
                <strong>{money(mo.earned)}</strong>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[11px] text-ui-fg-muted">
          İade edilen siparişin komisyonu hak edişten düşer. Ödemeden sonra gelen iade bakiyeyi eksiye düşürebilir; fark
          sonraki ödemeden düşülür.
        </p>
      </section>

      {st.payments.length > 0 && (
        <section className={card}>
          <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-ui-fg-base">Ödemeler</h2>
          <ul className="divide-y divide-ui-border-base">
            {st.payments.map((p) => (
              <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2.5 text-sm">
                <span>
                  {day(p.created_at)}
                  {p.note && <span className="text-xs text-ui-fg-muted"> · {p.note}</span>}
                </span>
                <strong>{money(p.amount)}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
