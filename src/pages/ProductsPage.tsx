import { useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import SidebarFilters, { type FilterState } from "../components/SidebarFilters";
import { useProducts, useCart, useCategories } from "../services/hooks";
import { productApi, type ReviewResponse } from "../services/api";

type RatingBucketMap = Record<number, number>;

const buildRatingBucketMap = (summaries: Record<number, ReviewResponse>): RatingBucketMap =>
  Object.fromEntries(
    Object.entries(summaries).map(([productId, summary]) => [
      Number(productId),
      Math.round(summary.averageRating),
    ])
  );

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryIdParam = searchParams.get("category");
  const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;
  const { products, loading, error } = useProducts(categoryId);
  const { categories } = useCategories();
  const { addToCart } = useCart();
  const itemsPerPage = 9;
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    sizes: [],
    colors: [],
    minPrice: 0,
    maxPrice: 2000000,
    status: [],
    minRating: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<string>("default");

  // Rating summaries from product detail API
  const [productReviewSummaries, setProductReviewSummaries] = useState<Record<number, ReviewResponse>>({});
  const [ratingLoading, setRatingLoading] = useState(false);

  // Fetch rating summaries using the same API as the product detail page
  useEffect(() => {
    const fetchReviewSummaries = async () => {
      setRatingLoading(true);
      try {
        const summaries = await Promise.all(
          products.map(async (product) => {
            try {
              const summary = await productApi.getReviewSummary(product.id);
              return [product.id, summary] as const;
            } catch (error) {
              console.error(`Error fetching rating summary for product ${product.id}:`, error);
              return [product.id, { averageRating: 0, totalReviews: 0, reviews: [] }] as const;
            }
          })
        );

        setProductReviewSummaries(Object.fromEntries(summaries));
      } catch (error) {
        console.error("Error fetching product review summaries:", error);
        setProductReviewSummaries({});
      } finally {
        setRatingLoading(false);
      }
    };

    if (products.length > 0) {
      fetchReviewSummaries();
    } else {
      setProductReviewSummaries({});
    }
  }, [products]);

  const selectedCategory = categories.find((category) => category.id === categoryId);

  const productRatingBuckets = useMemo(
    () => buildRatingBucketMap(productReviewSummaries),
    [productReviewSummaries]
  );

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (filters.minRating !== null && ratingLoading) {
        return true;
      }

      // Lọc đánh giá theo điểm trung bình của sản phẩm, làm tròn về đúng 1 bucket sao
      if (filters.minRating !== null) {
        const ratingBucket = productRatingBuckets[product.id];
        if (ratingBucket !== filters.minRating) {
          return false;
        }
      }

      // Check if any filters are active
      const hasActiveFilters = 
        filters.sizes.length > 0 ||
        filters.colors.length > 0 ||
        filters.minPrice > 0 ||
        filters.maxPrice < 2000000 ||
        filters.status.length > 0;

      // If no filters active, show all products
      if (!hasActiveFilters) {
        return true;
      }

      // Check if product has any variants that match the filters
      const hasMatchingVariant = product.variants?.some(variant => {
        // Check size filter
        if (filters.sizes.length > 0 && !filters.sizes.includes(variant.size)) {
          return false;
        }
        
        // Check color filter
        if (filters.colors.length > 0 && !filters.colors.includes(variant.color)) {
          return false;
        }
        
        // Check price filter
        if (Number(variant.price) < filters.minPrice || Number(variant.price) > filters.maxPrice) {
          return false;
        }

        // Check status filter based on stock_quantity
        if (filters.status.length > 0) {
          const isInStock = Number(variant.stockQuantity) > 0;
          const isOutOfStock = Number(variant.stockQuantity) === 0;
          
          const matchesStatus = filters.status.some(status => {
            if (status === "in-stock" && isInStock) return true;
            if (status === "out-of-stock" && isOutOfStock) return true;
            return false;
          });

          if (!matchesStatus) {
            return false;
          }
        }
        
        return true;
      });
      
      return hasMatchingVariant ?? false;
    });
  }, [products, filters, productRatingBuckets]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (sortOrder === "price-asc") {
      sorted.sort((a, b) => {
        const minPriceA = a.variants?.length ? Math.min(...a.variants.map(v => Number(v.price))) : 0;
        const minPriceB = b.variants?.length ? Math.min(...b.variants.map(v => Number(v.price))) : 0;
        return minPriceA - minPriceB;
      });
    } else if (sortOrder === "price-desc") {
      sorted.sort((a, b) => {
        const minPriceA = a.variants?.length ? Math.min(...a.variants.map(v => Number(v.price))) : 0;
        const minPriceB = b.variants?.length ? Math.min(...b.variants.map(v => Number(v.price))) : 0;
        return minPriceB - minPriceA;
      });
    }
    return sorted;
  }, [filteredProducts, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage));

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, filters.sizes, filters.colors, filters.minPrice, filters.maxPrice, filters.status, filters.minRating, sortOrder]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleCategoryClick = (id?: number) => {
    if (id) {
      searchParams.set("category", id.toString());
    } else {
      searchParams.delete("category");
    }
    setSearchParams(searchParams);
  };

  if (error) return <div className="h-screen flex items-center justify-center text-red-500 uppercase font-black tracking-tight">Error: {error}</div>;

  return (
    <div className="bg-[#F8F8F8] min-h-screen lg:h-screen overflow-hidden flex flex-col font-sans px-4 lg:px-10 py-4 lg:py-6">
      <header className="mb-8 shrink-0">
        <div className="text-[9px] text-gray-400 font-bold tracking-[0.2em] uppercase mb-1">Home / Shop</div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-3xl font-black text-[#1A1A1A] uppercase tracking-tighter italic">
              SẢN PHẨM
            </h1>
            {selectedCategory && (
              <p className="text-sm uppercase mt-2 text-gray-500">
                Danh mục: <span className="font-bold text-black">{selectedCategory.name}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Sắp xếp:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border border-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-widest px-3 py-2 outline-none focus:border-black transition-colors bg-white text-black cursor-pointer"
            >
              <option value="default">Mặc định</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
            </select>
          </div>
        </div>
        
        {/* Danh mục sản phẩm */}
        <div className="flex gap-3 overflow-x-auto pt-6 scrollbar-hide">
          <button
            onClick={() => handleCategoryClick()}
            className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${
              !categoryId
                ? "bg-black text-white shadow-lg"
                : "bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black"
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${
                categoryId === cat.id
                  ? "bg-black text-white shadow-lg"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 flex-1 overflow-hidden relative">
        
        <aside className="shrink-0 lg:overflow-y-auto scrollbar-hide w-full lg:w-64">
          <SidebarFilters 
            products={products}
            onFilterChange={setFilters}
            loading={loading}
          />
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-4 pb-24 scrollbar-thin">
            {loading ? (
              <div className="flex h-full items-center justify-center text-[11px] font-black uppercase tracking-[0.4em] text-gray-300 animate-pulse">Loading Collection...</div>
            ) : sortedProducts.length === 0 ? (
              <div className="flex h-full items-center justify-center flex-col gap-4">
                <div className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-300">
                  Không có sản phẩm phù hợp
                </div>
                <p className="text-[10px] text-gray-400">
                  Vui lòng thử lại với các bộ lọc khác
                </p>
              </div>
            ) : (
              <>
                <div className="text-[9px] text-gray-400 font-bold mb-4">
                  Tìm thấy <span className="text-black font-bold">{sortedProducts.length}</span> sản phẩm
                </div>
                <div className="grid gap-x-10 gap-y-14 transition-all duration-700 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {paginatedProducts.map((item) => (
                    <div key={item.id} className="hover:-translate-y-2 transition-transform duration-500">
                      <ProductCard product={item} onAddToCart={addToCart} />
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-3 pb-6">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="rounded-full border border-gray-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Trước
                    </button>
                    <div className="rounded-full bg-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                      Trang {currentPage}/{totalPages}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-full border border-gray-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;