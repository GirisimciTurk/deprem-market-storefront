import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

type CartLineItem = NonNullable<HttpTypes.StoreCart["items"]>[number]

type SellerInfo = { id: string; name: string; handle?: string }

const getSeller = (item: CartLineItem): SellerInfo | undefined =>
  (item.product as any)?.seller

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items

  const sortedItems = items
    ? [...items].sort((a, b) =>
        (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
      )
    : undefined

  // Satıcıya göre grupla (satıcısı olmayanlar tek bir "diğer" grubuna düşer).
  // Grup sırası, ilk görülen ürünün sıralamasını korur.
  const groups: { seller?: SellerInfo; items: CartLineItem[] }[] = []
  if (sortedItems) {
    const indexByKey = new Map<string, number>()
    for (const item of sortedItems) {
      const seller = getSeller(item)
      const key = seller?.id ?? "__no_seller__"
      let idx = indexByKey.get(key)
      if (idx === undefined) {
        idx = groups.length
        indexByKey.set(key, idx)
        groups.push({ seller, items: [] })
      }
      groups[idx].items.push(item)
    }
  }

  const showSellerHeaders = groups.length > 1

  return (
    <div>
      <div className="pb-3 flex items-center">
        <Heading className="text-[2rem] leading-[2.75rem]">Sepet</Heading>
      </div>
      <Table>
        <Table.Header className="border-t-0">
          <Table.Row className="text-ui-fg-subtle txt-medium-plus">
            <Table.HeaderCell className="!pl-0">Ürün</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
            <Table.HeaderCell className="px-1 small:px-4">Adet</Table.HeaderCell>
            <Table.HeaderCell className="hidden small:table-cell">
              Fiyat
            </Table.HeaderCell>
            <Table.HeaderCell className="!pr-0 text-right">
              Toplam
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedItems
            ? groups.flatMap((group) => {
                const rows = []
                if (showSellerHeaders) {
                  const seller = group.seller
                  const name = seller?.name ?? "Diğer satıcılar"
                  rows.push(
                    <Table.Row
                      key={`seller-${seller?.id ?? "none"}`}
                      className="border-b-0"
                    >
                      <Table.Cell
                        colSpan={5}
                        className="!pl-0 pt-4 pb-1 text-sm font-semibold text-gray-700"
                      >
                        Satıcı:{" "}
                        {seller?.handle ? (
                          <LocalizedClientLink
                            href={`/satici/${seller.handle}`}
                            className="text-orange-600 hover:text-orange-500 transition-colors"
                          >
                            {name}
                          </LocalizedClientLink>
                        ) : (
                          <span className="text-orange-600">{name}</span>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  )
                }
                group.items.forEach((item) => {
                  rows.push(
                    <Item
                      key={item.id}
                      item={item}
                      currencyCode={cart?.currency_code ?? ""}
                    />
                  )
                })
                return rows
              })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default ItemsTemplate
