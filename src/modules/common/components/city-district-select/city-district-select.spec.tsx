import React, { useState } from "react"
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import CityDistrictSelect, { districtsOf, TR_CITIES } from "./index"

function Harness(props: {
  city?: string
  district?: string
  districtOptional?: boolean
  withDistrict?: boolean
  labels?: boolean
}) {
  const [v, setV] = useState({
    city: props.city ?? "",
    district: props.district ?? "",
  })
  return (
    <>
      <CityDistrictSelect
        city={v.city}
        district={v.district}
        onChange={setV}
        districtOptional={props.districtOptional}
        withDistrict={props.withDistrict}
        className="girdi"
        {...(props.labels
          ? { cityLabel: "İl", districtLabel: "İlçe" }
          : {
              cityProps: { "aria-label": "İl" },
              districtProps: { "aria-label": "İlçe" },
            })}
      />
      <output data-testid="state">{`${v.city}|${v.district}`}</output>
    </>
  )
}

const options = (el: HTMLElement) =>
  Array.from((el as HTMLSelectElement).options).map((o) => o.value)

describe("CityDistrictSelect", () => {
  afterEach(cleanup)

  it("81 il Türkçe alfabe sırasıyla", () => {
    expect(TR_CITIES).toHaveLength(81)
    const c = TR_CITIES.indexOf("Çanakkale")
    expect(TR_CITIES[c - 1]).toBe("Bursa")
    expect(TR_CITIES.indexOf("İstanbul")).toBeGreaterThan(TR_CITIES.indexOf("Iğdır"))
    expect(TR_CITIES.indexOf("Şanlıurfa")).toBeGreaterThan(TR_CITIES.indexOf("Sivas"))
    expect(TR_CITIES.indexOf("Zonguldak")).toBe(80)
  })

  it("il seçilince ilçeler dolar; il değişince ilçe sıfırlanır", () => {
    render(<Harness />)
    const city = screen.getByLabelText("İl")
    const district = screen.getByLabelText("İlçe")
    expect(district).toBeDisabled()
    expect(city).toHaveClass("girdi")

    fireEvent.change(city, { target: { value: "İstanbul" } })
    expect(district).not.toBeDisabled()
    expect(options(district)).toEqual(["", ...districtsOf("İstanbul")])
    fireEvent.change(district, { target: { value: "Kadıköy" } })
    expect(screen.getByTestId("state")).toHaveTextContent("İstanbul|Kadıköy")

    fireEvent.change(city, { target: { value: "Ankara" } })
    expect(screen.getByTestId("state")).toHaveTextContent("Ankara|")
    expect((district as HTMLSelectElement).value).toBe("")
    expect(options(district)).toContain("Çankaya")
    expect(options(district)).not.toContain("Kadıköy")
  })

  it("listede olmayan eski il/ilçe seçili ek seçenek olarak kalır", () => {
    render(<Harness city="istanbul" district="kadikoy" />)
    const city = screen.getByLabelText("İl") as HTMLSelectElement
    const district = screen.getByLabelText("İlçe") as HTMLSelectElement
    expect(city.value).toBe("istanbul")
    expect(options(city)).toContain("istanbul")
    expect(district.value).toBe("kadikoy")
    expect(district).not.toBeDisabled()

    // Listeden il seçilince eski ilçe düşer.
    fireEvent.change(city, { target: { value: "İstanbul" } })
    expect(options(district)).not.toContain("kadikoy")
    expect(screen.getByTestId("state")).toHaveTextContent("İstanbul|")
  })

  it("bilinen ilde listede olmayan eski ilçe de korunur", () => {
    render(<Harness city="Kocaeli" district="Eski Mahalle" />)
    const district = screen.getByLabelText("İlçe") as HTMLSelectElement
    expect(district.value).toBe("Eski Mahalle")
    expect(options(district)).toContain("İzmit")
  })

  it("opsiyonel ilçe etiketi ve yalnız il kipi", () => {
    render(<Harness districtOptional />)
    expect(screen.getByLabelText("İlçe")).not.toBeRequired()
    expect(
      (screen.getByLabelText("İlçe") as HTMLSelectElement).options[0].text
    ).toBe("İlçe (opsiyonel)")
    cleanup()
    render(<Harness withDistrict={false} />)
    expect(screen.queryByLabelText("İlçe")).toBeNull()
  })

  it("etiket verilince select'ler etiketlerine bağlanır", () => {
    render(<Harness labels />)
    expect(screen.getByLabelText("İl").tagName).toBe("SELECT")
    expect(screen.getByLabelText("İlçe").tagName).toBe("SELECT")
  })
})
