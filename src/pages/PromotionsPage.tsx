import { useState, useEffect } from 'react';
import { ArrowLeft, Tag, Calendar, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { promotionsApi, type PromotionItem } from '../services/api';

const PromotionsPage = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const data = await promotionsApi.getAll();
        setPromotions(data);
      } catch (error) {
        console.error('Lỗi khi tải khuyến mãi', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen pb-20">
      <section className="px-6 lg:px-20 py-10 lg:py-16 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Trang chủ</span>
          </button>
          
          <div className="flex items-center gap-3 mb-4">
             <Tag className="text-red-500 w-8 h-8" />
             <h1 className="text-3xl lg:text-5xl font-[1000] uppercase tracking-tighter">
                Khuyến Mãi & Ưu Đãi
             </h1>
          </div>
          <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">
            Khám phá các chương trình khuyến mãi độc quyền tại H&Q Store. 
            Lưu ngay mã giảm giá để tận hưởng trải nghiệm mua sắm tuyệt vời với mức giá ưu đãi nhất.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-20 py-12">
         {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-white animate-pulse rounded-xl border border-gray-200 shadow-sm"></div>
              ))}
           </div>
         ) : promotions.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
             <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
             <p className="text-gray-500 font-medium text-lg">Hiện tại không có khuyến mãi nào khả dụng.</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {promotions.map((promo) => (
               <div key={promo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                 <div className="bg-red-500 p-6 flex flex-col items-center justify-center text-white relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-black opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 delay-100"></div>
                    <h3 className="text-3xl font-black tracking-tighter z-10">{promo.discountText || `${promo.discountValue}%`}</h3>
                    <p className="text-xs uppercase tracking-widest mt-2 font-bold opacity-90 z-10">Voucher Đặc Biệt</p>
                 </div>
                 
                 <div className="p-6 flex-1 flex flex-col">
                   <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight line-clamp-2">{promo.title || promo.description}</h4>
                   
                   <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 mt-auto pt-4">
                     <Calendar size={14} className="text-gray-400" />
                     <span>HSD: {promo.endDate}</span>
                   </div>

                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                     <div className="font-mono font-bold text-red-600 tracking-wider text-sm">{promo.code}</div>
                     <button
                       onClick={() => handleCopy(promo.code)}
                       className="text-gray-500 hover:text-black transition-colors"
                       title="Sao chép mã"
                     >
                       {copiedCode === promo.code ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                     </button>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         )}
      </section>
    </div>
  );
};

export default PromotionsPage;