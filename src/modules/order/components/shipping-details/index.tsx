import { convertToLocale } from "@lib/util/money"
import { StoreAddress, StoreOrder } from "types/store"
import { Heading, Text } from "@modules/common/components/ui"

import Divider from "@modules/common/components/divider"

type ShippingDetailsProps = {
  order: StoreOrder
}

/** Adresin gösterilen satırları; boş parçalar ve satırlar atlanır (il city'de, ilçe province'ta). */
export function shippingAddressLines(a?: StoreAddress | null): string[] {
  if (!a) return []
  const join = (parts: (string | null | undefined)[], sep: string) =>
    parts.map((p) => p?.trim()).filter(Boolean).join(sep)
  const place = join([a.province, a.city], " / ")

  return [
    join([a.first_name, a.last_name], " "),
    a.company?.trim(),
    join([a.address_1, a.address_2], " "),
    join([a.postal_code, place], " "),
    a.country_code?.toUpperCase(),
  ].filter((l): l is string => !!l)
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  const addressLines = shippingAddressLines(order.shipping_address)

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        Teslimat
      </Heading>
      <div className="flex items-start gap-x-8">
        <div
          className="flex flex-col w-1/3"
          data-testid="shipping-address-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">
            Teslimat Adresi
          </Text>
          {addressLines.length ? (
            addressLines.map((line, i) => (
              <Text key={i} className="txt-medium text-ui-fg-subtle">
                {line}
              </Text>
            ))
          ) : (
            <Text className="txt-medium text-ui-fg-subtle">—</Text>
          )}
        </div>

        <div
          className="flex flex-col w-1/3 "
          data-testid="shipping-contact-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">İletişim</Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.phone}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">{order.email}</Text>
        </div>

        <div
          className="flex flex-col w-1/3"
          data-testid="shipping-method-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">Yöntem</Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {(order.shipping_methods?.[0] as { name?: string })?.name} (
            {convertToLocale({
              amount: order.shipping_methods?.[0].total ?? 0,
              currency_code: order.currency_code,
            })}
            )
          </Text>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default ShippingDetails
