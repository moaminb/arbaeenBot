import { useState, useEffect } from "react";
import axios from "axios";

interface PhotoItem {
  phone_number: string;
  has_received_photo: number;
  photos: string[];
}

export default function PhotoGallery() {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "received" | "not_received">("all");
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/admin/photos", {
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
    <div>
      <h2 className="text-2xl font-bold mb-4">گالری تصاویر آپلود شده</h2>
      
      <div className="mb-6 flex items-center space-x-4 space-x-reverse">
        <label className="font-semibold text-gray-700">فیلتر وضعیت:</label>
        <select 
          className="border border-gray-300 rounded px-4 py-2 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">همه عکس‌ها</option>
          <option value="received">عکس توسط کاربر دریافت شده</option>
          <option value="not_received">عکس توسط کاربر دریافت نشده</option>
        </select>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          تعداد: {filteredItems.length}
        </span>
      </div>

      {loading ? (
        <p className="text-gray-500">در حال بارگذاری...</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-gray-500">هیچ عکسی با این فیلتر یافت نشد.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.phone_number} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              {item.photos.length > 0 ? (
                <div className="relative pt-[100%] bg-gray-100">
                  <img 
                    src={item.photos[0]} 
                    alt={`Photo ${item.phone_number}`} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {item.photos.length > 1 && (
                    <span className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                      +{item.photos.length - 1} عکس
                    </span>
                  )}
                </div>
              ) : (
                <div className="pt-[100%] bg-gray-200 relative">
                  <span className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">عکسی یافت نشد</span>
                </div>
              )}
              
              <div className="p-4 flex flex-col items-center">
                <span className="text-lg font-bold text-gray-800 mb-2" dir="ltr">{item.phone_number}</span>
                {item.has_received_photo === 1 ? (
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">دریافت شده</span>
                ) : (
                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">دریافت نشده</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
