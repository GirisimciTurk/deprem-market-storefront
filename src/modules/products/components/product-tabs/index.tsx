"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Ürün Bilgileri",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Kargo & İade",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Malzeme</span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Üretim Ülkesi</span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Tür</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Ağırlık</span>
            <p>{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Boyutlar</span>
            <p>
              {product.length && product.width && product.height
                ? `${product.length}U x ${product.width}G x ${product.height}Y`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Hızlı Teslimat</span>
            <p className="max-w-sm">
              Siparişiniz 3-5 iş günü içinde belirtilen adrese veya
              seçtiğiniz teslim noktasına ulaştırılır.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Kolay Değişim</span>
            <p className="max-w-sm">
              Ürün beklentinizi karşılamadı mı? Sorun değil &mdash; ürününüzü
              yenisiyle değiştiriyoruz.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Kolay İade</span>
            <p className="max-w-sm">
              Ürününüzü iade edin, ücretinizi geri alın. Soru sorulmaz &mdash;
              iade sürecinizi olabildiğince zahmetsiz hale getiriyoruz.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
