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
      <div className="flex items-center gap-4 lg:gap-6 flex-1 relative">
        <button 
          onClick={() => setIsNavMenuOpen(!isNavMenuOpen)} 
          className="nav-button p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none text-black shrink-0"
        >
          <Menu size={20} />
        </button>
        
        {isNavMenuOpen && (
          <div className="nav-menu absolute top-full left-0 mt-4 md:static md:mt-0 flex flex-col md:flex-row items-start md:items-center bg-white md:bg-transparent shadow-xl md:shadow-none rounded-xl md:rounded-none border border-gray-100 md:border-none p-6 md:p-0 gap-6 lg:gap-8 text-sm font-bold uppercase tracking-widest text-gray-600 animate-in slide-in-from-left-4 fade-in duration-300 z-50">
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
                <div className="md:absolute static top-full left-0  w-full md:w-56 bg-gray-50 md:bg-white border-none md:border border-gray-100 rounded-xl md:shadow-xl py-2 md:py-3 z-50 overflow-hidden">
                  <button 
                    onClick={() => {
                      navigate(`/products`);
                      setIsProductsDropdownOpen(false);
                      setIsNavMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm font-bold hover:bg-gray-100 md:hover:bg-gray-50 transition-colors"
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
                      className="w-full text-left px-5 py-3 text-sm font-medium hover:bg-gray-100 md:hover:bg-gray-50 transition-colors"
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
                <div className="md:absolute static top-full left-0 w-full md:w-64 bg-gray-50 md:bg-white border-none md:border border-gray-100 rounded-xl md:shadow-xl py-2 md:py-3 z-50 overflow-hidden">
                  
                  {/* Tất cả */}
                  <button 
                    onClick={() => {
                      navigate("/news");
                      setIsNewsDropdownOpen(false);
                      setIsNavMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 text-sm font-bold hover:bg-gray-100 md:hover:bg-gray-50"
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
                      className="w-full text-left px-5 py-3 text-sm hover:bg-gray-100 md:hover:bg-gray-50"
                    >
                      <div className="font-medium">{news.title}</div>
                      <div className="text-xs text-gray-500">{news.category}</div>
                    </button>
                  ))}

                </div>
              )}
            </div>

            <button onClick={() => { navigate("/aboutus"); setIsNavMenuOpen(false); }} className={`hover:text-black transition-colors shrink-0 ${location.pathname.startsWith('/aboutus') ? 'text-black' : ''}`}>
              About us
            </button>

            <button onClick={() => navigate("/faq")} className="hover:text-gray-500 transition-colors ">
              Hỗ trợ
            </button>
          </div>
        )}
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
