import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import PreviewPrice from "./price"
import { VariantPrice } from "types/global"

describe("PreviewPrice Component", () => {
  it("should return null if price is not provided", () => {
    const { container } = render(
      <PreviewPrice price={null as unknown as VariantPrice} />
    )
    expect(container.firstChild).toBeNull()
  })

  it("should render regular price if not on sale", () => {
    const price: VariantPrice = {
      currency_code: "try",
      calculated_price:"150,00 TL",
      calculated_price_number: 15000,
      original_price: "150,00 TL",
      original_price_number: 15000,
      price_type: "default",
      percentage_diff: "0",
    }

    render(<PreviewPrice price={price} />)

    // İndirim yoksa düz fiyat gösterilir; indirim rozeti/üstü çizili fiyat OLMAMALI.
    expect(screen.getByText("150,00 TL")).toBeInTheDocument()
    expect(screen.queryByText(/İndirim/)).not.toBeInTheDocument()
    expect(screen.queryByText("150,00 TL")).not.toHaveClass("line-through")
  })

  it("should render sale price with crossed-out original price and discount badge when on sale", () => {
    const price: VariantPrice = {
      currency_code: "try",
      calculated_price:"120,00 TL",
      calculated_price_number: 120,
      original_price: "150,00 TL",
      original_price_number: 150,
      price_type: "sale",
      percentage_diff: "20",
    }

    render(<PreviewPrice price={price} />)

    // Original price with line-through should be visible
    const originalPrice = screen.getByText("150,00 TL")
    expect(originalPrice).toBeInTheDocument()
    expect(originalPrice).toHaveClass("line-through")

    // Discount percentage badge should be visible
    expect(screen.getByText("%20 İndirim")).toBeInTheDocument()

    // Calculated price box should be visible
    expect(screen.getByText("120,00 TL")).toBeInTheDocument()
  })
})
