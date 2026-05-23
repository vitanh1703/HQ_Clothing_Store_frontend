import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE, cartApi, promotionsApi } from "../services/api";
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
      const res = await axios.get(`${API_BASE}/cart/${userId}`);
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

  const handleQuantity = (id: number, newQuantity: number) => {
    if (!cart) return;

    const qty = Math.max(newQuantity, 1);
    const updatedItems = cart.items.map(item =>
      item.id === id
        ? { ...item, quantity: qty, total: qty * item.price }
        : item
    );
    setCart({ ...cart, items: updatedItems });
  };

  const handleRemove = async (id: number) => {
    const confirmDelete = window.confirm("Bạn có muốn xóa sản phẩm khỏi giỏ hàng không?");
    if (!confirmDelete) return;

    try {
      await cartApi.remove(id);
      if (!cart) return;
      const updatedItems = cart.items.filter(item => item.id !== id);
      setCart({ ...cart, items: updatedItems });
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
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

  const selectedCartItems = useMemo(() => {
    return cart?.items.filter(item => selectedItems.includes(item.id)) || [];
  }, [cart?.items, selectedItems]);

  const totalPrice = useMemo(() => {
    return selectedCartItems.reduce((sum, item) => sum + item.total, 0);
  }, [selectedCartItems]);

  const discountAmount = useMemo(() => {
    if (!promoResult) return 0;
    return promoResult.discountType === "Percentage"
      ? Math.round((totalPrice * promoResult.discountValue) / 100)
      : Math.min(promoResult.discountValue, totalPrice);
  }, [promoResult, totalPrice]);

  const totalAfterDiscount = totalPrice - discountAmount;

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-4 py-6 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black uppercase mb-6 text-gray-900 tracking-tight">Giỏ Hàng</h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mb-4"></div>
            <p className="text-sm text-gray-500">Đang tải sản phẩm...</p>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="bg-white p-8 md:p-12 text-center rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 mb-6">Giỏ hàng trống. Hãy mua sắm thêm sản phẩm phong cách mới!</p>
            <button onClick={() => navigate("/home")} className="px-6 py-3 bg-black text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all">
              Khám phá ngay
            </button>
          </div>
        ) : (
          // CẤU TRÚC GRID CO GIÃN ĐA THIẾT BỊ (1 cột trên mobile, 3 cột trên PC)
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Táp bên trái: Chi tiết danh sách sản phẩm */}
            <div className="lg:col-span-2 space-y-4">
              {/* Checkbox chọn tất cả */}
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-xs">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === cart.items.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 cursor-pointer accent-black rounded"
                  />
                  <span className="text-sm md:text-base font-bold text-gray-800">
                    Chọn tất cả ({selectedItems.length}/{cart.items.length})
                  </span>
                </div>
              </div>

              {/* Lặp sản phẩm bọc Responsive Flexbox */}
              {cart.items.map(item => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/products/${item.productId}`, { state: { from: "cart" } })}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-gray-100 p-4 rounded-xl hover:shadow-md transition duration-300 gap-4 cursor-pointer relative group"
                >
                  {/* Nhóm Checkbox + Ảnh + Thông tin chữ */}
                  <div className="flex items-center gap-3 md:gap-4 w-full sm:flex-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelectItem(item.id)}
                      className="w-4 h-4 cursor-pointer accent-black shrink-0"
                    />
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-20 h-24 md:w-24 md:h-28 object-cover rounded-lg border border-gray-100 shrink-0 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-sm md:text-base text-gray-900 mb-1 line-clamp-2 pr-4">
                        {item.productName}
                      </h2>
                      <p className="text-xs md:text-sm text-gray-500 font-medium space-x-2">
                        <span>Size: <b className="text-gray-800">{item.size}</b></span> 
                        <span>|</span> 
                        <span>Màu: <b className="text-gray-800">{item.color}</b></span>
                      </p>
                      {/* Giá tiền ẩn trên PC - hiện trên Mobile */}
                      <p className="text-sm font-bold text-red-500 mt-1 block sm:hidden">
                        {item.price.toLocaleString()}đ
                      </p>
                    </div>
                  </div>

                  {/* Nhóm Bộ điều khiển số lượng + Tổng tiền */}
                  <div className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0 sm:gap-8 border-t border-gray-50 sm:border-t-0 pt-3 sm:pt-0">
                    {/* Giá gốc hiển thị trên PC */}
                    <p className="text-base font-semibold text-gray-900 hidden sm:block w-24 text-right">
                      {item.price.toLocaleString()}đ
                    </p>
                    
                    {/* Thanh cộng trừ số lượng */}
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
                      <button
                        className="w-7 h-7 bg-white rounded border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 transition active:scale-90"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.quantity === 1) handleRemove(item.id);
                          else handleQuantity(item.id, item.quantity - 1);
                        }}
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                      <button
                        className="w-7 h-7 bg-white rounded border border-gray-200 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 transition active:scale-90"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantity(item.id, item.quantity + 1);
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Tổng tiền cụ thể của item đó */}
                    <div className="text-right flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                      <p className="font-bold text-base text-red-500">
                        {item.total.toLocaleString()}đ
                      </p>
                      <button
                        className="text-xs font-bold text-gray-400 hover:text-red-500 hover:underline transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item.id);
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Táp bên phải: Khung tổng kết hóa đơn thanh toán (Sticky ghim theo màn hình) */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-100 p-5 md:p-6 rounded-xl shadow-sm space-y-6 sticky top-6">
                <h2 className="text-lg md:text-xl font-black uppercase text-gray-900 border-b pb-3">Tóm Tắt Đơn Hàng</h2>

                {/* Khung Voucher xử lý mượt mà trên Mobile */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700">Mã Giảm Giá</label>
                    <button
                      onClick={() => setShowPromoModal(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                    >
                      Chọn từ danh sách
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      placeholder="Nhập mã ưu đãi..."
                      className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black transition"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo}
                      className="text-xs font-bold px-4 bg-black text-white uppercase tracking-wider rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      Áp Dụng
                    </button>
                  </div>
                  
                  {/* Alert mã giảm giá thành công */}
                  {promoResult && (
                    <div className="text-xs bg-green-50 border border-green-100 p-3 rounded-lg text-green-800 flex items-center justify-between gap-2 animate-fade-in">
                      <div>
                        <p className="font-bold text-green-700">Đã áp dụng: {promoResult.code}</p>
                        <p className="text-gray-600 mt-0.5">{promoResult.description}</p>
                      </div>
                      <button onClick={clearPromo} className="text-xs font-bold text-red-500 hover:underline shrink-0">
                        Xóa
                      </button>
                    </div>
                  )}
                  {promoMessage && !promoResult && (
                    <p className="text-xs font-medium text-orange-600 bg-orange-50 p-2 rounded-md">{promoMessage}</p>
                  )}
                </div>

                {/* Khung tính toán hiển thị hóa đơn */}
                <div className="space-y-3 pt-2 border-t border-gray-50 text-sm font-medium text-gray-600">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span className="text-gray-900 font-bold">{totalPrice.toLocaleString()}đ</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá voucher</span>
                      <span className="font-bold">-{discountAmount.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Phí giao hàng</span>
                    <span className="text-green-600 font-bold">Miễn phí</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                    <span className="font-bold text-gray-900 text-base">Tổng cộng</span>
                    <span className="font-black text-xl text-red-500">{totalAfterDiscount.toLocaleString()}đ</span>
                  </div>
                </div>

                {/* Nút bấm hành động chốt thanh toán */}
                <button
                  disabled={selectedItems.length === 0}
                  onClick={() => {
                    if (selectedItems.length === 0) return;
                    navigate("/checkout", {
                      state: {
                        items: selectedCartItems,
                        promo: promoResult,
                        total: totalPrice
                      }
                    });
                  }}
                  className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-800 transition active:scale-98 disabled:bg-gray-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {selectedItems.length === 0 ? "Chọn sản phẩm thanh toán" : `Tiến hành thanh toán (${selectedItems.length})`}
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