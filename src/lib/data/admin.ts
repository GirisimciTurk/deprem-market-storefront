"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"

export const getAdminDashboardData = async () => {
  return sdk.client
    .fetch<{ orders: any[]; products: any[]; promotions?: any[] }>(`/store/admin-dashboard`, {
      method: "GET",
      cache: "no-cache",
    })
    .catch((err) => medusaError(err))
}

export const executeAdminAction = async (action: string, payload: any) => {
  return sdk.client
    .fetch<{ success: boolean; updated?: any; updatedVariant?: any; created?: any }>(`/store/admin-dashboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, payload }),
      cache: "no-cache",
    })
    .catch((err) => medusaError(err))
}

export const approveOrder = async (orderId: string) => {
  return executeAdminAction("approve_order", { order_id: orderId })
}

export const shipOrder = async (orderId: string, trackingNumber?: string, providerId?: string) => {
  return executeAdminAction("ship_order", { 
    order_id: orderId, 
    tracking_number: trackingNumber || "TR-EXPRESS-123456", 
    provider_id: providerId || "Trend Express" 
  })
}

export const cancelOrder = async (orderId: string) => {
  return executeAdminAction("cancel_order", { order_id: orderId })
}

export const updateProductPrice = async (priceId: string, amount: number) => {
  return executeAdminAction("update_price", { price_id: priceId, amount })
}

export const updateProductStock = async (variantId: string, inventoryQuantity: number, manageInventory: boolean) => {
  return executeAdminAction("update_stock", { 
    variant_id: variantId, 
    inventory_quantity: inventoryQuantity, 
    manage_inventory: manageInventory 
  })
}

export const createPromotion = async (code: string, type: "percentage" | "fixed", value: number, targetType: "order" | "item" | "shipping") => {
  return executeAdminAction("create_promotion", {
    code,
    type,
    value,
    target_type: targetType,
  })
}

export const deletePromotion = async (promotionId: string) => {
  return executeAdminAction("delete_promotion", { promotion_id: promotionId })
}
