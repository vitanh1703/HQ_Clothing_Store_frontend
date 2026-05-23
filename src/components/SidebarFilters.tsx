import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Star, X } from "lucide-react";
import type { Product } from "../services/api";

export interface FilterState {
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  status: string[];
  minRating: number | null;
}

interface SidebarFiltersProps {
  products: Product[];
  onFilterChange: (filters: FilterState) => void;
  loading?: boolean;
}

const SidebarFilters = ({ products, onFilterChange, loading = false }: SidebarFiltersProps) => {
  const [openMenus, setOpenMenus] = useState<string[]>(["Kích thước", "Khoảng giá"]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 2000000 });
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => 
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  // TỐI ƯU HIỆU NĂNG: Bọc logic quét mảng lồng nhau vào useMemo để tránh lag giao diện khi gõ hoặc kéo thanh trượt
  const { sizes, colors, absoluteMaxPrice, hasInStock, hasOutOfStock } = useMemo(() => {
    const extractedSizes = new Set<string>();
    const extractedColors = new Set<string>();
    let maxP = 2000000; // Giá trị trần mặc định đề phòng mảng rỗng
    let inStock = false;
    let outOfStock = false;

    if (products && products.length > 0) {
      maxP = 0;
      products.forEach(product => {
        product.variants?.forEach(variant => {
          if (variant.size) extractedSizes.add(variant.size);
          if (variant.color) extractedColors.add(variant.color);
              
              const vPrice = Number(variant.price) || 0;
              if (vPrice > maxP) maxP = vPrice;
              
              const vStock = Number(variant.stockQuantity ?? (variant as any).stock_quantity) || 0;
              if (vStock > 0) inStock = true;
              if (vStock === 0) outOfStock = true;
        });
      });
    }

    return {
      sizes: Array.from(extractedSizes).sort(),
      colors: Array.from(extractedColors),
      absoluteMaxPrice: maxP === 0 ? 2000000 : maxP,
      hasInStock: inStock,
      hasOutOfStock: outOfStock
    };
  }, [products]);

  // Map bảng màu HEX cố định
  const colorMap: Record<string, string> = useMemo(() => ({
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
  }), []);

  const getColorHex = useMemo(() => {
    return (colorName: string) => colorMap[colorName] || "#CCCCCC"; 
  }, [colorMap]);

  // Cập nhật giá trị maxPrice của thanh trượt tương ứng với dữ liệu sản phẩm thật đổ về
  useEffect(() => {
    if (absoluteMaxPrice > 0) {
      setPriceRange(prev => ({ ...prev, max: Math.min(prev.max, absoluteMaxPrice) || absoluteMaxPrice }));
    }
  }, [absoluteMaxPrice]);

  useEffect(() => {
    onFilterChange({
      sizes: selectedSizes,
      colors: selectedColors,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      status: selectedStatus,
      minRating: selectedRating,
    });
  }, [selectedSizes, selectedColors, priceRange, selectedStatus, selectedRating, onFilterChange]);

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceRange(prev => ({
      ...prev,
      max: Number(e.target.value)
    }));
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(selectedRating === rating ? null : rating);
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedStatus([]);
    setPriceRange({ min: 0, max: absoluteMaxPrice });
    setSelectedRating(null);
  };

  const activeFilterCount = selectedSizes.length + selectedColors.length + selectedStatus.length + (selectedRating ? 1 : 0);

  return (
    <div className="w-full lg:min-w-60 space-y-2 pb-6 lg:pb-20 bg-white p-4 lg:p-0 rounded-xl lg:rounded-none border border-gray-100 lg:border-0 shadow-xs lg:shadow-none">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="font-black uppercase text-[11px] tracking-[0.25em] text-black border-b-2 border-black pb-2 w-fit">
          Bộ lọc tìm kiếm
        </h3>
        {activeFilterCount > 0 && (
          <button 
            onClick={clearAllFilters}
            className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X size={12} />
            Xóa hết ({activeFilterCount})
          </button>
        )}
      </div>

      {/* --- KÍCH THƯỚC --- */}
      <div className="mb-2 border-b border-gray-50 pb-2">
        <div 
          className="flex justify-between items-center py-3 cursor-pointer group"
          onClick={() => toggleMenu("Kích thước")}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors">Kích thước</span>
          <ChevronDown size={12} className={`text-gray-400 transition-transform duration-300 ${openMenus.includes("Kích thước") ? "rotate-180" : ""}`} />
        </div>
        {openMenus.includes("Kích thước") && (
          <div className="grid grid-cols-4 gap-2 mt-1 mb-3 animate-in fade-in duration-200">
            {loading ? (
              <div className="col-span-4 text-center text-[10px] text-gray-400 py-2">Đang tải...</div>
            ) : sizes.length === 0 ? (
              <div className="col-span-4 text-center text-[10px] text-gray-400 py-2">Không có size</div>
            ) : (
              sizes.map((s) => (
                <button 
                  key={s} 
                  type="button"
                  onClick={() => handleSizeToggle(s)}
                  className={`h-9 border text-[10px] font-black rounded-md transition-all flex items-center justify-center cursor-pointer ${
                    selectedSizes.includes(s)
                      ? "bg-black text-white border-black shadow-xs"
                      : "border-gray-200 bg-white text-gray-800 hover:border-black"
                  }`}
                >
                  {s}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* --- TÌNH TRẠNG --- */}
      <FilterWrapper title="Tình trạng" isOpen={openMenus.includes("Tình trạng")} onToggle={() => toggleMenu("Tình trạng")}>
        <div className="space-y-2.5 mt-1 mb-3">
          {hasInStock && (
            <label className="flex items-center gap-3 cursor-pointer group w-fit">
              <input 
                type="checkbox" 
                checked={selectedStatus.includes("in-stock")}
                onChange={() => handleStatusToggle("in-stock")}
                className="w-4 h-4 accent-black border-gray-300 rounded cursor-pointer" 
              />
              <span className="text-[10px] font-bold uppercase text-gray-600 group-hover:text-black transition-colors">Còn hàng</span>
            </label>
          )}
          {hasOutOfStock && (
            <label className="flex items-center gap-3 cursor-pointer group w-fit">
              <input 
                type="checkbox" 
                checked={selectedStatus.includes("out-of-stock")}
                onChange={() => handleStatusToggle("out-of-stock")}
                className="w-4 h-4 accent-black border-gray-300 rounded cursor-pointer" 
              />
              <span className="text-[10px] font-bold uppercase text-gray-600 group-hover:text-black transition-colors">Hết hàng</span>
            </label>
          )}
          {!hasInStock && !hasOutOfStock && (
            <p className="text-[10px] text-gray-400 py-1">Không có sản phẩm</p>
          )}
        </div>
      </FilterWrapper>

      {/* --- MÀU SẮC --- */}
      <FilterWrapper title="Màu sắc" isOpen={openMenus.includes("Màu sắc")} onToggle={() => toggleMenu("Màu sắc")}>
        <div className="flex flex-wrap gap-2.5 mt-2 mb-3">
          {loading ? (
            <div className="text-[10px] text-gray-400 py-1">Đang tải...</div>
          ) : colors.length === 0 ? (
            <div className="text-[10px] text-gray-400 py-1">Không có màu</div>
          ) : (
            colors.map(color => (
              <button 
                key={color}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleColorToggle(color);
                }}
                title={color}
                className={`w-6 h-6 rounded-full transition-all relative shrink-0 border border-gray-200 cursor-pointer ${
                  selectedColors.includes(color) ? "ring-2 ring-offset-2 ring-black scale-105" : "hover:scale-105"
                }`}
                style={{ backgroundColor: getColorHex(color) }}
              >
                {selectedColors.includes(color) && (
                  <div className="absolute inset-0 rounded-full border-2 border-white"></div>
                )}
              </button>
            ))
          )}
        </div>
      </FilterWrapper>

      {/* --- KHOẢNG GIÁ --- */}
      <FilterWrapper title="Khoảng giá" isOpen={openMenus.includes("Khoảng giá")} onToggle={() => toggleMenu("Khoảng giá")}>
        <div className="mt-2 px-1 mb-3">
          <input 
            type="range" 
            min="0" 
            max={absoluteMaxPrice} 
            value={priceRange.max}
            onChange={handlePriceChange}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" 
          />
          <div className="flex justify-between mt-2 text-[9px] font-bold text-gray-400">
            <span>0đ</span>
            <span>{absoluteMaxPrice.toLocaleString()}đ</span>
          </div>
          <div className="mt-2.5 text-[10px] font-bold text-gray-500">
            Giá tối đa: <span className="text-red-500 font-extrabold text-xs">{priceRange.max.toLocaleString()}đ</span>
          </div>
        </div>
      </FilterWrapper>

      {/* --- ĐÁNH GIÁ --- */}
      <FilterWrapper title="Đánh giá" isOpen={openMenus.includes("Đánh giá")} onToggle={() => toggleMenu("Đánh giá")}>
        <div className="space-y-1.5 mt-2 mb-2">
          {[5, 4, 3, 2, 1].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              className={`w-full text-left flex items-center gap-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                selectedRating === star 
                  ? "bg-black text-white shadow-xs" 
                  : "hover:bg-gray-50 text-gray-600 hover:text-black"
              }`}
            >
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={10} 
                    fill={i < star ? (selectedRating === star ? "white" : "black") : "none"} 
                    className={i < star ? (selectedRating === star ? "text-white" : "text-black") : "text-gray-200"} 
                  />
                ))}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider ml-2 ${
                selectedRating === star ? "text-white" : "text-gray-400"
              }`}>
                Từ {star} sao
              </span>
            </button>
          ))}
        </div>
      </FilterWrapper>
    </div>
  );
};

function FilterWrapper({ title, children, isOpen, onToggle }: any) {
  return (
    <div className="border-b border-gray-50 py-2 transition-all">
      <div className="flex justify-between items-center cursor-pointer group py-2" onClick={onToggle}>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors">{title}</span>
        <ChevronDown size={12} className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </div>
      {isOpen && <div className="animate-in fade-in duration-200">{children}</div>}
    </div>
  );
}

export default SidebarFilters;