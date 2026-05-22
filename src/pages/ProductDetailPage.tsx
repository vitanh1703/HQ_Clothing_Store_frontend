﻿import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";

interface Variant {
  id: number;
  size: string;
  color: string;
  price: number;
  stockQuantity: number;
}

interface Product {
  id: number;
  name: string;
  brandText?: string;
  description?: string;
  imageUrl?: string;
  variants: Variant[];
}

interface ReviewItem {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  userName: string;
}

interface ReviewResponse {
  averageRating: number;
  totalReviews: number;
  reviews: ReviewItem[];
}

const API_BASE = "https://localhost:7137/api";

const renderStars = (rating: number) => {
  const rounded = Math.round(rating);
  return (
    <span className="text-yellow-500" aria-label={`${rating} sao`}>
      {"\u2605".repeat(rounded)}
      <span className="text-gray-300">{"\u2605".repeat(5 - rounded)}</span>
    </span>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviewsData, setReviewsData] = useState<ReviewResponse>({
    averageRating: 0,
    totalReviews: 0,
    reviews: [],
  });
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    axios
      .get(`${API_BASE}/products/${id}`)
      .then((productRes) => {
        setProduct(productRes.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Không tải được sản phẩm");
      })
      .finally(() => setLoading(false));

    axios
      .get(`${API_BASE}/products/${id}/reviews`)
      .then((reviewsRes) => {
        setReviewsData(reviewsRes.data);
      })
      .catch((err) => {
        console.error("Không tải được reviews:", err);
        setReviewsData({
          averageRating: 0,
          totalReviews: 0,
          reviews: [],
        });
      });
  }, [id]);

  if (loading) return <div className="py-20 text-center">Đang tải sản phẩm...</div>;
  if (error) return <div className="py-20 text-center text-red-500">{error}</div>;
  if (!product) return null;

  const availableColors = Array.from(new Set(product.variants.map((v) => v.color)));
  const allSizes = Array.from(new Set(product.variants.map((v) => v.size)));

  const availableSizes = selectedColor
    ? product.variants.filter((v) => v.color === selectedColor).map((v) => v.size)
    : allSizes;

  const selectedVariant =
    selectedColor && selectedSize
      ? product.variants.find((v) => v.color === selectedColor && v.size === selectedSize) || null
      : null;

  const handleQuantity = (type: "plus" | "minus") => {
    if (type === "plus") {
      const maxStock = selectedVariant?.stockQuantity || 99;
      if (quantity < maxStock) setQuantity((q) => q + 1);
    } else if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      alert("Vui lòng chọn màu và size!");
      return;
    }

    if (!selectedVariant) {
      alert("Variant không hợp lệ!");
      return;
    }

    const userId = Number(sessionStorage.getItem("userId"));

    if (!userId) {
      alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate("/auth");
      return;
    }

    try {
      await axios.post(`${API_BASE}/cart/add`, {
        userId,
        variantId: selectedVariant.id,
        quantity,
      });

      alert("Đã thêm vào giỏ hàng!");
      navigate("/cart");
    } catch (err) {
      console.error(err);
      alert("Lỗi thêm giỏ hàng!");
    }
  };

  return (
    <div>
      {/* Back Button Bar */}
      <div className="w-full border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <button
            onClick={() => {
              if (from === "cart") navigate("/cart");
              else if (from === "products") navigate("/products");
              else navigate(-1);
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-black"
          >
            <span className="text-lg">‹</span>
            TRỞ LẠI
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl p-6">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex-1">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full rounded object-cover"
            />
          </div>

          <div className="flex flex-1 flex-col gap-4">
          <h1 className="text-2xl font-bold uppercase">{product.name}</h1>
          <p className="text-gray-500">{product.brandText || "H&Q"}</p>

          <div className="flex items-center gap-2 text-sm">
            {renderStars(reviewsData.averageRating)}
            <span className="font-semibold">{reviewsData.averageRating.toFixed(1)}</span>
            <span className="text-gray-500">({reviewsData.totalReviews} đánh giá)</span>
          </div>

          <p className="mt-2">{product.description}</p>

          <p className="mt-4 text-xl font-bold text-red-600">
            {(selectedVariant ? selectedVariant.price : product.variants[0]?.price)?.toLocaleString()}đ
          </p>

          <div className="mt-2 flex gap-2">
            <span className="text-sm font-medium">Màu sắc:</span>
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  if (
                    selectedSize &&
                    !product.variants.some((v) => v.color === color && v.size === selectedSize)
                  ) {
                    setSelectedSize(null);
                  }
                }}
                className={`rounded border px-3 py-1 text-xs font-bold ${
                  selectedColor === color ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                {color}
              </button>
            ))}
          </div>

          <div className="mt-2 flex gap-2">
            <span className="text-sm font-medium">Size:</span>
            {allSizes.map((size) => {
              const isAvailable = !selectedColor || availableSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => isAvailable && setSelectedSize(size)}
                  disabled={!isAvailable}
                  className={`rounded border px-3 py-1 text-xs font-bold ${
                    selectedSize === size ? "bg-black text-white" : "bg-white text-black"
                  } ${!isAvailable ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {size}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-4">
            <button onClick={() => handleQuantity("minus")} className="border px-2">
              -
            </button>
            <span>{quantity}</span>
            <button onClick={() => handleQuantity("plus")} className="border px-2">
              +
            </button>
          </div>

          <button
            className="mt-4 rounded bg-black px-6 py-2 text-white hover:bg-gray-800"
            onClick={handleAddToCart}
          >
            Thêm vào giỏ hàng
          </button>
        </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-2xl font-bold">Đánh giá sản phẩm</h2>
            <div className="flex items-center gap-2 text-sm">
              {renderStars(reviewsData.averageRating)}
              <span className="font-semibold">{reviewsData.averageRating.toFixed(1)}</span>
              <span className="text-gray-500">({reviewsData.totalReviews} đánh giá)</span>
            </div>
          </div>

          {reviewsData.reviews.length === 0 ? (
            <p className="text-gray-500">
              Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này.
            </p>
          ) : (
            <div className="space-y-6">
              {reviewsData.reviews.map((review) => (
                <div key={review.id} className="border-b pb-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{review.userName}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        {renderStars(review.rating)}
                        <span>{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p className="mt-3 text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
