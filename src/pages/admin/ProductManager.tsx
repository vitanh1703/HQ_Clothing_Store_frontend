import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiSearch, FiX, FiBox, FiMenu } from 'react-icons/fi';
import AdminSidebar from '../../components/AdminSidebar';
import ProductModal from '../../components/ProductModal';
import { productApi, type Product as ApiProduct, type Category } from '../../services/api';

interface Product extends ApiProduct {
  displayVariantCount: number;
}

const INITIAL_FORM = {
  name: '',
  brandText: '',
  description: '',
  imageUrl: '',
  categoryId: '',
  supplierId: ''
};

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  
  const itemsPerPage = 9;
  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Helper to add variant counts to products
  const addVariantCounts = (data: ApiProduct[]) =>
    data.map(p => ({ ...p, displayVariantCount: p.variants?.length || 0 } as Product));

  // Reload products from API
  const reloadProducts = async () => {
    const data = await productApi.getAllForAdmin();
    const withCounts = addVariantCounts(data);
    setProducts(withCounts);
    setFilteredProducts(withCounts);
    setCurrentPage(1);
  };

  // Fetch categories
  useEffect(() => {
    productApi.getCategories().then(setCategories).catch(err => 
      console.error('Error fetching categories:', err)
    );
  }, []);

  // Fetch products
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await productApi.getAllForAdmin();
        const withCounts = addVariantCounts(data);
        setProducts(withCounts);
        setFilteredProducts(withCounts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Lỗi khi tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter products
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.brandText?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, products]);

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        brandText: product.brandText || '',
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        categoryId: product.categoryId?.toString() || '',
        supplierId: product.supplierId?.toString() || ''
      });
    } else {
      setEditingProduct(null);
      setFormData(INITIAL_FORM);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(INITIAL_FORM);
  };

  const handleSubmit = async (variants?: any[]) => {
    try {
      setSaving(true);
      
      const payload: any = {
        name: formData.name.trim(),
        brandText: formData.brandText.trim() || undefined,
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined
      };

      // Kèm variants cho cả tạo mới và cập nhật
      if (variants?.length) {
        payload.variants = variants.map(v => ({
          size: v.size,
          color: v.color,
          price: parseInt(v.price) || 0,
          stockQuantity: parseInt(v.stock_quantity) || 0,
          sku: v.sku?.trim() || null
        }));
      } else if (!editingProduct) {
        // Chỉ yêu cầu variant khi tạo mới
        toast.error('⚠️ Vui lòng thêm ít nhất 1 kích cỡ/màu/giá');
        setSaving(false);
        return;
      }

      if (editingProduct) {
        await productApi.update(editingProduct.id, payload as Partial<ApiProduct>);
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await productApi.create(payload as any);
        toast.success('Thêm sản phẩm thành công!');
      }

      await reloadProducts();
      closeModal();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi không xác định';
      toast.error(`❌ Lỗi: ${errorMsg}`);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;

    try {
      await productApi.delete(id);
      toast.success('Xóa sản phẩm thành công');
      await reloadProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 shadow-xl px-8 py-6 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 text-white rounded-lg transition duration-200"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-3xl font-bold text-white">Quản lý Sản phẩm</h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Sub Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Danh sách Sản phẩm</h2>
              <p className="text-gray-600 text-sm">Quản lý thông tin sản phẩm và biến thể</p>
            </div>

            {/* Search & Add Button */}
            <div className="flex gap-4 mb-8">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên sản phẩm hoặc mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-gray-900 transition"
                />
              </div>
              <button
                onClick={() => openModal()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg"
              >
                + Thêm sản phẩm
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FiBox className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Tổng sản phẩm</p>
                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FiBox className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Kết quả tìm kiếm</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredProducts.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FiBox className="text-orange-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Danh mục</p>
                    <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Đang tải...</p>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Không có sản phẩm nào</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition overflow-hidden flex flex-col h-auto">
                      {/* Product Image - Taller Rectangular */}
                      <div className="relative h-80 bg-gray-100 overflow-hidden group">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                            <FiBox size={48} className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-6 flex flex-col flex-1">
                        {/* Product ID Badge */}
                        <div className="inline-flex items-center gap-2 mb-3 w-fit">
                          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded">Mã #{product.id}</span>
                        </div>
                        
                        {/* Product Name */}
                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                          {product.name}
                        </h3>

                        {/* Brand and Category */}
                        <div className="space-y-2 mb-4">
                          {product.brandText && (
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Thương hiệu:</span> {product.brandText}
                            </p>
                          )}
                        {product.categoryId !== undefined && (
                            <p className="text-sm text-gray-700">
                            <span className="font-semibold">Danh mục:</span> {product.categoryId ? (categoryMap.get(product.categoryId) || `ID ${product.categoryId}`) : 'Chưa phân loại'}
                            </p>
                          )}
                        </div>

                        {/* Description */}
                        {product.description && (
                          <p className="text-sm text-gray-600 mb-5 line-clamp-3 flex-1">
                            {product.description}
                          </p>
                        )}

                        {/* Variant Badge - Only show if has variants */}
                        {product.displayVariantCount > 0 && (
                          <div className="mb-5">
                            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              ✓ {product.displayVariantCount} biến thể
                            </span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 mt-auto">
                          <button
                            onClick={() => openModal(product)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                          >
                            <FiEdit size={16} /> Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                          >
                            <FiTrash2 size={16} /> Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={showModal}
        isEditing={!!editingProduct}
        formData={formData}
        editingProduct={editingProduct}
        onClose={closeModal}
        onFormDataChange={setFormData}
        onSave={handleSubmit}
        loading={saving}
      />
    </div>
  );
};

export default ProductManager;
