import React, { useRef, useState, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { Heart } from 'lucide-react';
import type { Product } from '../services/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ProductCardProps {
  product: Product;
  onAddToCart: (variantId: number, quantity: number) => void;
}

const WISHLIST_KEY = "wishlistVariantIds";

const colorMap: Record<string, string> = {
  "Trắng": "#FFFFFF",
  "Đen": "#000000",
  "Xanh Indigo": "#4B0082",
  "Be": "#F5F5DC",
  "Xám": "#808080",
  "Xanh Navy": "#000080",
  "Đỏ": "#FF0000",
  "Xanh Lá": "#008000",
  "Vàng": "#FFFF00",
  "Hồng": "#FFC0CB",
  "Tím": "#800080",
  "Cam": "#FFA500",
  "Xanh Dương": "#0000FF",
  "Xanh": "#3b82f6",
  "Nâu": "#8B4513",
  "Kẻ sọc": "#e5e7eb"
};

const getColorHex = (colorName: string) => {
  return colorMap[colorName] || "#CCCCCC";
};

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

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart
}) => {
  const { name, variants, brandText } = product;
  const imageSrc = product.imageUrl || (product as any).imageUrl || product.imageSrc;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const availableColors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))),
    [variants]
  );

  const allSizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size).filter(Boolean))).sort(),
    [variants]
  );

  const variantToAdd = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return variants.find((v) => v.color === selectedColor && v.size === selectedSize) ?? null;
  }, [selectedColor, selectedSize, variants]);

  const activeVariant = variantToAdd || variants[0] || null;
  const displayPrice = variantToAdd
    ? variantToAdd.price
    : (variants.length > 0 ? Math.min(...variants.map((v) => Number(v.price))) : 0);

  useEffect(() => {
    const checkWishlist = () => {
      if (!activeVariant?.id) return;
      const stored = sessionStorage.getItem(WISHLIST_KEY);
      const wishlist: number[] = stored ? JSON.parse(stored) : [];
      setIsFavorite(wishlist.includes(activeVariant.id));
    };

    checkWishlist();
    window.addEventListener("wishlistUpdated", checkWishlist);
    return () => window.removeEventListener("wishlistUpdated", checkWishlist);
  }, [activeVariant]);

  const updateWishlistStorage = (variantId: number, add: boolean) => {
    const stored = sessionStorage.getItem(WISHLIST_KEY);
    const wishlist: number[] = stored ? JSON.parse(stored) : [];
    const next = add
      ? Array.from(new Set([...wishlist, variantId]))
      : wishlist.filter((id) => id !== variantId);
    sessionStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    setIsFavorite(add);
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const navigate = useNavigate();
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const userId = getUserId();
    if (!userId) {
      alert("Vui lòng đăng nhập để thêm vào yêu thích!");
      navigate("/auth");
      return;
    }

    if (!activeVariant) return;

    const variantId = activeVariant.id;
    if (!variantId) return;
    const willAdd = !isFavorite;

    try {
      if (willAdd) {
        await axios.post(`https://localhost:7137/api/wishlist`, { userId, variantId });
        toast.success("Đã thêm vào danh sách yêu thích");
      } else {
        await axios.delete(`https://localhost:7137/api/wishlist/${userId}/${variantId}`);
        toast.info("Đã xóa khỏi danh sách yêu thích");
      }
      updateWishlistStorage(variantId, willAdd);
    } catch (err: any) {
      console.error("Lỗi đồng bộ wishlist:", err);
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật danh sách yêu thích!");
    }
  };

  const handleQuantity = (type: 'plus' | 'minus') => {
    if (type === 'plus') {
      const maxStock = Number(activeVariant?.stockQuantity) || 99;
      if (quantity < maxStock) setQuantity(prev => prev + 1);
    } else {
      if (quantity > 1) setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const auth = sessionStorage.getItem("auth");
    if (!auth) {
      alert("Vui lòng đăng nhập để thực hiện mua sắm tại H&Q Store!");
      navigate("/auth");
      return;
    }

    if (!variantToAdd) {
      alert("Vui lòng chọn đầy đủ màu sắc và kích thước!");
      return;
    }

    if (!variantToAdd.id) {
      alert("Lỗi: Không tìm thấy ID của sản phẩm!");
      return;
    }

    const button = buttonRef.current;
    if (!button || button.classList.contains('active')) return;

    onAddToCart(variantToAdd.id, quantity);

    button.classList.add('active');
    const tl = gsap.timeline();

    tl.to(button, {
      keyframes: [
        { '--background-scale': 0.97, duration: 0.15 },
        { '--background-scale': 1, delay: 0.125, duration: 1.2, ease: 'elastic.out(1, .6)' },
      ],
    }).to(button, {
      keyframes: [
        {
          '--shirt-scale': 1,
          '--shirt-y': '-42px',
          '--cart-x': '0px',
          '--cart-scale': 1,
          duration: 0.4,
          ease: 'power1.in'
        },
        { '--shirt-y': '-40px', duration: 0.3 },
        { '--shirt-y': '16px', '--shirt-scale': 0.9, duration: 0.25 },
        {
          '--shirt-scale': 0,
          duration: 0.3,
          onComplete: () => {
            setTimeout(() => {
              if (button) {
                button.classList.remove('active');
                gsap.set(button, {
                  '--shirt-y': '-42px',
                  '--shirt-scale': 0,
                  '--cart-x': '-120px',
                  '--cart-scale': 0.6,
                  '--text-o': 1
                });
              }
            }, 2000);
          }
        },
      ],
    }, 0);

    gsap.to(button, { '--text-o': 0, duration: 0.3 });
  };

  return (
     <div className="group cursor-pointer w-full"
         onClick={() => navigate(`/products/${product.id}`)}
    >
      <div className="relative aspect-1500/2000 bg-[#F5F5F5] rounded-sm overflow-hidden mb-4 shadow-sm border border-gray-100">
        <img
          src={imageSrc}
          alt={name}
          className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
        />

        <button
          onClick={handleToggleFavorite}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-red-500 shadow-md transition hover:scale-105"
          aria-label={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
        >
          <Heart fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" size={18} />
        </button>

        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end pb-4 px-3">
          <div className="flex flex-wrap justify-center gap-1 mb-1.5 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(color);
                  if (selectedSize && !variants.some((v) => v.color === color && v.size === selectedSize)) {
                    setSelectedSize(null);
                  }
                }}
                title={color}
                className={`w-5 h-5 rounded-full border border-gray-300 transition-all duration-300 shrink-0 ${
                  selectedColor === color
                    ? 'ring-2 ring-white scale-110 shadow-md'
                    : 'hover:scale-110 shadow-sm'
                }`}
                style={{ backgroundColor: getColorHex(color) }}
              />
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 mb-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            {allSizes.map((size) => {
              const isAvailable = !selectedColor || variants.some((v) => v.color === selectedColor && v.size === size);
              return (
                <button
                  key={size}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAvailable) {
                      setSelectedSize(size);
                      if (!selectedColor) {
                        const colorForSize = variants.find((v) => v.size === size)?.color;
                        if (colorForSize) setSelectedColor(colorForSize);
                      }
                    }
                  }}
                  disabled={!isAvailable}
                  className={`min-w-8 h-8 px-1 flex items-center justify-center text-[10px] font-bold border transition-all duration-300 rounded-sm ${
                    selectedSize === size
                      ? 'bg-black text-white border-black'
                      : isAvailable
                        ? 'bg-white/90 text-black border-transparent hover:border-black'
                        : 'bg-gray-200 text-gray-400 border-transparent cursor-not-allowed opacity-50'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>

          <div className="flex items-center bg-white/95 rounded-sm mb-3 w-full justify-between px-3 py-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 shadow-sm">
            <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Số lượng</span>
            <div className="flex items-center gap-4">
              <button onClick={(e) => { e.stopPropagation(); handleQuantity('minus'); }} className="text-sm font-bold hover:text-red-500">-</button>
              <span className="text-xs font-bold w-4 text-center">{quantity}</span>
              <button onClick={(e) => { e.stopPropagation(); handleQuantity('plus'); }} className="text-sm font-bold hover:text-green-500">+</button>
            </div>
          </div>

          <button
            ref={buttonRef}
            onClick={handleAddToCart}
            className="add-to-cart w-full relative h-11.25 rounded-sm bg-black text-white text-[10px] font-bold uppercase overflow-hidden tracking-widest transition-all duration-300 hover:bg-zinc-900"
            style={{
                '--shirt-y': '-42px',
                '--shirt-scale': 0,
                '--cart-x': '-120px',
                '--cart-scale': 0.6,
                '--text-o': 1,
                '--background-scale': 1
            } as React.CSSProperties}
          >
            <span className="relative z-10 block transition-opacity duration-300" style={{ opacity: 'var(--text-o)' }}>
              {variantToAdd ? `Add - ${(Number(displayPrice) * quantity).toLocaleString()}đ` : 'Chọn Phân Loại'}
            </span>

            <div className="shirt pointer-events-none absolute left-1/2 top-0 -ml-3 origin-bottom"
                 style={{
                    transform: 'translateY(var(--shirt-y)) scale(var(--shirt-scale))',
                    opacity: 'var(--shirt-scale)'
                 }}>
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M4.99997 3L8.99997 1.5C8.99997 1.5 10.6901 3 12 3C13.3098 3 15 1.5 15 1.5L19 3L22.5 8L19.5 10.5L19 9.5L17.1781 18.6093C17.062 19.1901 16.778 19.7249 16.3351 20.1181C15.4265 20.925 13.7133 22.3147 12 23C10.2868 22.3147 8.57355 20.925 7.66487 20.1181C7.22198 19.7249 6.93798 19.1901 6.82183 18.6093L4.99997 9.5L4.5 10.5L1.5 8L4.99997 3Z" /></svg>
            </div>

            <div className="cart pointer-events-none absolute left-1/2 top-1/2 -ml-4.5 -mt-3.25"
                 style={{
                    transform: 'translateX(var(--cart-x)) scale(var(--cart-scale))',
                    opacity: 'var(--cart-scale)'
                 }}>
                <svg className="w-9 h-6.5 fill-none stroke-white stroke-2" viewBox="0 0 36 26"><path d="M1 2.5H6L10 18.5H25.5L28.5 7.5L7.5 7.5" /><circle cx="11.5" cy="23" r="2" fill="currentColor" stroke="none" /><circle cx="24" cy="23" r="2" fill="currentColor" stroke="none" /></svg>
            </div>
          </button>
        </div>
      </div>

      <div className="flex justify-between items-start px-0.5">
        <div className="flex flex-col gap-1">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.15em] leading-none">
            {brandText || 'H&Q'}
          </p>
          <h3 className="text-black text-[11px] uppercase font-bold tracking-tight leading-tight">
            {name}
          </h3>
        </div>
        <p className="text-[11px] font-bold text-black shrink-0">
          {displayPrice.toLocaleString()}đ
        </p>
      </div>
    </div>
  );
};

export default ProductCard;