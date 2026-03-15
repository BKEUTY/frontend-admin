# Hướng dẫn Deploy Admin lên Vercel (Private Organization & Monorepo)

Tài liệu này hướng dẫn chi tiết cách deploy ứng dụng **Admin** lên Vercel bằng **Vercel CLI**. Đây là giải pháp tối ưu cho dự án nằm trong một Organization Private hoặc có cấu trúc thư mục phức tạp (Monorepo) mà Vercel dashboard không tự nhận diện chính xác.

---

## 1. Chuẩn bị (Prerequisites)

1. **Cài đặt Vercel CLI**:
   Mở terminal (PowerShell hoặc CMD) và cài đặt globally:
   ```bash
   npm install -g vercel
   ```

2. **Cấu hình dự án**: Đảm bảo file `admin/app/web/vercel.json` đã tồn tại để cấu hình build command và routing.

---

## 2. Quy trình thiết lập từng bước (Interactive CLI)

Thực hiện các lệnh này tại thư mục chứa source code của Web Admin:
`d:\Code\HK252\bkeuty\admin\app\web`

### Bước 1: Đăng nhập
```bash
vercel login
```
- Chọn phương thức đăng nhập (Email/GitHub).
- Trình duyệt sẽ mở ra để bạn xác nhận. Sau khi thấy thông báo "Congratulations!", quay lại terminal.

### Bước 2: Liên kết dự án (Linking)
Chạy lệnh sau để kết nối code local với dự án trên Vercel:
```bash
vercel link
```

**Các câu hỏi bạn sẽ gặp và cách trả lời:**
1. **Set up and deploy?** `Yes`
2. **Which scope should contain your project?** Chọn tên Organization của bạn (ví dụ: `BKEUTY`).
3. **Link to existing project?** `No` (Nếu đây là lần đầu tiên bạn deploy dự án này).
4. **What’s your project’s name?** `bkeuty-admin` (Hoặc tên bạn muốn hiển thị trên Vercel).
5. **In which directory is your code located?** `./` (Vì bạn đang đứng đúng ở `admin/app/web`).
6. **Want to modify build settings?** `No` (Vì chúng ta đã cấu hình trong `vercel.json`).

---

## 3. Lấy thông số cấu hình CI/CD (GitHub Actions)

Sau khi `vercel link` thành công, một thư mục ẩn `.vercel` sẽ được tạo ra. Bạn cần lấy 3 giá trị sau để cấu hình tự động deploy:

1. **VERCEL_TOKENS**:
   - Truy cập [Vercel Tokens](https://vercel.com/account/tokens).
   - Tạo token mới, đặt tên là `GITHUB_ACTIONS_DEPLOY`.
2. **VERCEL_ORG_ID**:
   - Mở file `.vercel/project.json` trong thư mục `admin/app/web`.
   - Copy giá trị ở dòng `orgId`.
3. **VERCEL_PROJECT_ID**:
   - Cũng trong file `.vercel/project.json`.
   - Copy giá trị ở dòng `projectId`.

---

## 4. Cấu hình GitHub Secrets

Để file GitHub Workflow (`admin/.github/workflows/deploy_web.yml`) hoạt động, bạn phải thêm 3 giá trị trên vào **Secrets** của Repository trên GitHub:

1. Vào Repo `frontend-admin` -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Nhấn **New repository secret** và thêm lần lượt:
   - Tên: `VERCEL_TOKEN` | Giá trị: (Dán token ở bước 3.1)
   - Tên: `VERCEL_ORG_ID` | Giá trị: (Dán orgId ở bước 3.2)
   - Tên: `VERCEL_PROJECT_ID` | Giá trị: (Dán projectId ở bước 3.3)

---

## 5. Các lệnh Deploy hữu ích

- **Deploy lên môi trường nháp (Preview):**
  ```bash
  vercel
  ```
- **Deploy thẳng lên môi trường chính thức (Production):**
  ```bash
  vercel --prod
  ```

---

## Lưu ý về cấu trúc thư mục
Vì dự án này là một phần của repo lớn, hãy luôn đảm bảo bạn đang ở thư mục `admin/app/web` trước khi chạy bất kỳ lệnh `vercel` nào. Nếu chạy ở thư mục gốc `bkeuty`, Vercel sẽ không tìm thấy `package.json` và build sẽ thất bại.
