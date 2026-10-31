# 🏠 Nhà Lo 24h – Nền Tảng Dịch Vụ Sửa Chữa Gia Dụng 24/7

Nền tảng công nghệ kết nối trực tiếp theo nhu cầu (On-demand Platform) giữa hộ gia đình và lực lượng thợ sửa chữa, bảo trì kỹ thuật lành nghề.

---

## 📚 Hệ Thống Tài Liệu Dự Án (Documentation Index)

Dự án phân tách tài liệu thành hai nhánh rõ ràng theo đối tượng độc giả:

### 1. Dành cho Khối Kinh tế, Tiếp thị/Truyền thông & Vận hành (Non-Tech)
👉 **[Tài liệu Tổng quan Sản phẩm & Luồng Nghiệp vụ (PRODUCT_BLUEPRINT_AND_WORKFLOWS.md)](docs/PRODUCT_BLUEPRINT_AND_WORKFLOWS.md)**
* **Mục tiêu:** Giúp thành viên không chuyên về lập trình nắm bắt toàn diện bức tranh dự án.
* **Nội dung bao gồm:**
  * Bối cảnh thị trường & Bài toán kinh doanh cốt lõi.
  * Mô hình dòng tiền, hoa hồng sàn & Quỹ Ký Quỹ Bảo Hành (2.000.000đ).
  * Quy tắc bóc tách 3 nhóm chi phí & Quy tắc làm nguội 20 ngày.
  * Luồng trải nghiệm chi tiết từ lúc đặt lịch, khảo sát, thi công đến nghiệm thu và xử lý tranh chấp.
  * Đặc tả chức năng chi tiết từng phân hệ (Khách hàng, Thợ, Quản trị viên).

### 2. Dành cho Khối Kỹ thuật & Lập trình viên (Tech & Architecture)
👉 **[Mô tả Sản phẩm & Ngăn xếp Công nghệ (PRODUCT_AND_TECHNOLOGY_DESCRIPTION.md)](docs/PRODUCT_AND_TECHNOLOGY_DESCRIPTION.md)**
* **Tech Stack:** Java 21, Spring Boot 3.5.x, Spring Security, JWT, PostgreSQL 17, React 19, TypeScript, Vite.
* **Chi tiết:** Cấu trúc tầng dịch vụ (Service Layer), lược đồ di chuyển cơ sở dữ liệu (Flyway V1 - V14), OpenAPI/Swagger UI, cấu trúc định tuyến (React Router DOM) và API Client.

---

## 🚀 Khởi Chạy Nhanh (Quick Start)

### Backend (Spring Boot & PostgreSQL)
* Chạy cơ sở dữ liệu qua Docker:
  ```bash
  docker compose -f docker/compose.yaml up -d
  ```
* Khởi chạy ứng dụng máy chủ:
  ```bash
  cd backend
  ./mvnw spring-boot:run
  ```

### Frontend (React & Vite)
* Cài đặt thư viện và khởi chạy máy chủ phát triển:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
