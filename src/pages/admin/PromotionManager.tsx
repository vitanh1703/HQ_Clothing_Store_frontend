import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Trash2, Edit2, Plus, X as CloseIcon } from 'lucide-react';
import { FiX, FiMenu } from "react-icons/fi";
import AdminSidebar from '../../components/AdminSidebar';
import { toast } from 'react-toastify';

const PromotionManager = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountValue: 0,
    discountType: 'Percentage',
    startDate: '',
    endDate: '',
    status: true
  });

  const apiBase = 'https://localhost:7137/api/promotions';

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(apiBase);
      setPromotions(response.data);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu từ Server!");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPromotions(); }, []);

  const safeSplitDate = (dateStr: any) => {
    if (!dateStr) return '';
    // Nếu dateStr đã là dd/MM/yyyy từ backend cũ, ta cần convert lại sang yyyy-MM-dd để input date hiểu
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const parts = dateStr.split('/');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr.toString().split('T')[0];
  };

  const handleOpenAddModal = () => {
    setEditingPromotion(null);
    setFormData({ code: '', description: '', discountValue: 0, discountType: 'Percentage', startDate: '', endDate: '', status: true });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promo: any) => {
    setEditingPromotion(promo);
    setFormData({
      code: promo.code || promo.Code || '',
      description: promo.description || promo.Description || '',
      discountValue: promo.discountValue || promo.DiscountValue || 0,
      discountType: promo.discountType || promo.DiscountType || 'Percentage',
      startDate: safeSplitDate(promo.startDate || promo.StartDate),
      endDate: safeSplitDate(promo.endDate || promo.EndDate),
      // Quan trọng: Kiểm tra status là 1 hoặc true
      status: (promo.status === 1 || promo.status === true || promo.Status === 1)
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = {
      id: editingPromotion ? editingPromotion.id : 0,
      code: formData.code,
      description: formData.description,
      discountValue: Number(formData.discountValue),
      discountType: formData.discountType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status ? 1 : 0 // Gửi 1 cho Kích hoạt, 0 cho Dừng
    };

    try {
      if (editingPromotion) {
        await axios.put(`${apiBase}/${editingPromotion.id}`, dataToSend);
        toast.success("Cập nhật thành công!");
      } else {
        await axios.post(apiBase, dataToSend);
        toast.success("Thêm mới thành công!");
      }
      setIsModalOpen(false);
      fetchPromotions();
    } catch (error: any) {
      toast.error("Lỗi: Kiểm tra lại dữ liệu nhập vào!");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mã khuyến mại này không?")) {
      try {
        await axios.delete(`${apiBase}/${id}`);
        toast.success("Đã xóa thành công!");
        fetchPromotions();
      } catch (error) { toast.error("Lỗi khi xóa!"); }
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col h-full overflow-hidden border-l">
        <div className="bg-gray-900 shadow-xl px-8 py-6 flex items-center gap-4 text-white">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-700 rounded-lg">
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-3xl font-bold uppercase tracking-tight">Quản lý Khuyến mại</h1>
        </div>

        <main className="flex-1 overflow-y-auto p-8 bg-white text-black">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gray-800">Danh sách mã giảm giá</h2>
               <button onClick={handleOpenAddModal} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md">
                 <Plus size={20}/> Thêm mới
               </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden text-black">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-gray-500 text-sm uppercase font-bold">
                    <th className="p-4">Chương trình</th>
                    <th className="p-4">Mã</th>
                    <th className="p-4">Loại</th>
                    <th className="p-4">Hiệu lực</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {promotions.filter(p => (p.code || p.Code || "").toLowerCase().includes(searchTerm.toLowerCase())).map((promo) => {
                    return (
                      <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-semibold text-gray-800 text-sm">
                            {promo.description || promo.Description}
                        </td>
                        <td className="p-4 font-mono font-bold text-blue-600">{promo.code || promo.Code}</td>
                        <td className="p-4 text-sm">{ (promo.discountType || promo.DiscountType) === 'Percentage' ? 'Phần trăm' : 'Giảm tiền' }</td>
                        <td className="p-4 text-xs text-gray-500">
                      {new Date(promo.startDate || promo.StartDate).toLocaleDateString('vi-VN')} - {new Date(promo.endDate || promo.EndDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-4 text-center">
                            {(() => {
                                // 1. Lấy dữ liệu ngày tháng và status
                                const end = new Date(promo.endDate || promo.EndDate);
                                const now = new Date();
                                const isManualActive = (promo.status === 1 || promo.status === true || promo.Status === 1);
                                
                                // 2. Kiểm tra xem đã hết hạn chưa (So sánh ngày)
                                // Đặt giờ về 0 để so sánh chính xác theo ngày
                                now.setHours(0, 0, 0, 0);
                                const isExpired = end < now;

                                // 3. Logic hiển thị
                                if (!isManualActive) {
                                return (
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-500">
                                    Tạm dừng
                                    </span>
                                );
                                } else if (isExpired) {
                                return (
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-600">
                                    Hết hạn
                                    </span>
                                );
                                } else {
                                return (
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-600">
                                    Đang chạy
                                    </span>
                                );
                                }
                            })()}
                            </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleOpenEditModal(promo)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"><Edit2 size={16}/></button>
                            <button onClick={() => handleDelete(promo.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL GIỮ NGUYÊN PHẦN JSX FORM NHƯNG DÙNG CÁC TRƯỜNG DỮ LIỆU ĐÃ FIX */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-black">
            <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">{editingPromotion ? 'Sửa khuyến mãi' : 'Tạo mới khuyến mãi'}</h3>
              <button onClick={() => setIsModalOpen(false)}><CloseIcon size={24}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <input required placeholder="Mã khuyến mãi" className="w-full border p-2 rounded-lg" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
              <textarea placeholder="Mô tả" className="w-full border p-2 rounded-lg" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Giá trị" className="w-full border p-2 rounded-lg" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} />
                <select className="w-full border p-2 rounded-lg bg-white text-black" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                  <option value="Percentage">Phần trăm (%)</option>
                  <option value="FixedAmount">Giảm tiền (VNĐ)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required type="date" className="w-full border p-2 rounded-lg" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                <input required type="date" className="w-full border p-2 rounded-lg" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.status} onChange={e => setFormData({...formData, status: e.target.checked})} id="active_check" />
                <label htmlFor="active_check" className="text-sm font-bold text-gray-700">Kích hoạt ngay</label>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-100 rounded-lg font-bold">Hủy</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg">Lưu Database</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManager;