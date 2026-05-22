import { useEffect, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { useProducts, useCart } from "../services/hooks";
import type { Product, Variant } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

type WishlistItem = {
  id: number;
  productId: number;
  name: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  image: string;
  description: string;
};

const DEFAULT_WISHLIST: number[] = [];

const WishlistPage = () => {
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();
  const { addToCart, isAdding } = useCart();

  const [wishlistVariantIds, setWishlistVariantIds] = useState<number[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const getUserId = () => {
    const auth = sessionStorage.getItem("auth");
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        return parsed.user?.id || parsed.user?.Id;
      } catch (e) {}
    }
    return Number(sessionStorage.getItem("userId")) || null;
  };

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      axios.get(`https://localhost:7137/api/wishlist/${userId}`)
        .then((res) => {
          setWishlistVariantIds(res.data);
          sessionStorage.setItem("wishlistVariantIds", JSON.stringify(res.data));
        })
        .catch((err) => {
          console.error("Lỗi lấy danh sách yêu thích:", err);
        });
    } else {
      const stored = sessionStorage.getItem("wishlistVariantIds");
      let variantIds = DEFAULT_WISHLIST;
      if (stored && stored !== "undefined") {
        try {
          variantIds = JSON.parse(stored) as number[];
        } catch (e) {
          console.error("Lỗi parse wishlist", e);
        }
      }
      setWishlistVariantIds(variantIds);
    }
  }, []);

  useEffect(() => {
    const items: WishlistItem[] = [];

    products.forEach((product: Product) => {
      (product.variants || []).forEach((variant: Variant) => {
        if (wishlistVariantIds.includes(variant.id)) {
          items.push({
            id: variant.id,
            productId: product.id,
            name: product.name,
            sku: variant.sku ?? "",
            color: variant.color,
            size: variant.size,
            price: variant.price,
            image: product.imageUrl || "https://via.placeholder.com/250",
            description: product.description || "Không có mô tả",
          });
        }
      });
    });

    setWishlistItems(items);
  }, [products, wishlistVariantIds]);

  const saveWishlist = (variantIds: number[]) => {
    sessionStorage.setItem("wishlistVariantIds", JSON.stringify(variantIds));
    setWishlistVariantIds(variantIds);
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const handleRemoveFavorite = async (variantId: number) => {
    const userId = getUserId();
    
    const updateLocalState = () => {
      saveWishlist(wishlistVariantIds.filter((id) => id !== variantId));
      toast.info("Đã xóa khỏi danh sách yêu thích");
    };

    if (userId) {
      try {
        await axios.delete(`https://localhost:7137/api/wishlist/${userId}/${variantId}`);
        updateLocalState();
      } catch (err) {
        console.error("Lỗi khi xóa khỏi DB:", err);
        toast.error("Lỗi khi xóa khỏi danh sách yêu thích");
      }
    } else {
      updateLocalState();
    }
  };

  const handleAddToCart = async (variantId: number, productName: string) => {
    try {
      await addToCart(variantId, 1);
      toast.success(`Đã thêm "${productName}" vào giỏ hàng!`, {
        icon: <ShoppingCart size={18} className="text-green-500" />
      });
    } catch (err) {
      toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20">
      <main className="max-w-6xl mx-auto py-12 px-6">
        <header className="mb-12 border-b border-gray-100 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Yêu thích</h1>
            <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest">
              Bạn đang có {wishlistItems.length} món đồ trong danh sách
            </p>
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="text-[10px] font-black uppercase border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-all"
          >
            Tiếp tục mua sắm
          </button>
        </header>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-pulse font-black uppercase tracking-[0.3em] text-gray-300">Đang tải dữ liệu...</div>
          </div>
        )}
        
        {error && <p className="text-center text-red-500 font-bold uppercase py-10">{error}</p>}
        
        {!loading && !wishlistItems.length && (
          <div className="text-center py-20 space-y-4">
            <p className="text-gray-400 italic">Danh sách yêu thích của bạn hiện đang trống.</p>
            <button 
              onClick={() => navigate('/products')}
              className="inline-block bg-black text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
            >
              Khám phá sản phẩm
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-10">
          {wishlistItems.map((item) => (
            <div key={item.id} className="flex flex-col md:flex-row gap-8 border-b border-gray-100 pb-10 relative group">
              
              {/* 1. HÌNH ẢNH CÓ LINK */}
              <div 
                onClick={() => handleProductClick(item.productId)}
                className="w-full md:w-44 h-56 bg-gray-50 shrink-0 overflow-hidden rounded-2xl shadow-sm cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between py-2">
                <div className="space-y-3">
                  {/* 2. TÊN SẢN PHẨM CÓ LINK */}
                  <div 
                    onClick={() => handleProductClick(item.productId)}
                    className="inline-block cursor-pointer"
                  >
                    <h2 className="font-black text-2xl uppercase tracking-tight hover:text-gray-600 transition-colors leading-none">
                      {item.name}
                    </h2>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <p className="text-[10px] font-bold uppercase text-gray-400">SKU: <span className="text-black">{item.sku}</span></p>
                    <p className="text-[10px] font-bold uppercase text-gray-400">Màu: <span className="text-black">{item.color}</span></p>
                    <p className="text-[10px] font-bold uppercase text-gray-400">Size: <span className="text-black">{item.size}</span></p>
                  </div>
                  
                  <p className="text-[11px] text-gray-500 leading-relaxed max-w-xl italic">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-2xl font-black tracking-tighter italic">
                    {item.price.toLocaleString("vi-VN")} <span className="text-sm not-italic font-bold ml-1">VND</span>
                  </p>
                </div>
              </div>

              {/* NÚT XÓA */}
              <button
                onClick={() => handleRemoveFavorite(item.id)}
                className="absolute top-0 right-0 p-2 text-gray-300 hover:text-red-500 transition-colors"
                title="Xóa khỏi yêu thích"
              >
                <Heart size={20} fill="currentColor" />
              </button>

              {/* NÚT THÊM GIỎ HÀNG */}
              <div className="md:absolute md:bottom-10 md:right-0">
                <button
                  onClick={() => handleAddToCart(item.id, item.name)}
                  disabled={isAdding}
                  className="w-full md:w-auto bg-black text-white px-10 py-4 text-[11px] font-black rounded-full hover:bg-gray-800 transition-all uppercase tracking-[0.2em] shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isAdding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default WishlistPage;