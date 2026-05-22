import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Search, Package, Edit2, Trash2, Phone, MapPin } from 'lucide-react';
import { FiMenu, FiX } from 'react-icons/fi';
import AdminSidebar from '../../components/AdminSidebar';
import SupplierModal from '../../components/SupplierModal';
import type { Supplier } from '../../services/api';
import { supplierApi } from '../../services/api';

interface SupplierFormData {
  id?: number;
  name: string;
  phone?: string;
  address?: string;
}

const SupplierManager = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    phone: '',
    address: ''
  });

  // Fetch suppliers từ API
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await supplierApi.getAll();
      setSuppliers(data);
      setFilteredSuppliers(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhà cung cấp', error);
    } finally {
      setLoading(false);
    }
  };

  // Search suppliers
  useEffect(() => {
    const filtered = suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.phone && supplier.phone.includes(searchTerm)) ||
      (supplier.address && supplier.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSuppliers(filtered);
  }, [searchTerm, suppliers]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Handle edit
  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address
    });
    setIsModalOpen(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      phone: '',
      address: ''
    });
    setIsModalOpen(true);
  };

  // Handle save
  const handleSave = async () => {
    try {
      if (editingSupplier) {
        // Update existing
        await supplierApi.update(editingSupplier.id, formData);
        setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? {
          ...s,
          ...formData
        } : s));
        toast.success(' Cập nhật nhà cung cấp thành công!');
      } else {
        // Add new
        const newSupplier = await supplierApi.create(formData);
        setSuppliers(prev => [...prev, newSupplier]);
        toast.success(' Thêm nhà cung cấp thành công!');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Lỗi khi lưu nhà cung cấp', error);
      toast.error('❌ Lỗi: ' + (error instanceof Error ? error.message : 'Không thể lưu'));
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa nhà cung cấp này?')) {
      try {
        await supplierApi.delete(id);
        setSuppliers(prev => prev.filter(s => s.id !== id));
        toast.success('Xóa nhà cung cấp thành công!');
      } catch (error) {
        console.error('Lỗi khi xóa nhà cung cấp', error);
        toast.error('❌ Lỗi: ' + (error instanceof Error ? error.message : 'Không thể xóa'));
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
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
          <h1 className="text-3xl font-bold text-white">Quản lý Nhà cung cấp</h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Danh sách Nhà cung cấp</h2>
            <p className="text-gray-600">Quản lý thông tin nhà cung cấp và liên hệ</p>
          </div>

          {/* Search & Add Button */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên nhà cung cấp, điện thoại hoặc địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-gray-900 transition"
              />
            </div>
            <button
              onClick={handleAddNew}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg"
            >
              + Thêm nhà cung cấp
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center gap-3">
                <Package className="text-blue-600" size={28} />
                <div>
                  <p className="text-gray-600 text-sm">Tổng nhà cung cấp</p>
                  <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center gap-3">
                <Phone className="text-purple-600" size={28} />
                <div>
                  <p className="text-gray-600 text-sm">Kết quả tìm kiếm</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredSuppliers.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Suppliers Table */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 min-w-16">ID</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 min-w-40">Tên nhà cung cấp</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 min-w-40">Điện thoại</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 flex-1">Địa chỉ</th>
                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-900 w-24">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Đang tải...
                      </td>
                    </tr>
                  ) : filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Không tìm thấy nhà cung cấp phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">#{supplier.id}</td>
                        <td className="px-4 py-4 text-sm font-bold text-gray-900">{supplier.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {supplier.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={16} className="text-green-600 shrink-0" />
                              {supplier.phone}
                            </span>
                          ) || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {supplier.address && (
                            <span className="flex items-center gap-1">
                              <MapPin size={16} className="text-red-600 shrink-0" />
                              {supplier.address}
                            </span>
                          ) || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(supplier)}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                              title="Sửa"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(supplier.id)}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <SupplierModal
        isOpen={isModalOpen}
        editingSupplier={editingSupplier}
        formData={formData}
        onClose={() => setIsModalOpen(false)}
        onFormDataChange={setFormData}
        onSave={handleSave}
      />
    </div>
  );
};

export default SupplierManager;
