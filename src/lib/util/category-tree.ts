/**
 * Kategori ağacı yardımcıları.
 *
 * Medusa'nın ürün sorgusu `category_id`'yi DOĞRUDAN atama olarak yorumlar:
 * ürün "Deprem Çantası > Aile Çantası" alt kategorisine bağlıysa, üst kategori
 * ("Deprem Çantası") ile filtrelendiğinde GELMEZ. Ürünler pratikte yaprak
 * kategorilere atandığı için ana kategorilerin hepsi boş görünüyordu.
 *
 * Çözüm: seçilen kategori id'leri sorgudan ÖNCE tüm alt ağacıyla genişletilir.
 *
 * Sayaçlar bu ağaçtan HESAPLANMAZ: kategoriye gömülü `products` listesi
 * yayınlanmamış ve satış kanalı dışı ürünleri de içeriyor, /store/products ise
 * ikisini de süzüyor. "12 ürün" yazan kategori 8 ürünle açılırdı; sayaç bu
 * yüzden gerçek ürün sorgusunun `count`undan alınır (bkz. /kategoriler).
 */

type CategoryLike = {
  id: string
  parent_category_id?: string | null
  parent_category?: { id?: string | null } | null
  category_children?: { id?: string | null }[] | null
}

/** Kategorinin üst kategori id'si — alan iki farklı biçimde gelebiliyor. */
function parentIdOf(c: CategoryLike): string | null {
  return c.parent_category_id ?? c.parent_category?.id ?? null
}

/**
 * id → doğrudan çocuklarının id'leri. Düz listeden kurulur (derinlik sınırsız);
 * `category_children` yalnız bir seviye geldiği için ona güvenilmez.
 */
function buildChildrenMap(categories: CategoryLike[]): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const c of categories) {
    const pid = parentIdOf(c)
    if (!pid) continue
    map.set(pid, [...(map.get(pid) ?? []), c.id])
  }
  return map
}

/**
 * Verilen kategori id'lerini TÜM alt kategorileriyle birlikte döndürür.
 * Sıra korunur, tekrar edenler ayıklanır. Döngüsel veriye karşı ziyaret
 * kümesiyle korunur (bozuk veri sonsuz döngüye girmesin).
 */
export function expandCategoryIds(
  selectedIds: string[],
  categories: CategoryLike[]
): string[] {
  if (!selectedIds.length) return []
  const childrenMap = buildChildrenMap(categories)
  const out: string[] = []
  const seen = new Set<string>()
  const stack = [...selectedIds]

  while (stack.length) {
    const id = stack.shift() as string
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push(id)
    stack.push(...(childrenMap.get(id) ?? []))
  }
  return out
}
