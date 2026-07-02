import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ResellerApplication = {
  companyName: string
  taxOfficeNumber?: string
  contactName: string
  email: string
  phone: string
  city: string
  message?: string
  date: string
  status: "pending" | "approved" | "rejected" | "suspended"
  applicationType?: "bayi" | "firma"
}

export default function SaticiStatusClient({
  application,
}: {
  application: ResellerApplication | null
}) {
  const isFirma = application?.applicationType === "firma"
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-ui-fg-base flex items-center gap-2">
          {isFirma ? "🏪 Firma Başvurum" : "🤝 Bayilik Başvurum"}
        </h1>
        <p className="text-xs text-ui-fg-muted mt-1">
          depremTek Market{" "}
          {isFirma ? "firma (satıcı)" : "bayilik (hizmet ortağı)"} başvurunuzun
          güncel durumu.
        </p>
      </div>

      {application ? (
        <div className="border border-ui-border-base bg-ui-bg-subtle rounded-2xl p-6 md:p-8 space-y-6 hover:shadow-md transition-shadow relative overflow-hidden">
          {/* Status Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-ui-border-base/50">
            <div>
              <span className="text-xs text-ui-fg-muted font-bold block uppercase tracking-wider">
                {isFirma ? "FİRMA / MAĞAZA" : "HİZMET ORTAĞI"}
              </span>
              <h2 className="text-xl font-extrabold text-gray-900 mt-1">
                {application.companyName}
              </h2>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-ui-fg-muted font-bold uppercase tracking-wider block">
                DURUM
              </span>
              {application.status === "pending" && (
                <span className="bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide animate-pulse">
                  ⌛ İncelemede
                </span>
              )}
              {application.status === "approved" && (
                <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  ✓ Onaylandı
                </span>
              )}
              {application.status === "rejected" && (
                <span className="bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  ✕ Reddedildi
                </span>
              )}
              {application.status === "suspended" && (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  ⏸ Askıya Alındı
                </span>
              )}
            </div>
          </div>

          {/* Status Explanation Card */}
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-gray-900">Açıklama</h3>
            <p className="text-xs sm:text-sm text-gray-655 leading-relaxed">
              {application.status === "pending" &&
                `${
                  isFirma ? "Firma" : "Bayilik (hizmet ortağı)"
                } başvurunuz sistemimize ulaştı ve ekibimiz tarafından değerlendiriliyor. En kısa sürede başvuruda belirttiğiniz telefon numarası veya e-posta adresi üzerinden sizinle iletişime geçilecektir.`}
              {application.status === "approved" &&
                (isFirma
                  ? "Tebrikler! Firma başvurunuz onaylandı. Artık mağazanızı açabilir, ürünlerinizi ekleyip satışa başlayabilirsiniz. Satıcı paneli erişiminiz ve sonraki adımlar için müşteri temsilcinize ulaşabilirsiniz."
                  : "Tebrikler! Bayilik başvurunuz onaylandı. Hizmet ortağımız oldunuz; uygun müşteri taleplerini size yönlendirmeye başlayacağız. Panel erişiminiz ve sonraki adımlar için müşteri temsilcinize ulaşabilirsiniz.")}
              {application.status === "rejected" &&
                `${
                  isFirma ? "Firma" : "Bayilik"
                } başvurunuz yapılan ön inceleme sonucunda şu an için olumsuz sonuçlandı. Gerekli kriterleri sağladığınızı düşünüyorsanız ya da ek bilgi iletmek isterseniz müşteri hizmetlerimizle irtibata geçebilirsiniz.`}
              {application.status === "suspended" &&
                `${
                  isFirma ? "Firma" : "Bayilik (hizmet ortağı)"
                } hesabınız geçici olarak askıya alınmıştır. Durumun netleşmesi ve hesabınızın yeniden etkinleştirilmesi için müşteri hizmetlerimizle irtibata geçmenizi rica ederiz.`}
            </p>
          </div>

          {/* Application Details Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-655 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider mb-0.5">
                Yetkili Kişi
              </span>
              <span className="font-bold text-gray-800">
                {application.contactName}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider mb-0.5">
                Başvuru Tarihi
              </span>
              <span className="font-bold text-gray-800">{application.date}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider mb-0.5">
                Şehir
              </span>
              <span className="font-bold text-gray-800">{application.city}</span>
            </div>
            {application.taxOfficeNumber && (
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider mb-0.5">
                  Vergi Dairesi / No
                </span>
                <span className="font-bold text-gray-800">
                  {application.taxOfficeNumber}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-ui-border-base bg-ui-bg-subtle rounded-2xl p-6 md:p-8 space-y-6 text-center max-w-2xl mx-auto py-12">
          <span className="text-5xl block animate-bounce">🤝</span>
          <h2 className="text-xl font-extrabold text-gray-900">
            depremTek Market İş Ortağı Olun
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Henüz bir başvurunuz yok. Size uygun modeli seçin:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
            <div className="bg-white border border-gray-150 rounded-xl p-5 space-y-2.5 flex flex-col">
              <h3 className="font-bold text-sm text-gray-900">🏪 Firmamız Ol</h3>
              <p className="text-xs text-gray-655 leading-relaxed flex-1">
                Kendi mağazanızı açıp ürünlerinizi satın; hizmeti kendiniz
                yürütün. Biz yalnızca sattığınız ürünün komisyonunu alırız.
              </p>
              <LocalizedClientLink
                href="/firma-ol"
                className="mt-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-all text-center"
              >
                Firma Başvurusu &rarr;
              </LocalizedClientLink>
            </div>
            <div className="bg-white border border-gray-150 rounded-xl p-5 space-y-2.5 flex flex-col">
              <h3 className="font-bold text-sm text-gray-900">🤝 Bayimiz Ol</h3>
              <p className="text-xs text-gray-655 leading-relaxed flex-1">
                Hizmet verin, müşteriyi biz bulalım. Uzmanlığınıza uygun
                talepleri size yönlendiririz; süreci birlikte yürütürüz.
              </p>
              <LocalizedClientLink
                href="/satici-ol"
                className="mt-2 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-all text-center"
              >
                Bayilik Başvurusu &rarr;
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
