import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { FiMenu, FiX } from 'react-icons/fi';
import { Search, Eye, Edit2 } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/AdminSidebar';
import { OrderDetailModal, OrderStatusUpdateModal } from '../../components/OrderModal';
import type { Order } from '../../components/OrderModal';

const OrderManager = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const apiBase = 'https://localhost:7137/api';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Order[]>(`${apiBase}/orders/admin/all`);
      setOrders(response.data);
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleEditStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  const closeModals = () => {
    setIsDetailModalOpen(false);
    setIsStatusModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderUpdated = (updatedOrder: Order) => {
    setOrders(prev => 
      prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)
    );
    closeModals();
  };

  const filteredOrders = useMemo(() => orders.filter(o => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (o.orderCode || '').toLowerCase().includes(term) ||
      (o.fullName || '').toLowerCase().includes(term) ||
      (o.email || '').toLowerCase().includes(term) ||
      (o.phone || '').includes(searchTerm);
    
    if (filterStatus === null) return matchesSearch;
    return matchesSearch && o.status?.toLowerCase() === filterStatus.toLowerCase();
  }), [orders, searchTerm, filterStatus]);

  const statusCounts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter(o => o.status?.toLowerCase() === 'pending').length,
    success: orders.filter(o => o.status?.toLowerCase() === 'success').length,
    cancel: orders.filter(o => o.status?.toLowerCase() === 'cancel').length,
    revenue: orders.filter(o => o.status?.toLowerCase() === 'success').reduce((sum, o) => sum + o.totalAmount, 0)
  }), [orders]);

  const getStatusColor = (status: string) => {
    const normalized = status?.toLowerCase() || '';
    switch (normalized) {
      case 'success':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'cancel':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getFilterCardStyle = (status: string | null) => {
    const isActive = filterStatus === status;
    switch (status) {
      case 'Pending':
        return isActive 
          ? 'bg-yellow-50 border-yellow-600 shadow-md text-yellow-700'
          : 'bg-yellow-50 border-yellow-200 hover:border-yellow-300 text-yellow-600';
      case 'Success':
        return isActive
          ? 'bg-green-50 border-green-600 shadow-md text-green-700'
          : 'bg-green-50 border-green-200 hover:border-green-300 text-green-600';
      case 'Cancel':
        return isActive
          ? 'bg-red-50 border-red-600 shadow-md text-red-700'
          : 'bg-red-50 border-red-200 hover:border-red-300 text-red-600';
      default:
        return isActive
          ? 'bg-white border-gray-400 shadow-md text-gray-900'
          : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    const normalized = status?.toLowerCase() || '';
    switch (normalized) {
      case 'success':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'cancel':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 shadow-xl px-8 py-6 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 text-white rounded-lg transition duration-200"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-3xl font-bold text-white">Quản lý Đơn hàng</h1>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Danh sách Đơn hàng</h2>
              <p className="text-gray-500 text-sm">Xem và quản lý các đơn hàng từ khách hàng</p>
            </div>

            {/* Filter Cards */}
            <div className="grid grid-cols-5 gap-6 mb-10">
              {[
                { status: null, label: 'Tất cả', count: statusCounts.all },
                { status: 'Pending', label: 'Chờ xử lý', count: statusCounts.pending },
                { status: 'Success', label: 'Hoàn thành', count: statusCounts.success },
                { status: 'Cancel', label: 'Đã hủy', count: statusCounts.cancel }
              ].map((card) => (
                <div
                  key={card.status}
                  onClick={() => setFilterStatus(card.status)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${getFilterCardStyle(card.status)}`}
                >
                  <div className="text-sm font-semibold mb-2">{card.label}</div>
                  <div className="text-3xl font-bold">{card.count}</div>
                </div>
              ))}
              <div className="p-6 rounded-xl border-2 border-gray-200 bg-white cursor-default">
                <div className="text-sm text-gray-600 mb-2">Doanh thu</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(statusCounts.revenue)}
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-10">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo mã đơn, tên khách, email, số điện thoại..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Mã đơn</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Khách hàng</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Số điện thoại</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Tổng tiền</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Ngày đặt</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400">Đang tải dữ liệu...</td>
                    </tr>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-teal-600">{order.orderCode}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-bold text-gray-900">{order.fullName}</div>
                          <div className="text-xs text-gray-500">{order.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.phone}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.orderDate)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(order)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEditStatus(order)}
                              className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                              title="Cập nhật trạng thái"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                        Không tìm thấy đơn hàng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeModals}
        order={selectedOrder}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
        getStatusLabel={getStatusLabel}
      />

      {/* Order Status Update Modal */}
      <OrderStatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={closeModals}
        order={selectedOrder}
        onOrderUpdated={handleOrderUpdated}
        getStatusLabel={getStatusLabel}
      />
    </div>
  );
};

export default OrderManager;
