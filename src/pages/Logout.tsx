import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2 } from 'lucide-react';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem("auth");
    sessionStorage.removeItem("cart"); 
    sessionStorage.clear(); 

    const timer = setTimeout(() => {
      navigate("/");
      window.location.reload(); 
    }, 3000);

    return () => clearTimeout(timer); 
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-10 text-center space-y-6 border border-gray-100">
        
        {/* Icon Đăng xuất với hiệu ứng xoay nhẹ */}
        <div className="flex justify-center">
          <div className="bg-red-50 p-4 rounded-full">
            <LogOut className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Đăng xuất thành công!</h1>
          <p className="text-gray-500">
            Hẹn gặp lại bạn tại <span className="font-semibold text-black">H&Q Store</span>.
          </p>
        </div>

        {/* Hiệu ứng Loading */}
        <div className="flex items-center justify-center gap-3 text-sm text-blue-600 font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Đang chuyển hướng về trang chủ...</span>
        </div>
      </div>
    </div>
  );
};

export default Logout;