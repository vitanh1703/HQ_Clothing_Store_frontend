import React, { useState } from "react";
import { 
  Plus, 
  Minus, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  Ruler, 
  UserCircle,
  ChevronRight,
  MessageCircle,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// 1. Cấu trúc dữ liệu đầy đủ cho các danh mục
const faqData = [
  // DANH MỤC: GIAO HÀNG (delivery)
  { 
    id: 1, 
    category: "delivery", 
    question: "H&Q có giao hàng toàn quốc không?", 
    answer: "Chúng tôi hỗ trợ giao hàng tận nơi trên toàn quốc với thời gian từ 2-4 ngày làm việc. Đơn hàng trên 1.000.000đ sẽ được miễn phí vận chuyển." 
  },
  { 
    id: 2, 
    category: "delivery", 
    question: "Làm thế nào để tôi theo dõi đơn hàng?", 
    answer: "Sau khi gửi hàng, H&Q sẽ gửi mã vận đơn qua Email/SMS của bạn. Bạn có thể kiểm tra trực tiếp trên website của đơn vị vận chuyển hoặc mục 'Đơn hàng' trong tài khoản." 
  },

  // DANH MỤC: ĐỔI TRẢ & HOÀN TIỀN (returns)
  { 
    id: 3, 
    category: "returns", 
    question: "Tôi có thể đổi sản phẩm trong bao lâu?", 
    answer: "H&Q hỗ trợ đổi sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên tem mác, chưa qua sử dụng và không có mùi lạ." 
  },
  { 
    id: 4, 
    category: "returns", 
    question: "Làm thế nào để yêu cầu hoàn tiền?", 
    answer: "Vui lòng liên hệ Hotline hoặc Fanpage kèm mã đơn hàng. Sau khi kiểm tra điều kiện sản phẩm hoàn trả, chúng tôi sẽ hoàn tiền vào tài khoản ngân hàng của bạn trong 3-5 ngày làm việc." 
  },
  { 
    id: 5, 
    category: "returns", 
    question: "Tôi có phải trả phí khi đổi size không?", 
    answer: "Nếu đổi size theo nhu cầu cá nhân, bạn vui lòng thanh toán phí vận chuyển 2 chiều. Nếu lỗi do H&Q (sai mẫu, lỗi vải), chúng tôi sẽ chịu toàn bộ chi phí." 
  },

  // DANH MỤC: TÀI KHOẢN & BẢO MẬT (personal)
  { 
    id: 6, 
    category: "personal", 
    question: "Tôi quên mật khẩu tài khoản thì phải làm sao?", 
    answer: "Tại trang Đăng nhập, hãy nhấn 'Quên mật khẩu'. Chúng tôi sẽ gửi link thiết lập lại mật khẩu vào Email bạn đã đăng ký." 
  },
  { 
    id: 7, 
    category: "personal", 
    question: "Thông tin của tôi có được bảo mật không?", 
    answer: "Tuyệt đối bảo mật. H&Q Store sử dụng giao thức mã hóa dữ liệu và cam kết không cung cấp thông tin cá nhân của khách hàng cho bên thứ ba." 
  },
  { 
    id: 8, 
    category: "personal", 
    question: "Tôi có thể xóa tài khoản vĩnh viễn không?", 
    answer: "Có. Bạn hãy gửi yêu cầu qua email info@hqstore.vn, bộ phận kỹ thuật sẽ hỗ trợ xóa toàn bộ dữ liệu tài khoản của bạn trong 24h." 
  },

  // DANH MỤC: KÍCH CỠ (sizes)
  { 
    id: 9, 
    category: "sizes", 
    question: "Làm sao để chọn đúng size Darkwear?", 
    answer: "Phong cách Darkwear thường có form Oversize. Bạn nên chọn đúng size theo bảng quy đổi hoặc lùi 1 size nếu muốn mặc gọn gàng hơn." 
  }
];

const categories = [
  { id: "delivery", name: "Giao hàng & Theo dõi đơn", icon: <Truck size={18} /> },
  { id: "returns", name: "Đổi trả & Hoàn tiền", icon: <RotateCcw size={18} /> },
  { id: "payments", name: "Thanh toán & Khuyến mãi", icon: <CreditCard size={18} /> },
  { id: "sizes", name: "Thông số sản phẩm", icon: <Ruler size={18} /> },
  { id: "personal", name: "Tài khoản & Bảo mật", icon: <UserCircle size={18} /> },
];

const FAQPage = () => {
  const [activeTab, setActiveTab] = useState("delivery");
  const [openId, setOpenId] = useState<number | null>(null);
  const navigate = useNavigate();

  const filteredFaqs = faqData.filter(faq => faq.category === activeTab);

  return (
    <div className="bg-white min-h-screen text-[#1a1a1a]">

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-16 pb-20 mt-4">
        
        {/* SIDEBAR */}
        <aside className="w-full md:w-1/4">
          <h2 className="text-[13px] font-bold mb-8 uppercase tracking-[1px] border-b border-black pb-2">Danh mục trợ giúp</h2>
          <nav className="flex flex-col">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveTab(cat.id); setOpenId(null); }}
                className={`flex items-center gap-4 py-4 text-[13px] transition-all border-b border-gray-100
                  ${activeTab === cat.id ? "text-black font-bold" : "text-gray-400 hover:text-black"}`}
              >
                {cat.icon}
                <span className="uppercase">{cat.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* NỘI DUNG CHÍNH */}
        <main className="w-full md:w-3/4">
          <header className="mb-12">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              <span className="text-sm">Quay lại</span>
            </button>
            <h1 className="text-4xl font-light mb-6 tracking-tight">Chúng tôi có thể giúp gì cho bạn?</h1>
            <p className="text-gray-500 text-[14px] leading-relaxed max-w-2xl">
              Chọn danh mục ở bên trái để tìm câu trả lời nhanh nhất. Nếu bạn vẫn gặp khó khăn, 
              đội ngũ hỗ trợ của H&Q luôn sẵn sàng giải đáp 24/7.
            </p>
          </header>

          <div className="space-y-0">
            <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-[2px] mb-6">
              {categories.find(c => c.id === activeTab)?.name}
            </h3>
            
            <div className="border-t border-gray-200">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <div key={faq.id} className="border-b border-gray-100">
                    <button
                      onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                      className="w-full py-6 flex items-center justify-between text-left group transition-all"
                    >
                      <span className="text-[15px] font-medium group-hover:pl-2 transition-all">{faq.question}</span>
                      <div className="text-black">
                        {openId === faq.id ? <Minus size={16} /> : <Plus size={16} />}
                      </div>
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out
                      ${openId === faq.id ? "max-h-96 pb-8" : "max-h-0"}`}>
                      <div className="text-[14px] text-gray-500 leading-7 pr-10">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-gray-400 text-[13px] italic">
                  Chưa có câu hỏi thường gặp cho mục này.
                </div>
              )}
            </div>
          </div>

          {/* Liên hệ thêm */}
          <div className="mt-20 p-8 bg-gray-50 rounded-sm flex items-center justify-between flex-wrap gap-6">
            <div>
              <h4 className="font-bold text-sm uppercase mb-1">Bạn vẫn cần hỗ trợ?</h4>
              <p className="text-xs text-gray-500">Liên hệ với chúng tôi qua các kênh trực tuyến.</p>
            </div>
            <a 
              href="https://www.facebook.com/h&qstore/"
              target="_blank" 
              className="flex items-center gap-2 bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
            >
              <MessageCircle size={16} />
              Chat với nhân viên
            </a>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FAQPage;