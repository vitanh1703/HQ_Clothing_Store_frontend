import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { cartApi, promotionsApi } from "../services/api";
import type { PromotionItem, PromotionValidationResult } from "../services/api";
import { PromoSelectionModal } from "../components/PromoSelectionModal";

interface CartItem {
  id: number;
  variantId: number;
  productId: number;
  productName: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  total: number;
  image: string;
}

interface CartResponse {
  cartId: number;
  items: CartItem[];
}

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoResult, setPromoResult] = useState<PromotionValidationResult | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const userId = Number(sessionStorage.getItem("userId"));

  useEffect(() => {
    if (!userId) {
      navigate("/auth");
      return;
    }
    fetchCart();
    fetchPromotions();
    restorePromo();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`https://localhost:7137/api/cart/${userId}`);
      setCart(res.data);
    } catch (err) {
      console.error("Lỗi lấy cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      const data = await promotionsApi.getAll();
      setPromotions(data);
    } catch (err) {
      console.error("Lỗi lấy danh sách mã giảm giá:", err);
    }
  };

  const restorePromo = () => {
    const stored = sessionStorage.getItem("selectedPromo");
    if (!stored) return;

    try {
      const parsed: PromotionValidationResult = JSON.parse(stored);
      setPromoCode(parsed.code);
      setPromoResult(parsed);
      setPromoMessage(`Mã ${parsed.code} đã được áp dụng.`);
    } catch {
      sessionStorage.removeItem("selectedPromo");
    }
  };

  // --- Cập nhật số lượng item ---
  const handleQuantity = (id: number, newQuantity: number) => {
    if (!cart) return;

    const qty = Math.max(newQuantity, 1); // số lượng tối thiểu 1
    const updatedItems = cart.items.map(item =>
      item.id === id
        ? { ...item, quantity: qty, total: qty * item.price }
        : item
    );
    setCart({ ...cart, items: updatedItems });
  };

  // --- Xóa sản phẩm ---
  const handleRemove = async (id: number) => {
    const confirmDelete = window.confirm("Bạn có muốn xóa sản phẩm khỏi giỏ hàng không?");
    if (!confirmDelete) return;

    try {
      await cartApi.remove(id);
      if (!cart) return;
      const updatedItems = cart.items.filter(item => item.id !== id);
      setCart({ ...cart, items: updatedItems });
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      alert("Không thể xóa sản phẩm khỏi giỏ hàng");
    }
  };
  const toggleSelectItem = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };
  const toggleSelectAll = () => {
    if (!cart) return;

    if (selectedItems.length === cart.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.items.map(item => item.id));
    }
  };
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoMessage("Vui lòng nhập mã giảm giá.");
      return;
    }

    setIsApplyingPromo(true);
    try {
      const result = await promotionsApi.validateCode(promoCode.trim());
      setPromoResult(result);
      setPromoMessage(`Áp dụng mã ${result.code} thành công!`);
      sessionStorage.setItem("selectedPromo", JSON.stringify(result));
    } catch (err: any) {
      setPromoResult(null);
      setPromoMessage(err.response?.data?.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn.");
      sessionStorage.removeItem("selectedPromo");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleSelectPromo = async (promo: PromotionItem) => {
    setPromoCode(promo.code);
    setShowPromoModal(false);
    try {
      const result = await promotionsApi.validateCode(promo.code);
      setPromoResult(result);
      setPromoMessage(`Áp dụng mã ${result.code} thành công!`);
      sessionStorage.setItem("selectedPromo", JSON.stringify(result));
    } catch (err: any) {
      setPromoResult(null);
      setPromoMessage(err.response?.data?.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn.");
      sessionStorage.removeItem("selectedPromo");
    }
  };

  const clearPromo = () => {
    setPromoCode("");
    setPromoResult(null);
    setPromoMessage("");
    sessionStorage.removeItem("selectedPromo");
  };

  const selectedCartItems = cart?.items.filter(item =>
    selectedItems.includes(item.id)
  ) || [];

  const totalPrice = selectedCartItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = promoResult
      ? promoResult.discountType === "Percentage"
        ? Math.round((totalPrice * promoResult.discountValue) / 100)
        : Math.min(promoResult.discountValue, totalPrice)
      : 0;
    const totalAfterDiscount = totalPrice - discountAmount;

  return (
    <div className="min-h-screen bg-white px-6 py-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Giỏ Hàng</h1>

        {loading ? (
          <p className="text-sm text-gray-500">Đang tải...</p>
        ) : !cart || cart.items.length === 0 ? (
          <p className="text-sm text-gray-500">Giỏ hàng trống. Hãy mua sắm thêm sản phẩm!</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Danh sách sản phẩm */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={cart && selectedItems.length === cart.items.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-base font-medium text-gray-700">Chọn tất cả ({cart.items.length})</span>
                </div>
              </div>

              {/* Product Items */}
              {cart.items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white border border-gray-200 p-5 rounded-lg hover:shadow-md transition duration-300 cursor-pointer"
                  onClick={() =>
                navigate(`/products/${item.productId}`, {
                  state: { from: "cart" }
                })
              }
                >
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelectItem(item.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-24 h-28 object-cover rounded-lg border border-gray-200 cursor-pointer"
                      onClick={() => navigate(`/product/${item.productId}`)}
                    />
                    <div className="flex-1 flex flex-col justify-between min-h-28">
                      <div>
                        <h2 className="font-semibold text-base text-gray-900 mb-2">{item.productName}</h2>
                        <p className="text-sm text-gray-600 space-x-3"><span>Size: {item.size}</span> <span>|</span> <span>Màu: {item.color}</span></p>
                      </div>
                      <p className="text-base font-semibold text-red-600 mt-2">{item.price.toLocaleString()}đ</p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mr-6">
                    <button
                      className="w-9 h-9 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.quantity === 1) {
                          handleRemove(item.id);
                        } else {
                          handleQuantity(item.id, item.quantity - 1);
                        }
                      }}
                    >
                      <span className="text-base font-medium">−</span>
                    </button>
                    <span className="w-8 text-center text-base font-medium">{item.quantity}</span>
                    <button
                      className="w-9 h-9 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantity(item.id, item.quantity + 1);
                      }}
                    >
                      <span className="text-base font-medium">+</span>
                    </button>
                  </div>

                  {/* Total & Delete */}
                  <div className="flex flex-col items-end gap-3">
                    <p className="font-semibold text-base text-red-600">{item.total.toLocaleString()}đ</p>
                    <button
                      className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.id);
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm Tắt Đơn Hàng</h2>

                {/* Promo Section */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <label className="text-base font-medium text-gray-800">Mã Giảm Giá</label>
                    <button
                      onClick={() => setShowPromoModal(true)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                    >
                      Chọn Mã
                    </button>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      placeholder="Nhập mã..."
                      className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo}
                      className="text-sm font-medium px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
                    >
                      {isApplyingPromo ? "..." : "Áp Dụng"}
                    </button>
                  </div>
                  {promoResult && (
                    <div className="text-sm bg-green-50 border border-green-200 p-3 rounded-lg text-green-800">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">{promoResult.code}</p>
                          <p>{promoResult.description}</p>
                        </div>
                        <button
                          onClick={clearPromo}
                          className="text-green-600 hover:text-green-700 underline whitespace-nowrap"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  )}
                  {promoMessage && !promoResult && (
                    <p className="text-sm text-gray-600">{promoMessage}</p>
                  )}
                </div>

                {/* Pricing */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Tạm Tính</span>
                    <span className="font-medium text-gray-900">{totalPrice.toLocaleString()}đ</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-base text-green-600">
                      <span>Giảm Giá</span>
                      <span className="font-medium">-{discountAmount.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Vận Chuyển</span>
                    <span className="font-medium text-gray-900">Miễn Phí</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="font-bold text-gray-900">Tổng Cộng</span>
                    <span className="font-bold text-xl text-gray-900">{totalAfterDiscount.toLocaleString()}đ</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  className="w-full bg-black text-white py-3 rounded-lg font-medium text-base hover:bg-gray-900 transition disabled:opacity-50"
                  disabled={selectedItems.length === 0}
                  onClick={() => {
                  if (selectedItems.length === 0) {
                    alert("Vui lòng chọn ít nhất 1 sản phẩm");
                    return;
                  }
                  navigate("/checkout", {
                    state: {
                      items: selectedCartItems,
                      promo: promoResult,
                      total: totalPrice
                    }
                  });
                }}
                >
                  {selectedItems.length === 0 ? "Chọn Sản Phẩm" : `Thanh Toán (${selectedItems.length})`}
                </button>
              </div>
            </div>
          </div>
        )}

        <PromoSelectionModal
          isOpen={showPromoModal}
          onClose={() => setShowPromoModal(false)}
          promotions={promotions}
          onSelectPromo={handleSelectPromo}
        />
      </div>
    </div>
  );
};

export default CartPage;