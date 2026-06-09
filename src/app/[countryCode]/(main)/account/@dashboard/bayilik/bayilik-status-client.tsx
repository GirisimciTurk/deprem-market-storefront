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
  status: "pending" | "approved" | "rejected"
}

export default function BayilikStatusClient({
  application,
}: {
  application: ResellerApplication | null
}) {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-extrabold text-ui-fg-base flex items-center gap-2">
          🏢 Bayilik Durumu
        </h1>
        <p className="text-xs text-ui-fg-muted mt-1">
          Deprem Market kurumsal bayi veya tedarik ortaklığı başvuru durumunuz.
        </p>
      </div>

      {application ? (
        <div className="border border-ui-border-base bg-ui-bg-subtle rounded-2xl p-6 md:p-8 space-y-6 hover:shadow-md transition-shadow relative overflow-hidden">
          {/* Status Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-ui-border-base/50">
            <div>
              <span className="text-xs text-ui-fg-muted font-bold block uppercase tracking-wider">BAŞVURU FİRMASI</span>
              <h2 className="text-xl font-extrabold text-gray-900 mt-1">{application.companyName}</h2>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-ui-fg-muted font-bold uppercase tracking-wider block">DURUM</span>
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
                <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                  ✕ Reddedildi
                </span>
              )}
            </div>
          </div>

          {/* Status Explanation Card */}
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-gray-900">Açıklama</h3>
            <p className="text-xs sm:text-sm text-gray-655 leading-relaxed">
              {application.status === "pending" && (
                "Bayilik başvurunuz sistemimize ulaşmıştır ve yetkili ekiplerimiz tarafından değerlendirilmektedir. En kısa sürede başvuruda belirttiğiniz telefon numarası veya e-posta adresi üzerinden sizinle iletişime geçilecektir."
              )}
              {application.status === "approved" && (
                "Tebrikler! Bayilik başvurunuz onaylanmıştır. Artık Deprem Market kurumsal bayimiz olarak size özel iskonto oranları ve toplu alım imkanları ile siparişlerinizi oluşturabilirsiniz. Detaylar ve entegrasyon desteği için müşteri temsilcinize ulaşabilirsiniz."
              )}
              {application.status === "rejected" && (
                "Bayilik başvurunuz yapılan ön inceleme sonucunda şu an için olumsuz sonuçlandırılmıştır. Gerekli kriterleri sağladığınızı düşünüyorsanız ya da ek bilgi iletmek isterseniz müşteri hizmetlerimizle irtibata geçebilirsiniz."
              )}
            </p>
          </div>

          {/* Application Details Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-655 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider mb-0.5">Yetkili Kişi</span>
              <span className="font-bold text-gray-800">{application.contactName}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider mb-0.5">Başvuru Tarihi</span>
              <span className="font-bold text-gray-800">{application.date}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider mb-0.5">Şehir</span>
              <span className="font-bold text-gray-800">{application.city}</span>
            </div>
            {application.taxOfficeNumber && (
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider mb-0.5">Vergi Dairesi / No</span>
                <span className="font-bold text-gray-800">{application.taxOfficeNumber}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-ui-border-base bg-ui-bg-subtle rounded-2xl p-6 md:p-8 space-y-6 text-center max-w-2xl mx-auto py-12">
          <span className="text-5xl block animate-bounce">🏢</span>
          <h2 className="text-xl font-extrabold text-gray-900">Kurumsal Bayi Olun</h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Deprem malzemeleri, ilk yardım çantaları ve arama kurtarma ekipmanlarını işletmeniz, şantiyeniz veya kurumunuz için toplu alımlarda bayilik avantajları ve özel fiyat teklifleriyle satın alın.
          </p>
          
          <div className="bg-white border border-gray-150 rounded-xl p-4 text-left max-w-md mx-auto space-y-2.5 text-xs text-gray-655">
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-bold">✓</span>
              <span>Bayilere özel iskonto oranları</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-bold">✓</span>
              <span>Toplu sipariş ve lojistik kolaylıkları</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-bold">✓</span>
              <span>Cari hesap ve taksitli ödeme seçenekleri</span>
            </div>
          </div>

          <div className="pt-4">
            <LocalizedClientLink
              href="/bayilik-basvuru-formu"
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm py-3 px-8 rounded-xl transition-all shadow-md inline-block hover:-translate-y-0.5 duration-200"
            >
              Bayilik Başvurusu Yap &rarr;
            </LocalizedClientLink>
          </div>
        </div>
      )}
    </div>
  )
}
