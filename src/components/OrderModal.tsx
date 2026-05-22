import { useState } from 'react';
import { Package } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

export interface Order {
  id: number;
  userId?: number;
  orderCode: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  totalAmount: number;
  status: string;
  orderDate: string;
  paymentDate?: string;
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

interface OrderStatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderUpdated?: (updatedOrder: Order) => void;
  getStatusLabel?: (status: string) => string;
}

const OrderDetailModal = ({
  isOpen,
  onClose,
  order,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel
}: OrderDetailModalProps) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Package size={24} className="text-teal-600" />
          <h3 className="text-xl font-bold text-gray-900">Chi tiết đơn hàng</h3>
        </div>

        {/* Detail View */}
        <div className="space-y-4 mb-8">
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
            <div className="text-sm text-gray-600">Mã đơn hàng</div>
            <div className="text-2xl font-bold text-teal-600">{order.orderCode}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Khách hàng</div>
              <div className="font-bold text-gray-900">{order.fullName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Email</div>
              <div className="text-sm text-gray-900">{order.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Số điện thoại</div>
              <div className="font-bold text-gray-900">{order.phone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Trạng thái</div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Địa chỉ giao hàng</div>
            <div className="text-sm text-gray-900">{order.address}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Tổng tiền</div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Ngày đặt</div>
              <div className="text-sm text-gray-900">{formatDate(order.orderDate)}</div>
            </div>
          </div>

          {order.paymentDate && (
            <div>
              <div className="text-sm text-gray-600">Ngày thanh toán</div>
              <div className="text-sm text-gray-900">{formatDate(order.paymentDate)}</div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

const OrderStatusUpdateModal = ({
  isOpen,
  onClose,
  order,
  onOrderUpdated
}: OrderStatusUpdateModalProps) => {
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async () => {
    if (!order || !newStatus) {
      toast.warning('Vui lòng chọn trạng thái mới');
      return;
    }

    setIsUpdating(true);
    try {
      await axios.put(`https://localhost:7137/api/orders/${order.id}/status`, { status: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      if (onOrderUpdated) {
        onOrderUpdated({ ...order, status: newStatus });
      }
      onClose();
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái', error);
      toast.error('Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setNewStatus('');
    onClose();
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Package size={24} className="text-teal-600" />
          <h3 className="text-xl font-bold text-gray-900">Cập nhật trạng thái</h3>
        </div>

        {/* Order Code Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Mã đơn</div>
          <div className="font-bold text-gray-900">{order.orderCode}</div>
        </div>

        {/* Status Update Form */}
        <div className="mb-6">
          <label className="text-sm font-bold text-gray-700 block mb-3">Trạng thái mới</label>
          <select
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            <option value="">-- Chọn trạng thái --</option>
            <option value="Pending">Chờ thanh toán</option>
            <option value="Success">Đã thanh toán</option>
            <option value="Cancel">Đã hủy</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleUpdateStatus}
            disabled={isUpdating}
            className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
          <button
            onClick={handleClose}
            disabled={isUpdating}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export { OrderDetailModal, OrderStatusUpdateModal };
export default OrderDetailModal;
