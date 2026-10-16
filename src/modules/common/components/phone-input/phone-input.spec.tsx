import React, { useState } from "react"
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import PhoneInput, { useTrPhoneField } from "./index"

function Controlled({ initial = "", mobileOnly = false }) {
  const [v, setV] = useState(initial)
  return (
    <form>
      <PhoneInput
        aria-label="Telefon"
        value={v}
        onChange={setV}
        mobileOnly={mobileOnly}
        className="girdi"
      />
      <output data-testid="state">{v}</output>
    </form>
  )
}

function HookField({ initial }: { initial?: string | null }) {
  const phone = useTrPhoneField(initial, { mobileOnly: true })
  return <input aria-label="Hesap telefonu" name="phone" {...phone.inputProps} />
}

describe("PhoneInput", () => {
  afterEach(cleanup)

  it("tel klavyesi açar ve formun sınıfını taşır", () => {
    render(<Controlled />)
    const input = screen.getByLabelText("Telefon")
    expect(input).toHaveAttribute("type", "tel")
    expect(input).toHaveAttribute("inputmode", "tel")
    expect(input).toHaveClass("girdi")
    expect(input).toHaveAttribute("placeholder", "0 5xx xxx xx xx")
  })

  it("yalnız rakam alır ve yazdıkça biçimler", () => {
    render(<Controlled />)
    const input = screen.getByLabelText("Telefon") as HTMLInputElement
    fireEvent.change(input, { target: { value: "5" } })
    expect(input.value).toBe("0 5")
    fireEvent.change(input, { target: { value: "0 532a1b2" } })
    expect(input.value).toBe("0 532 12")
    fireEvent.change(input, { target: { value: "053212345678" } })
    expect(input.value).toBe("0 532 123 45 67")
    expect(screen.getByTestId("state")).toHaveTextContent("0 532 123 45 67")
  })

  it("başka biçimde gelen başlangıç değerini biçimlenmiş gösterir", () => {
    render(<Controlled initial="+905321234567" />)
    expect((screen.getByLabelText("Telefon") as HTMLInputElement).value).toBe(
      "0 532 123 45 67"
    )
  })

  it("eksik numarada alan geçersiz olur ve Türkçe ileti taşır", () => {
    render(<Controlled />)
    const input = screen.getByLabelText("Telefon") as HTMLInputElement
    expect(input.validity.valid).toBe(true)
    fireEvent.change(input, { target: { value: "0532 12" } })
    expect(input.validity.valid).toBe(false)
    expect(input.validationMessage).toMatch(/eksiksiz/)
    fireEvent.change(input, { target: { value: "0212 123 45 67" } })
    expect(input.validity.valid).toBe(true)
  })

  it("mobileOnly sabit hattı geçersiz sayar", () => {
    render(<Controlled initial="02121234567" mobileOnly />)
    const input = screen.getByLabelText("Telefon") as HTMLInputElement
    expect(input.validationMessage).toMatch(/cep telefonu/)
  })
})

describe("useTrPhoneField", () => {
  afterEach(cleanup)

  it("hesaptaki +90 numarayı biçimler, girdiyi biçimler ve doğrular", () => {
    render(<HookField initial="+905321234567" />)
    const input = screen.getByLabelText("Hesap telefonu") as HTMLInputElement
    expect(input.value).toBe("0 532 123 45 67")
    expect(input).toHaveAttribute("inputmode", "tel")
    fireEvent.change(input, { target: { value: "05321" } })
    expect(input.value).toBe("0 532 1")
    expect(input.validity.valid).toBe(false)
  })

  it("boş başlangıç boş ve geçerli kalır", () => {
    render(<HookField initial={null} />)
    const input = screen.getByLabelText("Hesap telefonu") as HTMLInputElement
    expect(input.value).toBe("")
    expect(input.validity.valid).toBe(true)
  })
})
