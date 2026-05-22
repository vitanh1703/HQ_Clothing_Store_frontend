import React, { useState, useEffect } from 'react';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { productController } from '../services/controller';

interface ProductFormData {
  name: string;
  brandText: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  supplierId: string;
}

interface Variant {
  tempId?: string; // For temporary variants before save
  size: string;
  color: string;
  price: string;
  stock_quantity: string;
  sku: string;
}

interface ProductModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: ProductFormData;
  editingProduct?: any; // Product object when editing (contains variants)
  onClose: () => void;
  onFormDataChange: (data: ProductFormData) => void;
  onSave: (variants?: Variant[]) => Promise<void>;
  loading?: boolean;
}

const EMPTY_VARIANT: Variant = {
  size: '',
  color: '',
  price: '',
  stock_quantity: '0',
  sku: ''
};

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  isEditing,
  formData,
  editingProduct,
  onClose,
  onFormDataChange,
  onSave,
  loading = false,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [variants, setVariants] = useState<Variant[]>([]);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [variantForm, setVariantForm] = useState<Variant>(EMPTY_VARIANT);

  // Reset trạng thái khi modal mở/đóng
  useEffect(() => {
    if (!isOpen) {
      setVariants([]);
      setErrors({});
      setEditingVariantId(null);
    } else if (isEditing && editingProduct?.variants) {
      // Khi edit: load variants từ product hiện tại
      const existingVariants = editingProduct.variants.map((v: any) => ({
        tempId: `v-${v.id}`,
        size: v.size || '',
        color: v.color || '',
        price: v.price?.toString() || '',
        stock_quantity: v.stockQuantity?.toString() || '0',
        sku: v.sku || ''
      }));
      setVariants(existingVariants);
    } else if (isEditing && !editingProduct?.variants) {
      // Nếu edit nhưng ko có variants, reset
      setVariants([]);
      setEditingVariantId(null);
    }
  }, [isOpen, isEditing, editingProduct]);

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

  const handleVariantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVariantForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Load variant vào form để edit
  const loadVariantToEdit = (variant: any) => {
    setVariantForm(variant);
    setEditingVariantId(variant.tempId || `v-${variant.id || ''}`);
  };

  // Cancel edit variant
  const cancelEditVariant = () => {
    setEditingVariantId(null);
    setVariantForm(EMPTY_VARIANT);
  };

  // Add hoặc Update variant
  const addVariant = () => {
    if (!variantForm.size.trim() || !variantForm.color.trim() || !variantForm.price.trim()) {
      toast.error('Vui lòng điền đầy đủ Size, Màu, Giá');
      return;
    }

    if (editingVariantId) {
      // Update variant hiện tại
      setVariants(variants.map(v => 
        (v.tempId || '') === editingVariantId
          ? { ...variantForm, tempId: editingVariantId }
          : v
      ));
      cancelEditVariant();
      toast.success(' Cập nhật variant thành công');
    } else {
      // Add variant mới
      const newVariant = {
        ...variantForm,
        tempId: `temp_${Date.now()}_${Math.random()}`
      };
      setVariants([...variants, newVariant]);
      setVariantForm(EMPTY_VARIANT);
      toast.success(' Thêm variant thành công');
    }
  };

  const removeVariant = (tempId?: string) => {
    // Nếu xóa variant đang edit, cancel edit
    if (tempId === editingVariantId) {
      cancelEditVariant();
    }
    setVariants(variants.filter(v => v.tempId !== tempId));
    toast.success('Xóa variant thành công');
  };

  const handleModalSave = async () => {
    // Validate thông tin sản phẩm trước
    const result = productController.validateProduct(formData);
    
    if (!result.success) {
      toast.error(`❌ ${result.message}`);
      if (result.field && result.message) {
        setErrors({ [result.field]: result.message });
      }
      return;
    }

    // Nếu là PRODUCT MỚI (không edit) -> Phải có ít nhất 1 variant
    if (!isEditing && variants.length === 0) {
      toast.error('⚠️ Vui lòng thêm ít nhất 1 kích cỡ/màu/giá');
      return;
    }

    // Hợp lệ rồi, gọi API để lưu
    try {
      await onSave(variants);
      setErrors({});
      onClose();
    } catch (error) {
      // API đã xử lý error
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden transform transition-transform duration-300 pointer-events-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
          </h2>
        </div>

        {/* Content - 2 Columns */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Product Info */}
          <div className="w-1/2 overflow-y-auto p-4 space-y-3 border-r border-gray-200">
          {/* Tên */}
          <div>
            <label className="text-xs font-semibold text-gray-700">Tên *</label>
            <input
              type="text"
              name="name"
              placeholder="Tên sản phẩm *"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-2 py-1.5 border-2 rounded text-sm focus:outline-none ${
                errors.name ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'
              }`}
            />
            {errors.name && <p className="text-red-600 text-xs mt-0.5">{errors.name}</p>}
          </div>

          {/* Brand */}
          <div>
            <label className="text-xs font-semibold text-gray-700">Thương hiệu *</label>
            <input
              type="text"
              name="brandText"
              placeholder="Tên thương hiệu *"
              value={formData.brandText}
              onChange={handleInputChange}
              className={`w-full px-2 py-1.5 border-2 rounded text-sm focus:outline-none ${
                errors.brandText ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'
              }`}
            />
            {errors.brandText && <p className="text-red-600 text-xs mt-0.5">{errors.brandText}</p>}
          </div>

          {/* Category & Supplier */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-700">Danh mục *</label>
              <input
                type="number"
                name="categoryId"
                placeholder="ID"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={`w-full px-2 py-1.5 border-2 rounded text-sm focus:outline-none ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'
                }`}
              />
              {errors.categoryId && <p className="text-red-600 text-xs">{errors.categoryId}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Nhà cung cấp *</label>
              <input
                type="number"
                name="supplierId"
                placeholder="ID"
                value={formData.supplierId}
                onChange={handleInputChange}
                className={`w-full px-2 py-1.5 border-2 rounded text-sm focus:outline-none ${
                  errors.supplierId ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'
                }`}
              />
              {errors.supplierId && <p className="text-red-600 text-xs">{errors.supplierId}</p>}
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="text-xs font-semibold text-gray-700">URL Ảnh *</label>
            <input
              type="text"
              name="imageUrl"
              placeholder="Link ảnh *"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className={`w-full px-2 py-1.5 border-2 rounded text-sm focus:outline-none ${
                errors.imageUrl ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'
              }`}
            />
            {errors.imageUrl && <p className="text-red-600 text-xs mt-0.5">{errors.imageUrl}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-700">Mô tả *</label>
            <textarea
              name="description"
              placeholder="Mô tả sản phẩm *"
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              className={`w-full px-2 py-1.5 border-2 rounded text-sm focus:outline-none resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'
              }`}
            />
            {errors.description && <p className="text-red-600 text-xs mt-0.5">{errors.description}</p>}
          </div>
          </div>

          {/* Right: Variants */}
          <div className="w-1/2 overflow-y-auto p-4 space-y-2 bg-gray-50">
            <label className="text-xs font-semibold text-gray-700">Kích cỡ / Màu / Giá {!isEditing && <span className="text-red-600">*</span>}</label>

            {/* Add Variant Form */}
            <div className="bg-white p-2 rounded border border-blue-200 space-y-1">
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="text"
                  name="size"
                  placeholder="Size"
                  value={variantForm.size}
                  onChange={handleVariantInputChange}
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-600"
                />
                <input
                  type="text"
                  name="color"
                  placeholder="Màu sắc"
                  value={variantForm.color}
                  onChange={handleVariantInputChange}
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-600"
                />
              </div>
              <input
                type="number"
                name="price"
                placeholder="Giá (VNĐ)"
                value={variantForm.price}
                onChange={handleVariantInputChange}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-600"
              />
              <input
                type="number"
                name="stock_quantity"
                placeholder="Số lượng tồn kho"
                value={variantForm.stock_quantity}
                onChange={handleVariantInputChange}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-600"
              />
              <div className="flex gap-1">
                <button
                  onClick={addVariant}
                  className="flex-1 px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-xs transition flex items-center justify-center gap-1"
                >
                  <FiPlus size={12} /> {editingVariantId ? 'Cập nhật' : 'Thêm'}
                </button>
                {editingVariantId && (
                  <button
                    onClick={cancelEditVariant}
                    className="flex-1 px-2 py-1.5 bg-gray-400 hover:bg-gray-500 text-white rounded font-semibold text-xs transition"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>

            {/* Variants List */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Danh sách hiện tại:</h4>
              {variants.length > 0 ? (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {variants.map((variant) => (
                    <div
                      key={variant.tempId}
                      onClick={() => loadVariantToEdit(variant)}
                      className={`p-2 rounded border cursor-pointer transition ${
                        (variant.tempId || '') === editingVariantId
                          ? 'bg-blue-100 border-blue-500 border-2'
                          : 'bg-white border-gray-300 hover:border-blue-400'
                      } flex justify-between items-start`}
                    >
                      <div className="text-xs flex-1">
                        <div className="font-semibold text-gray-800">{variant.size} / {variant.color}</div>
                        <div className="text-gray-600">
                          <span>{Number(variant.price).toLocaleString('vi-VN')}đ</span>
                          <span className="ml-2">Tồn: {variant.stock_quantity}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeVariant(variant.tempId)}
                        className="text-red-600 hover:text-red-700 p-0.5 ml-1"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-3">Chưa có variant</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-4 py-2.5 bg-gray-100 border-t border-gray-300">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-2 py-1.5 bg-gray-400 hover:bg-gray-500 text-white rounded font-semibold text-sm transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleModalSave}
            disabled={loading}
            className="flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-sm transition disabled:opacity-50"
          >
            {loading ? 'Lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
