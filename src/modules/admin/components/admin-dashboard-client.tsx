"use client"

import React, { useState } from "react"
import { convertToLocale } from "@lib/util/money"
import {
  Button,
  Heading,
  Text,
  Badge,
} from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  approveOrder,
  shipOrder,
  cancelOrder,
  updateProductPrice,
  updateProductStock,
} from "@lib/data/admin"

type AdminDashboardClientProps = {
  initialOrders: any[]
  initialProducts: any[]
}

export default function AdminDashboardClient({
  initialOrders,
  initialProducts,
}: AdminDashboardClientProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [products, setProducts] = useState(initialProducts)
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders")
  const [orderSearch, setOrderSearch] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})
  const [notif, setNotif] = useState<string | null>(null)

  // Inline edit state for pricing and stock
  const [editingPrice, setEditingPrice] = useState<Record<string, string>>({})
  const [editingStock, setEditingStock] = useState<Record<string, string>>({})
  const [manageInventoryState, setManageInventoryState] = useState<
    Record<string, boolean>
  >({})

  // Notification helper
  const triggerNotif = (msg: string) => {
    setNotif(msg)
    setTimeout(() => setNotif(null), 3000)
  }

  const setButtonLoading = (key: string, val: boolean) => {
    setLoadingMap((prev) => ({ ...prev, [key]: val }))
  }

  // Action: Approve Order
  const handleApproveOrder = async (orderId: string) => {
    const key = `approve-${orderId}`
    setButtonLoading(key, true)
    try {
      const res = await approveOrder(orderId)
      if (res && res.success) {
        // Update local order list
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: "completed", payment_status: "captured" }
              : o
          )
        )
        triggerNotif(
          `Sipariş başarıyla onaylandı! (Durum: Ödendi & Tamamlandı)`
        )
      }
    } catch (e: any) {
      alert("Hata: " + e.message)
    } finally {
      setButtonLoading(key, false)
    }
  }

  // Action: Ship Order
  const handleShipOrder = async (orderId: string) => {
    const tracking = prompt(
      "Lütfen kargo takip numarasını girin veya varsayılanı kullanın:",
      `TR-EXP-${Math.floor(100000 + Math.random() * 900000)}`
    )
    if (tracking === null) return // Canceled

    const key = `ship-${orderId}`
    setButtonLoading(key, true)
    try {
      const res = await shipOrder(orderId, tracking)
      if (res && res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, fulfillment_status: "shipped" } : o
          )
        )
        triggerNotif(`Sipariş kargoya verildi! Takip No: ${tracking}`)
      }
    } catch (e: any) {
      alert("Hata: " + e.message)
    } finally {
      setButtonLoading(key, false)
    }
  }

  // Action: Cancel Order
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Bu siparişi iptal etmek istediğinizden emin misiniz?")) return

    const key = `cancel-${orderId}`
    setButtonLoading(key, true)
    try {
      const res = await cancelOrder(orderId)
      if (res && res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "canceled",
                  payment_status: "canceled",
                  fulfillment_status: "canceled",
                }
              : o
          )
        )
        triggerNotif(`Sipariş iptal edildi.`)
      }
    } catch (e: any) {
      alert("Hata: " + e.message)
    } finally {
      setButtonLoading(key, false)
    }
  }

  // Action: Update Pricing
  const handleUpdatePrice = async (priceId: string, variantId: string) => {
    const newPriceVal = editingPrice[priceId]
    if (!newPriceVal || isNaN(parseFloat(newPriceVal))) {
      alert("Lütfen geçerli bir fiyat girin.")
      return
    }

    const newPrice = parseFloat(newPriceVal)
    const key = `price-${priceId}`
    setButtonLoading(key, true)
    try {
      const res = await updateProductPrice(priceId, newPrice)
      if (res && res.success) {
        // Update local products list
        setProducts((prev) =>
          prev.map((p) => ({
            ...p,
            variants: p.variants.map((v: any) => {
              if (v.id === variantId) {
                return {
                  ...v,
                  prices: v.prices.map((pr: any) =>
                    pr.id === priceId ? { ...pr, amount: newPrice } : pr
                  ),
                }
              }
              return v
            }),
          }))
        )
        triggerNotif(`Fiyat başarıyla güncellendi! Yeni Fiyat: ${newPrice} TL`)
      }
    } catch (e: any) {
      alert("Hata: " + e.message)
    } finally {
      setButtonLoading(key, false)
    }
  }

  // Action: Update Stock & Inventory Settings
  const handleUpdateStock = async (variantId: string) => {
    const stockQtyVal = editingStock[variantId]
    const shouldManage =
      manageInventoryState[variantId] !== undefined
        ? manageInventoryState[variantId]
        : true // Default to manage

    if (shouldManage && (!stockQtyVal || isNaN(parseInt(stockQtyVal, 10)))) {
      alert("Lütfen stok miktarı girin.")
      return
    }

    const qty = shouldManage ? parseInt(stockQtyVal, 10) : 0
    const key = `stock-${variantId}`
    setButtonLoading(key, true)

    try {
      const res = await updateProductStock(variantId, qty, shouldManage)
      if (res && res.success) {
        // Update local products list
        setProducts((prev) =>
          prev.map((p) => ({
            ...p,
            variants: p.variants.map((v: any) => {
              if (v.id === variantId) {
                return {
                  ...v,
                  manage_inventory: shouldManage,
                  metadata: {
                    ...v.metadata,
                    inventory_quantity: qty,
                  },
                }
              }
              return v
            }),
          }))
        )
        triggerNotif(`Stok ve envanter ayarları güncellendi!`)
      }
    } catch (e: any) {
      alert("Hata: " + e.message)
    } finally {
      setButtonLoading(key, false)
    }
  }

  // Formatting and helpers
  const getFulfillmentBadge = (status: string) => {
    switch (status) {
      case "not_fulfilled":
        return <Badge color="orange">Hazırlanıyor</Badge>
      case "partially_fulfilled":
        return <Badge color="blue">Kısmen Hazırlandı</Badge>
      case "fulfilled":
        return <Badge color="blue">Hazırlandı</Badge>
      case "partially_shipped":
        return <Badge color="blue">Kısmen Kargolandı</Badge>
      case "shipped":
        return <Badge color="green">Kargoda</Badge>
      case "delivered":
        return <Badge color="green">Teslim Edildi</Badge>
      case "canceled":
        return <Badge color="red">İptal Edildi</Badge>
      default:
        return <Badge color="grey">{status}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge color="orange">Onay Bekliyor</Badge>
      case "completed":
        return <Badge color="green">Tamamlandı</Badge>
      case "canceled":
        return <Badge color="red">İptal Edildi</Badge>
      default:
        return <Badge color="grey">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "not_paid":
        return <Badge color="orange">Ödeme Bekliyor</Badge>
      case "awaiting":
        return <Badge color="orange">Onay Bekliyor</Badge>
      case "captured":
        return <Badge color="green">Ödendi</Badge>
      case "refunded":
        return <Badge color="grey">İade Edildi</Badge>
      case "canceled":
        return <Badge color="red">İptal Edildi</Badge>
      default:
        return <Badge color="grey">{status}</Badge>
    }
  }

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const s = orderSearch.toLowerCase().trim()
    if (!s) return true
    return (
      o.display_id.toString().includes(s) ||
      o.email.toLowerCase().includes(s) ||
      o.id.toLowerCase().includes(s)
    )
  })

  // Filter products
  const filteredProducts = products.filter((p) => {
    const s = productSearch.toLowerCase().trim()
    if (!s) return true
    return (
      p.title.toLowerCase().includes(s) ||
      p.handle.toLowerCase().includes(s) ||
      p.variants.some((v: any) => v.sku?.toLowerCase().includes(s))
    )
  })

  // KPI Calculations
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length
  const totalSalesAmount = orders
    .filter((o) => o.status !== "canceled" && o.payment_status === "captured")
    .reduce((sum, o) => {
      const orderTotal = o.items.reduce(
        (acc: number, it: any) => acc + it.unit_price * it.quantity,
        0
      )
      return sum + orderTotal
    }, 0)

  const lowStockVariantsCount = products.reduce((count, p) => {
    const lowStockInProduct = p.variants.filter((v: any) => {
      if (!v.manage_inventory) return false
      const qty = v.metadata?.inventory_quantity ?? 0
      return qty < 5
    }).length
    return count + lowStockInProduct
  }, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Toast Notification */}
      {notif && (
        <div className="fixed top-6 right-6 bg-gray-900 text-white text-sm font-semibold py-3 px-5 rounded-lg shadow-xl z-50 animate-bounce border border-gray-800">
          {notif}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/4">
          <svg className="w-60 h-60" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 00-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
          </svg>
        </div>

        <div className="relative z-10">
          <span className="bg-red-600 text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
            Yönetim Paneli
          </span>
          <Heading
            level="h1"
            className="text-3xl font-extrabold tracking-tight mt-3 text-white"
          >
            EKYP Deprem Market Yönetim Sistemi
          </Heading>
          <Text className="text-gray-300 text-sm mt-1">
            Sipariş onaylama, kargo takip girişi, stok seviyesi denetimi ve tek
            tıkla ürün fiyatı güncelleme modülleri.
          </Text>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10 shrink-0">
          <LocalizedClientLink
            href="/admin/bayilik-onay"
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-white/10 transition-colors shadow-sm"
          >
            🤝 Bayilik Başvuruları &rarr;
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/admin/yorum-onay"
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-white/10 transition-colors shadow-sm"
          >
            💬 Yorum Onay Paneli &rarr;
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm shadow-red-950/20"
          >
            &larr; Mağazaya Git
          </LocalizedClientLink>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-orange-50 text-orange-600">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <Text className="text-xs text-gray-500 font-medium">
              Onay Bekleyen Siparişler
            </Text>
            <Heading
              level="h3"
              className="text-2xl font-extrabold text-gray-900 mt-1"
            >
              {pendingOrdersCount}
            </Heading>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-green-50 text-green-600">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <Text className="text-xs text-gray-500 font-medium">
              Toplam Onaylı Ciro
            </Text>
            <Heading
              level="h3"
              className="text-2xl font-extrabold text-gray-900 mt-1"
            >
              {convertToLocale({
                amount: totalSalesAmount,
                currency_code: "try",
              })}
            </Heading>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-blue-50 text-blue-600">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div>
            <Text className="text-xs text-gray-500 font-medium">
              Katalogtaki Ürün Sayısı
            </Text>
            <Heading
              level="h3"
              className="text-2xl font-extrabold text-gray-900 mt-1"
            >
              {products.length}
            </Heading>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-red-50 text-red-600">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <Text className="text-xs text-gray-500 font-medium">
              Kritik Stok Seviyesi (&lt;5)
            </Text>
            <Heading
              level="h3"
              className="text-2xl font-extrabold text-gray-900 mt-1"
            >
              {lowStockVariantsCount}
            </Heading>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 mb-6 gap-x-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "orders"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📦 Siparişleri Yönet ({filteredOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "products"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          🏷️ Ürünler, Fiyat & Stok Yönetimi ({filteredProducts.length})
        </button>
      </div>

      {/* SEARCH / FILTERS ROW */}
      <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        {activeTab === "orders" ? (
          <div className="w-full relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Sipariş kodu, e-posta veya ID ile ara..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        ) : (
          <div className="w-full relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Ürün adı, handle veya SKU ile ara..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        )}
      </div>

      {/* CONTENT TABS */}
      {activeTab === "orders" ? (
        /* ==================== ORDERS TAB ==================== */
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-gray-50 border border-gray-150 rounded-2xl py-12 text-center text-gray-500 font-bold">
              Aranan kriterlere uygun sipariş bulunamadı.
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const orderTotal = ord.items.reduce(
                (acc: number, it: any) => acc + it.unit_price * it.quantity,
                0
              )
              const shippingMethod =
                ord.shipping_methods?.[0]?.name || "Standart Kargo"
              const shippingCost = ord.shipping_methods?.[0]?.amount ?? 0
              const isCompleted = ord.status === "completed"
              const isCanceled = ord.status === "canceled"
              const isShipped =
                ord.fulfillment_status === "shipped" ||
                ord.fulfillment_status === "delivered"

              return (
                <div
                  key={ord.id}
                  className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row justify-between items-stretch gap-6"
                >
                  {/* Left Column: Order metadata & Items */}
                  <div className="flex-1 space-y-4">
                    {/* Header line */}
                    <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 pb-3">
                      <span className="font-extrabold text-gray-900 text-lg">
                        Sipariş #{ord.display_id}
                      </span>
                      {getStatusBadge(ord.status)}
                      {getPaymentBadge(ord.payment_status)}
                      {getFulfillmentBadge(ord.fulfillment_status)}
                      <span className="text-xs text-gray-400 font-medium ml-auto">
                        {new Date(ord.created_at).toLocaleString("tr-TR")}
                      </span>
                    </div>

                    {/* Email & Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100/40">
                      <div>
                        <span className="block font-bold text-gray-700 mb-1">
                          Müşteri & İletişim
                        </span>
                        <span>{ord.email}</span>
                        {ord.shipping_address?.phone && (
                          <span className="block mt-0.5">
                            Tel: {ord.shipping_address.phone}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="block font-bold text-gray-700 mb-1">
                          Teslimat Adresi
                        </span>
                        <span className="font-semibold">
                          {ord.shipping_address?.first_name}{" "}
                          {ord.shipping_address?.last_name}
                        </span>
                        <span className="block">
                          {ord.shipping_address?.address_1}{" "}
                          {ord.shipping_address?.address_2}
                        </span>
                        <span>
                          {ord.shipping_address?.postal_code}{" "}
                          {ord.shipping_address?.city}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                        Sipariş Kalemleri
                      </span>
                      <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-2">
                        {ord.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex py-2 items-center gap-3 text-sm"
                          >
                            {item.thumbnail && (
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-10 h-10 object-cover rounded bg-gray-50 border border-gray-150 shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-gray-900 block truncate">
                                {item.title}
                              </span>
                              <span className="text-xs text-gray-500">
                                Miktar: {item.quantity} adet | SKU:{" "}
                                {item.variant_sku || "N/A"}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-gray-800 shrink-0">
                              {convertToLocale({
                                amount: item.unit_price * item.quantity,
                                currency_code: ord.currency_code,
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions & Total Price */}
                  <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-between items-stretch gap-4">
                    {/* Price summary */}
                    <div className="text-right">
                      <span className="text-xs text-gray-500 font-medium">
                        Toplam Sipariş Tutarı
                      </span>
                      <div className="text-2xl font-extrabold text-red-600 font-mono mt-1">
                        {convertToLocale({
                          amount: orderTotal + shippingCost,
                          currency_code: ord.currency_code,
                        })}
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        Kargo: {shippingMethod} (
                        {convertToLocale({
                          amount: shippingCost,
                          currency_code: ord.currency_code,
                        })}
                        )
                      </span>
                    </div>

                    {/* Action buttons stack */}
                    <div className="flex flex-col gap-2">
                      {!isCompleted && !isCanceled && (
                        <Button
                          onClick={() => handleApproveOrder(ord.id)}
                          isLoading={loadingMap[`approve-${ord.id}`]}
                          className="w-full h-10 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Siparişi Onayla
                        </Button>
                      )}

                      {!isShipped && !isCanceled && (
                        <Button
                          onClick={() => handleShipOrder(ord.id)}
                          isLoading={loadingMap[`ship-${ord.id}`]}
                          className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                            />
                          </svg>
                          Kargoya Ver
                        </Button>
                      )}

                      {!isCanceled && (
                        <Button
                          onClick={() => handleCancelOrder(ord.id)}
                          isLoading={loadingMap[`cancel-${ord.id}`]}
                          variant="secondary"
                          className="w-full h-10 border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl transition-all"
                        >
                          İptal Et
                        </Button>
                      )}

                      {(isCompleted || isCanceled) && (
                        <div className="text-center py-2 text-xs font-semibold text-gray-400 bg-gray-50 rounded-xl border border-gray-150 italic">
                          {isCanceled
                            ? "Sipariş İptal Edildi"
                            : "Sipariş Tamamlandı"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      ) : (
        /* ==================== PRODUCTS TAB ==================== */
        <div className="space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="bg-gray-50 border border-gray-150 rounded-2xl py-12 text-center text-gray-500 font-bold">
              Aranan kriterlere uygun ürün bulunamadı.
            </div>
          ) : (
            filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6"
              >
                {/* Product Thumbnail */}
                <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-gray-50 border border-gray-150 rounded-xl overflow-hidden self-start">
                  <img
                    src={prod.thumbnail}
                    alt={prod.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Content */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {prod.title}
                    </h3>
                    <span className="text-xs text-gray-400 font-mono block mt-0.5">
                      Handle: {prod.handle}
                    </span>
                  </div>

                  {/* Variants Details & Controllers */}
                  <div className="space-y-4 border-t border-gray-100 pt-4">
                    {prod.variants.map((variant: any) => {
                      // Find TRY Price
                      const tryPriceRecord = variant.prices.find(
                        (p: any) => p.currency_code === "try"
                      )
                      const priceId = tryPriceRecord?.id
                      const currentPrice = tryPriceRecord?.amount ?? 0

                      // Stock status
                      const isInventoryManaged =
                        variant.manage_inventory ?? false
                      const currentStock =
                        variant.metadata?.inventory_quantity ?? 0

                      return (
                        <div
                          key={variant.id}
                          className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100"
                        >
                          {/* Variant Label */}
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-sm text-gray-900 block">
                              {variant.title}
                            </span>
                            <span className="text-xs text-gray-500 font-mono block mt-0.5">
                              SKU: {variant.sku || "N/A"}
                            </span>
                            <div className="mt-1 flex gap-2">
                              <Badge
                                color={
                                  isInventoryManaged
                                    ? currentStock < 5
                                      ? "red"
                                      : "green"
                                    : "grey"
                                }
                                className="text-[10px]"
                              >
                                {isInventoryManaged
                                  ? `Stok Takipte: ${currentStock} Adet`
                                  : "Stok Takibi Devredışı (Sınırsız)"}
                              </Badge>
                            </div>
                          </div>

                          {/* Quick Editors */}
                          <div className="flex flex-wrap items-end gap-4 shrink-0">
                            {/* Price editor */}
                            {priceId && (
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-500">
                                  Fiyat Güncelle (TRY)
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    placeholder={currentPrice.toString()}
                                    value={editingPrice[priceId] ?? ""}
                                    onChange={(e) =>
                                      setEditingPrice((prev) => ({
                                        ...prev,
                                        [priceId]: e.target.value,
                                      }))
                                    }
                                    className="w-24 h-9 px-2.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 font-mono font-bold"
                                  />
                                  <Button
                                    onClick={() =>
                                      handleUpdatePrice(priceId, variant.id)
                                    }
                                    isLoading={loadingMap[`price-${priceId}`]}
                                    className="h-9 px-3 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-lg transition-colors shrink-0"
                                  >
                                    Güncelle
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Stock editor */}
                            <div className="flex flex-col gap-1.5 border-l border-gray-200 pl-4">
                              <label className="text-xs font-semibold text-gray-500">
                                Stok & Envanter
                              </label>
                              <div className="flex items-center gap-3 h-9">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={
                                      manageInventoryState[variant.id] !==
                                      undefined
                                        ? manageInventoryState[variant.id]
                                        : isInventoryManaged
                                    }
                                    onChange={(e) =>
                                      setManageInventoryState((prev) => ({
                                        ...prev,
                                        [variant.id]: e.target.checked,
                                      }))
                                    }
                                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                  />
                                  Takip Et
                                </label>

                                {(manageInventoryState[variant.id] !== undefined
                                  ? manageInventoryState[variant.id]
                                  : isInventoryManaged) && (
                                  <input
                                    type="number"
                                    placeholder={currentStock.toString()}
                                    value={editingStock[variant.id] ?? ""}
                                    onChange={(e) =>
                                      setEditingStock((prev) => ({
                                        ...prev,
                                        [variant.id]: e.target.value,
                                      }))
                                    }
                                    className="w-20 h-9 px-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 font-mono font-bold"
                                  />
                                )}

                                <Button
                                  onClick={() => handleUpdateStock(variant.id)}
                                  isLoading={loadingMap[`stock-${variant.id}`]}
                                  className="h-9 px-3 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-lg transition-colors shrink-0"
                                >
                                  Güncelle
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
