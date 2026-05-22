import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiSearch, FiX, FiMenu, FiFileText, FiTag } from 'react-icons/fi';
import AdminSidebar from '../../components/AdminSidebar';
import NewsModal from '../../components/NewsModal';
import { newsApi, type NewsManagerItem } from '../../services/api';
import { newsController } from '../../services/controller';

interface FormData {
  title: string;
  category: string;
  description: string;
  content: string;
  imgUrl: string;
  publishDate: string;
}

const INITIAL_FORM: FormData = {
  title: '',
  category: 'Tin tức',
  description: '',
  content: '',
  imgUrl: '',
  publishDate: new Date().toISOString().split('T')[0]
};

const NewsManager = () => {
  const [news, setNews] = useState<NewsManagerItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsManagerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsManagerItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  
  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await newsApi.getAllForAdmin();
        setNews(data);
        setFilteredNews(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Lỗi tải tin tức');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = news.filter(n =>
      n.title.toLowerCase().includes(term) ||
      n.category.toLowerCase().includes(term) ||
      n.description?.toLowerCase().includes(term)
    );
    setFilteredNews(filtered);
    setCurrentPage(1);
  }, [searchTerm, news]);

  const openModal = (item?: NewsManagerItem) => {
    if (item) {
      setEditingNews(item);
      setFormData({
        title: item.title || '',
        category: item.category || 'Tin tức',
        description: item.description || '',
        content: item.content || '',
        imgUrl: item.imgUrl || '',
        publishDate: item.publishDate.split('T')[0]
      });
    } else {
      setEditingNews(null);
      setFormData(INITIAL_FORM);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNews(null);
    setFormData(INITIAL_FORM);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate before sending
      const validationResult = newsController.validateNews(formData);
      
      if (!validationResult.success) {
        toast.error(`❌ ${validationResult.message}`);
        setSaving(false);
        return;
      }
      
      const payload = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        imgUrl: formData.imgUrl.trim() || undefined,
        publishDate: formData.publishDate
      };

      if (editingNews) {
        await newsApi.update(editingNews.id, payload);
        toast.success('✅ Cập nhật thành công!');
      } else {
        await newsApi.create(payload);
        toast.success('✅ Thêm thành công!');
      }

      const data = await newsApi.getAllForAdmin();
      setNews(data);
      setFilteredNews(data);
      closeModal();
    } catch (error: any) {
      toast.error(`❌ ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Xóa "${title}"?`)) return;
    try {
      await newsApi.delete(id);
      toast.success('✅ Xóa thành công');
      const data = await newsApi.getAllForAdmin();
      setNews(data);
      setFilteredNews(data);
    } catch (error: any) {
      toast.error('❌ Lỗi xóa');
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uniqueCategories = new Set(news.map(n => n.category)).size;

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-gray-900 shadow-xl px-8 py-6 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-700 text-white rounded-lg transition duration-200">
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-3xl font-bold text-white">Quản lý Tin tức</h1>
        </div>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Danh sách Tin tức</h2>
              <p className="text-gray-600 text-sm">Quản lý nội dung tin tức và bài viết</p>
            </div>
            <div className="flex gap-4 mb-8">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600" />
              </div>
              <button onClick={() => openModal()} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Thêm tin tức</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded"><FiFileText size={24} className="text-blue-600" /></div>
                  <div><p className="text-gray-600 text-sm">Tổng tin tức</p><p className="text-2xl font-bold">{news.length}</p></div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded"><FiSearch size={24} className="text-green-600" /></div>
                  <div><p className="text-gray-600 text-sm">Kết quả tìm kiếm</p><p className="text-2xl font-bold">{filteredNews.length}</p></div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded"><FiTag size={24} className="text-orange-600" /></div>
                  <div><p className="text-gray-600 text-sm">Danh mục</p><p className="text-2xl font-bold">{uniqueCategories}</p></div>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-12"><p className="text-gray-500">Đang tải...</p></div>
            ) : paginatedNews.length === 0 ? (
              <div className="text-center py-12"><p className="text-gray-500">Không có tin tức nào</p></div>
            ) : (
              <>
                <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8">
                  {paginatedNews.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg overflow-hidden flex flex-col">
                      <div className="h-48 bg-gray-100 overflow-hidden group">
                        {item.imgUrl ? (
                          <img src={item.imgUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200"><FiFileText size={48} className="text-gray-400" /></div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded mb-2 w-fit">{item.category}</span>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                        {item.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{item.description}</p>}
                        <p className="text-xs text-gray-500 mb-4">{new Date(item.publishDate).toLocaleDateString('vi-VN')}</p>
                        <div className="grid grid-cols-2 gap-2 mt-auto">
                          <button onClick={() => openModal(item)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1"><FiEdit size={14} /> Sửa</button>
                          <button onClick={() => handleDelete(item.id, item.title)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1"><FiTrash2 size={14} /> Xóa</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Trước</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setCurrentPage(page)} className={`px-4 py-2 text-sm font-medium rounded-lg transition ${currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}>{page}</button>
                    ))}
                    <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Sau</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Centered Modal */}
      <NewsModal
        isOpen={showModal}
        editingNews={editingNews}
        formData={formData}
        onClose={closeModal}
        onFormChange={handleFormChange}
        onSave={handleSave}
        isSaving={saving}
      />
    </div>
  );
};

export default NewsManager;
