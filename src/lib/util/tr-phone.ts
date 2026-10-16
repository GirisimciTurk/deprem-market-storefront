/**
 * Türkiye telefon numarası yardımcıları — formlardaki telefon alanlarının ortak
 * kuralı. Kullanıcı yalnız rakam girer; alan yazdıkça "0 5xx xxx xx xx"
 * biçimine girer. Gönderilen KANONİK biçim 11 hanelik "05xxxxxxxxx"tir
 * (sabit hatlar 0 2xx / 0 3xx / 0 4xx ile başlar).
 *
 * Müşteri hesabının telefonu (kayıt, Hesabım → Telefon) sunucu eyleminde
 * "+905xxxxxxxxx" olarak saklanır; o alanlar da aynı girdiyi kullanır, E.164'e
 * çeviri sunucu eyleminde kalır.
 */

/**
 * Her biçimdeki girdiyi ("+90 532…", "0090…", "905321234567", "532 123 45 67",
 * "0532-123-45-67") baştaki 0 ile en fazla 11 haneye indirir. Eksik numara
 * eksik kalır; geçerliliği isValidTrPhone söyler.
 */
export function normalizeTrPhone(input: string | null | undefined): string {
  const raw = (input ?? "").trim()
  let d = raw.replace(/\D/g, "")
  if (!d) return ""
  if (d.startsWith("0090") && d.length > 4) {
    d = d.slice(4)
  } else if (d.startsWith("90") && (raw.startsWith("+") || d.length === 12)) {
    d = d.slice(2)
  }
  return ("0" + d.replace(/^0+/, "")).slice(0, 11)
}

/** Yazarken gösterilen biçim: "0 532 123 45 67" (eksikse olduğu kadarı). */
export function formatTrPhone(input: string | null | undefined): string {
  const d = normalizeTrPhone(input)
  const parts = [d.slice(0, 1), d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)]
  return parts.filter(Boolean).join(" ")
}

/** 11 hane, 0 ile başlar; ikinci hane 2–5 (sabit hat veya cep). */
export function isValidTrPhone(input: string | null | undefined): boolean {
  return /^0[2-5]\d{9}$/.test(normalizeTrPhone(input))
}

/** Yalnız cep telefonu: 05xxxxxxxxx. */
export function isTrMobilePhone(input: string | null | undefined): boolean {
  return /^05\d{9}$/.test(normalizeTrPhone(input))
}

/** Geçerli numarayı "+90…" biçimine çevirir; geçersizse boş dize. */
export function toE164TrPhone(input: string | null | undefined): string {
  return isValidTrPhone(input) ? "+90" + normalizeTrPhone(input).slice(1) : ""
}

export const TR_PHONE_PLACEHOLDER = "0 5xx xxx xx xx"
export const TR_PHONE_INCOMPLETE_MESSAGE =
  "Lütfen telefon numarasını eksiksiz girin (örn. 0 532 123 45 67)."
export const TR_MOBILE_INVALID_MESSAGE =
  "Lütfen geçerli bir cep telefonu numarası girin (örn. 0 532 123 45 67)."

/**
 * Doluysa ama eksik/geçersizse kullanıcıya gösterilecek Türkçe ileti; boş ya da
 * geçerliyse boş dize. Boş zorunlu alanı formun kendi kuralı yakalar.
 */
export function trPhoneProblem(
  input: string | null | undefined,
  opts: { mobileOnly?: boolean } = {}
): string {
  if (!normalizeTrPhone(input)) return ""
  if (opts.mobileOnly) {
    return isTrMobilePhone(input) ? "" : TR_MOBILE_INVALID_MESSAGE
  }
  return isValidTrPhone(input) ? "" : TR_PHONE_INCOMPLETE_MESSAGE
}

export const ACCOUNT_PHONE_INVALID_MESSAGE =
  "Lütfen geçerli bir cep telefonu numarası girin (Örn: 0555 123 45 67)"

/**
 * Müşteri hesabının telefonu: hesapta "+905xxxxxxxxx" olarak saklanır. Boş
 * girdi boş dize, cep numarası olmayan girdi null döner. Kayıt eylemleri
 * (signup, signupExpert) bu tek kuralı kullanır.
 */
export function toAccountPhone(input: string | null | undefined): string | null {
  let v = (input ?? "").trim().replace(/[\s()\-.]/g, "")
  if (!v) return ""
  if (v.startsWith("0")) {
    v = "+90" + v.substring(1)
  } else if (v.startsWith("90")) {
    v = "+" + v
  } else if (!v.startsWith("+")) {
    v = "+90" + v
  }
  return /^\+905\d{9}$/.test(v) ? v : null
}
