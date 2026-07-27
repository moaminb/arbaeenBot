import React from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Users, Upload, FileSpreadsheet, LayoutDashboard, LogOut, Image as ImageIcon, Menu, X } from 'lucide-react'

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const token = localStorage.getItem('adminToken');

  React.useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row rtl" dir="rtl">
      {/* Mobile Header */}
      <div className="md:hidden glass-panel border-b border-white/5 p-4 flex justify-between items-center z-50 relative sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full object-cover border border-white/10" />
          <h1 className="text-xl font-black tracking-tight text-gradient">پنل مدیریت</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-200 hover:text-white p-2 rounded-lg bg-white/5 border border-white/10"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 right-0 z-40 transform 
        ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"} 
        md:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 glass-panel md:border-l border-white/5 flex flex-col shadow-2xl md:shadow-none bg-[#0a0a0a]/95 md:bg-transparent backdrop-blur-xl h-full
      `}>
        <div className="p-6 border-b border-white/5 hidden md:block">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-full object-cover border border-white/10" />
            <h1 className="text-2xl font-black tracking-tight text-gradient">پنل مدیریت</h1>
          </div>
        </div>
        <nav className="mt-6 flex flex-col px-4 space-y-2 flex-1 overflow-y-auto">
          <Link 
            to="/admin/dashboard" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl transition-all duration-300 ${isActive('/admin/dashboard') ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-gray-400 hover:bg-red-500/10 hover:text-red-400'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">داشبورد آماری</span>
          </Link>
          <Link 
            to="/admin/users" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl transition-all duration-300 ${isActive('/admin/users') ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-gray-400 hover:bg-red-500/10 hover:text-red-400'}`}
          >
            <Users size={20} />
            <span className="font-medium">لیست کاربران</span>
          </Link>
          <Link 
            to="/admin/gallery" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl transition-all duration-300 ${isActive('/admin/gallery') ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-gray-400 hover:bg-red-500/10 hover:text-red-400'}`}
          >
            <ImageIcon size={20} />
            <span className="font-medium">گالری تصاویر</span>
          </Link>
          <Link 
            to="/admin/manual" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl transition-all duration-300 ${isActive('/admin/manual') ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-gray-400 hover:bg-red-500/10 hover:text-red-400'}`}
          >
            <Upload size={20} />
            <span className="font-medium">آپلود دستی</span>
          </Link>
          <Link 
            to="/admin/batch" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl transition-all duration-300 ${isActive('/admin/batch') ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-gray-400 hover:bg-red-500/10 hover:text-red-400'}`}
          >
            <FileSpreadsheet size={20} />
            <span className="font-medium">آپلود با اکسل</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-white/5 mt-auto">
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
