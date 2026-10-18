import { StoreProduct } from "types/store"
;

export const isSimpleProduct = (product: StoreProduct): boolean => {
    return product.options?.length === 1 && product.options[0].values?.length === 1;
}