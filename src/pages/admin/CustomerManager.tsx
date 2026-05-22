import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiMenu, FiX } from 'react-icons/fi';
import { Search, Trash2, Phone } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import CustomerModal from '../../components/CustomerModal';

// --- Interface dữ liệu ---
interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  status: boolean;
  createdAt: string;
  latestOrderStatus?: string | null;
}

interface OrderSummary {
  id: number;
  orderCode: string;
  totalAmount: number;
  status: string;
  orderDate: string;
}

const CustomerManager = () => {
  // Fix lỗi "sidebarOpen is not defined"
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<OrderSummary[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const apiBase = 'https://localhost:7137/api';

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Customer[]>(`${apiBase}/users`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Lỗi khi tải khách hàng', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenDetails = async (customer: Customer) => {
    try {
      const response = await axios.get<OrderSummary[]>(`${apiBase}/orders/user/${customer.id}`);
      setSelectedOrders(response.data);
      setSelectedCustomer(customer);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Lỗi đơn hàng', error);
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa khách hàng này?')) {
      try {
        await axios.delete(`${apiBase}/users/${id}`);
        setCustomers(prev => prev.filter(c => c.id !== id));
      } catch (error) { console.error(error); }
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const getPaymentLabel = (status?: string | null) => {
    if (!status) return 'Chưa có đơn';
    const normalized = status.toLowerCase();
    if (normalized === 'success') return 'Đã thanh toán';
    return 'Chưa thanh toán';
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      {/* 1. Gọi trực tiếp Sidebar (Để Sidebar tự quản lý độ rộng của nó) */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* 2. Nội dung bên phải */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header đen chuẩn theo hình trang nhà cung cấp */}
        <div className="bg-gray-900 shadow-xl px-8 py-6 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 text-white rounded-lg transition duration-200"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-3xl font-bold text-white">Quản lý Khách hàng</h1>
        </div>

        {/* Vùng Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Danh sách Khách hàng</h2>
              <p className="text-gray-500 text-sm">Quản lý và tra cứu thông tin khách hàng thân thiết</p>
            </div>

            {/* Thanh Search bo góc chuẩn UI */}
            <div className="relative mb-10">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* List Customer */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-10 text-gray-400">Đang tải dữ liệu...</div>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => (
                  <div key={customer.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md hover:border-blue-100 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100">
                        {customer.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{customer.fullName}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Phone size={14} className="text-green-500"/> {customer.phone || 'N/A'}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{customer.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        customer.latestOrderStatus?.toLowerCase() === 'success' 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-gray-100 text-gray-500'
                      }`}>
                        {getPaymentLabel(customer.latestOrderStatus)}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleOpenDetails(customer)} 
                          className="px-6 py-2 bg-[#00c853] text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-colors shadow-sm"
                        >
                          Chi tiết
                        </button>
                        <button 
                          onClick={() => handleDeleteCustomer(customer.id)} 
                          className="p-2.5 bg-[#ff3d00] text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">Không tìm thấy khách hàng nào.</div>
              )}
            </div>
          </div>
        </main>
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
        orders={selectedOrders}
      />
    </div>
  );
};

export default CustomerManager;