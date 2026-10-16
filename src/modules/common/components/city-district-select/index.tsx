"use client"

import React, { useId } from "react"
import { TR_CITIES_DISTRICTS } from "@lib/util/tr-cities-districts"

const byTurkish = (a: string, b: string) => a.localeCompare(b, "tr")

/** 81 il, Türkçe alfabe sırasıyla. */
export const TR_CITIES: string[] = Object.keys(TR_CITIES_DISTRICTS).sort(byTurkish)

const districtCache = new Map<string, string[]>()

/** İlin ilçeleri, Türkçe alfabe sırasıyla; listede olmayan il için boş. */
export function districtsOf(city: string): string[] {
  if (!Object.prototype.hasOwnProperty.call(TR_CITIES_DISTRICTS, city)) return []
  let list = districtCache.get(city)
  if (!list) {
    list = [...TR_CITIES_DISTRICTS[city]].sort(byTurkish)
    districtCache.set(city, list)
  }
  return list
}

export function isKnownCity(city: string): boolean {
  return Object.prototype.hasOwnProperty.call(TR_CITIES_DISTRICTS, city)
}

type SelectAttrs = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "defaultValue" | "onChange" | "className" | "disabled" | "children"
> & { "data-testid"?: string }

type Props = {
  city: string
  district?: string
  /** İl değişince ilçe sıfırlanır: { city: yeni, district: "" }. */
  onChange: (next: { city: string; district: string }) => void
  /** false ise yalnız il seçimi görünür. */
  withDistrict?: boolean
  districtOptional?: boolean
  required?: boolean
  disabled?: boolean
  /** Her iki select'in sınıfı — formun kendi girdi sınıfı. */
  className?: string
  cityPlaceholder?: string
  districtPlaceholder?: string
  /** Verilirse her select kendi etiketiyle bir sarmalayıcıya girer. */
  cityLabel?: React.ReactNode
  districtLabel?: React.ReactNode
  labelClassName?: string
  fieldClassName?: string
  cityProps?: SelectAttrs
  districtProps?: SelectAttrs
}

/**
 * İl → ilçe kademeli seçimi (TR_CITIES_DISTRICTS). İl değişince ilçe sıfırlanır.
 * Listede olmayan eski serbest metin değer kaybolmaz: seçili ek seçenek olarak
 * gösterilir, kullanıcı listeden bir değer seçene kadar aynen gönderilir.
 * Etiket verilmezse iki select yan yana (fragment) döner; yerleşim formundur.
 */
export default function CityDistrictSelect({
  city,
  district = "",
  onChange,
  withDistrict = true,
  districtOptional = false,
  required = false,
  disabled = false,
  className,
  cityPlaceholder = "İl seçin",
  districtPlaceholder,
  cityLabel,
  districtLabel,
  labelClassName,
  fieldClassName,
  cityProps,
  districtProps,
}: Props) {
  const autoId = useId()
  const cityId = cityProps?.id ?? `${autoId}-city`
  const districtId = districtProps?.id ?? `${autoId}-district`

  const legacyCity = !!city && !isKnownCity(city)
  const districts = districtsOf(city)
  const legacyDistrict = !!district && !districts.includes(district)
  const noDistricts = districts.length === 0 && !legacyDistrict

  const citySelect = (
    <select
      {...cityProps}
      id={cityId}
      required={required}
      disabled={disabled}
      value={city}
      onChange={(e) => onChange({ city: e.target.value, district: "" })}
      className={className}
    >
      <option value="">{cityPlaceholder}</option>
      {legacyCity && <option value={city}>{city}</option>}
      {TR_CITIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  )

  const districtSelect = withDistrict ? (
    <select
      {...districtProps}
      id={districtId}
      required={required && !districtOptional}
      disabled={disabled || noDistricts}
      value={district}
      onChange={(e) => onChange({ city, district: e.target.value })}
      className={className}
    >
      <option value="">
        {districtPlaceholder ??
          (districtOptional ? "İlçe (opsiyonel)" : "İlçe seçin")}
      </option>
      {legacyDistrict && <option value={district}>{district}</option>}
      {districts.map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      ))}
    </select>
  ) : null

  if (cityLabel === undefined && districtLabel === undefined) {
    return (
      <>
        {citySelect}
        {districtSelect}
      </>
    )
  }

  return (
    <>
      <div className={fieldClassName}>
        <label htmlFor={cityId} className={labelClassName}>
          {cityLabel}
        </label>
        {citySelect}
      </div>
      {districtSelect && (
        <div className={fieldClassName}>
          <label htmlFor={districtId} className={labelClassName}>
            {districtLabel}
          </label>
          {districtSelect}
        </div>
      )}
    </>
  )
}
