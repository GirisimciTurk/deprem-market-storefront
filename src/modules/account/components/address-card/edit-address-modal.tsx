"use client"

import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { PencilSquare as Edit, Trash } from "@medusajs/icons"
import { Home, Briefcase, MapPin } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import AddressRegionFields from "./address-region-fields"
import AddressLabelPicker from "./address-label-picker"
import { Button, Heading, Text, clx } from "@modules/common/components/ui"
import Spinner from "@modules/common/icons/spinner"
import React, { useActionState, useEffect, useState } from "react"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
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

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={clx(
          "border rounded-rounded p-5 min-h-[220px] h-full w-full flex flex-col justify-between transition-colors",
          {
            "border-gray-900": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            {(address as any).address_name ? (
              <div className="flex items-center gap-1.5 text-brand-700">
                {(() => {
                  const n = String((address as any).address_name).toLowerCase()
                  const Icon = n.includes("ev") ? Home : n.includes("iş") || n.includes("is") ? Briefcase : MapPin
                  return <Icon size={15} />
                })()}
                <span className="text-xs font-bold uppercase tracking-wider">
                  {(address as any).address_name}
                </span>
              </div>
            ) : (
              <span />
            )}
            {address.is_default_shipping && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 rounded px-1.5 py-0.5">
                Varsayılan
              </span>
            )}
          </div>
          <Heading
            className="text-left text-base-semi"
            data-testid="address-name"
          >
            {address.first_name} {address.last_name}
          </Heading>
          {address.company && (
            <Text
              className="txt-compact-small text-ui-fg-base"
              data-testid="address-company"
            >
              {address.company}
            </Text>
          )}
          <Text className="flex flex-col text-left text-base-regular mt-2">
            <span data-testid="address-address">
              {address.address_1}
              {address.address_2 && <span>, {address.address_2}</span>}
            </span>
            <span data-testid="address-postal-city">
              {address.postal_code}, {address.city}
            </span>
            <span data-testid="address-province-country">
              {address.province && `${address.province}, `}
              {address.country_code?.toUpperCase()}
            </span>
          </Text>
        </div>
        <div className="flex items-center gap-x-4">
          <button
            className="text-small-regular text-ui-fg-base flex items-center gap-x-2"
            onClick={open}
            data-testid="address-edit-button"
          >
            <Edit />
            Düzenle
          </button>
          <button
            className="text-small-regular text-ui-fg-base flex items-center gap-x-2"
            onClick={removeAddress}
            data-testid="address-delete-button"
          >
            {removing ? <Spinner /> : <Trash />}
            Kaldır
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          <Heading className="mb-2">Adresi düzenle</Heading>
        </Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-2">
              <AddressLabelPicker initial={(address as any).address_name} />
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="Ad"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  defaultValue={address.first_name || undefined}
                  data-testid="first-name-input"
                />
                <Input
                  label="Soyad"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  defaultValue={address.last_name || undefined}
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label="Şirket"
                name="company"
                autoComplete="organization"
                defaultValue={address.company || undefined}
                data-testid="company-input"
              />
              <Input
                label="Adres (mahalle, cadde, sokak)"
                name="address_1"
                required
                autoComplete="address-line1"
                defaultValue={address.address_1 || undefined}
                data-testid="address-1-input"
              />
              <Input
                label="Bina no, kat, daire"
                name="address_2"
                autoComplete="address-line2"
                defaultValue={address.address_2 || undefined}
                data-testid="address-2-input"
              />
              <Input
                label="Posta kodu"
                name="postal_code"
                required
                autoComplete="postal-code"
                defaultValue={address.postal_code || undefined}
                data-testid="postal-code-input"
              />
              <AddressRegionFields
                region={region}
                defaultCountryCode={address.country_code}
                defaultCity={address.city}
                defaultProvince={address.province}
              />
              <Input
                label="Telefon"
                name="phone"
                autoComplete="phone"
                defaultValue={address.phone || undefined}
                data-testid="phone-input"
              />
              <label className="flex items-center gap-2 mt-1 cursor-pointer text-small-regular text-ui-fg-base">
                <input
                  type="checkbox"
                  name="is_default_shipping"
                  className="w-4 h-4 accent-brand-600"
                  defaultChecked={!!address.is_default_shipping}
                  data-testid="default-address-checkbox"
                />
                Bu adresi varsayılan adresim yap
              </label>
            </div>
            {formState.error && (
              <div className="text-brand-500 text-small-regular py-2">
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10"
                data-testid="cancel-button"
              >
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

export default EditAddress
