import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, User } from 'lucide-react';

interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  status: boolean; // Trạng thái hoạt động tài khoản
}

interface OrderSummary {
  id: number;
  orderCode: string;
  totalAmount: number;
  status: string;
  orderDate: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  orders: OrderSummary[];
}

const CustomerModal = ({ isOpen, onClose, customer, orders }: Props) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (customer) {
      setFullName(customer.fullName ?? '');
      setEmail(customer.email ?? '');
      setPhone(customer.phone ?? '');
      setAddress(customer.address ?? '');
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header - Sạch sẽ không viền */}
        <div className="flex justify-between items-center p-6 pb-2">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Chi tiết khách hàng</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 pt-2 space-y-8 overflow-y-auto max-h-[80vh]">
          
          {/* Phần 1: Avatar và Trạng thái hoạt động */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-28 h-28 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                <User size={48} />
              </div>
              
              {/* Mục trạng thái tài khoản mới thêm */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tài khoản</span>
                {customer.status ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
                    <CheckCircle size={14} className="fill-green-600 text-white" />
                    <span className="text-xs font-bold uppercase">Hoạt động</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
                    <XCircle size={14} className="fill-red-600 text-white" />
                    <span className="text-xs font-bold uppercase">Bị khóa</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Họ và tên</label>
                <div className="text-gray-800 font-semibold text-lg leading-tight mt-1">{fullName}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email liên hệ</label>
                <div className="text-gray-600 text-sm mt-1">{email}</div>
              </div>
            </div>
          </div>

          {/* Phần 2: Thông tin liên lạc - Không dấu gạch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Số điện thoại</label>
              <div className="text-gray-700 font-medium">{phone || 'Chưa cung cấp'}</div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Địa chỉ</label>
              <div className="text-gray-700 font-medium">{address || 'Chưa cung cấp'}</div>
            </div>
          </div>

          {/* Phần 3: Lịch sử đơn hàng */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lịch sử giao dịch</label>
              <span className="text-[10px] font-bold text-gray-400 italic">Tổng {orders.length} đơn</span>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-hide">
              {orders.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-2xl text-gray-400 text-sm italic">
                  Khách hàng này chưa có đơn hàng nào
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-gray-900">{order.orderCode}</div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm font-black text-blue-600">
                        {order.totalAmount.toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-[9px] font-bold uppercase px-2 py-0.5 bg-gray-100 rounded text-gray-500">
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer: Chỉ một nút Đóng duy nhất */}
        <div className="p-6 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-10 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;