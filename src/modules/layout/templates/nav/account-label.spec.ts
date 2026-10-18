import { describe, it, expect } from "vitest"
import tr from "../../../../messages/tr.json"
import { accountLinkLabelKey } from "./account-label"

describe("üst menünün hesap bağlantısı", () => {
  it("oturum açıkken Hesabım, değilken Giriş Yap der", () => {
    expect(tr.nav[accountLinkLabelKey(true)]).toBe("Hesabım")
    expect(tr.nav[accountLinkLabelKey(false)]).toBe("Giriş Yap")
  })
})
