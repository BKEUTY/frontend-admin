# BKEUTY Admin Dashboard - Hệ thống Quản trị Toàn diện

BKEUTY Admin Dashboard là trung tâm điều hành của hệ thống, cung cấp cái nhìn toàn cảnh và các công cụ quản lý chuyên sâu cho nhà bán hàng. Từ quản lý kho vận đến phân tích hành vi khách hàng, tất cả được tích hợp trong một giao diện hiện đại và bảo mật.

## 📊 Công nghệ Chủ đạo

- **Cấu trúc**: React 19 & Vite (Tối ưu hóa tốc độ phản hồi Dashboard).
- **Trực quan hóa Dữ liệu**: [Recharts](https://recharts.org/) - Biểu đồ doanh thu, thống kê tăng trưởng và nhân khẩu học.
- **Hệ thống Giao diện**: Ant Design 6 với layout Dashbord chuyên dụng cho quản trị viên.
- **Xử lý Dữ liệu**: React Query xử lý luồng dữ liệu khổng lồ từ các Microservices một cách mượt mà.
- **Bảo mật**: Cơ chế xác thực vai trò (Role-based access control) thông qua Keycloak Admin.

## 🛠 Các Module Chức năng

- **Dashboard Phân tích**: 
  - Thống kê doanh thu, đơn hàng và khách hàng mới theo thời gian thực.
  - Báo cáo tăng trưởng và hiệu suất sản phẩm bán chạy.
- **Quản lý Sản phẩm (Inventory Center)**:
  - CRUD Sản phẩm & Biến thể (Variants) đa tầng.
  - Quản lý danh mục (Categories) và thương hiệu (Brands).
- **Hệ thống Đơn hàng (Order Ops)**:
  - Xử lý trạng thái đơn hàng từ lúc đặt đến khi giao thành công.
  - Quản lý thanh toán và thông tin vận chuyển.
- **Quản lý Khuyến mãi (Marketing)**: 
  - Thiết lập các chương trình giảm giá linh hoạt (theo giá trị đơn, theo sản phẩm).
- **Cộng đồng & Đánh giá**: 
  - Quản lý nội dung phản hồi, phê duyệt và tương tác với đánh giá từ khách hàng.
- **Quản lý Người dùng**: Kiểm soát tài khoản người dùng và vai trò quản trị.

## ⚙️ Hướng dẫn Triển khai

1. **Cài đặt**:
   ```bash
   npm install
   ```

2. **Cấu hình**:
   - Khởi tạo file `.env` từ mẫu `.env.example`.
   - Đảm bảo `VITE_API_URL` trỏ chính xác về API Gateway của Microservices.

3. **Khởi chạy**:
   ```bash
   npm run dev
   ```
   *Mặc định tại: `http://localhost:3001`*

4. **Đóng gói**:
   ```bash
   npm run build
   ```

## 📐 Cấu trúc Dự án

- `src/api`: Các API client chuyên dụng cho từng service (Product, Order, Revenue).
- `src/Component/Admin`: Các UI Admin specialized (Sidebar, StatsCard, AnalyticsChart).
- `src/pages/Admin`: Chứa source code của các module chức năng quản trị.
- `src/routes`: Hệ thống routing bảo vệ, chỉ cho phép vai trò Admin truy cập.
- `src/i18n`: Đa ngôn ngữ chuyên ngành thương mại điện tử.

---
© 2026 BKEUTY Admin Support. Powered by Microservices Architecture.
