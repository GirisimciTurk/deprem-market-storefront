import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

// Helper to get decimal digits for a currency
const getDecimalDigits = (currencyCode: string): number => {
  const zeroDecimalCurrencies = ["jpy", "krw", "vnd", "clp", "lpf", "gnf", "kmf", "mga", "pyg", "rwf", "ugx", "vuv", "xaf", "xof", "xpf"]
  const threeDecimalCurrencies = ["bhd", "iqd", "jod", "kwd", "lyd", "omr", "tnd"]
  
  const code = currencyCode.toLowerCase()
  if (zeroDecimalCurrencies.includes(code)) {
    return 0
  }
  if (threeDecimalCurrencies.includes(code)) {
    return 3
  }
  return 2 // Default for TRY, USD, EUR etc.
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "tr-TR",
}: ConvertToLocaleParams) => {
  if (!currency_code || isEmpty(currency_code)) {
    return amount.toString()
  }

  const upperCode = currency_code.toUpperCase()
  const decimalDigits = getDecimalDigits(currency_code)
  
  // Convert from smallest unit (cents/kuruş) to base unit (Lira/Dollar)
  const baseAmount = amount / Math.pow(10, decimalDigits)

  if (upperCode === "TRY") {
    // Determine if we need decimals: show ,XX only if there are kuruş
    const hasDecimals = baseAmount % 1 !== 0
    const minFrac = minimumFractionDigits ?? (hasDecimals ? 2 : 0)
    const maxFrac = maximumFractionDigits ?? (hasDecimals ? 2 : 0)

    const formatted = new Intl.NumberFormat("tr-TR", {
      style: "decimal",
      minimumFractionDigits: minFrac,
      maximumFractionDigits: maxFrac,
    }).format(baseAmount)

    return `${formatted} TL`
  }

  // For USD, EUR etc. — standard symbol format
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency_code,
    minimumFractionDigits: minimumFractionDigits ?? decimalDigits,
    maximumFractionDigits: maximumFractionDigits ?? decimalDigits,
  }).format(baseAmount)
}
