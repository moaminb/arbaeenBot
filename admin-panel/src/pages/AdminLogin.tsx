import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Lock, User } from 'lucide-react'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await axios.post('/api/login', { username, password })
      localStorage.setItem('adminToken', res.data.token)
      navigate('/admin/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'نام کاربری یا رمز عبور اشتباه است')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 rtl" dir="rtl">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-red-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-black text-gradient mb-2">ورود به پنل ادمین</h1>
          <p className="text-gray-400 text-sm">برای دسترسی به داشبورد اطلاعات خود را وارد کنید</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">نام کاربری</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pl-3 flex items-center pr-4 pointer-events-none text-gray-500">
                <User size={18} />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-black/20 text-gray-100 pr-12 pl-4 py-3 rounded-xl border border-white/10 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                placeholder="admin"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">رمز عبور</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pl-3 flex items-center pr-4 pointer-events-none text-gray-500">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/20 text-gray-100 pr-12 pl-4 py-3 rounded-xl border border-white/10 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !username || !password}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-medium py-3.5 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  )
}
