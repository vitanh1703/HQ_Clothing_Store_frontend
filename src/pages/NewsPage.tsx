import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { newsApi } from '../services/api';

interface NewsItem {
  id: number;
  category: string;
  title: string;
  date: string;
  img: string;
  desc: string;
}

const NewsPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await newsApi.getAll();
        setNews(data);
      } catch (error) {
        console.error('Failed to fetch news', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const categories = ['all', ...new Set(news.map(item => item.category))];
  const filteredNews = news.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedNews = filteredNews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="px-20 py-16 bg-[#F5F5F5] border-b border-gray-200">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-5xl font-[1000] uppercase tracking-tighter">
            Tin Tức & Sự Kiện
          </h1>
        </div>

        {/* Search */}
        <div className="max-w-2xl mb-8">
          <div className="relative flex items-center border-b-2 border-black pb-2 focus-within:border-blue-500 transition-colors">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tin tức..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ml-3 text-lg font-medium bg-transparent outline-none"
            />
          </div>
        </div>

        {/* Categories Filter */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-bold uppercase text-sm whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 hover:border-black text-black'
              }`}
            >
              {category === 'all' ? 'Tất Cả' : category}
            </button>
          ))}
        </div>
      </section>

      {/* News Grid */}
      <section className="px-20 py-20">
        {loading ? (
          <div className="space-y-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-8 pb-12 border-b border-gray-200">
                <div className="w-[30%] h-56 bg-gray-100 animate-pulse rounded-lg"></div>
                <div className="w-[70%] space-y-3">
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-1/4"></div>
                  <div className="h-6 bg-gray-100 animate-pulse rounded w-full"></div>
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : paginatedNews.length > 0 ? (
          <div className="space-y-12">
            {/* News Grid - 1 Column Centered */}
            <div className="flex justify-center">
              <div className="w-full max-w-2xl space-y-12">
                {paginatedNews.map((newsItem) => (
                  <div key={newsItem.id} className="group cursor-pointer" onClick={() => navigate(`/news/${newsItem.id}`)}>
                    {/* Image */}
                    <div className="relative overflow-hidden rounded-lg mb-6 h-56 bg-[#F5F5F5]">
                      <img
                        src={newsItem.img}
                        alt={newsItem.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-[0.15] group-hover:grayscale-0"
                      />
                      <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-[10px] font-black uppercase">{newsItem.date}</div>
                    </div>

                    {/* Content */}
                    <div className="text-left">
                      <p className="text-xs text-red-500 font-black uppercase tracking-wider mb-3">{newsItem.category}</p>
                      <h3 className="text-base font-black uppercase mb-3 leading-tight group-hover:text-red-500 transition-colors line-clamp-2">
                        {newsItem.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {newsItem.desc}
                      </p>
                      <button className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-red-500 transition-colors w-fit">
                        <span>Đọc thêm</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination - Bottom Right */}
            <div className="flex justify-end items-center gap-4 pt-12">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Trang {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-black hover:text-white hover:border-black disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                      currentPage === i + 1
                        ? 'bg-black text-white'
                        : 'border border-gray-300 hover:border-black hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-black hover:text-white hover:border-black disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg uppercase font-bold tracking-widest mb-4">
              Không tìm thấy tin tức
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className="px-6 py-2 border-b border-black text-sm font-bold uppercase hover:text-gray-400 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="px-20 py-16 bg-[#F5F5F5] border-t border-gray-200">
        <div className="flex justify-between items-center max-w-2xl">
          <div className="text-center flex-1">
            <p className="text-4xl font-black text-black mb-2">{filteredNews.length}</p>
            <p className="text-gray-500 text-sm uppercase font-bold tracking-widest">
              Tin tức tìm thấy
            </p>
          </div>
          <div className="text-center flex-1">
            <p className="text-4xl font-black text-black mb-2">{totalPages}</p>
            <p className="text-gray-500 text-sm uppercase font-bold tracking-widest">
              Trang
            </p>
          </div>
          <div className="text-center flex-1">
            <p className="text-4xl font-black text-black mb-2">{news.length}</p>
            <p className="text-gray-500 text-sm uppercase font-bold tracking-widest">
              Tổng cộng
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsPage;