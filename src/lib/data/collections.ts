"use server"

import { HttpTypes } from "@medusajs/types"
import { gobitData } from "@lib/gobit/client"
import { getCacheOptions } from "./cookies"

type GobitCollection = { id: string; title: string; handle: string; metadata?: Record<string, unknown> | null }

const toCollection = (c: GobitCollection) =>
  ({ id: c.id, title: c.title, handle: c.handle, metadata: c.metadata ?? {}, products: [] }) as unknown as HttpTypes.StoreCollection

async function all(): Promise<HttpTypes.StoreCollection[]> {
  const next = { ...(await getCacheOptions("collections")), revalidate: 300 }

  return gobitData<GobitCollection[]>("/store/v1/collections", { query: { limit: 100 }, next }).then((cs) =>
    cs.map(toCollection)
  )
}

export const retrieveCollection = async (id: string) => {
  return (await all()).find((c) => c.id === id) as HttpTypes.StoreCollection
}

export const listCollections = async (
  _queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const collections = await all()

  return { collections, count: collections.length }
}

export const getCollectionByHandle = async (handle: string): Promise<HttpTypes.StoreCollection | null> => {
  return (await all()).find((c) => c.handle === handle) ?? null
}
