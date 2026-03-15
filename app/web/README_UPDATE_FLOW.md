# BKEUTY - Luồng Hoạt Động & Tối Ưu Hóa Dữ Liệu Sản Phẩm

Tài liệu này mô tả chi tiết luồng hoạt động mới sau khi tối ưu hóa cấu trúc dữ liệu giữa Backend và Frontend, giúp ứng dụng chạy nhẹ hơn và mã nguồn gọn gàng hơn.

## 1. Cơ chế Tùy chọn Sản phẩm (Product Options) Mới

### Thay đổi Quan trọng:
Trước đây, Backend phải gửi thêm một danh sách `options` riêng biệt (Size, Màu sắc...) thông qua `OptionDto`. Hiện tại, để giảm tải cho database và đơn giản hóa API, chúng ta đã **loại bỏ OptionDto**.

### Luồng hoạt động hiện tại:
1.  **Backend**: Chỉ trả về thông tin sản phẩm và danh sách các **Variants** (Biến thể). Mỗi biến thể đã chứa sẵn các thuộc tính trong trường `variantOptions` (Map<String, String>).
    *   Ví dụ: Biến thể 1 có `{ "Dung tích": "50ml", "Màu sắc": "Đỏ" }`
2.  **Frontend (ProductDetail.js)**:
    *   Khi nhận được danh sách `variants`, Frontend sẽ tự động duyệt qua tất cả các phần tử.
    *   Sử dụng đối tượng `Set` để lọc ra các giá trị duy nhất cho mỗi tên thuộc tính.
    *   Tự động xây dựng lại mảng `options` để hiển thị các nút chọn trên giao diện.

### Lợi ích:
*   **Chính xác tuyệt đối**: Giao diện chỉ hiển thị các tùy chọn thực sự có hàng (dựa trên variant thực tế).
*   **Hiệu năng**: Backend bớt được 2-3 câu lệnh JOIN và truy vấn bảng Option/OptionValue.
*   **Dễ bảo trì**: Không cần quan tâm đến việc đồng bộ bảng Option khi cập nhật Variant.

## 2. Luồng Phân trang (Pagination)

Dữ liệu mẫu SQL đã được bổ sung >25 sản phẩm.
*   **Giao diện User**: Phân trang mặc định 30 sản phẩm/trang.
*   **Giao diện Admin**: Phân trang 10 sản phẩm/trang để dễ quản lý.
*   Cơ chế: Sử dụng `Pageable` của Spring Boot để thực hiện phân trang từ phía Server (Server-side pagination).

---
*Cập nhật ngày: 08/03/2026*
