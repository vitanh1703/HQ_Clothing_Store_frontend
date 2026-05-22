import { useNavigate } from "react-router-dom";

const AboutUsPage = () => {
    const navigate = useNavigate();
  return (
    <div className="bg-[#F5F5F5] min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Ghé Thăm Cửa Hàng</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Trải nghiệm triết lý “Ít hơn nhưng tốt hơn” trong không gian cửa hàng thực tế,
            nơi dịch vụ và trải nghiệm mua sắm được kết hợp hài hòa.
          </p>
        </div>

        {/* Section Stores */}
        <div className="grid lg:grid-cols-2 gap-10 items-center mb-12">
          <div>
            <h2 className="text-xl font-bold mb-4">Hệ Thống Cửa Hàng</h2>
            <p className="text-gray-600 mb-3">
              Khám phá không gian mua sắm được thiết kế tinh tế, mang lại trải nghiệm gần gũi
              và tập trung vào chất lượng sản phẩm.
            </p>
            <p className="text-gray-600">
              Hỗ trợ nhận hàng tại cửa hàng, giao hàng trong ngày và dịch vụ mua sắm cá nhân hóa.
            </p>
          </div>

          <img
            src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a"
            alt="store"
            className="rounded-xl w-full h-75 object-cover"
          />
        </div>

        {/* Gallery */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
            "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a",
            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
            "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
            "https://images.unsplash.com/photo-1526178613552-2b45c6c302f0",
          ].map((img, index) => (
            <div key={index}>
              <img
                src={img}
                alt="store"
                className="rounded-xl h-48 w-full object-cover"
              />
              <p className="text-sm text-gray-500 mt-2">
                Cửa hàng #{index + 1}
              </p>
            </div>
          ))}
        </div>

        {/* Appointment */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <img
            src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f"
            alt="appointment"
            className="rounded-xl w-full h-75 object-cover"
          />

          <div>
            
            <p className="text-gray-600 mb-6">
              Trải nghiệm dịch vụ mua sắm cá nhân hóa trong không gian thân thiện,
              phù hợp với phong cách và nhu cầu của bạn, cả trực tiếp tại cửa hàng hoặc online.
            </p>

            <button onClick={() => navigate("/products")}  className="bg-black text-white px-6 py-3 rounded-lg uppercase tracking-wider hover:bg-gray-900">
              Mua Ngay
            </button>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUsPage;