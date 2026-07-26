import React, { useState, useRef } from 'react'
import axios from 'axios'
import { FileSpreadsheet } from 'lucide-react'

export default function BatchUpload() {
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [status, setStatus] = useState({ loading: false, message: '', error: false })
  
  const excelInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setExcelFile(e.target.files[0])
    }
  }

  const handlePhotosDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      setPhotos(Array.from(e.dataTransfer.files))
    }
  }

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!excelFile || photos.length === 0) {
      setStatus({ loading: false, message: 'لطفا فایل اکسل و مجموعه‌ای از عکس‌ها را انتخاب کنید.', error: true })
      return
    }

    setStatus({ loading: true, message: 'در حال پردازش و آپلود (ممکن است طول بکشد)...', error: false })
    
    const formData = new FormData()
    formData.append('excel_file', excelFile)
    photos.forEach(file => {
      formData.append('photos', file)
    })

    try {
      const res = await axios.post('/api/upload_batch', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setStatus({ loading: false, message: res.data.message, error: false })
      setPhotos([])
      setExcelFile(null)
      if (excelInputRef.current) excelInputRef.current.value = ''
      if (photoInputRef.current) photoInputRef.current.value = ''
    } catch (err: any) {
      setStatus({ 
        loading: false, 
        message: err.response?.data?.detail || 'خطا در برقراری ارتباط با سرور', 
        error: true 
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto glass-card rounded-2xl p-8">
      <h2 className="text-2xl font-semibold text-gray-100 mb-6">آپلود با فایل اکسل</h2>
      
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 mb-8">
        <h3 className="text-red-400 font-semibold mb-2 text-lg">راهنمای آپلود</h3>
        <ul className="list-disc list-inside text-gray-300 text-sm space-y-2">
          <li>ابتدا یک فایل اکسل (.xlsx) حاوی یک ستون از شماره تلفن‌ها انتخاب کنید.</li>
          <li>سپس عکس‌ها را به همان ترتیب شماره‌ها انتخاب کنید.</li>
          <li>تعداد عکس‌ها باید دقیقاً با تعداد شماره تلفن‌های داخل اکسل برابر باشد.</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">انتخاب فایل اکسل</label>
          <div className="relative">
            <input 
              type="file" 
              accept=".xlsx,.xls"
              onChange={handleExcelChange}
              className="w-full bg-black/20 text-gray-100 px-4 py-3 rounded-xl border border-white/10 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
            />
          </div>
        </div>

        {/* Photos Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">انتخاب عکس‌ها</label>
          <div 
            className="border-2 border-dashed border-white/10 bg-black/20 rounded-2xl p-10 text-center hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300 cursor-pointer group"
            onDragOver={e => e.preventDefault()}
            onDrop={handlePhotosDrop}
            onClick={() => photoInputRef.current?.click()}
          >
            <FileSpreadsheet className="mx-auto text-gray-500 mb-3 group-hover:text-red-400 transition-colors duration-300" size={44} />
            <p className="text-gray-300 font-medium">عکس‌ها را اینجا رها کنید یا کلیک کنید</p>
            <p className="text-sm text-gray-500 mt-2">امکان انتخاب چند فایل همزمان وجود دارد</p>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              className="hidden" 
              ref={photoInputRef}
              onChange={handlePhotosChange}
            />
          </div>
          
          {photos.length > 0 && (
            <div className="mt-4 p-4 bg-white/5 rounded-xl text-gray-200 border border-white/5 text-sm font-medium flex items-center shadow-inner">
              <span className="w-2 h-2 rounded-full bg-green-500 ml-2 animate-pulse"></span>
              {photos.length} فایل انتخاب شد.
            </div>
          )}
        </div>

        {status.message && (
          <div className={`p-4 rounded-xl text-sm border font-medium ${status.error ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
            {status.message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={status.loading || !excelFile || photos.length === 0}
          className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-medium py-3.5 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {status.loading ? 'در حال آپلود...' : 'ثبت و ارسال گروهی'}
        </button>
      </form>
    </div>
  )
}
