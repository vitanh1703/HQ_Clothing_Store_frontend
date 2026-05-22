import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  useEffect(() => {
    const auth = sessionStorage.getItem("auth");
    if (!auth) {
      navigate("/auth");
      return;
    }

    const userData = JSON.parse(auth);
    setUser(userData.user);

    setEditFullName(userData.user.fullName || userData.user.full_name || '');
    setEditPhone(userData.user.phone || userData.user.Phone || '');
    setEditAddress(userData.user.address || userData.user.Address || '');

    const fetchOrders = async () => {
      try {
        const userId = userData.user.id || userData.user.Id;
        if (userId) {
          const res = await axios.get(`https://localhost:7137/api/orders/user/${userId}`);
          setOrders(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải lịch sử mua hàng:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }
    
    try {
      const userId = user.id || user.Id;
      await axios.put(`https://localhost:7137/api/users/${userId}/password`, {
        currentPassword,
        newPassword
      });
      alert("Cập nhật mật khẩu thành công!");
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      alert(error.response?.data?.message || "Đổi mật khẩu thất bại!");
    }
  };

  const handleProfileChange = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userId = user.id || user.Id;
      await axios.put(`https://localhost:7137/api/users/${userId}/info`, {
        fullName: editFullName,
        phone: editPhone,
        address: editAddress
      });
      alert("Cập nhật thông tin thành công!");
      
      setUser({ ...user, fullName: editFullName, full_name: editFullName, phone: editPhone, address: editAddress });
      const auth = JSON.parse(sessionStorage.getItem("auth") || '{}');
      if (auth.user) {
        auth.user.fullName = editFullName;
        auth.user.full_name = editFullName;
        auth.user.phone = editPhone;
        auth.user.address = editAddress;
        sessionStorage.setItem("auth", JSON.stringify(auth));
      }
      setShowEditProfile(false);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      alert(error.response?.data?.message || "Cập nhật thông tin thất bại!");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12">
      <div className="max-w-4xl mx-auto px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-black uppercase mb-8 text-center">Thông tin cá nhân</h1>

          <div className="mb-10 flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left md:justify-between">
            <div className="flex flex-col items-center gap-4">
              <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-100 border-4 border-black">
                <img
                  src={
                    user.avatar || user.avatar_url || user.AvatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80"
                  }
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-2xl font-black uppercase">{user.fullName || user.full_name || 'Khách hàng'}</p>
                <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{user.role || 'Customer'}</span>
              </div>
            </div>

            <div className="w-full max-w-xl rounded-xl bg-gray-50 p-6 border border-gray-200">
              <h2 className="text-xl font-bold uppercase mb-4">Thông tin liên hệ</h2>
              <div className="space-y-4 text-left">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-1">Địa chỉ</p>
                  <p className="text-base font-medium">{user.address || user.Address || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-1">Số điện thoại</p>
                  <p className="text-base font-medium">{user.phone || user.Phone || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold uppercase mb-4">Lịch sử mua hàng</h2>
            {loadingOrders ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-600">Đang tải lịch sử mua hàng...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">Chưa có đơn hàng nào</p>
                <button
                  onClick={() => navigate("/products")}
                  className="bg-black text-white px-6 py-2 rounded-lg font-bold uppercase text-sm hover:bg-gray-800 transition-colors"
                >
                  Mua sắm ngay
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg max-h-90 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 uppercase text-xs tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="p-4 font-bold">Mã đơn hàng</th>
                      <th className="p-4 font-bold">Ngày đặt</th>
                      <th className="p-4 font-bold">Tổng tiền</th>
                      <th className="p-4 font-bold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-semibold">{order.orderCode}</td>
                        <td className="p-4 text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-4 font-bold text-red-600">
                          {order.totalAmount.toLocaleString()}đ
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : order.status === 'Success' ? 'bg-green-100 text-green-700' : order.status === 'Shipping' ? 'bg-blue-100 text-blue-700' : order.status === 'Cancel' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                            {order.status === 'Pending' ? 'Chờ xử lý' : order.status === 'Success' ? 'Thành công' : order.status === 'Shipping' ? 'Đang giao' : order.status === 'Cancel' ? 'Đã hủy' : order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold uppercase mb-4">Cài đặt tài khoản</h2>
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => { setShowChangePassword(!showChangePassword); setShowEditProfile(false); }}
                className={`px-6 py-2 rounded-lg font-bold uppercase text-sm transition-colors ${showChangePassword ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Đổi mật khẩu
              </button>
              <button 
                onClick={() => { setShowEditProfile(!showEditProfile); setShowChangePassword(false); }}
                className={`px-6 py-2 rounded-lg font-bold uppercase text-sm transition-colors ${showEditProfile ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Thay đổi thông tin cá nhân
              </button>
            </div>

            {showChangePassword && (
              <form onSubmit={handlePasswordChange} className="bg-gray-50 p-6 rounded-lg border border-gray-200 max-w-md animate-fade-in">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu hiện tại</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu mới</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                    <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black" />
                  </div>
                  <button type="submit" className="w-full bg-black text-white font-bold uppercase tracking-widest text-xs py-3 rounded-lg mt-2 hover:bg-gray-800 transition-colors">
                    Xác nhận đổi mật khẩu
                  </button>
                </div>
              </form>
            )}

            {showEditProfile && (
               <form onSubmit={handleProfileChange} className="bg-gray-50 p-6 rounded-lg border border-gray-200 max-w-md animate-fade-in">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Họ và tên</label>
                    <input type="text" value={editFullName} onChange={e => setEditFullName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại</label>
                    <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Địa chỉ</label>
                    <textarea value={editAddress} onChange={e => setEditAddress(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black focus:ring-1 focus:ring-black min-h-20"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-black text-white font-bold uppercase tracking-widest text-xs py-3 rounded-lg mt-2 hover:bg-gray-800 transition-colors">
                    Lưu thông tin
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;