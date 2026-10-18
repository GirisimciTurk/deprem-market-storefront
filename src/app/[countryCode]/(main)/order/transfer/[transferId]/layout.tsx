import { Metadata } from "next"

// Devir sayfası istemci bileşenidir; başlığı ve dizinleme yasağı buradan.
export const metadata: Metadata = {
  title: "Sipariş devir talebi",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

export default function OrderTransferLayout({ children }: { children: React.ReactNode }) {
  return children
}
