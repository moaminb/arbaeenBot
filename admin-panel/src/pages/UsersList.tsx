import { useEffect, useState } from 'react'
import axios from 'axios'
import { Edit2, X, Save } from 'lucide-react'

const API_BASE = '/api'

interface User {
  user_id: number
  language: string
  name: string
  profession: string
  contribution: string
  phone_number: string
  has_received_photo?: number
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<User>>({})
  const [phoneError, setPhoneError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to fetch users', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleEditClick = (user: User) => {
    setEditingUser(user)
    setEditFormData({ ...user })
  }

  const handleCloseModal = () => {
    setEditingUser(null)
    setEditFormData({})
    setPhoneError('')
  }

  const handleSave = async () => {
    if (!editingUser) return
    if (editFormData.phone_number && !/^\+[0-9]+$/.test(editFormData.phone_number)) {
      setPhoneError('شماره موبایل باید با فرمت کد کشور وارد شود (مثال: +989123456789)')
      return
    }
    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      await axios.put(`${API_BASE}/users/${editingUser.user_id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchUsers()
      handleCloseModal()
    } catch (err) {
      console.error('Failed to update user', err)
      alert('خطا در ذخیره اطلاعات')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
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
                <th className="px-6 py-4 text-sm font-semibold text-gray-300">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">در حال دریافت اطلاعات...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">کاربری یافت نشد.</td>
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
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="ویرایش"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">ویرایش کاربر {editingUser.user_id}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">نام و نام خانوادگی</label>
                <input 
                  type="text" 
                  value={editFormData.name || ''} 
                  onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">شغل</label>
                <input 
                  type="text" 
                  value={editFormData.profession || ''} 
                  onChange={e => setEditFormData({...editFormData, profession: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">کمک‌ها</label>
                <textarea 
                  value={editFormData.contribution || ''} 
                  onChange={e => setEditFormData({...editFormData, contribution: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none min-h-[80px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">شماره تلفن</label>
                <input 
                  type="text" 
                  dir="ltr"
                  value={editFormData.phone_number || ''} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val && !/^\+?[0-9]*$/.test(val)) {
                      setPhoneError('فقط اعداد انگلیسی و علامت + مجاز است')
                    } else {
                      setPhoneError('')
                    }
                    setEditFormData({...editFormData, phone_number: val})
                  }}
                  className={`w-full bg-black/40 border ${phoneError ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-2 text-white focus:outline-none`}
                />
                {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">زبان</label>
                <select
                  value={editFormData.language || 'fa'}
                  onChange={e => setEditFormData({...editFormData, language: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="fa">فارسی</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                className="px-6 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition-colors font-medium"
              >
                انصراف
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? 'در حال ذخیره...' : <><Save size={18} /> ذخیره تغییرات</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
