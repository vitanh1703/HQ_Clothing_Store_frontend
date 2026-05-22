import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import type { NewsManagerItem } from '../services/api';
import { newsController } from '../services/controller';

interface NewsFormData {
  title: string;
  category: string;
  description: string;
  content: string;
  imgUrl: string;
  publishDate: string;
}

interface NewsModalProps {
  isOpen: boolean;
  editingNews: NewsManagerItem | null;
  formData: NewsFormData;
  onClose: () => void;
  onFormChange: (field: string, value: string) => void;
  onSave: () => void;
  isSaving?: boolean;
}

const NewsModal: React.FC<NewsModalProps> = ({
  isOpen,
  editingNews,
  formData,
  onClose,
  onFormChange,
  onSave,
  isSaving = false,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    onFormChange(field, value);
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleModalSave = async () => {
    try {
      // Validate with newsController
      const validationResult = newsController.validateNews(formData);
      
      if (!validationResult.success) {
        setErrors({ [validationResult.field || 'general']: validationResult.message || 'Lỗi không xác định' });
        toast.error(`❌ ${validationResult.message}`);
        return;
      }

      setErrors({});
      await onSave();
    } catch (error: any) {
      toast.error('❌ Lỗi validate dữ liệu');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl w-96 max-h-[85vh] overflow-hidden pointer-events-auto flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {editingNews ? 'Chỉnh sửa tin tức' : 'Thêm tin tức mới'}
            </h2>
            <button onClick={onClose} disabled={isSaving} className="p-1 hover:bg-blue-500 rounded text-white">
              <FiX size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Tiêu đề *</label>
              <input type="text" placeholder="Tiêu đề" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} className={`w-full px-2 py-1.5 border-2 rounded text-sm focus:outline-none ${errors.title ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'}`} />
              {errors.title && <p className="text-red-600 text-xs mt-0.5">{errors.title}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Danh mục *</label>
              <input type="text" placeholder="Danh mục" value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} className={`w-full px-2 py-1.5 border-2 rounded text-sm focus:outline-none ${errors.category ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'}`} />
              {errors.category && <p className="text-red-600 text-xs mt-0.5">{errors.category}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Mô tả ngắn *</label>
              <textarea placeholder="Mô tả" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={2} className={`w-full px-2 py-1.5 border-2 rounded text-sm focus:outline-none resize-none ${errors.description ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'}`} />
              {errors.description && <p className="text-red-600 text-xs mt-0.5">{errors.description}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Nội dung *</label>
              <textarea placeholder="Nội dung chi tiết" value={formData.content} onChange={(e) => handleInputChange('content', e.target.value)} rows={2} className={`w-full px-2 py-1.5 border-2 rounded text-sm focus:outline-none resize-none ${errors.content ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'}`} />
              {errors.content && <p className="text-red-600 text-xs mt-0.5">{errors.content}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">URL Ảnh</label>
              <input type="text" placeholder="Link ảnh" value={formData.imgUrl} onChange={(e) => handleInputChange('imgUrl', e.target.value)} className={`w-full px-2 py-1.5 border-2 rounded text-sm focus:outline-none ${errors.imgUrl ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'}`} />
              {errors.imgUrl && <p className="text-red-600 text-xs mt-0.5">{errors.imgUrl}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Ngày đăng *</label>
              <input type="date" value={formData.publishDate} onChange={(e) => handleInputChange('publishDate', e.target.value)} className={`w-full px-2 py-1.5 border-2 rounded text-sm focus:outline-none ${errors.publishDate ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'}`} />
              {errors.publishDate && <p className="text-red-600 text-xs mt-0.5">{errors.publishDate}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 px-4 py-2.5 bg-gray-100 border-t">
            <button onClick={onClose} disabled={isSaving} className="flex-1 px-2 py-1.5 bg-gray-400 hover:bg-gray-500 text-white rounded font-semibold text-sm">
              Hủy
            </button>
            <button onClick={handleModalSave} disabled={isSaving} className="flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-sm">
              {isSaving ? 'Lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsModal;
