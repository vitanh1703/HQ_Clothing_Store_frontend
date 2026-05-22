import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 md:px-20 text-gray-800 leading-relaxed font-sans">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 p-8 md:p-12 shadow-sm rounded-xl">
        
        <h1 className="text-3xl font-extrabold mb-8 text-center text-black border-b border-gray-100 pb-6 uppercase tracking-tight">
          CHÍNH SÁCH GIAO HÀNG TẬN NƠI
        </h1>

        <div className="space-y-8 text-sm md:text-base text-justify text-gray-700">
          
          {/* Mục 1 */}
          <section>
            <h2 className="text-xl font-bold text-black mb-4">1. Phạm vi giao hàng</h2>
            <p>
              H&Q Store hỗ trợ giao hàng tận nơi trên toàn quốc (34 tỉnh thành). Chúng tôi hợp tác với các đơn vị vận chuyển uy tín như Giao Hàng Tiết Kiệm, Viettel Post, J&T Express để đảm bảo sản phẩm đến tay bạn an toàn và nhanh chóng nhất.
            </p>
          </section>

          {/* Mục 2 */}
          <section>
            <h2 className="text-xl font-bold text-black mb-4">2. Thời gian giao hàng dự kiến</h2>
            <ul className="list-disc ml-6 space-y-3">
              <li><strong>Khu vực nội thành Hà Nội:</strong> 1 - 2 ngày làm việc.</li>
              <li><strong>Khu vực tỉnh/thành phố khác:</strong> 3 - 5 ngày làm việc.</li>
              <li><strong>Lưu ý:</strong> Thời gian giao hàng không tính Chủ nhật và các ngày lễ, tết theo quy định.</li>
            </ul>
          </section>

          {/* Mục 3 */}
          <section>
            <h2 className="text-xl font-bold text-black mb-4">3. Phí vận chuyển</h2>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase">Giá trị đơn hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase">Phí vận chuyển</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4">Dưới 500.000đ</td>
                    <td className="px-6 py-4">30.000đ (Toàn quốc)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-green-600">Từ 500.000đ trở lên</td>
                    <td className="px-6 py-4 font-bold text-green-600">Miễn phí vận chuyển</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Mục 4 */}
          <section>
            <h2 className="text-xl font-bold text-black mb-4">4. Kiểm tra hàng hóa</h2>
            <p>
              Khi nhận hàng, Quý khách vui lòng kiểm tra kỹ bao bì và sản phẩm. Nếu thấy có dấu hiệu rách hoặc hư hỏng, vui lòng chụp ảnh và liên hệ ngay với Hotline của chúng tôi để được hỗ trợ xử lý kịp thời.
            </p>
          </section>

          <section className="pt-6 border-t border-gray-100 text-center font-medium italic text-gray-500">
            H&Q Store luôn nỗ lực để mang đến dịch vụ giao hàng tốt nhất cho bạn!
          </section>

        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;