import { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import Select from "@modules/common/components/select"
import { TR_CITIES_DISTRICTS } from "@lib/util/tr-cities-districts"
import React, { useState } from "react"
import { useTranslations } from "next-intl"
import CountrySelect from "../country-select"

const isValidTCKN = (val: string): boolean => {
  if (val.length !== 11) return false
  if (!/^\d+$/.test(val)) return false
  if (val[0] === "0") return false

  const digits = val.split("").map(Number)
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7]

  const digit10 = (oddSum * 7 - evenSum) % 10
  if (digit10 !== digits[9]) return false

  const totalSum = digits.slice(0, 10).reduce((a, b) => a + b, 0)
  if (totalSum % 10 !== digits[10]) return false

  return true
}

const isValidVKN = (val: string): boolean => {
  if (val.length !== 10) return false
  if (!/^\d+$/.test(val)) return false

  const digits = val.split("").map(Number)
  let sum = 0
  for (let i = 0; i < 9; i++) {
    const v1 = (digits[i] + 9 - i) % 10
    if (v1 === 0) continue
    const v2 = (v1 * Math.pow(2, 9 - i)) % 9
    sum += v2 === 0 ? 9 : v2
  }
  const checksum = (10 - (sum % 10)) % 10
  return checksum === digits[9]
}

