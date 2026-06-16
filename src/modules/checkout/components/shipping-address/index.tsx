import { HttpTypes } from "@medusajs/types"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import Select from "@modules/common/components/select"
import { TR_CITIES_DISTRICTS } from "@lib/util/tr-cities-districts"
import compareAddresses from "@lib/util/compare-addresses"
import { CheckCircleSolid } from "@medusajs/icons"
import { Home, Briefcase, MapPin, Plus, ChevronLeft } from "lucide-react"
import React, { useEffect, useMemo, useRef, useState } from "react"
import CountrySelect from "../country-select"

const labelIcon = (name?: string | null) => {
  const n = String(name || "").toLocaleLowerCase("tr")
  if (n.includes("ev")) return Home
  if (n.includes("iş") || n.includes("is")) return Briefcase
  return MapPin
}

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.address_2": cart?.shipping_address?.address_2 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code": cart?.shipping_address?.country_code || "",
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // Bölgedeki kayıtlı adresler.
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ) ?? [],
    [customer?.addresses, countriesInRegion]
  )
  const hasSaved = addressesInRegion.length > 0

  // Mod: kayıtlı adres varsa hızlı "seç" modu; yoksa manuel form.
  const [mode, setMode] = useState<"saved" | "manual">(
    hasSaved ? "saved" : "manual"
  )
  // Kart tıklamasıyla seçildiğinde formu otomatik gönder (teslimat adımına geç).
  const [pendingSubmit, setPendingSubmit] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    if (address) {
      const countryCode = address?.country_code || ""
      let city = address?.city || ""
      let province = address?.province || ""
      // TR: yalnız geçerli İl/İlçe değerlerini ön-doldur (bozuk kayıtlar boş kalsın).
      if (countryCode === "tr") {
        const cityValid = Object.prototype.hasOwnProperty.call(
          TR_CITIES_DISTRICTS,
          city
        )
        city = cityValid ? city : ""
        province =
          city && TR_CITIES_DISTRICTS[city]?.includes(province) ? province : ""
      }
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.address_2": address?.address_2 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": city,
        "shipping_address.country_code": countryCode,
        "shipping_address.province": province,
        "shipping_address.phone": address?.phone || "",
      }))
    }

    if (email) {
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        email: email,
      }))
    }
  }

  useEffect(() => {
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart])

  // Seçili kartı ID ile takip et (compareAddresses null/"" farkında kırılgan).
  const [selectedId, setSelectedId] = useState<string>("")

  // İlk açılış: sepette adres varsa eşleşen kartı vurgula; yoksa varsayılanı ön-doldur.
  const didInit = useRef(false)
  useEffect(() => {
    if (didInit.current || !hasSaved) return
    didInit.current = true
    if (cart?.shipping_address?.address_1) {
      const match = addressesInRegion.find((a) =>
        compareAddresses(a, cart.shipping_address as object)
      )
      if (match) setSelectedId(match.id)
    } else {
      const pre =
        addressesInRegion.find((a) => a.is_default_shipping) ||
        addressesInRegion[0]
      if (pre) {
        setSelectedId(pre.id)
        setFormAddress(pre as HttpTypes.StoreCartAddress, customer?.email || undefined)
      }
    }
  }, [hasSaved])

  // Kart seçilince: vurgula + formu doldur + (fatura adresi aynıysa) otomatik gönder.
  const handlePickSaved = (address: HttpTypes.StoreCustomerAddress) => {
    setSelectedId(address.id)
    setFormAddress(address as HttpTypes.StoreCartAddress, customer?.email || undefined)
    if (checked) setPendingSubmit(true)
  }

  // pendingSubmit + formData güncellendikten SONRA formu gönder (gizli alanlar hazır).
  useEffect(() => {
    if (pendingSubmit) {
      rootRef.current?.closest("form")?.requestSubmit()
      setPendingSubmit(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSubmit, formData])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      if (name === "shipping_address.country_code" && value === "tr") {
        updated["shipping_address.city"] = ""
        updated["shipping_address.province"] = ""
      }
      if (
        name === "shipping_address.city" &&
        prev["shipping_address.country_code"] === "tr"
      ) {
        updated["shipping_address.province"] = ""
      }
      return updated
    })
  }

  // Manuel formdaki tüm shipping_address.* + email alanları (gizli kopya — kayıtlı
  // mod gönderiminde server action'a taşınır; required YOK ki gizli alan validasyonu kırılmasın).
  const hiddenFields = (
    <>
      {Object.entries(formData).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
    </>
  )

  return (
    <div ref={rootRef}>
      {/* ---------- KAYITLI ADRES SEÇİMİ (hızlı) ---------- */}
      {mode === "saved" && hasSaved ? (
        <div className="flex flex-col gap-y-4">
          <p className="text-small-regular text-ui-fg-subtle">
            {`Merhaba ${customer?.first_name || ""}, teslimat adresini seç — tıklayınca otomatik devam edilir.`}
          </p>
          <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
            {addressesInRegion.map((a) => {
              const Icon = labelIcon((a as any).address_name)
              const isSel = selectedId === a.id
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => handlePickSaved(a)}
                  data-testid="saved-address-card"
                  className={`relative text-left border-2 rounded-rounded p-4 transition-colors ${
                    isSel
                      ? "border-brand-600 bg-brand-50"
                      : "border-ui-border-base hover:border-brand-300"
                  }`}
                >
                  {isSel && (
                    <CheckCircleSolid className="absolute top-3 right-3 text-brand-600" />
                  )}
                  {(a as any).address_name && (
                    <div className="flex items-center gap-1.5 mb-1.5 text-brand-700">
                      <Icon size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {(a as any).address_name}
                      </span>
                    </div>
                  )}
                  <div className="text-base-semi">
                    {a.first_name} {a.last_name}
                  </div>
                  <div className="text-small-regular text-ui-fg-subtle mt-1 leading-relaxed">
                    <div>
                      {a.address_1}
                      {a.address_2 ? `, ${a.address_2}` : ""}
                    </div>
                    <div>
                      {a.province ? `${a.province}, ` : ""}
                      {a.city}
                      {a.postal_code ? ` ${a.postal_code}` : ""}
                    </div>
                    {a.phone && <div>{a.phone}</div>}
                  </div>
                </button>
              )
            })}

            {/* Yeni adres ile devam */}
            <button
              type="button"
              onClick={() => setMode("manual")}
              data-testid="new-address-card"
              className="border-2 border-dashed border-ui-border-base rounded-rounded p-4 flex flex-col items-center justify-center gap-2 text-ui-fg-subtle hover:border-brand-400 hover:text-brand-600 transition-colors min-h-[120px]"
            >
              <span className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                <Plus size={18} />
              </span>
              <span className="text-small-regular font-semibold">
                Yeni adres gir
              </span>
            </button>
          </div>

          {/* same-as-billing seçeneği seç-modunda da görünür (kapatılırsa fatura adresi açılır) */}
          <div className="mt-2">
            <Checkbox
              label="Fatura adresi teslimat adresiyle aynı"
              name="same_as_billing"
              checked={checked}
              onChange={onChange}
              data-testid="billing-address-checkbox"
            />
          </div>

          {hiddenFields}
        </div>
      ) : (
        /* ---------- MANUEL FORM (yeni/farklı adres) ---------- */
        <>
          {hasSaved && (
            <button
              type="button"
              onClick={() => setMode("saved")}
              className="flex items-center gap-1 text-small-regular text-ui-fg-interactive hover:text-ui-fg-interactive-hover mb-4"
            >
              <ChevronLeft size={16} /> Kayıtlı adreslerimden seç
            </button>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ad"
              name="shipping_address.first_name"
              autoComplete="given-name"
              value={formData["shipping_address.first_name"]}
              onChange={handleChange}
              required
              data-testid="shipping-first-name-input"
            />
            <Input
              label="Soyad"
              name="shipping_address.last_name"
              autoComplete="family-name"
              value={formData["shipping_address.last_name"]}
              onChange={handleChange}
              required
              data-testid="shipping-last-name-input"
            />
            <div className="col-span-2">
              <Input
                label="Adres (mahalle, cadde, sokak)"
                name="shipping_address.address_1"
                autoComplete="address-line1"
                value={formData["shipping_address.address_1"]}
                onChange={handleChange}
                required
                data-testid="shipping-address-input"
              />
            </div>
            <Input
              label="Bina no, kat, daire"
              name="shipping_address.address_2"
              autoComplete="address-line2"
              value={formData["shipping_address.address_2"]}
              onChange={handleChange}
              data-testid="shipping-address-2-input"
            />
            <Input
              label="Şirket (opsiyonel)"
              name="shipping_address.company"
              value={formData["shipping_address.company"]}
              onChange={handleChange}
              autoComplete="organization"
              data-testid="shipping-company-input"
            />
            <CountrySelect
              name="shipping_address.country_code"
              autoComplete="country"
              region={cart?.region}
              value={formData["shipping_address.country_code"]}
              onChange={handleChange}
              required
              data-testid="shipping-country-select"
            />
            <Input
              label="Posta Kodu"
              name="shipping_address.postal_code"
              autoComplete="postal-code"
              value={formData["shipping_address.postal_code"]}
              onChange={handleChange}
              required
              data-testid="shipping-postal-code-input"
            />
            {formData["shipping_address.country_code"] === "tr" ? (
              <Select
                label="Şehir (İl)"
                name="shipping_address.city"
                value={formData["shipping_address.city"]}
                onChange={handleChange}
                required
                data-testid="shipping-city-select"
              >
                <option value="" disabled hidden>
                  Şehir Seçiniz
                </option>
                {Object.keys(TR_CITIES_DISTRICTS).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                label="Şehir"
                name="shipping_address.city"
                autoComplete="address-level2"
                value={formData["shipping_address.city"]}
                onChange={handleChange}
                required
                data-testid="shipping-city-input"
              />
            )}
            {formData["shipping_address.country_code"] === "tr" ? (
              <Select
                label="İlçe"
                name="shipping_address.province"
                value={formData["shipping_address.province"]}
                onChange={handleChange}
                required
                data-testid="shipping-province-select"
                disabled={!formData["shipping_address.city"]}
              >
                <option value="" disabled hidden>
                  İlçe Seçiniz
                </option>
                {formData["shipping_address.city"] &&
                  TR_CITIES_DISTRICTS[formData["shipping_address.city"]]?.map(
                    (district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    )
                  )}
              </Select>
            ) : (
              <Input
                label="İlçe / Semt"
                name="shipping_address.province"
                autoComplete="address-level1"
                value={formData["shipping_address.province"]}
                onChange={handleChange}
                data-testid="shipping-province-input"
              />
            )}
          </div>
          <div className="my-8">
            <Checkbox
              label="Fatura adresi teslimat adresiyle aynı"
              name="same_as_billing"
              checked={checked}
              onChange={onChange}
              data-testid="billing-address-checkbox"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="E-posta"
              name="email"
              type="email"
              title="Geçerli bir e-posta adresi girin."
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
              data-testid="shipping-email-input"
            />
            <Input
              label="Telefon"
              name="shipping_address.phone"
              autoComplete="tel"
              value={formData["shipping_address.phone"]}
              onChange={handleChange}
              data-testid="shipping-phone-input"
            />
          </div>
        </>
      )}
    </div>
  )
}

export default ShippingAddress
