"use server"

import { StoreRegion } from "types/store"
import { gobitData } from "@lib/gobit/client"
import { GobitRegion, toRegion } from "@lib/gobit/adapt"
import { getCacheOptions } from "./cookies"

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
    revalidate: 3600,
  }

  return gobitData<GobitRegion[]>(`/store/v1/regions`, { next }).then((rs) => rs.map(toRegion))
}

export const retrieveRegion = async (id: string) => {
  const regions = await listRegions()

  return regions.find((r) => r.id === id) as StoreRegion
}

const regionMap = new Map<string, StoreRegion>()

export const getRegion = async (countryCode: string) => {
  if (regionMap.has(countryCode)) {
    return regionMap.get(countryCode)
  }

  const regions = await listRegions()

  if (!regions) {
    return null
  }

  regions.forEach((region) => {
    region.countries?.forEach((c) => {
      regionMap.set(c?.iso_2 ?? "", region)
    })
  })

  const region = countryCode ? regionMap.get(countryCode) : regionMap.get("tr")

  return region
}
