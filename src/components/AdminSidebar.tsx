import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUsers, FiBox, FiBarChart, FiLogOut, FiTag, FiHome, FiFileText } from 'react-icons/fi';

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ sidebarOpen }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: FiHome, label: 'Điều khiển', path: '/admin' },
    { icon: FiUsers, label: 'Khách hàng', path: '/customers' },
    { icon: FiBox, label: 'Nhà cung cấp', path: '/suppliers' },
    { icon: FiTag, label: 'Khuyến mại', path: '/promotions' },
    { icon: FiBox, label: 'Kho', path: '/admin/inventory' },
    { icon: FiBox, label: 'Sản phẩm', path: '/admin/products' },
    { icon: FiBarChart, label: 'Báo cáo thống kê', path: '/reports' },
    { icon: FiFileText, label: 'Tin tức', path: '/admin/news' },
    { icon: FiShoppingCart, label: 'Đơn hàng', path: '/orders' },
  ];

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white text-black transition-all duration-300 flex flex-col shadow-lg border-r border-gray-200`}>
      <div className="p-4 border-b border-gray-200 flex items-center gap-3 hover:bg-black hover:text-white transition cursor-pointer rounded-lg m-2">
        <div className="bg-black text-white p-2 rounded font-bold text-lg flex-shrink-0">🛒</div>
        {sidebarOpen && <span className="text-base font-bold truncate">H&Q SHOP</span>}
      </div>

      <div className="flex-1 py-4 overflow-y-auto px-2">
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 text-black bg-white hover:bg-black hover:text-white rounded-lg text-sm font-medium transition duration-200 group"
              >
                <Icon className="shrink-0 text-lg" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="border-t border-gray-200 p-4 m-2">
        <button 
          onClick={() => {
            sessionStorage.clear();
            window.location.href = "/auth";
          }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600 hover:text-white rounded-lg text-sm font-medium transition duration-200 text-black bg-white"
        >
          <FiLogOut className="shrink-0 text-lg" />
          {sidebarOpen && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;