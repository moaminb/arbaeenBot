import React from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Users, Upload, FileSpreadsheet, LayoutDashboard, LogOut } from 'lucide-react'

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const token = localStorage.getItem('adminToken');
  if (!token) {
    React.useEffect(() => {
      navigate('/admin/login');
    }, [navigate]);
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row rtl" dir="rtl">
      {/* Sidebar */}
      <div className="w-full md:w-64 glass-panel border-r-0 border-t-0 border-b-0 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-2xl font-black tracking-tight text-gradient">پنل مدیریت</h1>
        </div>
        <nav className="mt-6 flex flex-col px-4 space-y-2 flex-1">
          <Link 
            to="/admin/dashboard" 
            className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl transition-all duration-300 ${isActive('/admin/dashboard') ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-gray-400 hover:bg-red-500/10 hover:text-red-400'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">داشبورد آماری</span>
          </Link>
          <Link 
            to="/admin/users" 
            className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl transition-all duration-300 ${isActive('/admin/users') ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-gray-400 hover:bg-red-500/10 hover:text-red-400'}`}
          >
            <Users size={20} />
            <span className="font-medium">لیست کاربران</span>
          </Link>
          <Link 
            to="/admin/manual" 
            className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl transition-all duration-300 ${isActive('/admin/manual') ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-gray-400 hover:bg-red-500/10 hover:text-red-400'}`}
          >
            <Upload size={20} />
            <span className="font-medium">آپلود دستی</span>
          </Link>
          <Link 
            to="/admin/batch" 
            className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl transition-all duration-300 ${isActive('/admin/batch') ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-gray-400 hover:bg-red-500/10 hover:text-red-400'}`}
          >
            <FileSpreadsheet size={20} />
            <span className="font-medium">آپلود با اکسل</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full space-x-2 space-x-reverse px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 cursor-pointer"
          >
            <LogOut size={20} />
            <span className="font-medium">خروج</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
