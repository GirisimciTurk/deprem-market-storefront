"use client"

import { useState, useEffect } from "react"
import { Container } from "@modules/common/components/ui"
import ChevronDown from "@modules/common/icons/chevron-down"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<"send" | "verify" | "success">("send")
  const [verificationCode, setVerificationCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Persist verification status in localStorage for demo purposes
  useEffect(() => {
    if (customer?.id) {
      const verified = localStorage.getItem(`phone_verified_${customer.id}`) === "true"
      setIsPhoneVerified(verified)
    }
  }, [customer?.id])

  // Quiz State
  const [quizStatus, setQuizStatus] = useState<"idle" | "active" | "completed">("idle")
  const [currentQ, setCurrentQ] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([])

  useEffect(() => {
    if (customer?.id) {
      const savedQuiz = localStorage.getItem(`disaster_quiz_${customer.id}`)
      if (savedQuiz) {
        try {
          const parsed = JSON.parse(savedQuiz)
          setQuizStatus(parsed.status || "idle")
          setQuizAnswers(parsed.answers || [])
          setCurrentQ(parsed.currentQ || 0)
        } catch {
          // Ignore
        }
      }
    }
  }, [customer?.id])

  const saveQuizState = (status: "idle" | "active" | "completed", answers: boolean[], qIndex: number) => {
    if (customer?.id) {
      localStorage.setItem(`disaster_quiz_${customer.id}`, JSON.stringify({ status, answers, currentQ: qIndex }))
    }
    setQuizStatus(status)
    setQuizAnswers(answers)
    setCurrentQ(qIndex)
  }

  const quizQuestions = [
    {
      id: 1,
      text: "Çantanızda en az 72 saat (3 gün) yetecek kadar dayanıklı konserve gıda ve yüksek enerjili barlar bulunuyor mu?",
      missing: "🥫 72 Saatlik Dayanıklı Konserve Gıda & Enerji Barları",
    },
    {
      id: 2,
      text: "Kişi başına günlük en az 3 litre içme suyu ve su filtreleme/arıtma tabletleriniz çantanızda mevcut mu?",
      missing: "💧 Acil Durum İçme Suyu & Su Arıtma Tabletleri",
    },
    {
      id: 3,
      text: "İlk yardım çantanızda sargı bezleri, yara bandı, steril eldivenler, cımbız ve antiseptik solüsyon tam olarak var mı?",
      missing: "🩹 Kapsamlı İlk Yardım Seti & Tıbbi Malzemeler",
    },
    {
      id: 4,
      text: "Elektrik kesintilerine karşı yedek pilli veya el dinamolu bir el feneri ile acil durum afet radyosu çantanızda yer alıyor mu?",
      missing: "🔋 Pilli/Dinamolu El Feneri & Afet Radyosu",
    },
    {
      id: 5,
      text: "Enkazda sesinizi duyurmak için acil durum düdüğü, çok amaçlı çakı ve toz maskesi çantanızda hazır mı?",
      missing: "🚨 Acil Durum Düdüğü, Çok Amaçlı Çakı & Toz Maskesi",
    },
    {
      id: 6,
      text: "Nüfus cüzdanı, tapu, ruhsat, sigorta poliçesi gibi önemli evrakların fotokopilerini su geçirmez kilitli bir poşete koydunuz mu?",
      missing: "📂 Su Geçirmez Kilitli Poşette Önemli Evrak Fotokopileri",
    },
  ]

  const handleAnswer = (answer: boolean) => {
    const nextAnswers = [...quizAnswers, answer]
    const nextQ = currentQ + 1
    if (nextQ >= quizQuestions.length) {
      saveQuizState("completed", nextAnswers, nextQ)
    } else {
      saveQuizState("active", nextAnswers, nextQ)
    }
  }

  const handleResetQuiz = () => {
    saveQuizState("idle", [], 0)
  }

  const handleSendCode = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setModalStep("verify")
    }, 1000)
  }

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (verificationCode.length < 4) {
      alert("Lütfen geçerli bir kod girin.")
      return
    }
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsPhoneVerified(true)
      if (customer?.id) {
        localStorage.setItem(`phone_verified_${customer.id}`, "true")
      }
      setModalStep("success")
    }, 1200)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalStep("send")
    setVerificationCode("")
  }

  // Calculate profile completeness score including verification bonus
  const getDynamicScore = () => {
    let count = 0
    if (!customer) return 0
    if (customer.email) count++
    if (customer.first_name && customer.last_name) count++
    if (customer.phone) count++
    if (customer.addresses && customer.addresses.length > 0) count++
    
    // Add verification weight
    let score = (count / 4) * 100
    if (isPhoneVerified) {
      score = Math.min(100, score + 10) // 10% bonus for phone verification
    }
    return score
  }

  const profileScore = getDynamicScore()

  return (
    <div data-testid="overview-page-wrapper" className="space-y-8 relative">
      {/* Premium Hero Welcome Card */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-brand-900 to-brand-700 p-6 sm:p-8 text-white shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400 via-brand-900 to-black"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-amber-400 text-xs font-semibold tracking-wider uppercase bg-brand-950/50 px-3 py-1 rounded-full border border-brand-800/50">
              Kullanıcı Paneli
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3 mb-1">
              Merhaba, {customer?.first_name || "Değerli Üyemiz"} 👋
            </h1>
            <p className="text-brand-100 text-xs sm:text-sm">
              Giriş yaptığınız hesap: <span className="font-semibold text-white">{customer?.email}</span>
            </p>
          </div>
          <LocalizedClientLink
            href="/store"
            className="bg-white hover:bg-brand-50 text-brand-700 font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            🛒 Alışverişe Başla
          </LocalizedClientLink>
        </div>
      </div>

      {/* Grid: Preparedness Score & Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Disaster Preparedness Meter */}
        <div className="md:col-span-2 border border-ui-border-base rounded-2xl p-6 bg-ui-bg-subtle flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-center mb-3 gap-2">
              <h3 className="font-bold text-ui-fg-base text-sm sm:text-base">Afet Hazırlık Puanı</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                profileScore <= 25 ? "bg-brand-100 text-brand-700" :
                profileScore <= 75 ? "bg-amber-100 text-amber-700" :
                "bg-green-100 text-green-700"
              }`}>
                {profileScore <= 25 ? "Başlangıç Seviyesi" :
                 profileScore <= 75 ? "Kısmi Hazırlık" :
                 "Güvenli Profil"}
              </span>
            </div>
            <p className="text-xs text-ui-fg-muted mb-4">
              Profil bilgilerinizi ve kayıtlı adreslerinizi eksiksiz doldurarak acil durumlarda siparişlerinizin hızlı ulaşmasını sağlayın.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-ui-fg-subtle">Profil Tamamlanma Oranı</span>
              <span className="text-ui-fg-base">{profileScore}%</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-brand-650 via-amber-500 to-green-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${profileScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Addresses & Quick Info Card */}
        <div className="border border-ui-border-base rounded-2xl p-6 bg-ui-bg-subtle flex flex-col justify-between hover:shadow-md transition-shadow h-full min-h-[160px]">
          <div>
            <h3 className="font-bold text-ui-fg-base text-sm sm:text-base mb-1">Kayıtlı Adresleriniz</h3>
            <p className="text-xs text-ui-fg-muted">
              Sevkiyat ve fatura işlemleri için tanımlanmış adresleriniz.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 pt-2 border-t border-ui-border-base/50">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-ui-fg-base">{customer?.addresses?.length || 0}</span>
              <span className="text-xs text-ui-fg-subtle">Adres Tanımlı</span>
            </div>
            <LocalizedClientLink
              href="/account/addresses"
              className="text-xs text-brand-650 hover:underline font-semibold whitespace-nowrap"
            >
              Adreslerimi Yönet &rarr;
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {/* Main Grid: Details Checklist & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Checklist Left Panel */}
        <div className="lg:col-span-5 border border-ui-border-base p-6 rounded-2xl bg-ui-bg-subtle shadow-sm space-y-4">
          <h3 className="font-bold text-ui-fg-base text-sm sm:text-base border-b pb-2">Hesap Kontrol Listesi</h3>
          
          <div className="space-y-3">
            {/* E-Posta */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-ui-bg-base border border-ui-border-base gap-x-4">
              <div className="flex items-center gap-x-2.5 min-w-0">
                <span className="text-green-600 text-sm flex-shrink-0">✓</span>
                <span className="text-xs sm:text-sm font-semibold text-ui-fg-base truncate">E-Posta</span>
              </div>
              <span className="text-xs text-ui-fg-subtle truncate font-mono text-right max-w-[150px] sm:max-w-none" title={customer?.email}>
                {customer?.email}
              </span>
            </div>

            {/* Ad & Soyad */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-ui-bg-base border border-ui-border-base gap-x-4">
              <div className="flex items-center gap-x-2.5 min-w-0">
                {customer?.first_name ? (
                  <span className="text-green-600 text-sm flex-shrink-0">✓</span>
                ) : (
                  <span className="text-brand-500 text-sm flex-shrink-0">○</span>
                )}
                <span className="text-xs sm:text-sm font-semibold text-ui-fg-base truncate">Ad & Soyad</span>
              </div>
              {customer?.first_name ? (
                <span className="text-xs text-ui-fg-subtle font-semibold text-right truncate max-w-[150px]">
                  {customer.first_name} {customer.last_name}
                </span>
              ) : (
                <LocalizedClientLink href="/account/profile" className="text-xs text-brand-650 hover:underline flex-shrink-0">
                  Ekle
                </LocalizedClientLink>
              )}
            </div>

            {/* Telefon Numarası & Doğrulama */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-ui-bg-base border border-ui-border-base gap-x-4">
              <div className="flex items-center gap-x-2.5 min-w-0">
                {customer?.phone ? (
                  isPhoneVerified ? (
                    <span className="text-green-600 text-sm flex-shrink-0">✓</span>
                  ) : (
                    <span className="text-amber-500 text-sm flex-shrink-0">⚠</span>
                  )
                ) : (
                  <span className="text-brand-500 text-sm flex-shrink-0">○</span>
                )}
                <span className="text-xs sm:text-sm font-semibold text-ui-fg-base truncate">Telefon</span>
              </div>
              
              <div className="flex flex-col items-end gap-y-1 flex-shrink-0">
                {customer?.phone ? (
                  <>
                    <span className="text-xs text-ui-fg-subtle font-mono">{customer.phone}</span>
                    {isPhoneVerified ? (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Doğrulandı
                      </span>
                    ) : (
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-850 text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors"
                      >
                        Doğrula
                      </button>
                    )}
                  </>
                ) : (
                  <LocalizedClientLink href="/account/profile" className="text-xs text-brand-650 hover:underline">
                    Ekle
                  </LocalizedClientLink>
                )}
              </div>
            </div>

            {/* Teslimat Adresi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-ui-bg-base border border-ui-border-base gap-2">
              <div className="flex items-center gap-x-2.5">
                {customer?.addresses && customer.addresses.length > 0 ? (
                  <span className="text-green-600 text-sm">✓</span>
                ) : (
                  <span className="text-brand-500 text-sm">○</span>
                )}
                <span className="text-xs sm:text-sm font-semibold text-ui-fg-base whitespace-nowrap">Teslimat Adresi</span>
              </div>
              {customer?.addresses && customer.addresses.length > 0 ? (
                <span className="text-xs text-ui-fg-subtle text-right">Kayıtlı</span>
              ) : (
                <LocalizedClientLink href="/account/addresses" className="text-xs text-brand-650 hover:underline">
                  Ekle
                </LocalizedClientLink>
              )}
            </div>
          </div>
        </div>

        {/* Orders Right Panel */}
        <div className="lg:col-span-7 border border-ui-border-base p-6 rounded-2xl bg-ui-bg-subtle shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-ui-fg-base text-sm sm:text-base">Son Siparişleriniz</h3>
            <LocalizedClientLink href="/account/orders" className="text-xs text-brand-650 hover:underline font-semibold">
              Tümünü Gör
            </LocalizedClientLink>
          </div>

          <ul className="space-y-3" data-testid="orders-wrapper">
            {orders && orders.length > 0 ? (
              orders.slice(0, 3).map((order) => (
                <li key={order.id} data-testid="order-wrapper">
                  <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
                    <Container className="bg-ui-bg-base border border-ui-border-base rounded-xl p-4 flex justify-between items-center hover:border-ui-border-strong transition-colors">
                      <div className="grid grid-cols-3 text-xs gap-x-4 flex-1">
                        <div>
                          <span className="block text-ui-fg-muted font-medium mb-0.5">Tarih</span>
                          <span className="font-semibold text-ui-fg-base">
                            {new Date(order.created_at).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                        <div>
                          <span className="block text-ui-fg-muted font-medium mb-0.5">Sipariş No</span>
                          <span className="font-semibold text-ui-fg-base">#{order.display_id}</span>
                        </div>
                        <div>
                          <span className="block text-ui-fg-muted font-medium mb-0.5">Toplam Tutar</span>
                          <span className="font-semibold text-ui-fg-base">
                            {convertToLocale({
                              amount: order.total,
                              currency_code: order.currency_code,
                            })}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="-rotate-90 text-ui-fg-muted ml-2" />
                    </Container>
                  </LocalizedClientLink>
                </li>
              ))
            ) : (
              <div className="text-center py-8 bg-ui-bg-base rounded-xl border border-ui-border-base border-dashed">
                <span className="text-3xl mb-2 block">🎒</span>
                <p className="text-xs sm:text-sm text-ui-fg-subtle font-medium mb-1">
                  Henüz bir siparişiniz bulunmuyor.
                </p>
                <p className="text-2xs sm:text-xs text-ui-fg-muted mb-4 max-w-xs mx-auto">
                  Ailenizin acil durum ihtiyaçları için deprem çantalarımızı ve güvenlik ekipmanlarımızı inceleyin.
                </p>
                <LocalizedClientLink
                  href="/store"
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors inline-block"
                >
                  Ürünleri İncele
                </LocalizedClientLink>
              </div>
            )}
          </ul>
        </div>
      </div>

      {/* Disaster Preparedness Interactive Quiz */}
      <div className="border border-ui-border-base rounded-2xl p-6 bg-ui-bg-subtle shadow-sm transition-all duration-300">
        {quizStatus === "idle" && (
          <div className="space-y-4">
            <div className="flex items-center gap-x-3 border-b pb-3">
              <span className="text-2xl sm:text-3xl">🎒</span>
              <div>
                <h3 className="font-bold text-ui-fg-base text-sm sm:text-base">
                  Afet Çantası Hazırlık Testi
                </h3>
                <p className="text-2xs sm:text-xs text-ui-fg-muted">
                  Acil durum çantanızın deprem ve diğer afetlere ne kadar hazır olduğunu test edin.
                </p>
              </div>
            </div>
            
            <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-bold text-ui-fg-base text-xs sm:text-sm">Çantanız ne kadar güvenli?</h4>
                <p className="text-2xs sm:text-xs text-ui-fg-muted max-w-lg">
                  6 soruluk hızlı testle çantanızı analiz edin, eksiklerinizi rapor halinde listeleyin ve anında tamamlayın.
                </p>
              </div>
              <button
                onClick={() => saveQuizState("active", [], 0)}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm py-2 px-5 rounded-lg transition-colors shadow-sm whitespace-nowrap"
              >
                Testi Başlat
              </button>
            </div>
          </div>
        )}

        {quizStatus === "active" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3 gap-2">
              <div className="flex items-center gap-x-2">
                <span className="text-xl">🎒</span>
                <span className="font-bold text-ui-fg-base text-sm sm:text-base">Hazırlık Analizi Yapılıyor</span>
              </div>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Soru {currentQ + 1} / {quizQuestions.length}
              </span>
            </div>

            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-brand-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentQ + 1) / quizQuestions.length) * 100}%` }}
              ></div>
            </div>

            <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-6 text-center space-y-6">
              <p className="text-xs sm:text-base font-bold text-ui-fg-base max-w-xl mx-auto leading-relaxed">
                {quizQuestions[currentQ]?.text}
              </p>
              
              <div className="flex justify-center gap-4 max-w-xs mx-auto">
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-300 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
                >
                  ✓ Evet, Var
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-300 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
                >
                  ✕ Hayır, Yok
                </button>
              </div>
            </div>
          </div>
        )}

        {quizStatus === "completed" && (() => {
          const score = Math.round((quizAnswers.filter(a => a === true).length / quizQuestions.length) * 100)
          const missingList = quizQuestions.filter((_, idx) => quizAnswers[idx] === false)

          return (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3 gap-2">
                <div className="flex items-center gap-x-2">
                  <span className="text-xl">📊</span>
                  <span className="font-bold text-ui-fg-base text-sm sm:text-base">Hazırlık Analiz Raporu</span>
                </div>
                <button
                  onClick={handleResetQuiz}
                  className="text-xs text-brand-650 hover:underline font-semibold"
                >
                  Testi Yeniden Çöz
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Gauge Score */}
                <div className="border border-ui-border-base p-5 rounded-xl bg-ui-bg-base text-center space-y-3">
                  <span className="text-xs font-bold text-ui-fg-muted block uppercase tracking-wider">Deprem Çantası Skoru</span>
                  <div className="relative inline-flex items-center justify-center">
                    <span className={`text-4xl font-extrabold ${
                      score <= 33 ? "text-brand-650" :
                      score <= 66 ? "text-amber-500" :
                      "text-green-600"
                    }`}>
                      {score}%
                    </span>
                  </div>
                  <span className={`block text-xs font-bold px-2 py-0.5 rounded-full ${
                    score <= 33 ? "bg-brand-100 text-brand-700" :
                    score <= 66 ? "bg-amber-100 text-amber-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {score <= 33 ? "Kritik Derecede Yetersiz 🚨" :
                     score <= 66 ? "Kısmen Hazır ⚠️" :
                     "Tam Teşekküllü Hazır ✅"}
                  </span>
                </div>

                {/* Recommendations and missing items list */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="font-bold text-ui-fg-base text-xs sm:text-sm mb-1">
                      {missingList.length > 0 ? "⚠️ Çantanızdaki Eksik Ürünler" : "🎉 Tebrikler!"}
                    </h4>
                    <p className="text-2xs sm:text-xs text-ui-fg-muted">
                      {missingList.length > 0 
                        ? "Test sonucunuza göre çantanızda bulunmayan acil durum ekipmanları aşağıda listelenmiştir. Lütfen en kısa sürede tamamlayın:"
                        : "Testteki tüm temel acil durum ekipmanlarının çantanızda hazır olduğunu beyan ettiniz. Afetlere tam anlamıyla hazırsınız!"
                      }
                    </p>
                  </div>

                  {missingList.length > 0 ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {missingList.map((item) => (
                          <div 
                            key={item.id}
                            className="flex items-center gap-x-2 p-2.5 rounded-lg bg-brand-50/50 border border-brand-100 text-brand-800 text-2xs sm:text-xs font-semibold"
                          >
                            <span className="text-brand-550 flex-shrink-0">✕</span>
                            <span className="truncate">{item.missing}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-2">
                        <LocalizedClientLink
                          href="/store"
                          className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-5 rounded-lg transition-colors inline-block shadow-sm"
                        >
                          🛒 Eksikleri Deprem Market'ten Tamamla
                        </LocalizedClientLink>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-150 text-green-800 text-2xs sm:text-xs font-semibold flex items-center gap-2">
                      <span>✓</span>
                      <span>Harika! Acil durum çantanız tüm uluslararası standartlara ve hazırlık yönergelerine uygun durumdadır.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Premium Verification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-md bg-white dark:bg-gray-950 border border-ui-border-base rounded-2xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-ui-fg-muted hover:text-ui-fg-base text-xl"
            >
              ✕
            </button>

            {modalStep === "send" && (
              <div className="text-center space-y-4">
                <span className="text-4xl block">📱</span>
                <h3 className="text-lg font-bold text-ui-fg-base">Telefon Numarası Doğrulama</h3>
                <p className="text-xs text-ui-fg-subtle">
                  Güvenliğiniz için <span className="font-semibold text-ui-fg-base">{customer?.phone}</span> numaralı telefonunuza SMS ile bir doğrulama kodu gönderilecektir.
                </p>
                <button
                  onClick={handleSendCode}
                  disabled={isSubmitting}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Kod Gönderiliyor..." : "📞 Doğrulama Kodu Gönder"}
                </button>
              </div>
            )}

            {modalStep === "verify" && (
              <form onSubmit={handleVerifyCode} className="space-y-4 text-center">
                <span className="text-4xl block">🔑</span>
                <h3 className="text-lg font-bold text-ui-fg-base">Onay Kodunu Girin</h3>
                <p className="text-xs text-ui-fg-subtle">
                  Telefonunuza gönderilen 6 haneli doğrulama kodunu aşağıdaki alana girin.
                </p>
                <div className="max-w-[200px] mx-auto">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full border border-ui-border-base rounded-xl px-4 py-3 bg-ui-bg-base text-center font-bold font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || verificationCode.length < 4}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Onaylanıyor..." : "Doğrulamayı Tamamla"}
                </button>
                <button
                  type="button"
                  onClick={() => setModalStep("send")}
                  className="text-xs text-brand-650 hover:underline block mx-auto"
                >
                  Tekrar Kod Gönder
                </button>
              </form>
            )}

            {modalStep === "success" && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-green-150 text-green-700 rounded-full flex items-center justify-center mb-4 text-3xl mx-auto animate-bounce">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-ui-fg-base">Doğrulama Başarılı!</h3>
                <p className="text-xs text-ui-fg-subtle max-w-xs mx-auto">
                  Telefon numaranız başarıyla onaylanmıştır. Afet Hazırlık Puanınıza ek <strong>+10 bonus puan</strong> tanımlanmıştır!
                </p>
                <button
                  onClick={handleCloseModal}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm"
                >
                  Paneli Gör
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Overview
