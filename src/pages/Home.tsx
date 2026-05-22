import { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from '../components/ProductCard';
import NewsCard from '../components/NewsCard';
import ServicesCard from '../components/ServicesCard';
import PromotionCard from '../components/PromotionCard';
import { useCart, useProducts, useNews, useServices, usePromotions } from '../services/hooks';

const Home = () => {
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { news, loading: newsLoading } = useNews();
  const { services, loading: servicesLoading } = useServices();
  const { promotions, loading: promotionsLoading } = usePromotions();

  // Lấy 6 sản phẩm mới nhất (ID lớn nhất) từ danh sách
  const latestProducts = [...products].sort((a, b) => b.id - a.id).slice(0, 6);
  const carouselItems = latestProducts.map(p => ({ 
    id: p.id, 
    imgUrl: p.imageUrl || "https://via.placeholder.com/1500x2000" 
  }));

  // Tự động lấy 4 ảnh sản phẩm cho phần Tư Duy Thiết Kế
  const approachImages = products.length >= 4 
    ? products.slice(0, 4).map(p => p.imageUrl || "https://via.placeholder.com/1500x2000")
    : Array(4).fill("https://via.placeholder.com/1500x2000");
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxIndex = Math.max(0, carouselItems.length - 2);

  const nextSlide = () => currentIndex < maxIndex ? setCurrentIndex(currentIndex + 1) : setCurrentIndex(0);
  const prevSlide = () => currentIndex > 0 ? setCurrentIndex(currentIndex - 1) : setCurrentIndex(maxIndex);

  const handleAddToCart = async (variantId: number, quantity: number) => {
    await addToCart(variantId, quantity);
  };

  return (
    <div className="bg-[#F5F5F5] min-h-[calc(100vh-70px)] font-sans text-black overflow-hidden select-none">
      <main className="grid grid-cols-10 gap-0 px-20 pt-24 items-start mb-20">
        <div className="col-span-4 flex flex-col pt-4">
          <div className="mb-24"> 
            <h1 className="text-[95px] font-[1000] uppercase leading-none tracking-[-0.05em] mb-8">
              Bộ Sưu Tập <br/>Mới Nhất
            </h1>
            <p className="text-gray-400 font-bold text-[12px] tracking-[0.3em] uppercase opacity-80">
              Mùa Hè 2026
            </p>
          </div>
          <div className="flex items-center gap-4 w-full max-w-105">
            <button 
              onClick={() => navigate("/products")}
              className="flex-1 bg-[#D9D9D9] flex justify-between items-center px-8 py-4 rounded-sm hover:bg-black hover:text-white transition-all group cursor-pointer border-none"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Mua Ngay</span>
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
            </button>
            <div className="flex gap-2">
              <button onClick={prevSlide} className="p-4 bg-white border border-gray-200 rounded-sm hover:bg-black hover:text-white transition-all cursor-pointer">
                <ChevronLeft size={14} />
              </button>
              <button onClick={nextSlide} className="p-4 bg-white border border-gray-200 rounded-sm hover:bg-black hover:text-white transition-all cursor-pointer">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="col-span-6 overflow-hidden pt-2 pl-4">
          <div 
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] gap-5" 
            style={{ transform: `translateX(-${currentIndex * 51}%)` }}
          >
            {carouselItems.map((item, index) => (
              <div 
                key={index} 
                onClick={() => item.id !== 0 && navigate(`/products/${item.id}`)}
                className={`min-w-[49%] aspect-1500/2000 overflow-hidden rounded-sm shadow-sm group relative bg-white ${item.id !== 0 ? 'cursor-pointer' : ''}`}
              >
                <img src={item.imgUrl} alt="Model" className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0" />
              </div>
            ))}
          </div>
        </div>
      </main>

      <section className="px-20 pb-32 bg-white pt-24">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-5xl font-[1000] uppercase leading-[0.8] tracking-tighter">
            Hàng Mới<span className="text-blue-600 text-sm align-top ml-1 font-bold">({products.length})</span>
          </h2>
          <button 
            onClick={() => navigate("/products")} 
            className="text-[11px] font-bold uppercase border-b border-black pb-0.5 hover:text-gray-400 transition-colors"
          >
            Xem tất cả
          </button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-4 gap-8">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="aspect-3/4 bg-gray-100 animate-pulse rounded-sm"></div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-8">
            {products.slice(0, 4).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>

      <section className="py-32 px-20 bg-[#F5F5F5]">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <h2 className="text-5xl font-[1000] uppercase tracking-[-0.02em] mb-8 leading-tight">
            Tư Duy Thiết Kế Của Chúng Tôi
          </h2>
          <p className="text-gray-500 text-[13px] font-medium uppercase tracking-[0.15em] leading-relaxed max-w-2xl mx-auto opacity-70">
            Tại H&Q Store, chúng tôi kết hợp sự sáng tạo với tay nghề thủ công bậc thầy để tạo ra 
            những thiết kế vượt thời gian. Mỗi sản phẩm đều được chăm chút tỉ mỉ, 
            đảm bảo chất lượng cao nhất và độ hoàn thiện tinh xảo.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-8 items-center">
          <div className="col-span-1 mt-20">
            <div className="aspect-1500/2000 overflow-hidden rounded-sm shadow-sm">
              <img src={approachImages[0]} alt="Design 1" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0" />
            </div>
          </div>
          <div className="col-span-1 mb-20">
            <div className="aspect-1500/2000 overflow-hidden rounded-sm shadow-sm">
              <img src={approachImages[1]} alt="Design 2" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0" />
            </div>
          </div>
          <div className="col-span-1 mt-10">
            <div className="aspect-1500/2000 overflow-hidden rounded-sm shadow-sm">
              <img src={approachImages[2]} alt="Design 3" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0" />
            </div>
          </div>
          <div className="col-span-1 -mt-10">
            <div className="aspect-1500/2000 overflow-hidden rounded-sm shadow-sm">
              <img src={approachImages[3]} alt="Design 4" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-32 bg-fixed bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000')" }}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        <div className="container mx-auto px-20 relative z-10">
          <div className="text-center mb-20 text-white">
            <h2 className="text-4xl font-[1000] uppercase tracking-tighter mb-4">Dịch vụ đặc quyền</h2>
            <div className="w-12 h-0.5 bg-white mx-auto opacity-50"></div>
            <p className="text-gray-300 text-xs uppercase tracking-[0.3em] mt-6">H&Q Store cam kết mang lại trải nghiệm mua sắm đẳng cấp</p>
          </div>
          <div className="grid grid-cols-4 gap-8">
            {servicesLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-sm"></div>
              ))
            ) : (
              services.map((item) => (
                <ServicesCard key={item.id} iconName={item.iconName} title={item.title} description={item.description} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* --- SECTION 5: PROMOTIONS (KHUYẾN MÃI) --- */}
      <section className="py-32 px-20 bg-[#F5F5F5]">
        <div className="flex justify-between items-center mb-20 pb-8 border-b border-gray-200">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
              Đặc Biệt & HOT
            </p>
            <h2 className="text-6xl font-[1000] uppercase leading-tight tracking-tighter text-black">
              Khuyến Mãi<br /><span className="text-red-500">Hôm Nay</span>
            </h2>
          </div>
          <button className="text-[11px] font-black uppercase px-6 py-3 border-2 border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 hover:shadow-lg">
            Xem tất cả
          </button>
        </div>
        <div className="grid grid-cols-3 gap-8">
          {promotionsLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
            ))
          ) : (
            promotions.slice(0, 3).map((promo) => (
              <PromotionCard
                key={promo.id}
                code={promo.code}
                title={promo.title ?? promo.code}
                description={promo.description}
                discountText={promo.discountText ?? `${promo.discountPercent ?? 0}%`}
              />
            ))
          )}
        </div>
      </section>

      {/* --- SECTION 6: NEWS (TIN TỨC & SỰ KIỆN) --- */}
      <section className="py-32 px-20 bg-white">
        <div className="flex justify-between items-end mb-16">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-2">Tạp Chí</p>
            <h2 className="text-5xl font-[1000] uppercase leading-[0.8] tracking-tighter">Tin tức<br />& Sự kiện</h2>
          </div>
          <button onClick={() => navigate("/news")} className="text-[11px] font-bold uppercase border-b border-black pb-1 hover:text-gray-400">Xem tất cả</button>
        </div>
        <div className="grid grid-cols-3 gap-12">
          {newsLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-sm"></div>
            ))
          ) : (
            news.slice(0, 3).map((newsItem) => (
              <NewsCard category={''} img={''} desc={''} key={newsItem.id} {...newsItem} />
            ))
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;