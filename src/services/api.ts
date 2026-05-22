import axios from "axios";
const API_BASE = "https://localhost:7137/api";

export interface Variant {
  id?: number;
  tempId?: string;
  size: string;
  color: string;
  price: number | string;
  stockQuantity: number | string;
  sku?: string;
}

export interface Product {
  imageSrc: any;
  id: number;
  name: string;
  brandText?: string;    
  imageUrl: string;    
  description?: string;
  categoryId?: number;
  supplierId?: number;
  variants: Variant[]; 
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  imageUrl: string;
}

export interface NewsCardProps {
  id: number;
  category: string;
  title: string;
  date: string;
  img: string;
  desc: string;
}
export interface Category {
  id: number;
  name: string;
  description?: string;
}
export interface NewsTitle {
  id: number;
  title: string;
  category: string;
}
export interface ServiceItem {
  id: number;
  iconName: string;
  title: string;
  description: string;
}

export interface PromotionItem {
  id: number;
  code: string;
  description: string;
  discountValue: number;
  discountType: string;
  discountText: string;
  startDate: string;
  endDate: string;
  title?: string;
  discountPercent?: number;
}

export interface PromotionValidationResult {
  code: string;
  description: string;
  discountValue: number;
  discountType: string;
}

export interface ReviewResponse {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

export interface CheckoutCartItem {
  id: number;
  variantId: number;
  productId: number;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  total: number;
  image: string;
}

export interface CheckoutUser {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface CheckoutResponse {
  id: number;
  orderCode: string;
  cartId: number;
  user: CheckoutUser;
  items: CheckoutCartItem[];
}

export interface AddToCartRequest {
  userId: number;
  variantId: number;
  quantity: number;
}

export interface ServicesCardProps {
  iconName: string;
  title: string;
  description: string;
}

export interface PromotionCardProps {
  code: string;
  title: string;
  description: string;
  discountText: string;
}

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  userName?: string;
}

export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  address?: string;
}

export interface NewsManagerItem {
  id: number;
  category: string;
  title: string;
  description?: string;
  content?: string;
  imgUrl?: string;
  publishDate: string;
  createdAt: string;
}

export interface DashboardStatisticsResponse {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  totalProducts: number;
  revenueTrend: {
    day: string;
    revenue: number;
  }[];
  categoryDistribution: {
    name: string;
    value: number;
  }[];
  vipCustomers: {
    name: string;
    orders: number;
    total: number;
  }[];
  orderStatusDistribution: {
    name: string;
    value: number;
  }[];
}

export const authApi = {
  login: async (loginData: any) => {
    const response = await axios.post(`${API_BASE}/Auth/login`, {
      Email: loginData.email,    
      Password: loginData.password
    });
    return response.data;
  },

  register: async (formData: any) => {
    const response = await axios.post(`${API_BASE}/Auth/register`, formData);
    return response.data;
  },

  googleLogin: async (idToken: string) => {
    const response = await axios.post(`${API_BASE}/Auth/google-login`, { 
      token: idToken 
    });
    return response.data;
  }
};

export const productApi = {
  getAll: async (categoryId?: number): Promise<Product[]> => {
    const response = await axios.get(`${API_BASE}/Products`, {
      params: categoryId ? { category: categoryId } : undefined,
    });
    return response.data;
  },
  getByCategory: async (categoryId: number): Promise<Product[]> => {
    return productApi.getAll(categoryId);
  },
  getReviewSummary: async (productId: number): Promise<ReviewResponse> => {
    const response = await axios.get(`${API_BASE}/Products/${productId}/reviews`);
    return response.data;
  },
  getCategories: async (): Promise<Category[]> => {
    const response = await axios.get(`${API_BASE}/Products/categories`);
    return response.data;
  },
  getAllForAdmin: async (): Promise<Product[]> => {
    const response = await axios.get(`${API_BASE}/Products/admin/all`);
    return response.data;
  },
  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const response = await axios.post(`${API_BASE}/Products/admin/create`, product);
    return response.data;
  },
  update: async (id: number, product: Partial<Product>): Promise<Product> => {
    const response = await axios.put(`${API_BASE}/Products/admin/${id}`, product);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/Products/admin/${id}`);
  }
};

export const cartApi = {
  add: async (data: AddToCartRequest) => {
    const response = await axios.post(`${API_BASE}/Cart/add`, data);
    return response.data;
  },

  remove: async (cartItemId: number) => {
    const response = await axios.delete(`${API_BASE}/Cart/remove/${cartItemId}`);
    return response.data;
  },

  getCheckout: async (userId: number): Promise<CheckoutResponse> => {
    const response = await axios.get(`${API_BASE}/Cart/checkout/${userId}`);
    return response.data;
  }
};

export const newsApi = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE}/News`);
    return response.data;
  },
  getTitles: async (): Promise<NewsTitle[]> => {
    const response = await axios.get(`${API_BASE}/News/titles`);
    return response.data;
  },
  getAllForAdmin: async (): Promise<NewsManagerItem[]> => {
    const response = await axios.get(`${API_BASE}/News/admin/all`);
    return response.data;
  },
  create: async (news: Omit<NewsManagerItem, 'id' | 'createdAt'>): Promise<NewsManagerItem> => {
    const response = await axios.post(`${API_BASE}/News/admin/create`, news);
    return response.data;
  },
  update: async (id: number, news: Partial<NewsManagerItem>): Promise<NewsManagerItem> => {
    const response = await axios.put(`${API_BASE}/News/admin/${id}`, news);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/News/admin/${id}`);
  }
};

export const servicesApi = {
  getAll: async (): Promise<ServiceItem[]> => {
    const response = await axios.get(`${API_BASE}/Services`);
    return response.data;
  }
};

export const promotionsApi = {
  getAll: async (): Promise<PromotionItem[]> => {
    const response = await axios.get(`${API_BASE}/Promotions`);
    return response.data;
  },

  validateCode: async (code: string): Promise<PromotionValidationResult> => {
    const response = await axios.get(`${API_BASE}/Promotions/validate/${encodeURIComponent(code)}`);
    return response.data;
  }
};

export const reviewApi = {
  getAll: async (): Promise<Review[]> => {
    const response = await axios.get(`${API_BASE}/Reviews`);
    return response.data;
  },
  getByProduct: async (productId: number): Promise<Review[]> => {
    const response = await axios.get(`${API_BASE}/Reviews/product/${productId}`);
    return response.data;
  },
  getByRating: async (rating: number): Promise<Review[]> => {
    const response = await axios.get(`${API_BASE}/Reviews/rating/${rating}`);
    return response.data;
  }
};

export const supplierApi = {
  getAll: async (): Promise<Supplier[]> => {
    try {
      const response = await axios.get(`${API_BASE}/Suppliers`);
      return response.data;
    } catch (error) {
      console.log('Supplier endpoint not available, returning empty array');
      return [];
    }
  },
  create: async (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
    const response = await axios.post(`${API_BASE}/Suppliers`, supplier);
    return response.data;
  },
  update: async (id: number, supplier: Partial<Supplier>): Promise<Supplier> => {
    const response = await axios.put(`${API_BASE}/Suppliers/${id}`, supplier);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/Suppliers/${id}`);
  }
};
export const statsApi = {
  getDashboard: async (range: string = '7days'): Promise<DashboardStatisticsResponse> => {
    const response = await axios.get(`${API_BASE}/Statistics/dashboard`, {
      params: { range },
    });
    return response.data;
  },
};