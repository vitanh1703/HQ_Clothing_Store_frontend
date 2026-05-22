export const authController = {
  validateLogin: (email: string, password: string) => {
    if (!email || !password) {
      return { success: false, message: "Vui lòng nhập đầy đủ email và mật khẩu!" };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: "Định dạng email không hợp lệ!" };
    }
    return { success: true };
  },
  
  validateRegister: (data: any) => {
    const { name, lastname, email, password, confirmPassword } = data;
    
    if (!name || !lastname || !email || !password || !confirmPassword) {
      return { success: false, message: "Vui lòng điền đầy đủ thông tin!" };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: "Email không hợp lệ!" };
    }

    if (password.length < 6) {
      return { success: false, message: "Mật khẩu phải từ 6 ký tự trở lên!" };
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Mật khẩu xác nhận không khớp!" };
    }

    return { success: true };
  }

};

export const checkoutController = {
  validateCheckout: (data: any) => {
    const { fullName, email, phone, address } = data;

    // check rỗng
    if (!fullName || !email || !phone || !address) {
      return {
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin giao hàng!",
      };
    }

    // email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: "Email không hợp lệ!",
      };
    }

    // phone VN
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return {
        success: false,
        message: "Số điện thoại không hợp lệ!",
      };
    }

    // tên
    if (fullName.trim().length < 2) {
      return {
        success: false,
        message: "Họ tên quá ngắn!",
      };
    }

    // địa chỉ
    if (address.trim().length < 5) {
      return {
        success: false,
        message: "Địa chỉ không hợp lệ!",
      };
    }

    return { success: true };
  },
};

export const supplierController = {
  validateSupplier: (data: any): { success: boolean; message?: string; field?: string } => {
    const { name, phone, address } = data;
    
    // Validate tên nhà cung cấp
    if (!name || name.trim() === '') {
      return { success: false, message: "Tên nhà cung cấp không được để trống", field: "name" };
    }
    
    if (name.trim().length < 3) {
      return { success: false, message: "Tên nhà cung cấp phải có ít nhất 3 ký tự", field: "name" };
    }
    
    // Validate số điện thoại - REQUIRED
    if (!phone || phone.trim() === '') {
      return { success: false, message: "Số điện thoại không được để trống", field: "phone" };
    }
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      return { success: false, message: "Số điện thoại phải có 10 chữ số", field: "phone" };
    }
    
    // Validate địa chỉ - REQUIRED
    if (!address || address.trim() === '') {
      return { success: false, message: "Địa chỉ không được để trống", field: "address" };
    }
    
    if (address.trim().length < 5) {
      return { success: false, message: "Địa chỉ phải có ít nhất 5 ký tự", field: "address" };
    }
    
    return { success: true };
  }
};

