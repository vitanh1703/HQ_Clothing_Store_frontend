import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock, ChevronLeft, Copy, Check, ShoppingBag } from "lucide-react";
import type { CheckoutCartItem, CheckoutResponse } from "../services/api";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(600); 
  const [copiedAccount, setCopiedAccount] = useState(false);
  const { checkoutData, totalAmount, form } = (location.state as {
    checkoutData: CheckoutResponse;
    totalAmount: number;
    form: { fullName: string; email: string; phone: string; address: string };
  }) || {};

  useEffect(() => {
    if (!checkoutData) {
      navigate("/checkout");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [checkoutData, navigate]);

  useEffect(() => {
    if (timeLeft === 0) {
      alert("Thời gian thanh toán đã hết. Vui lòng thử lại!");
      navigate("/cart");
    }
  }, [timeLeft, navigate]);

  if (!checkoutData) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
  };

  const bookingId = checkoutData.orderCode || checkoutData.id?.toString();
  
  const bankAccount = "8860382942";
  const accountName = "DIEM VIET ANH";
  const bankId = "BIDV";
  
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${bankAccount}-compact2.png?amount=${totalAmount}&addInfo=${bookingId}%20${form.phone}&accountName=${encodeURIComponent(accountName)}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(bankAccount);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleFinish = () => {
    alert("Cảm ơn bạn! Đơn hàng sẽ được xử lý sau khi chúng tôi xác nhận thanh toán.");
    navigate("/home");
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen pt-8 pb-24 font-sans text-[#4A4A4A]">
       <div className="max-w-6xl mx-auto px-6 mb-8 text-center relative">
         <button onClick={() => navigate("/checkout")} className="absolute left-6 top-0 flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
            <ChevronLeft size={16} className="mr-1" /> Trở về
         </button>
         <h1 className="text-3xl font-black uppercase text-black mb-4">Thanh toán</h1>
         
         <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-red-500 bg-red-50 px-4 py-2 rounded-full">
               <Clock size={16} />
               <span>{formatTime(timeLeft)}</span>
               <span className="font-normal text-gray-600">để hoàn tất thanh toán</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Đơn hàng sẽ tự động hủy nếu không thanh toán trong thời gian quy định.
            </p>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
              <div className="bg-white p-8 rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold uppercase mb-6 border-b pb-4">Thông tin đơn hàng</h3>
                  
                  <div className="flex justify-between items-center mb-6">
                       <span className="font-medium text-gray-600">Mã đơn hàng</span>
                       <span className="font-bold text-lg text-black">{bookingId}</span>
                  </div>

                  <div className="space-y-4 mb-6">
                      {checkoutData.items.map((item: CheckoutCartItem) => (
                          <div key={item.id} className="pb-4 border-b border-dashed border-gray-200 last:border-0 flex gap-4">
                              <img src={item.image} alt={item.productName} className="w-16 h-20 object-cover rounded-md border" />
                              <div className="flex-1">
                                <h4 className="font-bold text-sm mb-1">{item.productName}</h4>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                    <span>Size: {item.size}</span>
                                    {(item as any).color && <span>Màu: {(item as any).color}</span>}
                                    <span>SL: {item.quantity}</span>
                                </div>
                                <p className="font-bold text-sm">{item.total.toLocaleString()}đ</p>
                              </div>
                          </div>
                      ))}
                  </div>
                   
                   <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                       <span className="font-bold">Tổng thanh toán</span>
                       <span className="font-black text-2xl text-red-500">{totalAmount.toLocaleString()}đ</span>
                   </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold uppercase mb-6 border-b pb-4">Thông tin nhận hàng</h3>
                  <div className="space-y-4 text-sm">
                      <div className="grid grid-cols-[120px_1fr]">
                          <span className="text-gray-500">Người nhận</span>
                          <span className="font-medium text-black">{form.fullName}</span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr]">
                          <span className="text-gray-500">Số điện thoại</span>
                          <span className="font-medium text-black">{form.phone}</span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr]">
                          <span className="text-gray-500">Email</span>
                          <span className="font-medium text-black">{form.email}</span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr]">
                          <span className="text-gray-500">Địa chỉ</span>
                          <span className="font-medium text-black">{form.address}</span>
                      </div>
                  </div>
              </div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm h-fit">
              <h3 className="text-xl font-bold uppercase mb-6 text-center">Quét mã QR để thanh toán</h3>
              
              <div className="flex justify-center mb-8">
                <div className="border-2 border-black rounded-2xl p-4 inline-block relative shadow-md bg-white">
                   <img src={qrUrl} alt="QR Code Payment" className="w-64 h-64 object-contain" />
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl space-y-4 text-sm text-left mb-8 border border-gray-100">
                  <div className="flex justify-between items-center">
                      <span className="text-gray-500">Ngân hàng</span>
                      <span className="font-bold text-black">{bankId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-gray-500">Số tài khoản</span>
                      <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-black">{bankAccount}</span>
                          <button onClick={copyToClipboard} className="text-blue-600 hover:text-blue-800 transition-colors p-1" title="Copy">
                             {copiedAccount ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                      </div>
                  </div>
                  <div className="flex justify-between items-center">
                        <span className="text-gray-500">Chủ tài khoản</span>
                        <span className="font-bold text-black uppercase">{accountName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-gray-500">Số tiền</span>
                      <span className="font-bold text-black">{totalAmount.toLocaleString()} VNĐ</span>
                  </div>
                  <div className="flex justify-between items-start pt-2 border-t border-gray-200">
                      <span className="text-gray-500 whitespace-nowrap mr-4 mt-1">Nội dung CK</span>
                      <span className="font-bold text-black text-right wrap-break-word">{bookingId} {form.phone}</span>
                  </div>
              </div>

              <button 
                onClick={handleFinish}
                className="w-full bg-black text-white py-4 rounded-xl text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                 <ShoppingBag size={18} /> Tôi đã thanh toán
              </button>
          </div>
      </div>
    </div>
  );
};

export default PaymentPage;