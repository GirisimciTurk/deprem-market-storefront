"use server"

import { StoreCollection } from "types/store"
import { gobitData } from "@lib/gobit/client"
import { getCacheOptions } from "./cookies"

type GobitCollection = { id: string; title: string; handle: string; metadata?: Record<string, unknown> | null }

const toCollection = (c: GobitCollection): StoreCollection => ({
  id: c.id,
  title: c.title,
  handle: c.handle,
  metadata: c.metadata ?? {},
  products: [],
})

async function all(): Promise<StoreCollection[]> {
  const next = { ...(await getCacheOptions("collections")), revalidate: 300 }

  return gobitData<GobitCollection[]>("/store/v1/collections", { query: { limit: 100 }, next }).then((cs) =>
    cs.map(toCollection)
  )
}

export const retrieveCollection = async (id: string) => {
  return (await all()).find((c) => c.id === id) as StoreCollection
}

export const listCollections = async (
  _queryParams: Record<string, string> = {}
): Promise<{ collections: StoreCollection[]; count: number }> => {
  const collections = await all()

  return { collections, count: collections.length }
}

export const getCollectionByHandle = async (handle: string): Promise<StoreCollection | null> => {
  return (await all()).find((c) => c.handle === handle) ?? null
}
