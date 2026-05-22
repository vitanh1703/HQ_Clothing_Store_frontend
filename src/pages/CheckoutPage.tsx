import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { promotionsApi } from "../services/api";
import type { CheckoutCartItem, CheckoutResponse, PromotionItem, PromotionValidationResult } from "../services/api";
import { PromoSelectionModal } from "../components/PromoSelectionModal";
import { checkoutController } from "../services/controller";
import axios from "axios";
import { useLocation } from "react-router-dom";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const location = useLocation();
  const selectedItems = location.state?.items || [];
  const promoFromCart = location.state?.promo || null;
  const totalFromCart = location.state?.total || 0;
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoResult, setPromoResult] = useState<PromotionValidationResult | null>(null);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "vnpay" | "cod">("bank");

  const userId = Number(sessionStorage.getItem("userId"));

  useEffect(() => {
    if (!userId) {
      navigate("/auth");
      return;
    }
    if (!selectedItems || selectedItems.length === 0) {
      navigate("/cart");
      return;
    }

    // set data từ cart
  setCheckoutData({
    id: 0,
    orderCode: "",
    cartId: 0,
    items: selectedItems,
    user: {
      fullName: "",
      email: "",
      phone: "",
      address: ""
    }
  });

  // set promo nếu có
  if (promoFromCart) {
    setPromoResult(promoFromCart);
    setPromoCode(promoFromCart.code);
    setPromoMessage(`Mã ${promoFromCart.code} đã được áp dụng.`);
  }

  // fetch thêm danh sách mã giảm giá
  const fetchPromotions = async () => {
    try {
      const data = await promotionsApi.getAll();
      setPromotions(data);
    } catch (err) {
      console.error("Lỗi lấy danh sách mã giảm giá:", err);
    }
  };

  fetchPromotions();

  setLoading(false);
}, []);

  const totalPrice = totalFromCart;

  const discountAmount = useMemo(() => {
    if (!promoResult) return 0;
    if (promoResult.discountType === "Percentage") {
      return Math.round((totalPrice * promoResult.discountValue) / 100);
    }
    return Math.min(promoResult.discountValue, totalPrice);
  }, [promoResult, totalPrice]);

  const shippingCost = 0;
  const taxAmount = 0;
  const totalAfterDiscount = totalPrice - discountAmount + shippingCost + taxAmount;

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoMessage("Vui lòng nhập mã giảm giá.");
      return;
    }

    try {
      const result = await promotionsApi.validateCode(promoCode.trim());
      setPromoResult(result);
      setPromoMessage(`Áp dụng mã ${result.code} thành công!`);
      sessionStorage.setItem("selectedPromo", JSON.stringify(result));
    } catch (err: any) {
      setPromoResult(null);
      setPromoMessage(err.response?.data?.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn.");
      sessionStorage.removeItem("selectedPromo");
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

  const handlePlaceOrder = async () => { 
    if (!checkoutData || checkoutData.items.length === 0) {
      return alert("Không có sản phẩm nào để thanh toán.");
    }
    
    const validation = checkoutController.validateCheckout(form);
    if (!validation.success) {
      return alert(validation.message);
    }

    try {
      const orderPayload = {
        userId: userId,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        totalAmount: totalAfterDiscount,
        items: checkoutData.items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          priceAtPurchase: item.price
        }))
      };

      const response = await axios.post("https://localhost:7137/api/orders/create", orderPayload);
      const savedOrder = response.data; 

      if (paymentMethod === "vnpay") {
        const paymentRes = await axios.post("https://localhost:7137/api/payment/create-payment", {
          orderId: savedOrder.id,
          amount: totalAfterDiscount
        });
        window.location.href = paymentRes.data.url;
      } else if (paymentMethod === "bank") {
        navigate("/payment", {
          state: {
            checkoutData: {
              ...checkoutData,
              orderCode: savedOrder.orderCode,
              id: savedOrder.id
            },
            totalAmount: totalAfterDiscount,
            form
          }
        });
      } else {
        alert(`Đã tạo đơn hàng thành công! Mã đơn: ${savedOrder.orderCode}. Cảm ơn bạn.`);
        navigate("/home");
      }
    } catch (error: any) {
      console.error("Lỗi tạo đơn hàng:", error);
      alert("Không thể tạo đơn hàng. Vui lòng thử lại sau!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin checkout...</p>
        </div>
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen p-10 bg-[#F5F5F5]">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-10 text-center">
          <p className="text-lg text-gray-700">Không tìm thấy thông tin đặt hàng. Vui lòng kiểm tra lại giỏ hàng.</p>
          <button
            onClick={() => navigate("/cart")}
            className="mt-6 px-6 py-3 bg-black text-white rounded-lg uppercase tracking-[0.2em]"
          >
            Quay lại giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-6 py-8">
      <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black uppercase">Thanh Toán</h1>
              <p className="text-gray-500 mt-1">Xác nhận thông tin đơn hàng và địa chỉ giao hàng.</p>
            </div>
          </div>

          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Thông tin người đặt</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className=" text-sm text-gray-700">
                 <div className="flex items-center">
                    Họ và tên<span className="text-red-500 ml-1">*</span>
                  </div>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => handleChange("fullName", e.target.value)}
                  className="mt-2 rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </label>
              <label className="flex flex-col text-sm text-gray-700">
                <div className="flex items-center">
                    Email<span className="text-red-500 ml-1">*</span>
                  </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange("email", e.target.value)}
                  className="mt-2 rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </label>
              <label className="flex flex-col text-sm text-gray-700">
                <div className="flex items-center">
                    Số điện thoại <span className="text-red-500 ml-1">*</span>
                  </div>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => handleChange("phone", e.target.value)}
                  className="mt-2 rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </label>
              <label className="flex flex-col text-sm text-gray-700 md:col-span-2">
                <div className="flex items-center">
                    Địa chỉ giao hàng<span className="text-red-500 ml-1">*</span>
                  </div>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => handleChange("address", e.target.value)}
                  className="mt-2 rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Sản phẩm trong đơn</h2>
            <div className="space-y-4">
              {checkoutData.items.map((item: CheckoutCartItem) => (
                <div key={item.id} className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.productName} className="h-20 w-20 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold">{item.productName}</p>
                      <p className="text-gray-500 text-sm">Size: {item.size}</p>
                      <p className="text-gray-500 text-sm">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.total.toLocaleString()}đ</p>
                    <p className="text-sm text-gray-500">{item.price.toLocaleString()}đ / cái</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold mb-4">Mã giảm giá</h2>
              <button
                onClick={() => setShowPromoModal(true)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Chọn mã
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  type="text"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  placeholder="Nhập mã"
                  className="min-w-45 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  onClick={handleApplyPromo}
                  className="rounded-lg bg-black text-white px-4 py-2 text-sm uppercase tracking-[0.15em] hover:bg-gray-900 transition-colors"
                >
                  Áp dụng
                </button>
              </div>
              {promoResult && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold">{promoResult.code}</span>
                    <span>{promoResult.description}</span>
                    <button
                      onClick={clearPromo}
                      className="ml-auto rounded-lg border border-green-600 bg-white px-3 py-1 text-green-600 hover:bg-green-100"
                    >
                      Xóa mã
                    </button>
                  </div>
                </div>
              )}
              {promoMessage && <p className="text-sm text-gray-600">{promoMessage}</p>}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">Phương thức thanh toán</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <label className="flex items-center gap-3 rounded-xl border border-gray-300 p-4 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank"
                  checked={paymentMethod === "bank"}
                  onChange={() => setPaymentMethod("bank")}
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-semibold">Chuyển khoản (Mã QR)</p>
                  <p className="text-gray-500">Quét mã QR để thanh toán trực tiếp qua ứng dụng ngân hàng</p>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-gray-300 p-4 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="vnpay"
                  checked={paymentMethod === "vnpay"}
                  onChange={() => setPaymentMethod("vnpay")}
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-semibold">Thanh toán VNPay</p>
                  <p className="text-gray-500">Thanh toán an toàn qua cổng VNPay (Hỗ trợ ATM, Visa, Master...)</p>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-gray-300 p-4 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-semibold">Thanh toán khi nhận hàng</p>
                  <p className="text-gray-500">Thanh toán trực tiếp cho nhân viên giao hàng</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        <aside className="bg-white p-8 rounded-xl shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold uppercase mb-4">Tổng đơn hàng</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{totalPrice.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span>0đ</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{discountAmount.toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                <span>Thanh toán</span>
                <span>{totalAfterDiscount.toLocaleString()}đ</span>
              </div>
            </div>
          </div>
          <button
            className="w-full bg-black text-white uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-gray-900 transition-colors"
            onClick={handlePlaceOrder}
          >
            Hoàn tất thanh toán
          </button>
          <button
            onClick={() => navigate("/cart")}
            className="w-full border border-gray-300 text-gray-700 uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Quay lại giỏ hàng
          </button>
        </aside>
      </div>

      <PromoSelectionModal
        isOpen={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        promotions={promotions}
        onSelectPromo={handleSelectPromo}
      />
    </div>
  );
};

export default CheckoutPage;
