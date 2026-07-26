import { useEffect, useState } from 'react'
import axios from 'axios'
import { Users, Image as ImageIcon, HardDrive } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Stats {
  total_users: number
  total_photos: number
  storage_size_mb: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await axios.get('/api/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(res.data)
    } catch (err) {
      setError('خطا در دریافت اطلاعات داشبورد')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-gray-400">در حال بارگذاری...</div>
  }

  if (error || !stats) {
    return <div className="text-red-400">{error}</div>
  }

  const chartData = [
    { name: 'کاربران', value: stats.total_users, color: '#ef4444' },
    { name: 'عکس‌ها', value: stats.total_photos, color: '#f87171' },
    { name: 'حجم (MB)', value: stats.storage_size_mb, color: '#fca5a5' },
  ]

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-100">داشبورد آماری</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 flex items-center space-x-4 space-x-reverse relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-500 rounded-r-2xl"></div>
          <div className="p-4 bg-red-500/10 rounded-xl text-red-400 group-hover:scale-110 transition-transform duration-300">
            <Users size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">کل کاربران</p>
            <h3 className="text-3xl font-black text-gray-100 mt-1">{stats.total_users}</h3>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex items-center space-x-4 space-x-reverse relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-400 rounded-r-2xl"></div>
          <div className="p-4 bg-red-400/10 rounded-xl text-red-400 group-hover:scale-110 transition-transform duration-300">
            <ImageIcon size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">کل عکس‌ها</p>
            <h3 className="text-3xl font-black text-gray-100 mt-1">{stats.total_photos}</h3>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex items-center space-x-4 space-x-reverse relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-300 rounded-r-2xl"></div>
          <div className="p-4 bg-red-300/10 rounded-xl text-red-300 group-hover:scale-110 transition-transform duration-300">
            <HardDrive size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">فضای اشغال شده</p>
            <h3 className="text-3xl font-black text-gray-100 mt-1" dir="ltr">{stats.storage_size_mb} MB</h3>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-medium text-gray-200 mb-6">نمودار کلی سیستم</h3>
        <div className="h-80 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                cursor={{ fill: '#ffffff05' }}
                contentStyle={{ backgroundColor: '#111111', border: '1px solid #ffffff10', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
