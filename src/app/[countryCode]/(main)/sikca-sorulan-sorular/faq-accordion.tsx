"use client"

import { useState } from "react"

interface FaqItem {
  question: string
  answer: string
}

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs: FaqItem[] = [
    {
      question: "Deprem çantasının içeriği ne sıklıkla güncellenmeli veya kontrol edilmelidir?",
      answer: "Deprem çantası içerisindeki gıda malzemeleri, ilk yardım malzemeleri ve suyun son tüketim tarihleri ile pillerin şarj durumları en geç 6 ayda bir kontrol edilmelidir. Bozulmaya yüz tutmuş veya kullanım ömrünü tamamlamış malzemeler yenilenmelidir.",
    },
    {
      question: "Kargom ne zaman kargolanır ve ne kadar sürede elime ulaşır?",
      answer: "Hafta içi saat 15:00'e kadar verilen tüm siparişler aynı gün kargoya verilmektedir. İstanbul ve çevre illere teslimat genellikle 1-2 iş günü sürerken, diğer şehirlere teslimat 2-3 iş günü içerisinde gerçekleşmektedir.",
    },
    {
      question: "Toplu sipariş ve kurumlar için özel çanta içeriği hazırlıyor musunuz?",
      answer: "Evet! Okullar, şirketler, fabrikalar ve sivil toplum kuruluşları için özel logolu, adetli ve istenilen iç donanıma sahip deprem/ilk yardım çantaları tasarlayıp üretmekteyiz. Toplu sipariş talepleriniz için lütfen Bayilik Başvuru Formu'nu doldurun veya doğrudan bizimle iletişime geçin.",
    },
    {
      question: "Ürünlerinizin kalitesi ve sertifikaları hakkında bilgi alabilir miyim?",
      answer: "EKYP Deprem Market olarak satışa sunduğumuz tüm ilk yardım malzemeleri T.C. Sağlık Bakanlığı onaylıdır. Çantalarımız su geçirmez, yüksek mukavemetli yırtılmaz kumaşlardan üretilmekte olup; fener, düdük, radyo ve benzeri mekanik/teknolojik ürünlerimiz kalite sertifikalarına sahiptir.",
    },
    {
      question: "İptal, iade ve değişim süreçleri nasıl işlemektedir?",
      answer: "Tüketici Kanunu gereği satın aldığınız ürünü teslim aldığınız tarihten itibaren 14 gün içerisinde herhangi bir gerekçe göstermeksizin iade edebilir veya değiştirebilirsiniz. İade edilecek ürünün kullanılmamış, kutusunun ve koruyucu ambalajlarının zarar görmemiş olması gerekmektedir.",
    },
    {
      question: "Hangi ödeme yöntemlerini destekliyorsunuz?",
      answer: "E-ticaret platformumuz üzerinden tüm bankaların kredi ve banka kartları ile 3D Secure güvenli ödeme altyapısıyla alışveriş yapabilirsiniz. Ayrıca alışverişlerinizde peşin fiyatına taksit veya havale/EFT seçeneklerimiz de mevcuttur.",
    }
  ]

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index
        return (
          <div 
            key={index}
            className="border border-ui-border-base rounded-xl overflow-hidden bg-ui-bg-subtle transition-all duration-300"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-ui-fg-base hover:bg-ui-bg-base-hover/50 transition-colors gap-4"
            >
              <span>{faq.question}</span>
              <span className={`text-xl transform transition-transform duration-300 ${isOpen ? "rotate-45 text-red-600" : "text-ui-fg-muted"}`}>
                +
              </span>
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] border-t border-ui-border-base" : "max-h-0"} overflow-hidden`}
            >
              <div className="p-6 text-sm sm:text-base text-ui-fg-subtle leading-relaxed bg-ui-bg-base">
                {faq.answer}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
