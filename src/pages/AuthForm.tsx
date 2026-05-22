import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../services/hooks';
import { GoogleLogin } from '@react-oauth/google';
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import axios from 'axios';

const AuthForm = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [forgotStep, setForgotStep] = useState<0 | 1 | 2 | 3>(0);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  const [registerStep, setRegisterStep] = useState<0 | 1>(0);
  const [registerData, setRegisterData] = useState<any>(null);
  const [registerOtp, setRegisterOtp] = useState('');
  const [registerCooldown, setRegisterCooldown] = useState(0);

  const { login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedAuth = sessionStorage.getItem("auth");
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed.user?.role?.toLowerCase() === 'admin') {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } catch {
        navigate("/home");
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    if (registerCooldown > 0) {
      const timer = setTimeout(() => setRegisterCooldown(registerCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [registerCooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!forgotEmail) return toast.error("Vui lòng nhập email!");
    if (isSendingOtp) return;
    setIsSendingOtp(true);
    try {
      await axios.post("https://localhost:7137/api/auth/forgot-password", { email: forgotEmail });
      toast.success("Mã OTP đã được gửi đến email của bạn!");
      setForgotStep(2);
      setCooldown(60);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi gửi OTP hoặc email không tồn tại!");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("https://localhost:7137/api/auth/verify-otp", { email: forgotEmail, otp });
      toast.success("Xác thực OTP thành công!");
      setForgotStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP không hợp lệ hoặc đã hết hạn!");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
    try {
      await axios.post("https://localhost:7137/api/auth/reset-password", { email: forgotEmail, otp, newPassword });
      toast.success("Cập nhật mật khẩu thành công! Vui lòng đăng nhập lại.");
      setForgotStep(0);
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật mật khẩu!");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      const data = await login(email, password);
      const userRole = data.user?.role || "Customer"; 
      console.log("User role from API:", userRole); 
      sessionStorage.setItem("auth", JSON.stringify(data));
      sessionStorage.setItem("userId", String(data.user?.id || data.user?.Id));
       console.log("Data saved to sessionStorage:", sessionStorage.getItem("auth")); 

      if (userRole.toLowerCase() === 'admin') {
        toast.success("Chào mừng Admin trở lại!");
        navigate("/admin");
      } else {
        toast.success("Chào mừng bạn trở lại!");
        navigate("/home");
      }
    } catch (err: any) {
      toast.error(err.message || "Đăng nhập thất bại");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      return toast.error("Mật khẩu không khớp!");
    }

    const data = {
      fullName: `${formData.get("name")} ${formData.get("lastname")}`,
      email: formData.get("email") as string,
      password: password,
    };

    if (isSendingOtp) return;
    setIsSendingOtp(true);
    try {
      await axios.post("https://localhost:7137/api/auth/send-register-otp", data);
      setRegisterData(data);
      setRegisterStep(1);
      setRegisterCooldown(60);
      toast.success("Mã OTP đã được gửi đến email của bạn!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi gửi OTP!");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("https://localhost:7137/api/auth/verify-register-otp", { email: registerData.email, otp: registerOtp });
      toast.success("Đăng ký thành công! Hãy đăng nhập nhé.");
      setIsRightPanelActive(false);
      setRegisterStep(0);
      setRegisterData(null);
      setRegisterOtp('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP không hợp lệ hoặc đã hết hạn!");
    }
  };

  const handleResendRegisterOtp = async () => {
    if (!registerData || isSendingOtp) return;
    setIsSendingOtp(true);
    try {
      await axios.post("https://localhost:7137/api/auth/send-register-otp", registerData);
      setRegisterCooldown(60);
      toast.success("Mã OTP đã được gửi lại!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi gửi OTP!");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential;
      const data = await loginWithGoogle(idToken);
      sessionStorage.setItem("auth", JSON.stringify(data));
      sessionStorage.setItem("userId", String(data.user?.id || data.user?.Id));
      try {
        const userId = data.user?.id || data.user?.Id;
        if (userId) {
          const res = await axios.get(`https://localhost:7137/api/wishlist/${userId}`);
          sessionStorage.setItem("wishlistVariantIds", JSON.stringify(res.data));
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách yêu thích:", err);
      }
      toast.success(`Chào mừng ${data.user.full_name} trở lại!`);
      const userRole = data.user?.role || "Customer";
      if (userRole.toLowerCase() === 'admin') {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi xác thực Google");
    }
  };

  return (
    <div className="relative w-screen h-screen flex justify-center items-center overflow-hidden font-sans bg-[#f6f5f7]">
      <div className={`relative overflow-hidden w-212.5 max-w-full min-h-155 bg-white shadow-[0_14px_28px_rgba(0,0,0,0.25)] rounded-[20px] z-10 transition-all duration-600 ease-in-out`}>
        
        {/* --- FORM ĐĂNG KÝ --- */}
        <div className={`absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 z-1 opacity-0 
          ${isRightPanelActive ? 'translate-x-full opacity-100 z-5 animate-show' : ''}`}>
          {registerStep === 0 ? (
          <form onSubmit={handleRegisterSubmit} className="bg-white flex items-center justify-center flex-col px-10 h-full text-center">
            <h1 className="text-3xl font-bold mb-2">Tạo tài khoản mới</h1>
            <p className="text-gray-500 mb-6 text-sm">Vui lòng điền thông tin bên dưới</p>
            
            <div className="flex gap-3 w-full mb-3">
              <input name="name" type="text" placeholder="Tên" required className="border border-gray-300 p-3 w-1/2 rounded-lg outline-none focus:ring-1 focus:ring-black" />
              <input name="lastname" type="text" placeholder="Họ" required className="border border-gray-300 p-3 w-1/2 rounded-lg outline-none focus:ring-1 focus:ring-black" />
            </div>
            
            <input name="email" type="email" placeholder="Email" required className="border border-gray-300 p-3 mb-3 w-full rounded-lg outline-none focus:ring-1 focus:ring-black" />
            
            <div className="relative w-full mb-3">
              <input name="password" type={showPassword ? "text" : "password"} placeholder="Mật khẩu" required className="border border-gray-300 p-3 w-full rounded-lg outline-none focus:ring-1 focus:ring-black" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-4 text-gray-400">
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <input name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Xác nhận mật khẩu" required className="border border-gray-300 p-3 mb-6 w-full rounded-lg outline-none focus:ring-1 focus:ring-black" />
            
            <button type="submit" disabled={loading || isSendingOtp} className="w-full rounded-lg bg-black text-white font-bold py-3 uppercase active:scale-95 transition-all mb-3 disabled:bg-gray-400 cursor-pointer">
              {loading || isSendingOtp ? "Đang xử lý..." : "Đăng ký ngay"}
            </button>
            
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Auth Fail")} theme="outline" width="340px" text="signup_with" />
          </form>
          ) : (
          <form onSubmit={handleVerifyRegisterOtp} className="bg-white flex items-center justify-center flex-col px-10 h-full text-center">
            <h1 className="text-3xl font-bold mb-2">Xác thực Email</h1>
            <p className="text-gray-500 mb-6 text-sm">Nhập mã OTP đã được gửi đến {registerData?.email}</p>
            
            <input type="text" placeholder="Nhập mã OTP (6 số)" value={registerOtp} onChange={e => setRegisterOtp(e.target.value)} required className="border border-gray-300 p-3 mb-6 w-full rounded-lg outline-none focus:ring-1 focus:ring-black text-center text-xl tracking-widest font-bold" maxLength={6} />
            
            <button type="submit" className="w-full rounded-lg bg-black text-white font-bold py-3 uppercase active:scale-95 transition-all mb-3 cursor-pointer">
              Xác nhận OTP
            </button>
            <button type="button" onClick={handleResendRegisterOtp} disabled={registerCooldown > 0 || isSendingOtp} className="w-full text-sm font-bold text-gray-500 hover:text-black transition-colors disabled:opacity-50 cursor-pointer">
              {isSendingOtp ? "Đang gửi..." : (registerCooldown > 0 ? `Gửi lại mã (${registerCooldown}s)` : "Gửi lại mã OTP")}
            </button>
            <button type="button" onClick={() => setRegisterStep(0)} className="mt-4 text-sm font-bold text-gray-500 hover:underline cursor-pointer">
              Quay lại
            </button>
          </form>
          )}
        </div>

        {/* --- FORM ĐĂNG NHẬP --- */}
        <div className={`absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 z-2 
          ${isRightPanelActive ? 'translate-x-full' : ''}`}>
        {forgotStep === 0 ? (
          <form onSubmit={handleLoginSubmit} className="bg-white flex items-center justify-center flex-col px-10 h-full">
            <div className="mb-4 text-center w-full">
                <div className="bg-black w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-4 italic">H&Q</div>
                <h1 className="text-3xl font-bold">Chào mừng trở lại!</h1>
                <p className="text-gray-500 text-sm mt-1">Vui lòng nhập thông tin chi tiết của bạn</p>
            </div>

            <div className="w-full mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <input name="email" type="email" placeholder="Địa chỉ email của bạn" required className="border border-gray-300 p-3 w-full rounded-lg outline-none focus:ring-1 focus:ring-black" />
            </div>

            <div className="w-full mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu</label>
                <div className="relative">
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="Nhập mật khẩu" required className="border border-gray-300 p-3 w-full rounded-lg outline-none focus:ring-1 focus:ring-black" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-4 text-gray-400">
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                </div>
            </div>

            <div className="flex justify-end w-full mb-6 text-sm">
                <button type="button" onClick={() => setForgotStep(1)} className="font-bold hover:underline cursor-pointer">Quên mật khẩu?</button>
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-lg bg-black text-white font-bold py-3 uppercase active:scale-95 transition-all mb-3 disabled:bg-gray-400 cursor-pointer">
              {loading ? "Đang xác thực..." : "Đăng Nhập"}
            </button>

            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Auth Fail")} theme="outline" width="340px" text="signin_with" />
          </form>
        ) : (
          <div className="bg-white flex items-center justify-center flex-col px-10 h-full">
            <div className="mb-4 text-center w-full">
                <div className="bg-black w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-4 italic">H&Q</div>
                <h1 className="text-2xl font-bold">Quên Mật Khẩu</h1>
                <p className="text-gray-500 text-sm mt-1">
                  {forgotStep === 1 && "Nhập email để nhận mã OTP"}
                  {forgotStep === 2 && "Nhập mã OTP đã được gửi đến email"}
                  {forgotStep === 3 && "Nhập mật khẩu mới của bạn"}
                </p>
            </div>

            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} className="w-full">
                  <div className="w-full mb-4">
                      <input type="email" placeholder="Địa chỉ email của bạn" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required className="border border-gray-300 p-3 w-full rounded-lg outline-none focus:ring-1 focus:ring-black" />
                  </div>
                  <button type="submit" disabled={isSendingOtp} className="w-full rounded-lg bg-black text-white font-bold py-3 uppercase active:scale-95 transition-all mb-3 disabled:bg-gray-400 cursor-pointer">
                    {isSendingOtp ? "Đang gửi..." : "Gửi mã OTP"}
                  </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="w-full">
                  <div className="w-full mb-4">
                      <input type="text" placeholder="Nhập mã OTP (6 số)" value={otp} onChange={e => setOtp(e.target.value)} required className="border border-gray-300 p-3 w-full rounded-lg outline-none focus:ring-1 focus:ring-black text-center text-xl tracking-widest font-bold" maxLength={6} />
                  </div>
                  <button type="submit" className="w-full rounded-lg bg-black text-white font-bold py-3 uppercase active:scale-95 transition-all mb-3 cursor-pointer">
                    Xác nhận OTP
                  </button>
                  <button type="button" onClick={() => handleSendOtp()} disabled={cooldown > 0 || isSendingOtp} className="w-full text-sm font-bold text-gray-500 hover:text-black transition-colors disabled:opacity-50 cursor-pointer">
                    {isSendingOtp ? "Đang gửi..." : (cooldown > 0 ? `Gửi lại mã (${cooldown}s)` : "Gửi lại mã OTP")}
                  </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="w-full">
                  <div className="w-full mb-4 relative">
                      <input type={showPassword ? "text" : "password"} placeholder="Mật khẩu mới (ít nhất 6 ký tự)" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="border border-gray-300 p-3 w-full rounded-lg outline-none focus:ring-1 focus:ring-black" minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-4 text-gray-400 cursor-pointer">
                          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                  </div>
                  <button type="submit" className="w-full rounded-lg bg-black text-white font-bold py-3 uppercase active:scale-95 transition-all mb-3 cursor-pointer">
                    Cập nhật mật khẩu
                  </button>
              </form>
            )}

            <button type="button" onClick={() => { setForgotStep(0); setForgotEmail(''); setOtp(''); setNewPassword(''); setCooldown(0); }} className="mt-4 text-sm font-bold text-gray-500 hover:underline cursor-pointer">
                Quay lại đăng nhập
            </button>
          </div>
        )}
        </div>

        {/* --- OVERLAY --- */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-100 ${isRightPanelActive ? '-translate-x-full' : ''}`}>
          <div className={`bg-linear-to-r from-gray-900 to-black text-white relative -left-full h-full w-[200%] transition-transform duration-600 ${isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
            <div className={`absolute flex flex-col items-center justify-center px-10 text-center top-0 h-full w-1/2 transition-transform duration-600 ${isRightPanelActive ? 'translate-x-0' : '-translate-x-[20%]'}`}>
              <h1 className="text-3xl font-bold">Chào bạn mới!</h1>
              <p className="text-sm font-light my-5">Gia nhập H&Q Store để khám phá phong cách thời trang mới nhất.</p>
              <button onClick={() => { setIsRightPanelActive(false); setRegisterStep(0); }} className="bg-transparent border border-white rounded-full text-white text-xs font-bold py-3 px-11 uppercase cursor-pointer hover:bg-white hover:text-black transition-all">Đăng nhập</button>
            </div>
            <div className={`absolute flex flex-col items-center justify-center px-10 text-center top-0 right-0 h-full w-1/2 transition-transform duration-600 ${isRightPanelActive ? 'translate-x-[20%]' : 'translate-x-0'}`}>
              <h1 className="text-3xl font-bold">Khám phá ngay!</h1>
              <p className="text-sm font-light my-5">Tạo tài khoản và bắt đầu hành trình mua sắm tuyệt vời cùng chúng tôi.</p>
              <button onClick={() => setIsRightPanelActive(true)} className="bg-transparent border border-white rounded-full text-white text-xs font-bold py-3 px-11 uppercase cursor-pointer hover:bg-white hover:text-black transition-all">Đăng ký</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;