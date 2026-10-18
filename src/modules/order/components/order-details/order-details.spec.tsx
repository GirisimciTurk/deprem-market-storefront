import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import type { StoreOrder } from "types/store"
import OrderDetails from "./index"
import ShippingDetails, { shippingAddressLines } from "../shipping-details"

const order = (o: Partial<StoreOrder> = {}) =>
  ({
    id: "order_1",
    display_id: 2,
    email: "alici@test",
    status: "pending",
    fulfillment_status: "not_fulfilled",
    payment_status: "captured",
    currency_code: "try",
    created_at: "2026-10-17T23:53:53Z",
    items: [],
    shipping_methods: [{ id: "sm_1", name: "Yurtiçi Kargo - Standart", amount: 13000, total: 13000 }],
    ...o,
  }) as unknown as StoreOrder

describe("sipariş ayrıntısı", () => {
  it("sipariş ve ödeme durumunu Türkçe gösterir", () => {
    render(<OrderDetails order={order()} showStatus />)
    expect(screen.getByTestId("order-status")).toHaveTextContent("Hazırlanıyor")
    expect(screen.getByTestId("order-payment-status")).toHaveTextContent("Ödendi")
  })

  it("dtm'nin aşama adı varsa onu gösterir", () => {
    render(
      <OrderDetails order={order({ fulfillment_status: "shipped", stage_label: "Kargoya Verildi" })} showStatus />
    )
    expect(screen.getByTestId("order-status")).toHaveTextContent("Kargoya Verildi")
  })

  it("teslimat adresini satır satır gösterir", () => {
    render(
      <ShippingDetails
        order={order({
          shipping_address: {
            first_name: "Deniz",
            last_name: "Alıcı",
            address_1: "Atatürk Cad. 1",
            city: "İzmir",
            province: "Konak",
            postal_code: "35000",
            country_code: "tr",
          },
        })}
      />
    )
    const box = screen.getByTestId("shipping-address-summary")
    expect(box).toHaveTextContent("Deniz Alıcı")
    expect(box).toHaveTextContent("Atatürk Cad. 1")
    expect(box).toHaveTextContent("35000 Konak / İzmir")
    expect(box).toHaveTextContent("TR")
  })

  it("adres yoksa yalnız virgül değil, boş işaret gösterir", () => {
    expect(shippingAddressLines(null)).toEqual([])
    expect(shippingAddressLines({ postal_code: "", city: "" })).toEqual([])
    render(<ShippingDetails order={order()} />)
    expect(screen.getByTestId("shipping-address-summary")).not.toHaveTextContent(",")
  })
})
