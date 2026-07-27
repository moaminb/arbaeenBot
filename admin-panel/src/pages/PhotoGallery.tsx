import { useState, useEffect } from "react";
import axios from "axios";
import { Filter } from "lucide-react";

interface PhotoItem {
  phone_number: string;
  has_received_photo: number;
  photos: string[];
}

export default function PhotoGallery() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "received" | "not_received">("all");
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await axios.get("/api/admin/photos", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data.items);
    } catch (err) {
      console.error(err);
      alert("خطا در دریافت لیست تصاویر.");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "received") return item.has_received_photo === 1;
    if (filter === "not_received") return item.has_received_photo === 0;
    return true;
  });

  return (
    <div className="glass-card rounded-2xl overflow-hidden min-h-[calc(100vh-8rem)]">
      <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 gap-4">
        <h2 className="text-xl font-semibold text-gray-100">گالری تصاویر آپلود شده</h2>
        
        <div className="flex items-center space-x-3 space-x-reverse bg-black/40 p-2 rounded-xl border border-white/10">
          <Filter size={18} className="text-gray-400" />
          <select 
            className="bg-transparent text-sm font-medium text-gray-200 outline-none cursor-pointer appearance-none px-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all" className="bg-[#1a1a1a]">همه عکس‌ها</option>
            <option value="received" className="bg-[#1a1a1a]">دریافت شده</option>
            <option value="not_received" className="bg-[#1a1a1a]">دریافت نشده</option>
          </select>
          <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20 mr-2">
            {filteredItems.length} مورد
          </span>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">در حال بارگذاری تصاویر...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-black/20 rounded-xl border border-white/5">
            هیچ عکسی با این فیلتر یافت نشد.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div key={item.phone_number} className="bg-black/40 rounded-xl overflow-hidden border border-white/10 hover:border-red-500/50 transition-all duration-300 group shadow-lg">
                {item.photos.length > 0 ? (
                  <div className="relative pt-[100%] bg-white/5">
                    <img 
                      src={item.photos[0]} 
                      alt={`Photo ${item.phone_number}`} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.photos.length > 1 && (
                      <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-xs px-2 py-1 rounded-lg border border-white/10">
                        +{item.photos.length - 1} عکس
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="pt-[100%] bg-white/5 relative">
                    <span className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">عکسی یافت نشد</span>
                  </div>
                )}
                
                <div className="p-4 flex flex-col items-center border-t border-white/5 bg-gradient-to-b from-transparent to-black/50">
                  <span className="text-lg font-bold text-gray-200 mb-2 tracking-wider" dir="ltr">{item.phone_number}</span>
                  {item.has_received_photo === 1 ? (
                    <span className="bg-green-500/20 text-green-400 border border-green-500/20 text-xs font-semibold px-3 py-1 rounded-lg w-full text-center">
                      تحویل داده شده
                    </span>
                  ) : (
                    <span className="bg-orange-500/20 text-orange-400 border border-orange-500/20 text-xs font-semibold px-3 py-1 rounded-lg w-full text-center">
                      در انتظار تحویل
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
