import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 md:px-20 text-gray-800 leading-relaxed font-sans">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 p-8 md:p-12 shadow-sm rounded-xl">
        
        <h1 className="text-3xl font-extrabold mb-8 text-center text-black border-b border-gray-100 pb-6 uppercase tracking-tight">
          CHÍNH SÁCH ĐỔI TRẢ & BẢO HÀNH
        </h1>

        <div className="space-y-8 text-sm md:text-base text-justify text-gray-700">
          
          <section>
            <h2 className="text-xl font-bold text-black mb-4">1. Điều kiện đổi trả</h2>
            <p className="mb-4 font-medium italic text-gray-600">
              Quý Khách hàng cần kiểm tra tình trạng hàng hóa và có thể đổi hàng/ trả lại hàng ngay tại thời điểm giao/nhận hàng trong những trường hợp sau:
            </p>
            <ul className="list-disc ml-6 space-y-3">
              <li>Hàng không đúng chủng loại, mẫu mã trong đơn hàng đã đặt hoặc như trên website tại thời điểm đặt hàng.</li>
              <li>Không đủ số lượng, không đủ bộ như trong đơn hàng.</li>
              <li>Tình trạng bên ngoài bị ảnh hưởng như rách bao bì, bong tróc, bể vỡ…</li>
            </ul>
            <p className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm italic">
              Khách hàng có trách nhiệm trình giấy tờ liên quan chứng minh sự thiếu sót trên để hoàn thành việc hoàn trả/đổi trả hàng hóa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-4">2. Quy định về thời gian thông báo và gửi sản phẩm đổi trả</h2>
            <div className="space-y-4">
              <p>
                <span className="font-bold text-black">- Thời gian thông báo đổi trả:</span> trong vòng <strong>48h</strong> kể từ khi nhận sản phẩm đối với trường hợp sản phẩm thiếu phụ kiện, quà tặng hoặc bể vỡ.
              </p>
              <p>
                <span className="font-bold text-black">- Thời gian gửi chuyển trả sản phẩm:</span> trong vòng <strong>14 ngày</strong> kể từ khi nhận sản phẩm.
              </p>
              <p>
                <span className="font-bold text-black">- Địa điểm đổi trả sản phẩm:</span> Khách hàng có thể mang hàng trực tiếp đến văn phòng/ cửa hàng của chúng tôi hoặc chuyển qua đường bưu điện.
              </p>
            </div>
          </section>

          <section className="pt-6 border-t border-gray-100 text-center font-medium italic text-gray-500">
            Trong trường hợp Quý Khách hàng có ý kiến đóng góp/khiếu nại liên quan đến chất lượng sản phẩm, Quý Khách hàng vui lòng liên hệ đường dây chăm sóc khách hàng của chúng tôi.
          </section>

        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;