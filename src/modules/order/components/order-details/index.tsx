import { StoreOrder } from "types/store"
import { Text } from "@modules/common/components/ui"
import {
  getFulfillmentLabel,
  getPaymentLabel,
} from "@modules/order-tracking/components/tracking-utils"

type OrderDetailsProps = {
  order: StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  // dtm'nin aşama adı ("Kargoya Verildi") varsa o; yoksa durumun Türkçesi.
  const orderStatus =
    order.stage_label || getFulfillmentLabel(order.fulfillment_status).text
  const paymentStatus = getPaymentLabel(order.payment_status).text

  return (
    <div>
      <Text>
        Sipariş onayı detayları{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        {" "}adresine gönderildi.
      </Text>
      <Text className="mt-2">
        Sipariş tarihi:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        Sipariş numarası: <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              Sipariş durumu:{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {orderStatus}
              </span>
            </Text>
            <Text>
              Ödeme durumu:{" "}
              <span
                className="text-ui-fg-subtle "
                data-testid="order-payment-status"
              >
                {paymentStatus}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
