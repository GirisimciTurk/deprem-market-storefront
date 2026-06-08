import "server-only"

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  tr: () => import("./dictionaries/tr.json").then((module) => module.default),
}

export type Dictionary = Awaited<ReturnType<typeof dictionaries.en>>

export const getDictionary = async (countryCode: string): Promise<Dictionary> => {
  // Map countryCode to language key. If 'tr', load Turkish. Otherwise, default to English.
  const locale = countryCode.toLowerCase() === "tr" ? "tr" : "en"
  return dictionaries[locale]()
}
