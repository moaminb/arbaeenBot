import { useEffect, useState } from 'react'
import axios from 'axios'
import { Users, Image as ImageIcon, HardDrive } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface HistoricalData {
  date: string;
  users: number;
  photos: number;
  storage_mb: number;
}

interface Stats {
  total_users: number
  total_photos: number
  storage_size_mb: number
  historical_data: HistoricalData[]
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

  const chartData = stats.historical_data && stats.historical_data.length > 0 
    ? stats.historical_data 
    : [{ date: 'امروز', users: stats.total_users, photos: stats.total_photos, storage_mb: stats.storage_size_mb }];

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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-medium text-gray-200 mb-6 flex items-center gap-2">
            <Users size={18} className="text-red-500" />
            روند رشد کاربران
          </h3>
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', border: '1px solid #ffffff10', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="users" name="تعداد کاربران" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Photos Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-medium text-gray-200 mb-6 flex items-center gap-2">
            <ImageIcon size={18} className="text-red-400" />
            روند رشد عکس‌ها
          </h3>
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPhotos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', border: '1px solid #ffffff10', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="photos" name="تعداد عکس‌ها" stroke="#f87171" strokeWidth={3} fillOpacity={1} fill="url(#colorPhotos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Storage Chart */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-200 mb-6 flex items-center gap-2">
            <HardDrive size={18} className="text-red-300" />
            روند رشد حجم ذخیره سازی (MB)
          </h3>
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fca5a5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fca5a5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', border: '1px solid #ffffff10', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="storage_mb" name="حجم (مگابایت)" stroke="#fca5a5" strokeWidth={3} fillOpacity={1} fill="url(#colorStorage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
