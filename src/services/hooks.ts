import { useEffect, useState } from "react";
import { authApi, productApi, cartApi, newsApi, servicesApi, promotionsApi, reviewApi, type Product, type NewsItem, type ServiceItem, type PromotionItem, type Category, type NewsTitle, type Review } from "./api";
import { authController } from "./controller";
// Các hook tùy chỉnh để quản lý trạng thái và logic liên quan đến API
export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    const validation = authController.validateLogin(email, password);
    if (!validation.success) throw new Error(validation.message);

    try {
      setLoading(true);
      const data = await authApi.login({ email, password }); 
      
      console.log("User data:", data.user); // Log user data for debugging
      
      localStorage.setItem("userId", data.user.id.toString());
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) localStorage.setItem("token", data.token);
      
      return data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Đăng nhập thất bại"); 
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData: any) => {
    const validation = authController.validateRegister(registerData);
    if (!validation.success) throw new Error(validation.message);

    try {
      setLoading(true);
      const formattedData = {
        Email: registerData.email,
        Password: registerData.password,
        FullName: `${registerData.name} ${registerData.lastname}`,
        Role: "Customer",
        Status: true
      };
      return await authApi.register(formattedData);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    try {
      setLoading(true);
      const data = await authApi.googleLogin(idToken);
      
      localStorage.setItem("userId", data.user.id.toString());
      localStorage.setItem("auth", JSON.stringify(data));
      
      return data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Xác thực Google thất bại");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return { login, register, loginWithGoogle, logout, loading };
};

export const useProducts = (categoryId?: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (categoryId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.getAll(categoryId);
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(categoryId);
  }, [categoryId]);

  return { products, loading, error, refetch: fetchProducts };
};

export const useCart = () => {
  const [isAdding, setIsAdding] = useState(false);

  const addToCart = async (variantId: number, quantity: number) => {
    const userId = Number(localStorage.getItem("userId")) || 1;
    
    if (!userId) {
       alert("Vui lòng đăng nhập để thực hiện chức năng này");
       return;
    }

    setIsAdding(true);
    try {
      const result = await cartApi.add({
        userId,
        variantId,
        quantity
      });
      return result;
    } catch (error: any) {
      const msg = error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng";
      alert(msg);
      throw new Error(msg);
    } finally {
      setIsAdding(false);
    }
  };

  return { addToCart, isAdding };
};

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await newsApi.getAll();
      setNews(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải tin tức");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return { news, loading, error, refetch: fetchNews };
};

export const useServices = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await servicesApi.getAll();
      setServices(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return { services, loading, error, refetch: fetchServices };
};

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await promotionsApi.getAll();
      setPromotions(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return { promotions, loading, error, refetch: fetchPromotions };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh mục sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, refetch: fetchCategories };
};

export const useNewsTitles = () => {
  const [newsTitles, setNewsTitles] = useState<NewsTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewsTitles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await newsApi.getTitles();
      setNewsTitles(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải tiêu đề tin tức");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsTitles();
  }, []);

  return { newsTitles, loading, error, refetch: fetchNewsTitles };
};

export const useReviews = (productId?: number) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async (pId?: number) => {
    if (!pId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await reviewApi.getByProduct(pId);
      setReviews(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews(productId);
    }
  }, [productId]);

  return { reviews, loading, error, refetch: fetchReviews };
};