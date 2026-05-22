import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  FiTrendingUp,
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiChevronDown,
  FiAward,
  FiMenu,
  FiX,
  FiPackage,
} from 'react-icons/fi';
import AdminSidebar from '../../components/AdminSidebar';
import { statsApi } from '../../services/api';

interface RevenueTrendItem {
  day: string;
  revenue: number;
}

interface CategoryDistributionItem {
  name: string;
  value: number;
}

interface VipCustomerItem {
  name: string;
  orders: number;
  total: number;
}

interface OrderStatusItem {
  name: string;
  value: number;
}

interface DashboardStatistics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  totalProducts: number;
  revenueTrend: RevenueTrendItem[];
  categoryDistribution: CategoryDistributionItem[];
  vipCustomers: VipCustomerItem[];
  orderStatusDistribution: OrderStatusItem[];
}

const COLORS = ['#3B82F6', '#10B981', '#6366F1', '#8B5CF6', '#F59E0B', '#EF4444'];

const mapRangeToApi = (timeRange: string) => {
  switch (timeRange) {
    case '7 ngày qua':
      return '7days';
    case '30 ngày qua':
      return '30days';
    case '3 tháng':
      return '3months';
    case 'Năm nay':
      return 'thisyear';
    default:
      return '7days';
  }
};

const formatCurrency = (value: number) => `${Math.round(value || 0).toLocaleString('vi-VN')}đ`;

const Statistics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeRange, setTimeRange] = useState('7 ngày qua');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState<DashboardStatistics>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    totalProducts: 0,
    revenueTrend: [],
    categoryDistribution: [],
    vipCustomers: [],
    orderStatusDistribution: [],
  });

  const fetchStatistics = async (range: string) => {
    try {
      setLoading(true);
      setError('');

      const response = await statsApi.getDashboard(range);

      setStats({
        totalRevenue: Number(response.totalRevenue || 0),
        totalOrders: Number(response.totalOrders || 0),
        totalCustomers: Number(response.totalCustomers || 0),
        avgOrderValue: Number(response.avgOrderValue || 0),
        totalProducts: Number(response.totalProducts || 0),
        revenueTrend: Array.isArray(response.revenueTrend) ? response.revenueTrend : [],
        categoryDistribution: Array.isArray(response.categoryDistribution) ? response.categoryDistribution : [],
        vipCustomers: Array.isArray(response.vipCustomers) ? response.vipCustomers : [],
        orderStatusDistribution: Array.isArray(response.orderStatusDistribution)
          ? response.orderStatusDistribution
          : [],
      });
    } catch (err) {
      console.error('Lỗi khi tải thống kê:', err);
      setError('Không thể tải dữ liệu thống kê từ API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics(mapRangeToApi(timeRange));
  }, [timeRange]);

  const statusCards = useMemo(() => {
    return [
      { name: 'Pending', value: 0 },
      { name: 'Shipping', value: 0 },
      { name: 'Success', value: 0 },
      { name: 'Cancel', value: 0 },
    ].map((defaultItem) => {
      const found = stats.orderStatusDistribution.find((x) => x.name === defaultItem.name);
      return found || defaultItem;
    });
  }, [stats.orderStatusDistribution]);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-gray-900 shadow-xl px-8 py-6 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 text-white rounded-lg transition duration-200"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-3xl font-bold text-white uppercase tracking-wider">
            Báo cáo kinh doanh
          </h1>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Thống kê chi tiết</h2>
                <p className="text-gray-500">Dữ liệu lấy trực tiếp từ DB qua API thống kê</p>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-white border-2 border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:border-black transition"
                >
                  {timeRange} <FiChevronDown />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black rounded-lg shadow-xl z-50 overflow-hidden text-sm">
                    {['7 ngày qua', '30 ngày qua', '3 tháng', 'Năm nay'].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setTimeRange(item);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-black hover:text-white font-bold transition-colors border-b last:border-0"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Tổng doanh thu"
                value={formatCurrency(stats.totalRevenue)}
                icon={FiDollarSign}
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                title="Tổng đơn hàng"
                value={stats.totalOrders}
                icon={FiShoppingBag}
                color="bg-green-100 text-green-600"
              />
              <StatCard
                title="Khách hàng"
                value={stats.totalCustomers}
                icon={FiUsers}
                color="bg-purple-100 text-purple-600"
              />
              <StatCard
                title="Giá trị TB đơn"
                value={formatCurrency(stats.avgOrderValue)}
                icon={FiTrendingUp}
                color="bg-orange-100 text-orange-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h3 className="text-lg font-bold mb-6 italic text-gray-600 font-sans tracking-tight">
                  Xu hướng doanh thu
                </h3>

                <div className="h-80 w-full flex items-center justify-center">
                  {stats.revenueTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.revenueTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis hide />
                        <Tooltip formatter={(value: any) => `${Number(value).toLocaleString('vi-VN')} đ`} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#2563EB"
                          fill="#DBEAFE"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-gray-400 text-sm italic">
                      {loading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu doanh thu để hiển thị'}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h3 className="text-lg font-bold mb-6 text-center">Phân bố danh mục</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryDistribution}
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        paddingAngle={5}
                      >
                        {stats.categoryDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <FiAward className="text-yellow-500 text-2xl" />
                  <h3 className="text-lg font-bold uppercase">Khách hàng VIP</h3>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b uppercase">
                      <th className="pb-4 text-left">Họ tên</th>
                      <th className="pb-4 text-center">Đơn</th>
                      <th className="pb-4 text-right">Chi tiêu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.vipCustomers.length > 0 ? (
                      stats.vipCustomers.map((customer, index) => (
                        <tr key={index} className="border-b last:border-0 hover:bg-gray-50 transition">
                          <td className="py-4 font-semibold">{customer.name}</td>
                          <td className="py-4 text-center">{customer.orders}</td>
                          <td className="py-4 text-right font-bold text-blue-600">
                            {formatCurrency(customer.total)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-gray-400 italic">
                          {loading ? 'Đang tải dữ liệu...' : 'Chưa có khách hàng phát sinh đơn hàng'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <FiPackage className="text-blue-500 text-2xl" />
                  <h3 className="text-lg font-bold uppercase">Trạng thái đơn hàng</h3>
                </div>

                <div className="h-72">
                  {statusCards.some((item) => item.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusCards}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {statusCards.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 italic">
                      {loading ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu trạng thái đơn hàng'}
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {statusCards.map((item, index) => (
                    <div
                      key={item.name}
                      className="rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <span className="font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              Tổng sản phẩm hiện có trong hệ thống: <span className="font-bold">{stats.totalProducts}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
};

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
    </div>
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
  </div>
);

export default Statistics;