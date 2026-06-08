import React from "react"
import { Button } from "@modules/common/components/ui"

export default function CorporateSection({ countryCode }: { countryCode: string }) {
  const isTr = countryCode === "tr"

  return (
    <div className="bg-slate-900 text-white py-16 sm:py-24 relative overflow-hidden">
      {/* Background Graphic elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl -mr-20 -mt-20 z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -ml-20 -mb-20 z-0" />

      <div className="content-container relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center text-center gap-y-6">
        {/* Badge */}
        <span className="text-xs font-bold tracking-wider text-rose-500 uppercase bg-rose-950/40 border border-rose-900/60 px-3.5 py-1.5 rounded-full select-none">
          {isTr ? "MİSYONUMUZ & VİZYONUMUZ" : "MISSION & VISION"}
        </span>

        {/* Heading */}
        <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl tracking-tight leading-tight max-w-3xl uppercase">
          {isTr
            ? "BÜYÜK İSTANBUL DEPREMİNDEN SIFIR KAYIPLA ÇIKMAK"
            : "SURVIVING THE ISTANBUL EARTHQUAKE WITH ZERO CASUALTIES"}
        </h2>

        {/* Text Details */}
        <p className="text-lg text-slate-300 max-w-3xl leading-relaxed font-medium">
          {isTr ? (
            <>
              <strong>Deprem Market</strong>, deprem güvenliği alanında geliştirilen mühendislik çözümlerini, yenilikçi ürünleri ve girişimci fikirleri bir araya getiren bir <strong>EKYP (Ekonomik Kalkınma ve Yükseliş Projeleri)</strong> platformudur. Amacımız, beklenen afetlere karşı halkımızı ve kurumlarımızı en dayanıklı ekipmanlarla donatmaktır.
            </>
          ) : (
            <>
              <strong>Deprem Market</strong> is an official <strong>EKYP</strong> platform bringing together engineering solutions, survival kits, and innovative ideas. Our main mission is to equip households and institutions with resilient tools to survive unexpected disasters.
            </>
          )}
        </p>

        {/* Metadata stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 my-4 w-full max-w-3xl text-slate-300 font-bold border-y border-slate-800 py-6">
          <div className="flex flex-col">
            <span className="text-3xl text-rose-500 font-black">1.5M+</span>
            <span className="text-xs text-slate-400 mt-1">
              {isTr ? "Riskli Konut Dönüşümü Planı" : "Risk Housing Upgrade Plan"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl text-rose-500 font-black">24/48s</span>
            <span className="text-xs text-slate-400 mt-1">
              {isTr ? "Hızlı Hazırlık & Lojistik" : "Emergency Prep Speed"}
            </span>
          </div>
          <div className="flex flex-col col-span-2 md:col-span-1">
            <span className="text-3xl text-rose-500 font-black">EKYP</span>
            <span className="text-xs text-slate-400 mt-1">
              {isTr ? "Sosyal İştirak Modeli" : "Social Enterprise Backed"}
            </span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <a
            href="https://girisimciturk.com/ekyp/deprem-teknolojileri/"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto"
          >
            <Button className="w-full bg-rose-600 border-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg">
              {isTr ? "EKYP Deprem Projesi Detayları" : "EKYP Project Details"}
            </Button>
          </a>
          <a
            href="https://girisimciturk.com"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto"
          >
            <Button
              variant="secondary"
              className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 font-bold px-6 py-3 rounded-lg"
            >
              {isTr ? "Girişimci Türk Ana Sayfası" : "Girişimci Türk Portal"}
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
