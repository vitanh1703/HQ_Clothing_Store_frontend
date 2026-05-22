import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMenu, FiX, FiUsers, FiBox, FiTag, FiBarChart, FiFileText, FiShoppingCart, FiSearch, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';

const API_BASE = "https://localhost:7137/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [menuCardsData, setMenuCardsData] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState([
    { label: 'Doanh thu hôm nay', value: '0', unit: 'VND', icon: FiTrendingUp, color: 'blue' },
    { label: 'Đơn hàng chưa xử lý', value: '0', unit: 'Đơn', icon: FiBox, color: 'orange' },
    { label: 'Khách hàng mới', value: '0', unit: 'Người', icon: FiUsers, color: 'green' },
    { label: 'Sản phẩm tồn kho', value: '0', unit: 'Sản phẩm', icon: FiBarChart, color: 'purple' }
  ]);

  const getMenuCards = (badges: any) => [
    {
      title: 'Khách hàng',
      description: 'Xem và chỉnh sửa thông tin khách hàng, thêm khách hàng mới',
      icon: FiUsers,
      path: '/customers',
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      hoverBg: 'group-hover:bg-blue-600',
      badge: badges.customers || 0
    },
    {
      title: 'Nhà cung cấp',
      description: 'Quản lý danh sách nhà cung cấp và các chi tiết liên hệ',
      icon: FiBox,
      path: '/suppliers',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
      hoverBg: 'group-hover:bg-green-600',
      badge: badges.suppliers || 0
    },
    {
      title: 'Khuyến mại',
      description: 'Tạo và quản lý các chương trình khuyến mại, mã giảm giá',
      icon: FiTag,
      path: '/promotions',
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      hoverBg: 'group-hover:bg-orange-600',
      badge: badges.promotions || 0
    },
    {
      title: 'Kho',
      description: 'Theo dõi số lượng hàng tồn kho, nhập xuất hàng',
      icon: FiBox,
      path: '/admin/inventory',
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      hoverBg: 'group-hover:bg-purple-600',
      badge: badges.lowStock || 0
    },
    {
      title: 'Sản phẩm',
      description: 'Thêm, chỉnh sửa và quản lý các sản phẩm bán hàng',
      icon: FiBox,
      path: '/admin/products',
      color: 'pink',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      borderColor: 'border-pink-200',
      hoverBg: 'group-hover:bg-pink-600',
      badge: badges.products || 0
    },
    {
      title: 'Báo cáo thống kê',
      description: 'Xem báo cáo doanh thu, thống kê bán hàng chi tiết',
      icon: FiBarChart,
      path: '/reports',
      color: 'amber',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      hoverBg: 'group-hover:bg-amber-600',
      badge: badges.reports || 0
    },
    {
      title: 'Tin tức',
      description: 'Viết và quản lý các bài tin tức, thông báo khuyến mãi',
      icon: FiFileText,
      path: '/admin/news',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200',
      hoverBg: 'group-hover:bg-red-600',
      badge: badges.news || 0
    },
    {
      title: 'Đơn hàng',
      description: 'Xem và xử lý các đơn hàng từ khách hàng',
      icon: FiShoppingCart,
      path: '/orders',
      color: 'teal',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      borderColor: 'border-teal-200',
      hoverBg: 'group-hover:bg-teal-600',
      badge: badges.orders || 0
    }
  ];

  const menuCards = getMenuCards({
    customers: 0,
    suppliers: 0,
    promotions: 0,
    lowStock: 0,
    products: 0,
    reports: 0,
    news: 0,
    orders: 0
  });

  const filteredMenuCards = (menuCardsData.length > 0 ? menuCardsData : menuCards).filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch stats data
  const fetchStats = React.useCallback(async () => {
    try {
      // Get all orders
      const ordersRes = await axios.get(`${API_BASE}/orders/admin/all`);
      const orders = ordersRes.data || [];
      console.log('All orders:', orders);

      // Get all products
      const productsRes = await axios.get(`${API_BASE}/products/admin/all`);
      const products = productsRes.data || [];

      // Get all users
      const usersRes = await axios.get(`${API_BASE}/users`);
      const users = usersRes.data || [];

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Revenue today - sum of all PAID orders (check status and paymentDate)
      // For testing: show all revenue first regardless of date
      const todayRevenue = orders.reduce((sum: number, order: any) => {
        const isPaid = order.status === 'Paid' || order.status === 'Completed' || order.status === 'Success' || order.paymentDate;
        return isPaid ? sum + (order.totalAmount || 0) : sum;
      }, 0);

      // Pending orders
      const pendingOrders = orders.filter((order: any) => order.status === 'Pending').length;
      console.log('Pending orders:', pendingOrders);

      // New customers (all users for now, can be changed to users created today)
      const totalCustomers = users.length;
      console.log('Total customers:', totalCustomers);

      // Stock products (sum of all variant quantities)
      const totalStock = products.reduce((sum: number, product: any) => {
        if (product.variants && Array.isArray(product.variants)) {
          return sum + product.variants.reduce((varSum: number, variant: any) => {
            return varSum + (variant.stockQuantity || 0);
          }, 0);
        }
        return sum;
      }, 0);
      console.log('Total stock:', totalStock);

      // Format revenue
      const revenueDisplay = todayRevenue >= 1000000
        ? (todayRevenue / 1000000).toFixed(1) + 'M'
        : (todayRevenue / 1000).toFixed(1) + 'K';

      // Format stock
      const stockDisplay = totalStock >= 1000
        ? (totalStock / 1000).toFixed(1) + 'K'
        : totalStock.toString();

      setStats([
        { label: 'Doanh thu hôm nay', value: revenueDisplay, unit: 'VND', icon: FiTrendingUp, color: 'blue' },
        { label: 'Đơn hàng chưa xử lý', value: pendingOrders.toString(), unit: 'Đơn', icon: FiBox, color: 'orange' },
        { label: 'Khách hàng mới', value: totalCustomers.toString(), unit: 'Người', icon: FiUsers, color: 'green' },
        { label: 'Sản phẩm tồn kho', value: stockDisplay, unit: 'Sản phẩm', icon: FiBarChart, color: 'purple' }
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Fetch badge counts
  const fetchBadges = React.useCallback(async () => {
    try {
      const [usersRes, suppliersRes, promotionsRes, productsRes, newsRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE}/users`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/suppliers`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/promotions`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/products/admin/all`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/news/admin/all`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/orders/admin/all`).catch(() => ({ data: [] }))
      ]);

      const users = usersRes.data || [];
      const suppliers = suppliersRes.data || [];
      const promotions = promotionsRes.data || [];
      const products = productsRes.data || [];
      const news = newsRes.data || [];
      const orders = ordersRes.data || [];

      // Calculate low stock (variants with stock <= 5)
      let lowStock = 0;
      products.forEach((p: any) => {
        if (p.variants && Array.isArray(p.variants)) {
          lowStock += p.variants.filter((v: any) => (v.stockQuantity || 0) <= 5).length;
        }
      });

      // Calculate reports (orders from today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let reports = orders.filter((o: any) => {
        if (!o.orderDate) return false;
        const orderDate = new Date(o.orderDate);
        if (isNaN(orderDate.getTime())) return false;
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      }).length;

      const badgeData = {
        customers: users.length,
        suppliers: suppliers.length,
        promotions: promotions.length,
        lowStock: lowStock,
        products: products.length,
        reports: reports,
        news: news.length,
        orders: orders.length
      };

      setMenuCardsData(getMenuCards(badgeData));
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  }, []);

  React.useEffect(() => {
    const auth = sessionStorage.getItem("auth");
    if (auth) {
      const user = JSON.parse(auth).user;
      console.log("Admin page - User role:", user?.role);
      if (user?.role?.toLowerCase() !== 'admin') {
        toast.error("Bạn không có quyền truy cập trang này!");
        navigate("/home");
      } else {
        fetchStats();
        fetchBadges();
      }
    } else {
      toast.error("Vui lòng đăng nhập trước!");
      navigate("/auth");
    }
  }, [navigate, fetchStats, fetchBadges]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar Component */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 shadow-xl px-8 py-6 flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 text-white rounded-lg transition duration-200"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-3xl font-bold text-white">HQ Clothing Store - Hệ thống Quản lý</h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {/* Title & Search */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Bảng điều khiển</h2>
            
            {/* Search Bar */}
            <div className="relative mb-8">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Tìm kiếm ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 transition duration-200"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const colorMap: any = {
                blue: 'text-blue-600',
                orange: 'text-orange-600',
                green: 'text-green-600',
                purple: 'text-purple-600'
              };
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 p-6 border-l-4 border-gray-300 hover:border-gray-900"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-semibold text-gray-600">{stat.label}</h3>
                    <Icon size={32} className={colorMap[stat.color] || 'text-gray-600'} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-gray-500 text-sm font-medium">{stat.unit}</p>
                </div>
              );
            })}
          </div>

          {/* Menu Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMenuCards.length > 0 ? (
              filteredMenuCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(card.path)}
                    className={`relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 ${card.borderColor} hover:border-gray-900 text-left group transform hover:scale-105 hover:-translate-y-2`}
                  >
                    {/* Badge */}
                    {card.badge > 0 && (
                      <div className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg">
                        {card.badge}
                      </div>
                    )}

                    <div className="p-8 flex flex-col items-center text-center h-full">
                      {/* Icon Box */}
                      <div className={`mb-4 p-5 ${card.bgColor} ${card.hoverBg} rounded-xl transition-all duration-300 group-hover:text-white w-full flex justify-center`}>
                        <Icon className="text-4xl text-gray-400 group-hover:text-white transition duration-300" />
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-black transition duration-300">{card.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition duration-300">
                        {card.description}
                      </p>

                      {/* Accent Line */}
                      <div className={`mt-4 w-12 h-1 ${card.textColor} rounded-full transition duration-300 group-hover:w-16`}></div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy kết quả cho "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;