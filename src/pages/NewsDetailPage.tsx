import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { newsApi } from '../services/api';

interface NewsItem {
  id: number;
  category: string;
  title: string;
  date: string;
  img: string;
  desc: string;
  content?: string;
}

const NewsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Lấy danh sách tin tức và tìm tin có ID tương ứng
        const data = await newsApi.getAll();
        const foundNews = data.find((item: NewsItem) => item.id.toString() === id);
        setNews(foundNews || null);
      } catch (error) {
        console.error('Failed to fetch news detail', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest text-gray-400 animate-pulse">Đang tải tin tức...</div>;
  }

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-xl font-bold uppercase tracking-widest text-gray-400">Không tìm thấy tin tức</div>
        <button onClick={() => navigate('/news')} className="px-6 py-2 bg-black text-white font-bold uppercase text-sm rounded-sm hover:bg-gray-800 transition-colors">Quay lại Tin tức</button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <section className="px-8 md:px-20 py-8 bg-[#F5F5F5] border-b border-gray-200 sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Trở lại</span>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto mt-12 px-8">
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
          <span className="flex items-center gap-1.5"><Tag size={14} className="text-red-500" /> {news.category}</span>
          <span>|</span>
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {news.date || 'Chưa cập nhật'}</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-[1000] uppercase tracking-tighter leading-tight mb-8">
          {news.title}
        </h1>
        
        <p className="text-lg font-medium text-gray-600 mb-10 leading-relaxed italic border-l-4 border-black pl-4">
          {news.desc}
        </p>
        
        <div className="w-full aspect-21/9 bg-[#F5F5F5] rounded-sm overflow-hidden mb-12 shadow-sm">
          <img src={news.img} alt={news.title} className="w-full h-full object-cover grayscale-[0.1]" />
        </div>
        
        <div className="prose prose-lg max-w-none text-gray-800 leading-loose">
          {news.content ? (
             <div dangerouslySetInnerHTML={{ __html: news.content }} />
          ) : (
             <p className="text-gray-500 italic">Nội dung chi tiết của bài viết đang được cập nhật...</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default NewsDetailPage;