"use client"

import { Plus } from "@medusajs/icons"
import { Button, Heading } from "@modules/common/components/ui"
import { useActionState, useEffect, useState } from "react"

import { addCustomerAddress } from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import AddressRegionFields from "./address-region-fields"
import AddressLabelPicker from "./address-label-picker"

const AddAddress = ({
  region,
  addresses: _addresses,
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
}) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(addCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  return (
    <>
      <button
        className="group border-2 border-dashed border-ui-border-base hover:border-brand-500 rounded-rounded p-5 min-h-[180px] h-full w-full flex flex-col items-center justify-center gap-3 transition-colors"
        onClick={open}
        data-testid="add-address-button"
      >
        <span className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
          <Plus />
        </span>
        <span className="text-base-semi text-ui-fg-base">Yeni Adres Ekle</span>
        <span className="text-small-regular text-ui-fg-subtle">
          Ev, iş veya başka bir adres kaydedin
        </span>
      </button>

      <Modal isOpen={state} close={close} data-testid="add-address-modal">
        <Modal.Title>
          <Heading className="mb-2">Adres ekle</Heading>
        </Modal.Title>
        <form action={formAction}>
          <Modal.Body>
            <div className="flex flex-col gap-y-3">
              <AddressLabelPicker />
              <div className="grid grid-cols-2 gap-x-2">
                <Input label="Ad" name="first_name" required autoComplete="given-name" data-testid="first-name-input" />
                <Input label="Soyad" name="last_name" required autoComplete="family-name" data-testid="last-name-input" />
              </div>
              <Input label="Şirket (opsiyonel)" name="company" autoComplete="organization" data-testid="company-input" />
              <Input label="Adres (mahalle, cadde, sokak)" name="address_1" required autoComplete="address-line1" data-testid="address-1-input" />
              <Input label="Bina no, kat, daire" name="address_2" autoComplete="address-line2" data-testid="address-2-input" />
              <Input label="Posta kodu" name="postal_code" required autoComplete="postal-code" data-testid="postal-code-input" />
              <AddressRegionFields region={region} />
              <Input label="Telefon" name="phone" autoComplete="phone" data-testid="phone-input" />
              <label className="flex items-center gap-2 mt-1 cursor-pointer text-small-regular text-ui-fg-base">
                <input
                  type="checkbox"
                  name="is_default_shipping"
                  className="w-4 h-4 accent-brand-600"
                  defaultChecked={_addresses.length === 0}
                  data-testid="default-address-checkbox"
                />
                Bu adresi varsayılan adresim yap
              </label>
            </div>
            {formState.error && (
              <div className="text-brand-500 text-small-regular py-2" data-testid="address-error">
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button type="reset" variant="secondary" onClick={close} className="h-10" data-testid="cancel-button">
                İptal
              </Button>
              <SubmitButton data-testid="save-button">Kaydet</SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default AddAddress
