import React from "react"
import { Metadata } from "next"
import { getAdminDashboardData } from "@lib/data/admin"
import AdminDashboardClient from "@modules/admin/components/admin-dashboard-client"

export const metadata: Metadata = {
  title: "Admin Yönetim Paneli | EKYP Deprem Market",
  description: "Sipariş ve ürün fiyat/stok yönetimi.",
}

export default async function AdminPage() {
  const data = await getAdminDashboardData()

  // Graceful fallback if data fetch fails or returns undefined
  const orders = data?.orders || []
  const products = data?.products || []

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminDashboardClient initialOrders={orders} initialProducts={products} />
    </div>
  )
}
