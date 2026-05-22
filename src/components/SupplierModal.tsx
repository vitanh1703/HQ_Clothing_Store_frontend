import React, { useState } from 'react';
import { toast } from 'react-toastify';
import type { Supplier } from '../services/api';
import { supplierController } from '../services/controller';

interface SupplierFormData {
  id?: number;
  name: string;
  phone?: string;
  address?: string;
}

interface SupplierModalProps {
  isOpen: boolean;
  editingSupplier: Supplier | null;
  formData: SupplierFormData;
  onClose: () => void;
  onFormDataChange: (data: SupplierFormData) => void;
  onSave: () => void;
}

const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  editingSupplier,
  formData,
  onClose,
  onFormDataChange,
  onSave,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFormDataChange({
      ...formData,
      [name]: value,
    });
    // Clear error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleModalSave = () => {
    const result = supplierController.validateSupplier(formData);
    
    if (!result.success) {
      // Set error with field name from controller
      if (result.field && result.message) {
        setErrors({ [result.field]: result.message });
        toast.error(`❌ ${result.message}`);
      }
      return;
    }
    
    setErrors({});
    onSave();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl w-96 max-h-[85vh] overflow-hidden transform transition-transform duration-300 pointer-events-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            {editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Tên nhà cung cấp */}
          <div>
            <label className="text-xs font-semibold text-gray-700">Tên nhà cung cấp *</label>
            <input
              type="text"
              name="name"
              placeholder="Tên nhà cung cấp *"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-2 py-1.5 border-2 rounded text-sm focus:outline-none ${
                errors.name ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-0.5">{errors.name}</p>
            )}
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="text-xs font-semibold text-gray-700">Số điện thoại *</label>
            <input
              type="tel"
              name="phone"
              placeholder="Số điện thoại *"
              value={formData.phone || ''}
              onChange={handleInputChange}
              className={`w-full px-2 py-1.5 border-2 rounded text-sm focus:outline-none ${
                errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'
              }`}
            />
            {errors.phone && (
              <p className="text-red-600 text-xs mt-0.5">{errors.phone}</p>
            )}
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="text-xs font-semibold text-gray-700">Địa chỉ *</label>
            <textarea
              name="address"
              placeholder="Địa chỉ *"
              value={formData.address || ''}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-2 py-1.5 border-2 rounded text-sm focus:outline-none resize-none ${
                errors.address ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'
              }`}
            />
            {errors.address && (
              <p className="text-red-600 text-xs mt-0.5">{errors.address}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-4 py-2.5 bg-gray-100 border-t border-gray-300">
          <button
            onClick={onClose}
            className="flex-1 px-2 py-1.5 bg-gray-400 hover:bg-gray-500 text-white rounded font-semibold text-sm transition"
          >
            Hủy
          </button>
          <button
            onClick={handleModalSave}
            className="flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-sm transition"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierModal;
