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

  const extractedSizes = new Set<string>();
  const extractedColors = new Set<string>();
  let minPrice = Infinity;
  let maxPrice = 0;

  products.forEach(product => {
    product.variants?.forEach(variant => {
      if (variant.size) extractedSizes.add(variant.size);
      if (variant.color) extractedColors.add(variant.color);
      if (variant.price < minPrice) minPrice = variant.price;
      if (variant.price > maxPrice) maxPrice = variant.price;
    });
  });

  const sizes = Array.from(extractedSizes).sort();
  const colors = Array.from(extractedColors);

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
    return (colorName: string) => {
      return colorMap[colorName] || "#CCCCCC"; 
    };
  }, [colorMap]);

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
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedStatus([]);
    setPriceRange({ min: 0, max: 2000000 });
    setSelectedRating(null);
  };

  const hasInStock = products.some(p => 
    p.variants?.some(v => v.stockQuantity > 0)
  );
  const hasOutOfStock = products.some(p => 
    p.variants?.some(v => v.stockQuantity === 0)
  );

  const activeFilterCount = selectedSizes.length + selectedColors.length + selectedStatus.length + (selectedRating ? 1 : 0);

  return (
    <div className="min-w-60 space-y-2 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black uppercase text-[11px] tracking-[0.25em] text-black border-b-2 border-black pb-2 w-fit">
          Filters
        </h3>
        {activeFilterCount > 0 && (
          <button 
            onClick={clearAllFilters}
            className="text-[9px] font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-1"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      <div className="mb-8">
        <div 
          className="flex justify-between items-center py-3 cursor-pointer group"
          onClick={() => toggleMenu("Kích thước")}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Kích thước</span>
          <ChevronDown size={12} className={`transition-transform ${openMenus.includes("Kích thước") ? "rotate-180" : ""}`} />
        </div>
        {openMenus.includes("Kích thước") && (
          <div className="grid grid-cols-3 gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
            {loading ? (
              <div className="col-span-3 text-center text-[10px] text-gray-400">Loading...</div>
            ) : sizes.length === 0 ? (
              <div className="col-span-3 text-center text-[10px] text-gray-400">No sizes available</div>
            ) : (
              sizes.map((s) => (
                <button 
                  key={s} 
                  onClick={() => handleSizeToggle(s)}
                  className={`aspect-square border text-[10px] font-bold transition-all flex items-center justify-center ${
                    selectedSizes.includes(s)
                      ? "bg-black text-white border-black"
                      : "border-gray-200 bg-white hover:bg-black hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <FilterWrapper title="Tình trạng" isOpen={openMenus.includes("Tình trạng")} onToggle={() => toggleMenu("Tình trạng")}>
        <div className="space-y-2 mt-2">
          {hasInStock && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedStatus.includes("in-stock")}
                onChange={() => handleStatusToggle("in-stock")}
                className="w-4 h-4 accent-black border-gray-300 rounded" 
              />
              <span className="text-[10px] font-bold uppercase text-gray-600 group-hover:text-black">Còn hàng</span>
            </label>
          )}
          {hasOutOfStock && (
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedStatus.includes("out-of-stock")}
                onChange={() => handleStatusToggle("out-of-stock")}
                className="w-4 h-4 accent-black border-gray-300 rounded" 
              />
              <span className="text-[10px] font-bold uppercase text-gray-600 group-hover:text-black">Hết hàng</span>
            </label>
          )}
          {!hasInStock && !hasOutOfStock && (
            <p className="text-[10px] text-gray-400">No products available</p>
          )}
        </div>
      </FilterWrapper>

      <FilterWrapper title="Màu sắc" isOpen={openMenus.includes("Màu sắc")} onToggle={() => toggleMenu("Màu sắc")}>
        <div className="flex flex-wrap gap-3 mt-3">
          {loading ? (
            <div className="text-[10px] text-gray-400">Loading...</div>
          ) : colors.length === 0 ? (
            <div className="text-[10px] text-gray-400">No colors available</div>
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
                className={`w-6 h-6 rounded-full transition-all relative shrink-0 ${
                  selectedColors.includes(color) ? "ring-2 ring-offset-2 ring-gray-900" : "hover:opacity-80"
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

      <FilterWrapper title="Khoảng giá" isOpen={openMenus.includes("Khoảng giá")} onToggle={() => toggleMenu("Khoảng giá")}>
        <div className="mt-4 px-2">
          <input 
            type="range" 
            min="0" 
            max="2000000" 
            value={priceRange.max}
            onChange={handlePriceChange}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" 
          />
          <div className="flex justify-between mt-2 text-[9px] font-bold text-gray-400 uppercase">
            <span>0đ</span>
            <span>{Math.max(...products.flatMap(p => p.variants?.map(v => v.price) ?? [])).toLocaleString()}đ</span>
          </div>
          <div className="mt-3 text-[10px] font-bold text-gray-600">
            Max giá: <span className="text-black">{priceRange.max.toLocaleString()}đ</span>
          </div>
        </div>
      </FilterWrapper>

      <FilterWrapper title="Đánh giá" isOpen={openMenus.includes("Đánh giá")} onToggle={() => toggleMenu("Đánh giá")}>
        <div className="space-y-2 mt-3">
          {[5, 4, 3, 2, 1].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              className={`w-full text-left flex items-center gap-1 p-2 rounded transition-colors ${
                selectedRating === star 
                  ? "bg-black text-white" 
                  : "hover:bg-gray-100"
              }`}
            >
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={10} 
                  fill={i < star ? (selectedRating === star ? "white" : "black") : "none"} 
                  className={i < star ? (selectedRating === star ? "text-white" : "text-black") : "text-gray-200"} 
                />
              ))}
              <span className={`text-[9px] font-bold ml-1 ${
                selectedRating === star ? "text-white" : "text-gray-400"
              }`}>
                {star} sao
              </span>
            </button>
          ))}
        </div>
      </FilterWrapper>
    </div>
  );
};

const FilterWrapper = ({ title, children, isOpen, onToggle }: any) => (
  <div className="border-b border-gray-100 py-4 transition-all">
    <div className="flex justify-between items-center cursor-pointer group" onClick={onToggle}>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-black">{title}</span>
      <ChevronDown size={12} className={`text-gray-300 transition-transform ${isOpen ? "rotate-180" : ""}`} />
    </div>
    {isOpen && <div className="animate-in fade-in duration-300">{children}</div>}
  </div>
);

export default SidebarFilters;