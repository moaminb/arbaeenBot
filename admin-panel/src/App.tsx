import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Users, Upload, FileSpreadsheet } from 'lucide-react'

import UsersList from './pages/UsersList'
import ManualUpload from './pages/ManualUpload'
import BatchUpload from './pages/BatchUpload'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-transparent flex flex-col md:flex-row rtl" dir="rtl">
        {/* Sidebar */}
        <div className="w-full md:w-64 glass-panel border-r-0 border-t-0 border-b-0">
          <div className="p-6 border-b border-white/5">
            <h1 className="text-2xl font-black tracking-tight text-gradient">پنل مدیریت</h1>
          </div>
          <nav className="mt-6 flex flex-col px-4 space-y-2">
            <Link to="/" className="flex items-center space-x-2 space-x-reverse px-4 py-3 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] rounded-xl transition-all duration-300">
              <Users size={20} />
              <span className="font-medium">لیست کاربران</span>
            </Link>
            <Link to="/manual" className="flex items-center space-x-2 space-x-reverse px-4 py-3 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] rounded-xl transition-all duration-300">
              <Upload size={20} />
              <span className="font-medium">آپلود دستی</span>
            </Link>
            <Link to="/batch" className="flex items-center space-x-2 space-x-reverse px-4 py-3 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] rounded-xl transition-all duration-300">
              <FileSpreadsheet size={20} />
              <span className="font-medium">آپلود با اکسل</span>
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<UsersList />} />
            <Route path="/manual" element={<ManualUpload />} />
            <Route path="/batch" element={<BatchUpload />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
