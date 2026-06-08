"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Text } from "@modules/common/components/ui"
import { ArrowUpRightMini } from "@medusajs/icons"

export default function NotFound() {
  const pathname = usePathname()
  const isTr = pathname?.startsWith("/tr") || pathname === "/tr"

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
      <h1 className="text-4xl font-extrabold text-ui-fg-base tracking-tight mb-2">
        {isTr ? "Sayfa Bulunamadı" : "Page Not Found"}
      </h1>
      <p className="max-w-md text-base text-ui-fg-subtle leading-relaxed">
        {isTr
          ? "Ulaşmaya çalıştığınız sayfa mevcut değil veya taşınmış olabilir. Lütfen adresi kontrol edip tekrar deneyin."
          : "The page you tried to access does not exist. It might have been moved or deleted."}
      </p>
      
      <Link 
        className="flex gap-x-1 items-center group mt-4 px-4 py-2 border border-ui-border-base rounded-lg bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover transition-colors" 
        href={isTr ? "/tr" : "/"}
      >
        <Text className="text-ui-fg-interactive font-medium">
          {isTr ? "Ana Sayfaya Dön" : "Go to Frontpage"}
        </Text>
        <ArrowUpRightMini
          className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ease-in-out duration-150"
          color="var(--fg-interactive)"
        />
      </Link>
    </div>
  )
}
