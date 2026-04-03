# BKEUTY Admin Dashboard - Quản trị Hệ thống

Trang quản trị BKEUTY là Dashboard tích hợp dành cho nhà bán hàng để quản lý toàn diện các hoạt động kinh doanh, từ sản phẩm, đơn hàng cho đến phân tích dữ liệu.

## 📊 Công nghệ sử dụng

- **Core**: React 19, Vite, JavaScript (JSX)
- **UI Framework**: Ant Design 6
- **Routing**: React Router 7
- **Analytics Visualization**: Recharts (Dữ liệu doanh thu, số lượng đơn hàng)
- **Data Fetching**: @tanstack/react-query
- **State Management**: React Context (Auth, Notification, Language)
- **Styling**: Vanilla CSS (CSS Variables)

## 🛠 Tính năng Dashboard Quản trị

- **Dashboard Tổng quan**: Biểu đồ doanh thu theo thời gian, thống kê đơn hàng mới.
- **Quản lý Sản phẩm**: CRUD sản phẩm, biến thể (Variant), quản lý tồn kho và khuyến mãi.
- **Quản lý Đơn hàng**: Theo dõi trạng thái đơn đặt hàng, in hóa đơn và cập nhật vận chuyển.
- **Quản lý Đánh giá**: Phê duyệt và phản hồi đánh giá của khách hàng từ Review Service.
- **Phân quyền & Bảo mật**: Quản trị viên (Admin) thông qua Keycloak OAuth2.
- **Đa ngôn ngữ**: Giao diện tiếng Việt/tiếng Anh linh hoạt.

## ⚙️ Cài đặt và Chạy dự án

1. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

2. **Cấu hình môi trường**:
   - Sao chép file `.env.example` thành `.env`.
   - Cập nhật `VITE_API_URL` đến Microservice Gateway.

3. **Chạy ở chế độ phát triển**:
   ```bash
   npm run dev
   ```
   *Dự án sẽ khởi chạy tại: `http://localhost:3001`*

4. **Xây dựng bản sản xuất**:
   ```bash
   npm run build
   ```

## 📐 Cấu trúc thư mục

- `src/api`: Các API client tương tác với Microservices.
- `src/Component/Admin`: Các layout và thành phần đặc thù cho trang quản trị (Sidebar, Topbar).
- `src/pages/Admin`: Các module chức năng (Product, Order, Review, User management).
- `src/routes`: Cấu hình routing phân quyền theo Role.
- `src/i18n`: Cấu hình đa ngôn ngữ cho giao diện quản trị.
