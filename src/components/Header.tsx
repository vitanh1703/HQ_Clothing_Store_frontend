import { Menu, ShoppingBag, User, Heart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCategories } from "../services/hooks";
import { useNewsTitles } from "../services/hooks";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isNewsDropdownOpen, setIsNewsDropdownOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const { categories } = useCategories();
  const { newsTitles } = useNewsTitles();

  useEffect(() => {
    const checkAuth = () => {
      const auth = sessionStorage.getItem("auth");
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("userId");
      setIsLoggedIn(!!(auth || token || userId));
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-dropdown') && !target.closest('.user-button')) {
        setIsDropdownOpen(false);
      }
      if (!target.closest('.nav-menu') && !target.closest('.nav-button')) {
        setIsNavMenuOpen(false);
      }
    };

    if (isDropdownOpen || isNavMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isNavMenuOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    navigate("/logout"); 
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 md:px-10 py-4 shadow-sm">
      {/* LEFT: Menu & Navigation */}
      <div className="flex items-center gap-4 lg:gap-6 flex-1 lg:static">
        <button 
          onClick={() => setIsNavMenuOpen(!isNavMenuOpen)} 
          className="nav-button p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none text-black shrink-0 lg:hidden"
        >
          <Menu size={20} />
        </button>
        
        <div className={`nav-menu absolute top-full left-0 w-full lg:w-auto mt-0 lg:static flex-col lg:flex-row items-start lg:items-center bg-white lg:bg-transparent shadow-xl lg:shadow-none border-b border-gray-100 lg:border-none p-6 lg:p-0 gap-6 lg:gap-8 text-sm font-bold uppercase tracking-widest text-gray-600 z-50 ${isNavMenuOpen ? 'flex animate-in slide-in-from-top-2 fade-in duration-300' : 'hidden lg:flex'}`}>
            <button 
              onClick={() => { navigate("/home"); setIsNavMenuOpen(false); }} 
              className={`hover:text-black transition-colors shrink-0 ${location.pathname === '/home' ? 'text-black' : ''}`}
            >
              Trang chủ
            </button>
            
            <div
              className="relative"
              onMouseEnter={() => setIsProductsDropdownOpen(true)}
              onMouseLeave={() => setIsProductsDropdownOpen(false)}
            >
              <button 
                onClick={() => navigate("/products")} 
                className={`hover:text-black transition-colors w-full md:w-auto text-left ${location.pathname.startsWith('/products') ? 'text-black' : ''}`}
              >
                Sản phẩm
              </button>
              {isProductsDropdownOpen && (
                <div className="lg:absolute static top-full left-0 w-full lg:w-56 bg-gray-50 lg:bg-white border-none lg:border border-gray-100 rounded-xl lg:shadow-xl py-2 lg:py-3 z-50 overflow-hidden mt-2 lg:mt-0">
                  <button 
                    onClick={() => {
                      navigate(`/products`);
                      setIsProductsDropdownOpen(false);
                      setIsNavMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm font-bold hover:bg-gray-100 lg:hover:bg-gray-50 transition-colors"
                  >
                    Tất cả sản phẩm
                  </button>
                  {categories?.map((category: any) => (
                    <button 
                      key={category.id}
                      onClick={() => {
                        navigate(`/products?category=${category.id}`);
                        setIsProductsDropdownOpen(false);
                        setIsNavMenuOpen(false);
                      }}
                      className="w-full text-left px-5 py-3 text-sm font-medium hover:bg-gray-100 lg:hover:bg-gray-50 transition-colors"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setIsNewsDropdownOpen(true)}
              onMouseLeave={() => setIsNewsDropdownOpen(false)}
            >
              <button 
                onClick={() => navigate("/news")} 
                className={`hover:text-black transition-colors shrink-0 ${location.pathname.startsWith('/news') ? 'text-black' : ''}`}
              >
                Tin tức
              </button>

              {isNewsDropdownOpen && (
                <div className="lg:absolute static top-full left-0 w-full lg:w-64 bg-gray-50 lg:bg-white border-none lg:border border-gray-100 rounded-xl lg:shadow-xl py-2 lg:py-3 z-50 overflow-hidden mt-2 lg:mt-0">
                  
                  {/* Tất cả */}
                  <button 
                    onClick={() => {
                      navigate("/news");
                      setIsNewsDropdownOpen(false);
                      setIsNavMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm font-bold hover:bg-gray-100 lg:hover:bg-gray-50"
                  >
                    Tất cả bài viết
                  </button>

                  {/* Map API */}
                  {newsTitles?.slice(0, 5).map((news: any) => (
                    <button
                      key={news.id}
                      onClick={() => {
                        navigate(`/news/${news.id}`);
                        setIsNewsDropdownOpen(false);
                        setIsNavMenuOpen(false);
                      }}
                      className="w-full text-left px-5 py-3 text-sm hover:bg-gray-100 lg:hover:bg-gray-50"
                    >
                      <div className="font-medium">{news.title}</div>
                      <div className="text-xs text-gray-500">{news.category}</div>
                    </button>
                  ))}

                </div>
              )}
            </div>

            <button onClick={() => { navigate("/aboutus"); setIsNavMenuOpen(false); }} className={`hover:text-black transition-colors shrink-0 ${location.pathname.startsWith('/aboutus') ? 'text-black' : ''}`}>
              Giới thiệu
            </button>

            <button onClick={() => navigate("/faq")} className="hover:text-gray-500 transition-colors ">
              Hỗ trợ
            </button>
          </div>
      </div>

      {/* CENTER: Logo */}
      <div className="flex shrink-0 justify-center">
        <span onClick={() => navigate("/home")} className="text-3xl font-black tracking-tighter uppercase cursor-pointer hover:opacity-70 transition-opacity text-black">H&Q</span>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center justify-end gap-2 md:gap-4 flex-1">
        <button 
          onClick={() => navigate("/wishlist")}
          className={`p-2 rounded-full transition-colors hover:bg-gray-100 ${location.pathname === '/wishlist' ? 'bg-gray-100' : ''}`}
          title="Yêu thích"
        >
          <Heart size={20} className={location.pathname === '/wishlist' ? 'fill-black' : ''} />
        </button>

        <div className="relative user-dropdown">
          <button 
            onClick={() => {
              if (!isLoggedIn) {
                navigate("/auth");
              } else {
                setIsDropdownOpen(!isDropdownOpen);
              }
            }}
            className={`user-button flex items-center gap-1 p-2 hover:bg-gray-100 rounded-full transition-colors ${isDropdownOpen ? 'bg-gray-100' : ''}`}
            title="Tài khoản"
          >
            <User size={20} />
          </button>
          
          {isLoggedIn && isDropdownOpen && (
            <div className="user-dropdown absolute right-0 top-full mt-4 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-3 z-50 overflow-hidden">
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-5 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Thông tin cá nhân
              </button>
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate("/orders-history");
                }}
                className="w-full text-left px-5 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Lịch sử đơn hàng
              </button>
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate("/wishlist");
                }}
                className="w-full text-left px-5 py-3 text-sm font-medium hover:bg-gray-50 transition-colors md:hidden"
              >
                Yêu thích
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={() => navigate("/cart")}
          className="flex items-center bg-black text-white px-4 md:px-5 py-2.5 rounded-full gap-2 hover:bg-gray-800 transition-all shadow-md active:scale-95 ml-1 md:ml-2"
        >
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest hidden sm:inline">Giỏ hàng</span>
          <ShoppingBag size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Header;
