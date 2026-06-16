"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import CountrySelect from "@modules/checkout/components/country-select"
import Input from "@modules/common/components/input"
import Select from "@modules/common/components/select"
import { TR_CITIES_DISTRICTS } from "@lib/util/tr-cities-districts"

type Props = {
  region: HttpTypes.StoreRegion
  defaultCountryCode?: string | null
  defaultCity?: string | null
  defaultProvince?: string | null
}

/**
 * Adres formlarında Şehir(İl) + İlçe + Ülke alanları — checkout teslimat formuyla
 * AYNI eşleme: country_code === "tr" iken Şehir(İl) → `city` (İl select) ve
 * İlçe → `province` (seçilen İl'e bağlı kademeli select). Böylece hesaptan kaydedilen
 * adres, checkout'taki İl/İlçe select'lerine birebir oturur ve eksiksiz dolar.
 * tr dışı ülkelerde serbest metin (city / il-eyalet).
 *
 * Not: defaultCity/defaultProvince yalnız TR listesindeki değerlerle eşleşirse
 * seçili gelir; eski/bozuk (ör. büyük harf veya ters) kayıtlar boş başlar ki
 * kullanıcı doğru İl/İlçe'yi seçsin.
 */
export default function AddressRegionFields({
  region,
  defaultCountryCode,
  defaultCity,
  defaultProvince,
}: Props) {
  const initialCountry =
    defaultCountryCode || region?.countries?.[0]?.iso_2 || ""

  // TR için: yalnızca listeyle eşleşen değerleri ön-doldur (yoksa kullanıcı seçsin).
  const trCityValid =
    !!defaultCity && Object.prototype.hasOwnProperty.call(TR_CITIES_DISTRICTS, defaultCity)
  const trProvinceValid =
    trCityValid && !!defaultProvince &&
    TR_CITIES_DISTRICTS[defaultCity as string]?.includes(defaultProvince as string)

  const isTrInit = initialCountry === "tr"

  const [country, setCountry] = useState(initialCountry)
  const [city, setCity] = useState(
    isTrInit ? (trCityValid ? (defaultCity as string) : "") : defaultCity || ""
  )
  const [province, setProvince] = useState(
    isTrInit ? (trProvinceValid ? (defaultProvince as string) : "") : defaultProvince || ""
  )

  const isTr = country === "tr"

  return (
    <>
      {isTr ? (
        <>
          <Select
            label="Şehir (İl)"
            name="city"
            required
            value={city}
            onChange={(e) => {
              setCity(e.target.value)
              setProvince("")
            }}
            data-testid="city-select"
          >
            <option value="" disabled hidden>
              Şehir Seçiniz
            </option>
            {Object.keys(TR_CITIES_DISTRICTS).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            label="İlçe"
            name="province"
            required
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            disabled={!city}
            data-testid="province-select"
          >
            <option value="" disabled hidden>
              İlçe Seçiniz
            </option>
            {city &&
              TR_CITIES_DISTRICTS[city]?.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
          </Select>
        </>
      ) : (
        <>
          <Input
            label="Şehir"
            name="city"
            required
            autoComplete="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            data-testid="city-input"
          />
          <Input
            label="İl / Eyalet"
            name="province"
            autoComplete="address-level1"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            data-testid="state-input"
          />
        </>
      )}
      <CountrySelect
        name="country_code"
        region={region}
        required
        autoComplete="country"
        value={country}
        onChange={(e) => {
          setCountry(e.target.value)
          // Ülke değişince İl/İlçe listesi geçersizleşir → sıfırla.
          setCity("")
          setProvince("")
        }}
        data-testid="country-select"
      />
    </>
  )
}
