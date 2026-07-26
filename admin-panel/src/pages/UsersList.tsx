import { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = '/api'

interface User {
  user_id: number
  language: string
  name: string
  profession: string
  contribution: string
  phone_number: string
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_BASE}/users`)
      .then(res => {
        setUsers(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/5">
        <h2 className="text-xl font-semibold text-gray-100">لیست کاربران ربات</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">ID تلگرام</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">نام</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">شغل</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">کمک‌ها</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">شماره تلفن</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-300">زبان</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">در حال دریافت اطلاعات...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">کاربری یافت نشد.</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.user_id} className="hover:bg-red-500/5 transition-colors duration-300">
                  <td className="px-6 py-4 text-sm text-gray-400">{user.user_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-200 font-medium">{user.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{user.profession || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{user.contribution || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-200" dir="ltr">{user.phone_number || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300 uppercase border border-white/5">
                      {user.language}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
