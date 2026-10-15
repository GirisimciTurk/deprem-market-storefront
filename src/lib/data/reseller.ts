"use server"

import { gobitData, gobitFetch } from "@lib/gobit/client"
import { getAuthHeaders } from "./cookies"

// Bayilik ve firma başvuruları dtm'ye (/store/v1/dtm/storefront-applications)
// gider; pazaryeri sözleşmeleri /store/v1/dtm/contracts'tan okunur. Başvuru
// geçerli bir VKN ya da TCKN ister (sağlama ile denetlenir).

export interface MyResellerApplication {
  companyName: string
  contactName: string
  taxOfficeNumber?: string
  email: string
  phone: string
  city: string
  message?: string
  date: string
  status: "pending" | "approved" | "rejected" | "suspended"
  applicationType: "bayi" | "firma"
}

/** Müşterinin kendi başvurusunu okuyan uç dtm'de yok. */
export const getMyResellerApplication = async (): Promise<MyResellerApplication | null> => null

export type SellerContract = { id: string; title: string; version: number; body: string; required?: boolean }

/** Etkin pazaryeri sözleşmeleri. */
export async function listSellerContracts(): Promise<SellerContract[]> {
  return gobitData<SellerContract[]>("/store/v1/dtm/contracts", { next: { revalidate: 300 } }).catch(() => [])
}

/** Bayilik (reseller) ya da firma (company) başvurusu. */
export async function submitApplication(input: {
  kind: "reseller" | "company"
  companyName: string
  contactName: string
  email: string
  phone: string
  taxId: string
  taxOffice?: string
  iban?: string
  city?: string
  note?: string
  contracts: SellerContract[]
}): Promise<{ success: boolean; error: string | null }> {
  try {
    await gobitFetch("/store/v1/dtm/storefront-applications", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: {
        kind: input.kind,
        company_name: input.companyName,
        contact_name: input.contactName,
        contact_email: input.email,
        contact_phone: input.phone,
        tax_id: input.taxId,
        tax_office: input.taxOffice ?? "",
        iban: input.iban ?? "",
        city: input.city ?? "",
        note: input.note ?? "",
        contract_accepted: input.contracts.length > 0,
        contract_version: input.contracts.map((c) => `${c.id}:v${c.version}`).join(","),
      },
    })
    return { success: true, error: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return {
      success: false,
      error: /tax id/i.test(msg) ? "Vergi numarası ya da TC kimlik numarası geçerli değil." : msg,
    }
  }
}
