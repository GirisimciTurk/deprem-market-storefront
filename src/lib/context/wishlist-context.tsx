"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  addToWishlist,
  removeFromWishlist,
  type WishlistResult,
} from "@lib/data/wishlist"

/**
 * Favorilerin istemci tarafındaki TEK kaynağı. Sunucu (main layout) giriş
 * durumunu ve ilk favori listesini verir; kalp butonları ve nav sayacı buradan
 * okur, böylece hepsi anında senkron kalır.
 *
 * Eskiden her bileşen localStorage'ı ayrı ayrı okuyup "favorites-updated"
 * event'iyle haberleşiyordu. Favoriler hesaba taşınınca bu context'e geçildi;
 * event yayını GERİYE DÖNÜK UYUM için korunuyor (dışarıda kalan dinleyiciler).
 */

type WishlistContextValue = {
  productIds: string[]
  count: number
  isLoggedIn: boolean
  isFavorite: (productId: string) => boolean
  /** Ekler/çıkarır. Giriş yoksa sunucuya gitmez, `unauthorized` döner. */
  toggle: (productId: string) => Promise<WishlistResult>
  /** O an sunucuya gidilen ürün id'si (buton spinner'ı için). */
  pendingId: string | null
  /** Merge sonrası listeyi dışarıdan tazelemek için. */
  setProductIds: (ids: string[]) => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({
  children,
  isLoggedIn,
  initialProductIds,
}: {
  children: React.ReactNode
  isLoggedIn: boolean
  initialProductIds: string[]
}) {
  const [productIds, setProductIds] = useState<string[]>(initialProductIds)
  const [pendingId, setPendingId] = useState<string | null>(null)

  // Sunucu yeniden render edip FARKLI bir liste verdiğinde (giriş/çıkış,
  // router.refresh) istemci durumunu ona hizala. Bağımlılık dizinin kimliği
  // değil İÇERİĞİ: sunucu her render'da yeni bir dizi nesnesi üretiyor ve
  // kimliğe bakmak, aynı liste geldiğinde iyimser güncellemeyi boşuna geri alırdı.
  const initialKey = initialProductIds.join(",")
  useEffect(() => {
    setProductIds(initialKey ? initialKey.split(",") : [])
  }, [initialKey])

  const isFavorite = useCallback(
    (productId: string) => productIds.includes(productId),
    [productIds]
  )

  const toggle = useCallback(
    async (productId: string): Promise<WishlistResult> => {
      if (!isLoggedIn) {
        return { productIds: [], unauthorized: true, error: null }
      }

      const wasFavorite = productIds.includes(productId)
      // İyimser güncelleme: kalp anında dolar/boşalır, sunucu yanıtı sonra
      // otoriter listeyle üzerine yazar (hata olursa geri alınır).
      const optimistic = wasFavorite
        ? productIds.filter((id) => id !== productId)
        : [productId, ...productIds]
      setProductIds(optimistic)
      setPendingId(productId)

      try {
        const res = wasFavorite
          ? await removeFromWishlist(productId)
          : await addToWishlist(productId)

        if (res.unauthorized || res.error) {
          setProductIds(productIds) // geri al
        } else {
          setProductIds(res.productIds)
        }
        return res
      } catch (e) {
        setProductIds(productIds) // geri al
        return { productIds, unauthorized: false, error: String(e) }
      } finally {
        setPendingId(null)
      }
    },
    [isLoggedIn, productIds]
  )

  // Geriye dönük uyum: favoriler değiştiğinde eski event'i de yay.
  useEffect(() => {
    window.dispatchEvent(new Event("favorites-updated"))
  }, [productIds])

  const value = useMemo(
    () => ({
      productIds,
      count: productIds.length,
      isLoggedIn,
      isFavorite,
      toggle,
      pendingId,
      setProductIds,
    }),
    [productIds, isLoggedIn, isFavorite, toggle, pendingId]
  )

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  )
}

/**
 * Provider dışında da güvenle çağrılabilir (ör. checkout layout'u sarmıyor):
 * o durumda "giriş yok + boş liste" döner, bileşenler çökmez.
 */
export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext)
  if (ctx) return ctx
  return {
    productIds: [],
    count: 0,
    isLoggedIn: false,
    isFavorite: () => false,
    toggle: async () => ({ productIds: [], unauthorized: true, error: null }),
    pendingId: null,
    setProductIds: () => {},
  }
}
