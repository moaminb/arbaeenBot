import React, { useState, useRef } from 'react'
import axios from 'axios'
import { UploadCloud } from 'lucide-react'

export default function ManualUpload() {
  const [phone, setPhone] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState({ loading: false, message: '', error: false })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || files.length === 0) {
      setStatus({ loading: false, message: 'لطفا شماره موبایل و حداقل یک عکس را وارد کنید.', error: true })
      return
    }

    if (!/^[0-9]+$/.test(phone)) {
      setStatus({ loading: false, message: 'لطفا شماره موبایل را فقط با اعداد انگلیسی وارد کنید.', error: true })
      return
    }

    setStatus({ loading: true, message: '', error: false })
    
    const formData = new FormData()
    formData.append('phone_number', phone)
    files.forEach(file => {
      formData.append('files', file)
    })

    try {
      const token = localStorage.getItem('adminToken')
      await axios.post('/api/upload_manual', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })
      setStatus({ loading: false, message: 'عکس‌ها با موفقیت ذخیره شدند!', error: false })
      setFiles([])
      setPhone('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setStatus({ loading: false, message: 'خطا در برقراری ارتباط با سرور', error: true })
    }
  }

  return (
    <div className="max-w-2xl mx-auto glass-card rounded-2xl p-8">
      <h2 className="text-2xl font-semibold text-gray-100 mb-6">آپلود دستی عکس‌ها</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">شماره تلفن کاربر</label>
          <input 
            type="text" 
            value={phone}
            onChange={e => {
              const val = e.target.value;
              if (val && !/^[0-9]*$/.test(val)) {
                setStatus({ loading: false, message: 'فقط اعداد انگلیسی مجاز است.', error: true })
              } else {
                setStatus({ loading: false, message: '', error: false })
              }
              setPhone(val)
            }}
            placeholder="مثال: 09123456789"
            className="w-full bg-black/20 text-gray-100 px-4 py-3 rounded-xl border border-white/10 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all text-left placeholder-gray-600 outline-none"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">انتخاب عکس‌ها</label>
          <div 
            className="border-2 border-dashed border-white/10 bg-black/20 rounded-2xl p-10 text-center hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300 cursor-pointer group"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="mx-auto text-gray-500 mb-3 group-hover:text-red-400 transition-colors duration-300" size={44} />
            <p className="text-gray-300 font-medium">عکس‌ها را اینجا رها کنید یا کلیک کنید</p>
            <p className="text-sm text-gray-500 mt-2">امکان انتخاب چند فایل همزمان وجود دارد</p>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
          
          {files.length > 0 && (
            <div className="mt-4 p-4 bg-white/5 rounded-xl text-gray-200 border border-white/5 text-sm font-medium flex items-center shadow-inner">
              <span className="w-2 h-2 rounded-full bg-green-500 ml-2 animate-pulse"></span>
              {files.length} فایل انتخاب شد.
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
          disabled={status.loading}
          className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-medium py-3.5 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {status.loading ? 'در حال آپلود...' : 'ثبت عکس‌ها'}
        </button>
      </form>
    </div>
  )
}
