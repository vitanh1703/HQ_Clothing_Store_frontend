import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Clock, Truck, CheckCircle, XCircle, User } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../services/api';
import type { Order } from '../components/OrderModal';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const fetchOrder = async () => {
        try {
          const res = await axios.get(`${API_BASE}/orders/${id}`);
          setOrder(res.data);
        } catch (err) {
          setError("Lỗi tải thông tin đơn hàng");
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Pending': return { label: 'Chờ xử lý', color: 'text-yellow-700 bg-yellow-100', icon: Clock };
      case 'Shipping': return { label: 'Đang giao', color: 'text-blue-700 bg-blue-100', icon: Truck };
      case 'Success': return { label: 'Thành công', color: 'text-green-700 bg-green-100', icon: CheckCircle };
      case 'Cancel': return { label: 'Đã hủy', color: 'text-red-700 bg-red-100', icon: XCircle };
      default: return { label: status, color: 'text-gray-700 bg-gray-100', icon: Package };
    }
  };

  const handlePayNow = () => {
    if (!order) return;
    navigate("/payment", {
      state: {
        checkoutData: {
          id: order.id,
          orderCode: order.orderCode,
          cartId: 0,
          items: (order.items || order.orderDetails || []).map((item: any) => ({
            id: item.id || 0,
            variantId: item.variantId || 0,
            productId: item.productId || 0,
            productName: item.productName || item.product?.name || 'Sản phẩm',
            size: item.size || '',
            color: item.color || '',
            price: item.priceAtPurchase || item.price || 0,
            quantity: item.quantity || 1,
            total: (item.priceAtPurchase || item.price || 0) * (item.quantity || 1),
            image: item.image || item.product?.imageUrl || ''
          })),
        },
        totalAmount: order.totalAmount,
        form: {
          fullName: order.fullName,
          email: order.email,
          phone: order.phone,
          address: order.address
        }
      }
    });
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center font-bold uppercase tracking-widest text-gray-400">Đang tải chi tiết đơn hàng...</div>;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center gap-4">
        <div className="text-xl font-bold uppercase tracking-widest text-red-500">{error || "Không tìm thấy đơn hàng"}</div>
        <button onClick={() => navigate('/orders-history')} className="px-6 py-2 bg-black text-white font-bold uppercase text-sm rounded-sm hover:bg-gray-800 transition-colors">Quay lại lịch sử đơn hàng</button>
      </div>
    );
  }

  const items = order.items || order.orderDetails || [];
  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8 lg:py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/orders-history')}
          className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-bold uppercase tracking-widest">Trở lại</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-3">
              Chi tiết đơn hàng
            </h1>
            <p className="text-gray-500 mt-2">Mã đơn: <span className="font-bold text-black">{order.orderCode}</span></p>
          </div>
          <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 w-fit ${statusInfo.color}`}>
            <StatusIcon className="w-4 h-4" />{statusInfo.label}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Danh sách sản phẩm */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-lg uppercase tracking-wide border-b border-gray-100 pb-4 mb-4">Sản phẩm ({items.length})</h2>
              <div className="space-y-4">
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div className="w-20 h-24 md:w-24 md:h-28 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                      <img src={item.image || item.product?.imageUrl || "https://via.placeholder.com/150"} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 line-clamp-2">{item.productName || item.product?.name || 'Sản phẩm'}</h4>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                          {item.color && <span>Màu: {item.color} </span>}
                          {item.color && item.size && <span>| </span>}
                          {item.size && <span>Size: {item.size}</span>}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded">x{item.quantity}</span>
                        <span className="font-bold text-red-600">{(item.priceAtPurchase || item.price || 0).toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Tổng cộng */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-lg uppercase tracking-wide border-b border-gray-100 pb-3">Tổng đơn hàng</h3>
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Tạm tính</span>
                <span>{order.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 font-medium">
                <span>Phí vận chuyển</span>
                <span>0đ</span>
              </div>
              <div className="flex justify-between font-black text-lg pt-3 border-t border-gray-100">
                <span>Tổng thanh toán</span>
                <span className="text-red-600">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              {order.status === 'Pending' && (
                <button onClick={handlePayNow} className="w-full bg-black text-white font-bold uppercase tracking-widest text-xs py-3.5 rounded-lg mt-2 hover:bg-gray-800 transition-colors">
                  Thanh toán ngay
                </button>
              )}
            </div>

            {/* Thông tin nhận hàng */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-lg uppercase tracking-wide border-b border-gray-100 pb-3">Giao hàng đến</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User size={18} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5 font-bold">Người nhận</p>
                    <p className="font-bold text-sm text-gray-900">{order.fullName}</p>
                    <p className="text-gray-600 text-sm mt-0.5">{order.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5 font-bold">Địa chỉ</p>
                    <p className="font-medium text-sm text-gray-900 leading-relaxed">{order.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}