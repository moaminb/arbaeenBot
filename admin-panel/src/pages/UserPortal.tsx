import React, { useState } from 'react'
import axios from 'axios'
import { Search, Download, ImageIcon, Globe } from 'lucide-react'

const translations = {
  fa: {
    title: "پرتال کاربران ربات",
    adminLogin: "ورود مدیران",
    findPhotos: "عکس‌های خود را پیدا کنید",
    subtitle: "(برای دریافت عکس های خود شماره موبایلی که ثبت کرده اید را وارد کنید)",
    placeholder: "+989123456789",
    search: "جستجو",
    errorFormat: "لطفا شماره موبایل را همراه با کد کشور (مثلاً +989123456789) و فقط با اعداد انگلیسی وارد کنید.",
    errorServer: "خطا در ارتباط با سرور",
    photosFound: "عکس برای شما پیدا شد",
    downloadPhoto: "دانلود عکس",
    noPhotoTitle: "عکسی یافت نشد!",
    noPhotoDesc: "متاسفانه با این شماره عکسی در سیستم ثبت نشده است.",
    selectLang: "زبان خود را انتخاب کنید:"
  },
  en: {
    title: "User Portal",
    adminLogin: "Admin Login",
    findPhotos: "Find Your Photos",
    subtitle: "(Enter the mobile number you registered to receive your photos)",
    placeholder: "+989123456789",
    search: "Search",
    errorFormat: "Please enter your mobile number with the country code (e.g. +989123456789) and English digits only.",
    errorServer: "Error communicating with server",
    photosFound: "photos found for you",
    downloadPhoto: "Download Photo",
    noPhotoTitle: "No photo found!",
    noPhotoDesc: "Unfortunately, no photo is registered with this number.",
    selectLang: "Select your language:"
  },
  ar: {
    title: "بوابة المستخدمين",
    adminLogin: "دخول المشرفين",
    findPhotos: "ابحث عن صورك",
    subtitle: "(أدخل رقم الهاتف الذي قمت بتسجيله لاستلام صورك)",
    placeholder: "+989123456789",
    search: "بحث",
    errorFormat: "يرجى إدخال رقم الهاتف مع رمز البلد (مثال: +989123456789) واستخدام الأرقام الإنجليزية فقط.",
    errorServer: "خطأ في الاتصال بالخادم",
    photosFound: "تم العثور على صورة لك",
    downloadPhoto: "تنزيل الصورة",
    noPhotoTitle: "لم يتم العثور على صورة!",
    noPhotoDesc: "للأسف، لا توجد صورة مسجلة بهذا الرقم.",
    selectLang: "اختر لغتك:"
  }
}

type Lang = 'fa' | 'en' | 'ar';

export default function UserPortal() {
  const [lang, setLang] = useState<Lang | null>(null)
  const [phone, setPhone] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  const t = lang ? translations[lang] : translations['fa'];
  const dir = lang === 'en' ? 'ltr' : 'rtl';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return

    if (!/^\+[0-9]+$/.test(phone)) {
      setError(t.errorFormat)
      return
    }

    setLoading(true)
    setError('')
    setSearched(true)
    
    try {
      const res = await axios.get(`/api/user/photos/${phone}`)
      setPhotos(res.data.photos || [])
    } catch (err) {
      setError(t.errorServer)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `photo_${index + 1}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!lang) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6" dir="rtl">
        <div className="glass-card rounded-3xl p-12 text-center max-w-md w-full animate-fade-in border-white/10 shadow-[0_0_50px_rgba(239,68,68,0.05)]">
          <Globe size={48} className="mx-auto text-red-500 mb-6 opacity-80" />
          <h2 className="text-2xl font-bold text-gray-100 mb-8">{translations.fa.selectLang}</h2>
          
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setLang('fa')}
              className="bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-white py-4 rounded-xl font-medium transition-all"
            >
              فارسی
            </button>
            <button 
              onClick={() => setLang('ar')}
              className="bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-white py-4 rounded-xl font-medium transition-all"
            >
              العربية
            </button>
            <button 
              onClick={() => setLang('en')}
              className="bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-white py-4 rounded-xl font-medium transition-all"
            >
              English
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-transparent flex flex-col ${dir}`} dir={dir}>
      {/* Header */}
      <header className="glass-panel border-b border-white/5 py-4 px-6 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full object-cover border border-white/10" />
            <h1 className="text-xl font-black tracking-tight text-gradient">{t.title}</h1>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setLang(null)} className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1">
              <Globe size={16} />
              {lang === 'fa' ? 'فارسی' : lang === 'ar' ? 'العربية' : 'English'}
            </button>
            <a href="/admin/login" className="text-sm font-medium text-gray-500 hover:text-red-400 transition-colors">
              {t.adminLogin}
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">{t.findPhotos}</h2>
          <p className="text-gray-400 text-lg">{t.subtitle}</p>
        </div>

        {/* Search Box */}
        <div className="w-full max-w-xl glass-card rounded-3xl p-6 relative z-10 mb-12 shadow-[0_0_50px_rgba(239,68,68,0.05)] border-white/10 animate-fade-in">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val && !/^\+?[0-9]*$/.test(val)) {
                    setError(t.errorFormat)
                  } else {
                    setError('')
                  }
                  setPhone(val)
                }}
                placeholder={t.placeholder}
                className="w-full bg-black/40 text-gray-100 px-6 py-4 rounded-2xl border border-white/10 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-left font-medium text-lg placeholder-gray-600"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !phone}
              className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search size={20} />
                  <span>{t.search}</span>
                </>
              )}
            </button>
          </form>
          {error && <p className="text-red-400 mt-4 text-center font-medium">{error}</p>}
        </div>

        {/* Results Section */}
        {searched && !loading && !error && (
          <div className="w-full animate-fade-in">
            {photos.length > 0 ? (
              <>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="bg-red-500/20 text-red-400 p-2 rounded-xl">
                    <ImageIcon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-100">
                    <span className="text-red-400">{photos.length}</span> {lang === 'en' ? '' : ''}{t.photosFound}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {photos.map((url, idx) => (
                    <div key={idx} className="glass-card rounded-2xl overflow-hidden group">
                      <div className="relative aspect-[3/4] bg-black/50">
                        <img 
                          src={url} 
                          alt={`Photo ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                          <button
                            onClick={() => handleDownload(url, idx)}
                            className="bg-white/10 hover:bg-red-500 backdrop-blur-md border border-white/20 text-white font-medium py-2 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg"
                          >
                            <Download size={18} />
                            <span>{t.downloadPhoto}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="glass-card rounded-3xl p-12 text-center border-dashed border-2 border-white/10">
                <ImageIcon size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-300 mb-2">{t.noPhotoTitle}</h3>
                <p className="text-gray-500">{t.noPhotoDesc}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