const BillingAddress = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const t = useTranslations("billingAddress")
  // TR: geçersiz İl/İlçe değerlerini (eski/bozuk kayıt) yanlış "Adana" fallback'ine
  // düşmesin diye boşa çevir; kullanıcı doğru seçer.
  const billingCountry = cart?.billing_address?.country_code || ""
  const rawBillingCity = cart?.billing_address?.city || ""
  const rawBillingProvince = cart?.billing_address?.province || ""
  const initBillingCity =
    billingCountry === "tr" &&
    !Object.prototype.hasOwnProperty.call(TR_CITIES_DISTRICTS, rawBillingCity)
      ? ""
      : rawBillingCity
  const initBillingProvince =
    billingCountry === "tr" &&
    !(initBillingCity && TR_CITIES_DISTRICTS[initBillingCity]?.includes(rawBillingProvince))
      ? ""
      : rawBillingProvince

  const [formData, setFormData] = useState<Record<string, string>>({
    "billing_address.first_name": cart?.billing_address?.first_name || "",
    "billing_address.last_name": cart?.billing_address?.last_name || "",
    "billing_address.address_1": cart?.billing_address?.address_1 || "",
    "billing_address.company": cart?.billing_address?.company || "",
    "billing_address.postal_code": cart?.billing_address?.postal_code || "",
    "billing_address.city": initBillingCity,
    "billing_address.country_code": billingCountry,
    "billing_address.province": initBillingProvince,
    "billing_address.phone": cart?.billing_address?.phone || "",
  })

  const [invoiceType, setInvoiceType] = useState<"individual" | "corporate">(
    () => {
      const company = cart?.billing_address?.company || ""
      const address2 = cart?.billing_address?.address_2 || ""
      if (company || address2.startsWith("Vergi No:")) {
        return "corporate"
      }
      return "individual"
    }
  )

  const [tckn, setTckn] = useState(() => {
    const address2 = cart?.billing_address?.address_2 || ""
    if (address2.startsWith("TCKN:")) {
      return address2.replace("TCKN: ", "")
    }
    return ""
  })

  const [taxNumber, setTaxNumber] = useState(() => {
    const address2 = cart?.billing_address?.address_2 || ""
    if (address2.startsWith("Vergi No:")) {
      const parts = address2.split(", ")
      return parts[0]?.replace("Vergi No: ", "") || ""
    }
    return ""
  })

  const [taxOffice, setTaxOffice] = useState(() => {
    const address2 = cart?.billing_address?.address_2 || ""
    if (address2.startsWith("Vergi No:")) {
      const parts = address2.split(", ")
      return parts[1]?.replace("Vergi Dairesi: ", "") || ""
    }
    return ""
  })

  const [companyName, setCompanyName] = useState(() => {
    return cart?.billing_address?.company || ""
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      }

      if (name === "billing_address.country_code") {
        if (value === "tr") {
          updated["billing_address.city"] = ""
          updated["billing_address.province"] = ""
        }
      }

      if (name === "billing_address.city") {
        if (prev["billing_address.country_code"] === "tr") {
          updated["billing_address.province"] = ""
        }
      }

      return updated
    })
  }

  const tcknError =
    tckn.length > 0 && tckn.length < 11
      ? t("tcknLengthError")
      : tckn.length === 11 && !isValidTCKN(tckn)
      ? t("tcknInvalidError")
      : ""

  const vknError =
    taxNumber.length > 0 && taxNumber.length < 10
      ? t("vknLengthError")
      : taxNumber.length === 10 && !isValidVKN(taxNumber)
      ? t("vknInvalidError")
      : ""

  const isTr = formData["billing_address.country_code"] === "tr"

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {isTr && (
          <div className="col-span-2 flex flex-col gap-y-2 mb-2">
            <label className="text-small-semi text-ui-fg-base">
              {t("invoiceType")}
            </label>
            <div className="flex gap-x-4">
              <button
                type="button"
                onClick={() => setInvoiceType("individual")}
                className={`flex-1 py-2.5 px-4 border rounded-md text-sm font-semibold transition-all duration-200 ${
                  invoiceType === "individual"
                    ? "bg-brand-50 border-brand-500 text-brand-700"
                    : "bg-white border-ui-border-base text-ui-fg-subtle hover:bg-ui-bg-field-hover"
                }`}
              >
                {t("individualInvoice")}
              </button>
              <button
                type="button"
                onClick={() => setInvoiceType("corporate")}
                className={`flex-1 py-2.5 px-4 border rounded-md text-sm font-semibold transition-all duration-200 ${
                  invoiceType === "corporate"
                    ? "bg-brand-50 border-brand-500 text-brand-700"
                    : "bg-white border-ui-border-base text-ui-fg-subtle hover:bg-ui-bg-field-hover"
                }`}
              >
                {t("corporateInvoice")}
              </button>
            </div>
          </div>
        )}

        <Input
          label={t("firstName")}
          name="billing_address.first_name"
          autoComplete="given-name"
          value={formData["billing_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="billing-first-name-input"
        />
        <Input
          label={t("lastName")}
          name="billing_address.last_name"
          autoComplete="family-name"
          value={formData["billing_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="billing-last-name-input"
        />
        <Input
          label={t("address")}
          name="billing_address.address_1"
          autoComplete="address-line1"
          value={formData["billing_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="billing-address-input"
        />

        {isTr ? (
          invoiceType === "individual" ? (
            <div className="col-span-2">
              <Input
                label={t("tckn")}
                name="tckn_input"
                value={tckn}
                onChange={(e) =>
                  setTckn(e.target.value.replace(/\D/g, "").slice(0, 11))
                }
                required
                maxLength={11}
                pattern="^[1-9]\d{10}$"
              />
              {tcknError && (
                <span className="text-ui-fg-error text-xs mt-1 block">
                  {tcknError}
                </span>
              )}
            </div>
          ) : (
            <>
              <div className="col-span-2">
                <Input
                  label={t("companyName")}
                  name="company_input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  label={t("taxNumber")}
                  name="tax_number_input"
                  value={taxNumber}
                  onChange={(e) =>
                    setTaxNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  required
                  maxLength={10}
                  pattern="^\d{10}$"
                />
                {vknError && (
                  <span className="text-ui-fg-error text-xs mt-1 block">
                    {vknError}
                  </span>
                )}
              </div>
              <div>
                <Input
                  label={t("taxOffice")}
                  name="tax_office_input"
                  value={taxOffice}
                  onChange={(e) => setTaxOffice(e.target.value)}
                  required
                />
              </div>
            </>
          )
        ) : (
          <Input
            label={t("company")}
            name="billing_address.company"
            value={formData["billing_address.company"]}
            onChange={handleChange}
            autoComplete="organization"
            data-testid="billing-company-input"
          />
        )}

        <Input
          label={t("postalCode")}
          name="billing_address.postal_code"
          autoComplete="postal-code"
          value={formData["billing_address.postal_code"]}
          onChange={handleChange}
          required
          data-testid="billing-postal-input"
        />
        {isTr ? (
          <Select
            label={t("cityProvince")}
            name="billing_address.city"
            value={formData["billing_address.city"]}
            onChange={handleChange}
            required
            data-testid="billing-city-select"
          >
            <option value="" disabled hidden>
              {t("selectCity")}
            </option>
            {Object.keys(TR_CITIES_DISTRICTS).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
        ) : (
          <Input
            label={t("city")}
            name="billing_address.city"
            autoComplete="address-level2"
            value={formData["billing_address.city"]}
            onChange={handleChange}
            required
            data-testid="billing-city-input"
          />
        )}
        <CountrySelect
          name="billing_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["billing_address.country_code"]}
          onChange={handleChange}
          required
          data-testid="billing-country-select"
        />
        {isTr ? (
          <Select
            label={t("district")}
            name="billing_address.province"
            value={formData["billing_address.province"]}
            onChange={handleChange}
            required
            data-testid="billing-province-select"
            disabled={!formData["billing_address.city"]}
          >
            <option value="" disabled hidden>
              {t("selectDistrict")}
            </option>
            {formData["billing_address.city"] &&
              TR_CITIES_DISTRICTS[formData["billing_address.city"]]?.map(
                (district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                )
              )}
          </Select>
        ) : (
          <Input
            label={t("districtArea")}
            name="billing_address.province"
            autoComplete="address-level1"
            value={formData["billing_address.province"]}
            onChange={handleChange}
            data-testid="billing-province-input"
          />
        )}
        <Input
          label={t("phone")}
          name="billing_address.phone"
          autoComplete="tel"
          value={formData["billing_address.phone"]}
          onChange={handleChange}
          data-testid="billing-phone-input"
        />
      </div>

      {isTr && (
        <>
          <input
            type="hidden"
            name="billing_address.company"
            value={invoiceType === "corporate" ? companyName : ""}
          />
          <input
            type="hidden"
            name="billing_address.address_2"
            value={
              invoiceType === "corporate"
                ? `Vergi No: ${taxNumber}, Vergi Dairesi: ${taxOffice}`
                : `TCKN: ${tckn}`
            }
          />
        </>
      )}
    </>
  )
}

export default BillingAddress
