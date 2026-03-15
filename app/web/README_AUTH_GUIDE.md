# Hướng Dẫn Cấu Hình & Test Hệ Thống Xác Thực (Full Deep Dive)

Tài liệu này hướng dẫn bạn từ con số 0 để thiết lập Keycloak, kết nối Backend và test API thành công.

---

## PHẦN 1: KHỞI ĐỘNG HỆ THỐNG

### 1. Chuẩn bị Môi trường (Fix lỗi JAVA_HOME)
Keycloak yêu cầu Java nhưng đôi khi không nhận diện được đường dẫn. Hãy mở PowerShell và chạy:
```powershell
# Bước A: Gán đường dẫn JDK (Thay bằng đường dẫn thực tế trên máy bạn)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"

# Bước B: Start Keycloak ở port 8181
cd d:\Code\HK252\bkeuty\microservice\keycloak-26.2.5
.\bin\kc.bat start-dev --http-port 8181
```

### 2. Tạo tài khoản Admin hệ thống (Master Admin)
1.  Truy cập: [http://localhost:8181](http://localhost:8181)
2.  Nếu thấy trang **"Create administrator"**: Nhập Username: `admin` / Password: `admin`. Nhấn **Create**.
3.  Nhấn nút **Administration Console** và đăng nhập bằng tài khoản vừa tạo.

---

## PHẦN 2: CẤU HÌNH KEYCLOAK CHO DỰ ÁN (BẮT BUỘC)

### Bước 1: Tạo Realm (Vùng quản lý dự án)
1.  Ở góc trên bên trái, nhấn vào menu **Master** -> Chọn **Create Realm**.
2.  **Realm name**: `bkeuty` (Phải viết chính xác như vậy).
3.  Nhấn **Create**.

### Bước 2: Tạo Client (Cổng kết nối cho Auth-Service)
1.  Vào menu **Clients** (bên trái) -> Nhấn **Create client**.
2.  **Client ID**: `bkeuty-auth-service`.
3.  Nhấn **Next**.
4.  **Client Authentication**: Gạt sang **On** (Cực kỳ quan trọng).
5.  **Authentication flow**: Tích chọn thêm **Direct access grants**.
6.  Nhấn **Save**.

### Bước 3: Lấy Secret và Cấu hình Backend
1.  Tại client vừa tạo, vào tab **Credentials**.
2.  Copy chuỗi ở ô **Client Secret**.
3.  Mở file: `microservice/auth-service/src/main/resources/application.yaml`.
4.  Thay chuỗi vừa copy vào dòng: `client-secret: <dán_vào_đây>`.
5.  **Restart Auth-Service**: Chạy lại lệnh `./mvnw spring-boot:run` để nhận key mới.

---

## PHẦN 3: CẤU HÌNH PHÂN QUYỀN (MAPPER & ATTRIBUTES)

Backend cần thông tin `user_role` để cho phép vào trang Admin. Nếu thiếu phần này, bạn sẽ bị lỗi **403 Forbidden**.

### Bước 1: Tạo Mapper cho Client
1.  Vào menu **Clients** -> Chọn **bkeuty-auth-service**.
2.  Nhấn tab **Client scopes**.
3.  Dưới bảng, click vào link: **`bkeuty-auth-service-dedicated`**.
4.  Nhấn nút **Add mapper** -> Chọn **By configuration**.
5.  Tìm và chọn loại: **User Attribute**.
6.  Cấu hình chính xác như sau:
    *   **Name**: `map_user_role`
    *   **User Attribute**: `user_role`
    *   **Token Claim Name**: `user_role` (Viết thường, có gạch dưới)
    *   **Claim JSON Type**: `String`
    *   **Add to access token**: **On**
7.  Nhấn **Save**.

### Bước 2: Tạo User và Gán Role
1.  Vào menu **Users** (bên trái) -> Nhấn **Add user**.
2.  **Username**: `admin`, **Email**: `admin@bkeuty.com`. Nhấn **Create**.
3.  Vào tab **Credentials** -> Nhấn **Set password**. Nhập mật khẩu là `admin` và **tắt** "Temporary".
4.  Vào tab **Attributes** (Nằm ngay cạnh tab *Details* hoặc *Credentials*):
    *   Key: `user_role`
    *   Value: `ADMIN`
    *   Nhấn **Save**.

---

## PHẦN 4: THỰC HIỆN TEST API (THE CHECKLIST)

Bây giờ mọi thứ đã sẵn sàng. Hãy test theo trình tự sau qua **API Gateway (Port 8080)**.

### 1. Đăng nhập lấy Token
*   **Method**: `POST`
*   **URL**: `http://localhost:8080/api/auth/login`
*   **Body (JSON)**:
    ```json
    {
      "username": "admin@bkeuty.com",
      "password": "admin"
    }
    ```
*   **Mong đợi**: Trả về `access_token` (một chuỗi dài). Hãy copy chuỗi này.

### 2. Test API Admin (Ví dụ: Danh sách đơn hàng hoặc sản phẩm admin)
*   **Method**: `GET`
*   **URL**: `http://localhost:8080/api/admin/product` (hoặc bất kỳ API admin nào)
*   **Header**:
    *   Key: `Authorization`
    *   Value: `Bearer <dán_token_vào_đây>` 
*   **Mong đợi**: Trả về dữ liệu (200 OK). Nếu trả về 403, hãy kiểm tra lại cấu hình **Mapper** ở Phần 3.

---

## PHẦN 5: DANH SÁCH PORT (SỔ TAY TRÊN MÁY)

1.  **Discovery Server**: `8761` (Trái tim của hệ thống)
2.  **API Gateway**: `8080` (Cổng vào chính để test API)
3.  **Keycloak**: `8181` (Cổng cấu hình bảo mật)
4.  **Auth Service**: `8083` (Xử lý logic Token)
5.  **Product Service**: `8081`
6.  **Order Service**: `8082`
7.  **User Service**: `8084` (Tránh trùng với Auth Service)
