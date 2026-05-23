import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Clock, CheckCircle, XCircle, Truck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../services/api';

interface Order {
  id: number;
  orderCode: string;
  totalAmount: number;
  status: string;
  orderDate: string;
}

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
          setError('Vui lòng đăng nhập để xem đơn hàng.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE}/orders/user/${userId}`);
        // Sắp xếp đơn hàng mới nhất lên đầu
        const sortedOrders = response.data.sort((a: Order, b: Order) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        setOrders(sortedOrders);
      } catch (err) {
        setError('Có lỗi xảy ra khi tải danh sách đơn hàng.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Pending':
        return { label: 'Chờ xử lý', color: 'text-yellow-700 bg-yellow-100', icon: Clock };
      case 'Shipping':
        return { label: 'Đang giao', color: 'text-blue-700 bg-blue-100', icon: Truck };
      case 'Success':
        return { label: 'Thành công', color: 'text-green-700 bg-green-100', icon: CheckCircle };
      case 'Cancel':
        return { label: 'Đã hủy', color: 'text-red-700 bg-red-100', icon: XCircle };
      default:
        return { label: status, color: 'text-gray-700 bg-gray-100', icon: Package };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-gray-400 font-bold uppercase tracking-widest animate-pulse">Đang tải danh sách đơn hàng...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-bold uppercase tracking-widest">Quay lại</span>
        </button>

        <h1 className="text-3xl font-black uppercase mb-8 flex items-center gap-3">
          <Package className="w-8 h-8" /> Lịch sử đơn hàng
        </h1>

        {error ? (
          <div className="bg-white border border-red-200 rounded-lg p-8 text-center text-red-500 shadow-sm">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <p className="text-gray-500 mb-6">Bạn chưa có đơn hàng nào.</p>
            <button onClick={() => navigate('/products')} className="bg-black text-white px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition-colors">
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Mã đơn hàng: <span className="font-bold text-black uppercase">{order.orderCode}</span></p>
                    <p className="text-sm text-gray-500 mb-3">Ngày đặt: {new Date(order.orderDate).toLocaleString('vi-VN')}</p>
                    <p className="font-black text-xl text-red-600">{order.totalAmount.toLocaleString('vi-VN')} đ</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 mt-4 sm:mt-0 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                    <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${statusInfo.color}`}><StatusIcon className="w-4 h-4" />{statusInfo.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;