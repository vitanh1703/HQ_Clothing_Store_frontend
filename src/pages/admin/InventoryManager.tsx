import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FiSearch, FiBox, FiMenu, FiX, FiRefreshCcw, 
  FiAlertTriangle, FiCheckCircle, FiShoppingCart, FiTrendingUp 
} from "react-icons/fi";
import AdminSidebar from '../../components/AdminSidebar';
import { toast } from 'react-toastify';

const InventoryManager = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [warehouseData, setWarehouseData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // --- STATE CHO BỘ LỌC TRẠNG THÁI ---
  const [statusFilter, setStatusFilter] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock'>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi API lấy dữ liệu kho (nhớ kiểm tra route này ở backend)
      const res = await axios.get('https://localhost:7137/api/promotions/inventory');
      setWarehouseData(res.data);
    } catch (err) {
      toast.error("Lỗi kết nối Server!");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- LOGIC LỌC DỮ LIỆU ĐA TẦNG ---
  const filteredData = warehouseData.filter(item => {
    // 1. Lọc theo thanh tìm kiếm
    const matchesSearch = (item.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Lọc theo nút thống kê (Stats Cards)
    if (statusFilter === 'inStock') return matchesSearch && item.stockQuantity >= 20;
    if (statusFilter === 'lowStock') return matchesSearch && item.stockQuantity > 0 && item.stockQuantity < 20;
    if (statusFilter === 'outOfStock') return matchesSearch && item.stockQuantity <= 0;
    
    return matchesSearch;
  });

  // --- PHÂN TRANG ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  // --- DỮ LIỆU CHO CÁC THẺ THỐNG KÊ ---
  const stats = {
    totalTypes: warehouseData.length,
    inStock: warehouseData.filter(i => i.stockQuantity >= 20).length,
    lowStock: warehouseData.filter(i => i.stockQuantity > 0 && i.stockQuantity < 20).length,
    outOfStock: warehouseData.filter(i => i.stockQuantity <= 0).length,
    totalQuantity: warehouseData.reduce((sum, i) => sum + i.stockQuantity, 0)
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-black font-sans">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 shadow-xl px-8 py-6 flex items-center gap-4 text-white uppercase tracking-tight font-bold text-3xl">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-700 rounded-lg transition">
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          Quản lý Kho hàng
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Search Bar */}
            <div className="flex gap-4 mb-8">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã SKU, tên sản phẩm..."
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-gray-900 outline-none transition"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button onClick={() => {setStatusFilter('all'); fetchData();}} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg">
                <FiRefreshCcw className={loading ? "animate-spin" : ""} /> Tất cả hàng
              </button>
            </div>

            {/* Stats Cards - CÓ CHỨC NĂNG CLICK LỌC */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <StatCard 
                active={statusFilter === 'all'} 
                onClick={() => setStatusFilter('all')} 
                icon={<FiBox />} label="Loại SP" value={stats.totalTypes} color="blue" 
              />
              <StatCard 
                active={statusFilter === 'inStock'} 
                onClick={() => setStatusFilter('inStock')} 
                icon={<FiCheckCircle />} label="Đủ hàng" value={stats.inStock} color="green" 
              />
              <StatCard 
                active={statusFilter === 'lowStock'} 
                onClick={() => setStatusFilter('lowStock')} 
                icon={<FiAlertTriangle />} label="Sắp hết" value={stats.lowStock} color="yellow" 
              />
              <StatCard 
                active={statusFilter === 'outOfStock'} 
                onClick={() => setStatusFilter('outOfStock')} 
                icon={<FiShoppingCart />} label="Cần nhập" value={stats.outOfStock} color="red" 
              />
              <StatCard icon={<FiTrendingUp />} label="Tổng tồn" value={stats.totalQuantity} color="purple" />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b text-gray-500 text-xs font-bold uppercase">
                  <tr>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Sản phẩm</th>
                    <th className="p-4 text-center">Tồn kho</th>
                    <th className="p-4 text-center">Đã đặt</th>
                    <th className="p-4 text-center">Có thể bán</th>
                    <th className="p-4 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {currentItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-xs font-semibold text-blue-600">{item.sku}</td>
                      <td className="p-4">
                        <p className="font-bold text-gray-900 text-sm">{item.productName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{item.size} | {item.color}</p>
                      </td>
                      <td className="p-4 font-bold text-center">{item.stockQuantity}</td>
                      {/* CỘT ĐÃ ĐẶT MỚI THÊM */}
                      <td className="p-4 font-bold text-center text-orange-600">{item.reservedQuantity || 0}</td>
                      <td className="p-4 font-bold text-green-600 text-center">{item.stockQuantity - (item.reservedQuantity || 0)}</td>
                      <td className="p-4 text-center"><StatusBadge q={item.stockQuantity} /></td>
                    </tr>
                  ))}
                  {currentItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-20 text-gray-400">Không có sản phẩm nào thuộc danh mục này.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 bg-gray-50 border-t flex items-center justify-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50">Trước</button>
                  {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)} className={`px-4 py-2 rounded-lg ${currentPage === p ? 'bg-blue-600 text-white' : 'bg-white border'}`}>{p}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50">Sau</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CẬP NHẬT STATCARD ĐỂ NHẬN CLICK ---
const StatCard = ({ icon, label, value, color, active, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`p-4 rounded-lg shadow-md border cursor-pointer transition-all duration-200 flex items-center gap-3 bg-white
      ${active ? `ring-2 ring-${color}-500 shadow-lg scale-105` : 'hover:shadow-lg hover:-translate-y-1'}`}
  >
    <div className={`p-3 bg-${color}-100 text-${color}-600 rounded-lg text-xl`}>{icon}</div>
    <div>
      <p className="text-gray-600 text-[10px] uppercase font-bold">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ q }: { q: number }) => {
  const style = q >= 20 ? "bg-green-100 text-green-700" : q > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
  const text = q >= 20 ? "Đủ hàng" : q > 0 ? "Sắp hết" : "Cần nhập";
  return <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${style}`}>{text}</span>;
};

export default InventoryManager;