export const productController = {
  validateProduct: (data: any): { success: boolean; message?: string; field?: string } => {
    const { name, brandText, description, imageUrl, categoryId, supplierId } = data;
    
    // Validate tên sản phẩm
    if (!name || name.trim() === '') {
      return { success: false, message: "Tên sản phẩm không được để trống", field: "name" };
    }
    
    if (name.trim().length < 2) {
      return { success: false, message: "Tên sản phẩm phải có ít nhất 2 ký tự", field: "name" };
    }

    if (name.trim().length > 255) {
      return { success: false, message: "Tên sản phẩm không được vượt quá 255 ký tự", field: "name" };
    }
    
    // Validate thương hiệu
    if (!brandText || brandText.trim() === '') {
      return { success: false, message: "Thương hiệu không được để trống", field: "brandText" };
    }
    
    if (brandText.trim().length < 2) {
      return { success: false, message: "Thương hiệu phải có ít nhất 2 ký tự", field: "brandText" };
    }

    if (brandText.trim().length > 100) {
      return { success: false, message: "Thương hiệu không được vượt quá 100 ký tự", field: "brandText" };
    }
    
    // Validate mô tả
    if (!description || description.trim() === '') {
      return { success: false, message: "Mô tả sản phẩm không được để trống", field: "description" };
    }
    
    if (description.trim().length < 10) {
      return { success: false, message: "Mô tả sản phẩm phải có ít nhất 10 ký tự", field: "description" };
    }

    if (description.trim().length > 2000) {
      return { success: false, message: "Mô tả sản phẩm không được vượt quá 2000 ký tự", field: "description" };
    }
    
    // Validate ảnh
    if (!imageUrl || imageUrl.trim() === '') {
      return { success: false, message: "Ảnh sản phẩm không được để trống", field: "imageUrl" };
    }
    
    const urlRegex = /^(https?:\/\/).+/;
    if (!urlRegex.test(imageUrl.trim())) {
      return { success: false, message: "Đường dẫn ảnh phải là URL hợp lệ (http:// hoặc https://)", field: "imageUrl" };
    }

    if (imageUrl.trim().length > 500) {
      return { success: false, message: "Đường dẫn ảnh không được vượt quá 500 ký tự", field: "imageUrl" };
    }
    
    // Validate danh mục
    if (!categoryId || categoryId === '') {
      return { success: false, message: "Danh mục không được để trống", field: "categoryId" };
    }

    const categoryNum = Number(categoryId);
    if (isNaN(categoryNum) || categoryNum <= 0) {
      return { success: false, message: "Danh mục không hợp lệ", field: "categoryId" };
    }
    
    // Validate nhà cung cấp
    if (!supplierId || supplierId === '') {
      return { success: false, message: "Nhà cung cấp không được để trống", field: "supplierId" };
    }

    const supplierNum = Number(supplierId);
    if (isNaN(supplierNum) || supplierNum <= 0) {
      return { success: false, message: "Nhà cung cấp không hợp lệ", field: "supplierId" };
    }
    
    return { success: true };
  }
};

export const newsController = {
  validateNews: (data: any): { success: boolean; message?: string; field?: string } => {
    const { title, category, description, content, imgUrl, publishDate } = data;
    
    // Validate tiêu đề
    if (!title || title.trim() === '') {
      return { success: false, message: "Tiêu đề tin tức không được để trống", field: "title" };
    }
    if (title.trim().length < 3) {
      return { success: false, message: "Tiêu đề phải có ít nhất 3 ký tự", field: "title" };
    }
    if (title.trim().length > 200) {
      return { success: false, message: "Tiêu đề không được vượt quá 200 ký tự", field: "title" };
    }
    
    // Validate danh mục
    if (!category || category.trim() === '') {
      return { success: false, message: "Danh mục không được để trống", field: "category" };
    }
    if (category.trim().length < 2) {
      return { success: false, message: "Danh mục phải có ít nhất 2 ký tự", field: "category" };
    }
    if (category.trim().length > 50) {
      return { success: false, message: "Danh mục không được vượt quá 50 ký tự", field: "category" };
    }
    
    // Validate mô tả ngắn
    if (!description || description.trim() === '') {
      return { success: false, message: "Mô tả ngắn không được để trống", field: "description" };
    }
    if (description.trim().length < 10) {
      return { success: false, message: "Mô tả phải có ít nhất 10 ký tự", field: "description" };
    }
    if (description.trim().length > 500) {
      return { success: false, message: "Mô tả không được vượt quá 500 ký tự", field: "description" };
    }
    
    // Validate nội dung
    if (!content || content.trim() === '') {
      return { success: false, message: "Nội dung tin tức không được để trống", field: "content" };
    }
    if (content.trim().length < 20) {
      return { success: false, message: "Nội dung phải có ít nhất 20 ký tự", field: "content" };
    }
    if (content.trim().length > 10000) {
      return { success: false, message: "Nội dung không được vượt quá 10000 ký tự", field: "content" };
    }
    
    // Validate ảnh (optional)
    if (imgUrl && imgUrl.trim() !== '') {
      const urlRegex = /^(https?:\/\/).+/;
      if (!urlRegex.test(imgUrl.trim())) {
        return { success: false, message: "Đường dẫn ảnh phải là URL hợp lệ (http:// hoặc https://)", field: "imgUrl" };
      }
      if (imgUrl.trim().length > 500) {
        return { success: false, message: "Đường dẫn ảnh không được vượt quá 500 ký tự", field: "imgUrl" };
      }
    }
    
    // Validate ngày đăng
    if (!publishDate || publishDate.trim() === '') {
      return { success: false, message: "Ngày đăng không được để trống", field: "publishDate" };
    }
    
    return { success: true };
  }
};