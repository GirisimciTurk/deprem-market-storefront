import { describe, expect, it } from "vitest"
import { toReachableImageUrl } from "./image-url"

describe("toReachableImageUrl", () => {
  it("satıcı belgesinin /dtm/documents/ adresinin önüne arka ucu koyar", () => {
    expect(toReachableImageUrl("/dtm/documents/doc_1")).toMatch(/^https?:\/\/[^/]+\/dtm\/documents\/doc_1$/)
  })

  it("gobit'in köke göre verdiği /files/ adresinin önüne arka ucu koyar", () => {
    expect(toReachableImageUrl("/files/abc.png")).toMatch(/^https?:\/\/[^/]+\/files\/abc\.png$/)
  })

  it("r2.dev adresini /r2/ vekiline çevirir, diğerlerine dokunmaz", () => {
    expect(toReachableImageUrl("https://pub-972575e25eda4755b1250ca6be181153.r2.dev/a/b.jpg")).toMatch(/\/r2\/a\/b\.jpg$/)
    expect(toReachableImageUrl("https://images.example.com/x.jpg")).toBe("https://images.example.com/x.jpg")
    expect(toReachableImageUrl("")).toBeUndefined()
  })
})
