// PayTR'nin taksit oranlarını (taksit-sorgulama cevabı: kart programı →
// taksit_N → oran, "oranlar" ya da belgedeki adıyla "rates") ürün sayfasının
// banka bazlı COMMISSION_LIST biçimine çevirir. Tek çekim 1. satırdır.

export type Commission = {
  CODE: string
  KEY: string
  DATA: { INSTALLMENT: number; COMMISSION: string; CARD_TRX_TYPE: string; MERCHANT_COMMISSION: number }[]
}

export function toCommissionList(paytr: any): Commission[] {
  const rates = (paytr?.oranlar ?? paytr?.rates ?? {}) as Record<string, Record<string, number | string>>
  const max = Number(paytr?.max_inst_non_bus) || 12

  return Object.entries(rates)
    .map(([program, table]) => {
      const data = Object.entries(table ?? {})
        .map(([k, v]) => ({ n: Number(k.replace(/^taksit_/, "")), rate: Number(v) }))
        .filter((r) => Number.isFinite(r.n) && r.n > 1 && r.n <= max && Number.isFinite(r.rate))
        .sort((a, b) => a.n - b.n)
        .map((r) => ({ INSTALLMENT: r.n, COMMISSION: String(r.rate), CARD_TRX_TYPE: "", MERCHANT_COMMISSION: 0 }))

      return {
        CODE: program.toUpperCase(),
        KEY: program,
        DATA: [{ INSTALLMENT: 1, COMMISSION: "0", CARD_TRX_TYPE: "", MERCHANT_COMMISSION: 0 }, ...data],
      }
    })
    .filter((c) => c.DATA.length > 1)
}

