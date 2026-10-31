# 2. PRODUCT/SERVICE DESCRIPTION – TECHNOLOGY TOOLS DESCRIPTION

## 2.1. Product/Service Description (Mô tả Sản phẩm / Dịch vụ)

### 2.1.1. Mục tiêu của sản phẩm (Product Objectives)
**Nhà Lo 24h** là nền tảng số trung gian kết nối dịch vụ sửa chữa và bảo trì gia dụng 24/7, liên kết trực tiếp giữa các hộ gia đình (Khách hàng) và lực lượng lao động kỹ thuật (Thợ sửa chữa). Mục tiêu cốt lõi của sản phẩm là:
- Chuẩn hóa quy trình đặt lịch, kiểm tra hiện trường, báo giá và nghiệm thu dịch vụ sửa chữa tại nhà.
- Minh bạch hóa cơ chế định giá và chi phí dịch vụ thông qua cơ chế bóc tách chi tiết ba nhóm chi phí độc lập.
- Thiết lập cơ chế bảo đảm chất lượng và trách nhiệm pháp lý – tài chính thông qua hệ thống quỹ ký quỹ bảo hành và quy trình xử lý tranh chấp, bồi thường trực tiếp trên nền tảng.

### 2.1.2. Đối tượng sử dụng (Target Users & Stakeholders)
Hệ thống được thiết kế phục vụ ba nhóm tác nhân chính cùng nhóm khách vãng lai:
1. **Khách hàng (Customer):** Cá nhân hoặc hộ gia đình có nhu cầu tìm kiếm, đặt lịch thợ sửa chữa, vệ sinh, bảo dưỡng các thiết bị và hệ thống tiện ích trong gia đình (điện, nước, điện lạnh, thông nghẹt,...).
2. **Đối tác cung ứng dịch vụ / Thợ sửa chữa (Provider):** Đội ngũ thợ cá nhân hoặc tổ thợ chuyên nghiệp mong muốn tiếp cận nguồn khách hàng chủ động, quản lý đơn đặt hàng, đàm phán báo giá và theo dõi doanh thu.
3. **Quản trị viên nền tảng (Admin):** Bộ phận vận hành chịu trách nhiệm kiểm duyệt danh mục dịch vụ, đối soát tài chính, quản lý người dùng, xử lý tranh chấp – khiếu nại và kiểm duyệt chất lượng nội dung.
4. **Khách vãng lai (Guest):** Tiếp cận trang chủ giới thiệu (Landing Page) để tra cứu thông tin mạng lưới thợ, quy trình hoạt động và hướng dẫn gia nhập.

### 2.1.3. Vấn đề giải quyết (Problems Solved)
Dự án tập trung xử lý các rủi ro và nhược điểm điển hình của thị trường sửa chữa gia dụng truyền thống:
- **Xóa bỏ tình trạng mập mờ về giá và phát sinh chi phí tùy tiện:** Hệ thống áp dụng quy tắc bóc tách rõ ràng giữa ba thành phần: *Phí khảo sát & di chuyển* (kèm cơ chế cam kết miễn giảm nếu thực hiện sửa chữa), *Tiền công kỹ thuật*, và *Chi phí vật tư/linh kiện thay thế*. Mọi thay đổi về phạm vi công việc hay linh kiện trong quá trình sửa chữa bắt buộc phải thông qua phiên bản báo giá điều chỉnh có sự xác nhận của khách hàng.
- **Giải quyết rủi ro thợ thiếu trách nhiệm hoặc từ chối bảo hành:** Nền tảng áp dụng cơ chế bắt buộc duy trì Quỹ Ký Quỹ Bảo Hành (định mức 2.000.000 VNĐ) đối với tài khoản thợ, kết hợp quy định thời gian làm nguội đóng băng quỹ (cooling-off period 20 ngày kể từ đơn hàng hoàn tất cuối cùng) khi thợ yêu cầu rút vốn rời sàn, cho phép hệ thống trích cọc bồi thường tự động cho khách hàng khi thợ vi phạm cam kết kỹ thuật.
- **Ngăn ngừa tranh chấp thanh toán và thất thoát hoa hồng nền tảng:** Hệ thống xây dựng quy trình xác nhận thanh toán tiền mặt độc lập hai bước (Khách hàng khai báo số tiền – Thợ xác nhận khớp lệnh). Khi phát sinh sai lệch, đơn hàng tự động kích hoạt trạng thái tranh chấp để Quản trị viên hòa giải. Ngoài ra, hoa hồng nền tảng (mặc định 10%) chỉ thu trên tiền công thực tế của thợ, không áp dụng lên chi phí vật tư linh kiện và phí khảo sát/di chuyển.
- **Minh bạch hóa uy tín và năng lực tay nghề:** Thay vì hệ thống đánh giá một chiều, khách hàng đánh giá thợ sau nghiệm thu theo 4 tiêu chí cụ thể (Đúng hẹn, Tay nghề, Thái độ, Giá cả) kèm hình ảnh minh chứng; thợ có quyền phản hồi công khai và quản trị viên kiểm soát tính xác thực của đánh giá.

### 2.1.4. Các chức năng chính của sản phẩm (Main Features)
Dựa trên mã nguồn hiện hữu, các phân hệ chức năng đã được triển khai bao gồm:

* **Phân hệ Khách hàng (Customer Portal):**
  - *Quản lý hồ sơ & Sổ địa chỉ:* Cập nhật thông tin cá nhân; lưu trữ và quản lý danh sách nhiều địa chỉ thi công kèm gắn nhãn mặc định.
  - *Tìm kiếm và Khảo sát thợ:* Tra cứu danh mục dịch vụ; tìm kiếm, lọc danh sách thợ theo chuyên ngành, khu vực hoạt động, tình trạng nhận việc; xem chi tiết hồ sơ năng lực, bảng giá cơ sở và đánh giá lịch sử của thợ.
  - *Khởi tạo và Điều phối đơn hàng:* Tạo đơn đặt lịch (mô tả sự cố, hẹn giờ, tải tối đa 5 hình ảnh hiện trường); lựa chọn chỉ định thợ ban đầu hoặc phát tán yêu cầu báo giá tới nhiều đối tác thợ.
  - *Trao đổi và Đàm phán trực tiếp:* Khung chat tích hợp trao đổi trực tiếp với thợ cho từng yêu cầu báo giá cụ thể.
  - *Duyệt báo giá & Khảo sát:* Xác nhận chấp thuận điều kiện khảo sát; duyệt hoặc từ chối báo giá khảo sát hiện trường; duyệt/từ chối yêu cầu phát sinh linh kiện trong quá trình thi công; từ chối sửa sau khảo sát (chỉ chi trả phí khảo sát & di chuyển thỏa thuận).
  - *Nghiệm thu & Thanh toán:* Xác nhận kết quả hoàn thành công việc; thực hiện thanh toán trực tuyến qua cổng giả lập (Mock Gateway) hoặc khai báo số tiền mặt đã chi trả cho thợ.
  - *Đánh giá & Khiếu nại:* Gửi đánh giá dịch vụ đa tiêu chí (tổng quan 1–5 sao, 4 tiêu chí phụ, tải ảnh, gắn thẻ, ẩn danh); tạo đơn khiếu nại/báo cáo vi phạm (đội giá, chất lượng kém, bỏ việc,...) kèm bằng chứng hình ảnh.

* **Phân hệ Thợ / Nhà cung cấp dịch vụ (Provider Portal):**
  - *Quản lý hồ sơ nghề nghiệp:* Quản lý thông tin cá nhân, cập nhật ảnh đại diện (lưu trữ máy chủ), khai báo năm kinh nghiệm, khu vực phục vụ, đăng ký danh mục chuyên môn và bật/tắt trạng thái sẵn sàng nhận việc.
  - *Xử lý yêu cầu công việc:* Xem danh sách yêu cầu mới; gửi báo giá sơ bộ ban đầu (bóc tách 3 nhóm chi phí); từ chối nhận việc kèm lý do.
  - *Khảo sát & Lập bảng kê chi phí:* Gửi báo giá chốt sau khảo sát kèm bảng kê chi tiết từng linh kiện, vật tư (tên, đơn vị tính, số lượng, đơn giá); gửi yêu cầu điều chỉnh phát sinh vật tư khi công việc có thay đổi.
  - *Báo cáo hoàn thành:* Gửi thông báo hoàn tất công việc, đính kèm ghi chú nghiệm thu và hình ảnh kết quả thi công.
  - *Xác nhận thanh toán:* Xác nhận khớp số tiền mặt thu từ khách hàng hoặc ghi nhận không khớp để chuyển hòa giải.
  - *Quản lý Ví tài chính (Provider Wallet):* Theo dõi cấu trúc 2 ngăn số dư (Số dư khả dụng và Quỹ ký quỹ bảo hành); xem lịch sử biến động số dư chi tiết; tạo yêu cầu rút thu nhập khả dụng về tài khoản ngân hàng; nạp bù ký quỹ (từ số dư khả dụng hoặc qua mã VietQR chuyển khoản giả lập); yêu cầu hoàn cọc ký quỹ kèm quy định làm nguội 20 ngày.
  - *Tương tác đánh giá:* Xem danh sách đánh giá nhận được từ khách hàng và gửi phản hồi cho từng đánh giá.

* **Phân hệ Quản trị hệ thống (Admin Portal):**
  - *Bảng điều khiển (Dashboard):* Thống kê trực quan các chỉ số KPI vận hành: tổng doanh thu nền tảng, tổng giá trị giao dịch (GMV), số lượng đơn hàng, số lượng tài khoản theo vai trò.
  - *Quản lý người dùng:* Tạo tài khoản mới, tra cứu, lọc danh sách người dùng; kích hoạt hoặc vô hiệu hóa tài khoản; kiểm duyệt thông tin hồ sơ thợ.
  - *Quản lý danh mục dịch vụ:* Thiết lập danh mục dịch vụ kỹ thuật; cấu hình tỷ lệ hoa hồng danh mục, luồng làm việc mặc định (`SURVEY_FIRST` hoặc `FIXED_PRICE`), hình ảnh đại diện và trạng thái kích hoạt.
  - *Giám sát đơn hàng & Xử lý bất thường:* Tra cứu toàn bộ đơn hàng; lọc đơn hàng gắn cờ nghi vấn gian lận/lệch bất thường (`flagged abnormal`); can thiệp điều chỉnh hóa đơn trước thanh toán; phân xử tranh chấp thanh toán tiền mặt và chốt hoa hồng.
  - *Quản trị tài chính & Rút tiền:* Theo dõi doanh thu sàn chi tiết theo từng đơn hàng; thẩm định, phê duyệt hoặc từ chối các lệnh yêu cầu rút tiền của thợ; ghi nhận nạp quỹ ký quỹ thủ công.
  - *Xử lý khiếu nại & Kỷ luật (Disputes & Penalties):* Tiếp nhận hồ sơ khiếu nại từ khách hàng; ban hành kết luận xử lý với các chế tài linh hoạt: cảnh cáo, trích phạt cọc ký quỹ, đình chỉ tài khoản có thời hạn hoặc vĩnh viễn; xác nhận chuyển khoản bồi thường cho khách hàng; hỗ trợ hoàn phạt hoặc gỡ đình chỉ khi có hòa giải.
  - *Kiểm duyệt đánh giá (Review Moderation):* Quản lý danh sách đánh giá toàn sàn, bật/tắt quyền hiển thị công khai đối với các đánh giá vi phạm chuẩn mực.

* **Phân hệ Xác thực & Phân quyền (Authentication & Authorization):**
  - Đăng nhập bảo mật sử dụng JWT Access Token; đăng xuất vô hiệu hóa token trên server; định tuyến điều hướng tự động dựa trên vai trò (`CUSTOMER`, `PROVIDER`, `ADMIN`).
  *(Lưu ý về hiện trạng mã nguồn: Chức năng đăng nhập, đăng xuất và quản lý phiên làm việc đã được tích hợp đầy đủ giữa Frontend và Backend. Chức năng đăng ký tài khoản công khai hiện đang thực hiện luồng điều hướng giả lập trên giao diện người dùng; việc tạo tài khoản mới ở tầng API backend hiện được quản lý tập trung thông qua quyền của Quản trị viên).*

---

## 2.2. Technology Tools Description (Mô tả Công nghệ & Công cụ)

Hệ thống được xây dựng theo kiến trúc Client-Server hiện đại, phân tách độc lập giữa tầng giao diện người dùng (Frontend SPA) và tầng nghiệp vụ máy chủ (Backend REST API), giao tiếp thông qua giao thức HTTP/HTTPS với định dạng dữ liệu chuẩn JSON. Dưới đây là danh mục chi tiết các công nghệ, thư viện và công cụ thực tế được sử dụng trong mã nguồn:

### 2.2.1. Công nghệ Phía Backend (Server-Side Architecture)
- **Ngôn ngữ lập trình Java 21 (LTS):** Phiên bản máy ảo Java dài hạn, ứng dụng các tính năng mới như Record classes, Pattern matching, giúp mã nguồn tường minh và tối ưu hóa hiệu suất xử lý luồng.
- **Spring Boot 3.5.16:** Framework nền tảng cung cấp kiến trúc ứng dụng web hướng dịch vụ (Service-Oriented Architecture), tích hợp các module chuyên sâu:
  - *Spring MVC (`spring-boot-starter-web`):* Xây dựng hệ thống các RESTful API Controller, tiếp nhận và điều phối các yêu cầu HTTP.
  - *Spring Data JPA (`spring-boot-starter-data-jpa`):* Tích hợp Hibernate ORM để ánh xạ các thực thể cơ sở dữ liệu (Entities) sang đối tượng Java, quản lý giao dịch dữ liệu `@Transactional` và cung cấp cơ chế phân trang, lọc nâng cao (`Pageable`, `Specification`).
  - *Spring Security (`spring-boot-starter-security`):* Đảm nhiệm xác thực danh tính người dùng và kiểm soát quyền truy cập dựa trên vai trò (Role-Based Access Control - RBAC) tại từng endpoint thông qua annotation `@PreAuthorize`.
  - *Spring Validation (`spring-boot-starter-validation`):* Sử dụng Hibernate Validator để kiểm tra tính toàn vẹn dữ liệu đầu vào thông qua các annotation tiêu chuẩn (`@NotNull`, `@NotBlank`, `@Min`, `@Size`) trước khi xử lý nghiệp vụ.
- **JSON Web Token (JJWT - `io.jsonwebtoken` phiên bản 0.12.6):** Thư viện tạo lập, ký số bảo mật (thuật toán HMAC-SHA256 với secret key tối thiểu 256-bit) và giải mã JWT token. Kết hợp cùng bảng cơ sở dữ liệu `invalidated_tokens` để quản lý danh sách đen (blacklist) nhằm thu hồi hiệu lực token ngay lập tức khi người dùng đăng xuất.
- **Flyway Database Migration (`flyway-core` & `flyway-database-postgresql`):** Công cụ tự động hóa quản lý và thực thi 14 phiên bản di chuyển lược đồ cơ sở dữ liệu (từ `V1` đến `V14`), đảm bảo cấu trúc bảng, chỉ mục (indexes), khóa ngoại và ràng buộc toàn vẹn luôn nhất quán giữa các môi trường phát triển và kiểm thử.
- **Springdoc OpenAPI (`springdoc-openapi-starter-webmvc-ui` phiên bản 2.8.5):** Công cụ tự động trích xuất tài liệu đặc tả API theo chuẩn OpenAPI 3.0 và tích hợp giao diện tương tác Swagger UI (`/swagger-ui.html`) hỗ trợ tra cứu và kiểm thử API trực tiếp.
- **Xử lý tệp tin (Multipart Storage):** Sử dụng `StandardServletMultipartResolver` của Spring Boot để xử lý tải lên tệp ảnh sự cố và ảnh đại diện, kiểm tra giới hạn dung lượng (tối đa 10MB/ảnh, 30MB/yêu cầu) và lưu trữ cục bộ có tổ chức thư mục trên máy chủ (`uploads/avatars`, `uploads/orders`).
- **Thư viện Kiểm thử Backend:**
  - *JUnit 5 & Mockito (`spring-boot-starter-test`):* Thực hiện kiểm thử đơn vị (Unit Tests) cho các tầng Service và Controller.
  - *Spring Security Test:* Kiểm thử phân quyền truy cập endpoint theo vai trò người dùng.
  - *H2 In-Memory Database (`com.h2database:h2`):* Cơ sở dữ liệu bộ nhớ trong dùng riêng cho môi trường kiểm thử tích hợp tự động (`application-test.yml` và `migration-h2`).

### 2.2.2. Hệ quản trị Cơ sở dữ liệu (Database Management)
- **PostgreSQL 17.4 (Alpine Linux Container):** Hệ quản trị cơ sở dữ liệu quan hệ đối tượng (RDBMS) chính của dự án.
  - *Vai trò:* Lưu trữ bền vững toàn bộ dữ liệu người dùng, hồ sơ thợ, danh mục dịch vụ, quy trình đơn hàng, lịch sử báo giá, số dư ví tài chính, giao dịch biến động, đánh giá và khiếu nại.
  - *Đặc điểm kỹ thuật sử dụng trong dự án:*
    - Sử dụng kiểu dữ liệu `UUID` tự sinh (`gen_random_uuid()`) làm khóa chính nhằm tăng cường tính bảo mật và độc lập dữ liệu.
    - Trường thời gian có múi giờ chuẩn quốc tế `TIMESTAMPTZ`.
    - Thiết lập các chỉ mục duy nhất có điều kiện (Conditional Unique Indexes) như: ràng buộc duy nhất chỉ cho địa chỉ mặc định của khách hàng (`WHERE is_default = TRUE`), số điện thoại duy nhất khi khác null.
    - Thiết lập các ràng buộc miền giá trị (Check Constraints) đảm bảo tính hợp lệ: điểm đánh giá từ 1 đến 5 sao, số tiền và năm kinh nghiệm không được âm.

### 2.2.3. Công nghệ Phía Frontend (Client-Side Architecture)
- **React 19.2.8:** Thư viện giao diện người dùng cốt lõi theo mô hình Single Page Application (SPA), ứng dụng cơ chế Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`) để quản lý trạng thái giao diện và vòng đời tương tác mượt mà.
- **TypeScript 6.0.2:** Ngôn ngữ lập trình chính phía client, cung cấp hệ thống kiểu tĩnh (Type Safety) nghiêm ngặt cho toàn bộ mô hình dữ liệu (Order, Provider, Category, Wallet, Dispute, Review), hạn chế tối đa lỗi runtime và tăng tính bảo trì mã nguồn.
- **Vite 8.3.0 & `@vitejs/plugin-react` 6.1.1:** Công cụ đóng gói mã nguồn và máy chủ phát triển thế hệ mới, hỗ trợ Hot Module Replacement (HMR) tốc độ cao và tối ưu hóa việc phân tách gói (code splitting) khi biên dịch sang môi trường sản xuất.
- **React Router DOM 7.18.4:** Thư viện định tuyến phía máy khách (Client-side Routing), tổ chức theo cây định tuyến tập trung (`createBrowserRouter`) với 4 layout riêng biệt (`LandingLayout`, `CustomerLayout`, `ProviderLayout`, `AdminLayout`) và các bộ lọc bảo vệ route đa tầng (`ProtectedRoute`, `GuestRoute`).
- **Giao diện & Biểu tượng (Styling & Icons):**
  - *Vanilla CSS & CSS Custom Properties:* Dự án chủ động không phụ thuộc vào framework CSS cồng kềnh mà xây dựng hệ thống biến CSS toàn cục chuẩn mực (hệ màu xanh thương hiệu `#1D6AE5`, typography `Inter`, hệ thống đổ bóng và bo góc đồng nhất), kết hợp Media Queries phục vụ hiển thị Responsive thích ứng linh hoạt trên nhiều kích thước màn hình.
  - *Lucide React 1.52.0:* Bộ thư viện icon vector hiện đại, dung lượng nhẹ, hỗ trợ trực quan hóa các thao tác nghiệp vụ, trạng thái đơn hàng và điều hướng hệ thống.
- **Oxlint 1.81.0:** Công cụ phân tích cú pháp tĩnh (Linter) hiệu năng cao được xây dựng trên Rust, sử dụng để kiểm soát chất lượng mã nguồn TypeScript/JavaScript và đảm bảo chuẩn quy tắc lập trình trên toàn bộ repository.
- **Fetch API & Kiến trúc Service Layer:** Xây dựng module client tùy biến (`apiClient.ts`) đóng gói cơ chế gọi REST API, tự động gắn kèm `Authorization: Bearer <token>`, chuẩn hóa xử lý phản hồi lỗi từ Spring Boot (`ApiErrorResponse`) và quản lý phiên đăng nhập tại `localStorage`.

### 2.2.4. Công cụ Môi trường, DevOps và Triển khai
- **Docker & Docker Compose (`compose.yaml`):** Đóng gói và điều phối tự động container dịch vụ cơ sở dữ liệu PostgreSQL trên môi trường phát triển máy nhánh (`nhalo24h-postgres`), gắn kèm Named Volume (`nhalo24h_postgres_data`) lưu trữ dữ liệu bền vững và script tự động cấp quyền người dùng ứng dụng (`01-init-app-user.sh`).
- **GitHub Actions (`.github/workflows/frontend-ci.yml`):** Thiết lập quy trình Tích hợp liên tục (CI) tự động kích hoạt trên máy chủ ảo Ubuntu khi có thao tác đẩy mã nguồn (`push`) hoặc tạo yêu cầu hợp nhất (`pull_request`) vào nhánh `master` / `main`. Luồng thực thi bao gồm các bước: cài đặt môi trường Node.js 22, cài đặt phụ thuộc (`npm ci`), quét lỗi cú pháp (`npm run lint`), chạy kiểm thử và biên dịch ứng dụng (`npm run build`).
- **Postman Collection (`docs/NhaLo24h_User_Auth_Postman_Collection.json`):** Bộ sưu tập kịch bản kiểm thử API tích hợp đầy đủ các mẫu request/response thực tế, hỗ trợ kiểm thử thủ công và nghiệm thu tương thích giữa Frontend và Backend.

---

### Bảng tổng hợp Công cụ & Công nghệ cốt lõi

| Phân tầng / Khối chức năng | Tên Công nghệ / Thư viện | Phiên bản thực tế | Vai trò và Mục đích sử dụng trong dự án |
| :--- | :--- | :--- | :--- |
| **Backend Runtime & Core** | Java (JDK) | 21 (LTS) | Ngôn ngữ lập trình chính cho toàn bộ nghiệp vụ máy chủ. |
| **Backend Framework** | Spring Boot | 3.5.16 | Nền tảng framework điều phối Web MVC, Data JPA, Security và Validation. |
| **Security & Auth** | Spring Security & JJWT | 0.12.6 | Xác thực bảo mật, quản lý phiên làm việc không trạng thái (stateless) qua JWT HMAC-SHA256 và phân quyền RBAC. |
| **Database Migration** | Flyway | Tích hợp Spring Boot | Quản lý lịch sử và đồng bộ 14 bản script di chuyển lược đồ dữ liệu. |
| **API Documentation** | Springdoc OpenAPI / Swagger | 2.8.5 | Tự động sinh tài liệu chuẩn hóa và giao diện thử nghiệm API tương tác. |
| **Relational Database** | PostgreSQL | 17.4-alpine | Hệ quản trị cơ sở dữ liệu quan hệ chính, lưu trữ toàn bộ dữ liệu nghiệp vụ. |
| **Testing Backend** | JUnit 5, Mockito, H2 DB | Tích hợp | Thực hiện kiểm thử đơn vị và kiểm thử tích hợp (Integration Tests) tự động. |
| **Frontend Framework** | React | 19.2.8 | Thư viện xây dựng giao diện ứng dụng đơn trang (SPA). |
| **Frontend Language** | TypeScript | 6.0.2 | Chuẩn hóa kiểu dữ liệu tĩnh cho toàn bộ thành phần giao diện và dịch vụ API. |
| **Build Tool & Bundler** | Vite | 8.3.0 | Môi trường phát triển HMR tốc độ cao và đóng gói mã nguồn sản phẩm. |
| **Frontend Routing** | React Router DOM | 7.18.4 | Quản lý điều hướng, phân tách Layout và kiểm soát bảo vệ định tuyến theo vai trò. |
| **Icons & Styling** | Lucide React & Vanilla CSS | 1.52.0 | Hệ thống biểu tượng giao diện và mã CSS tùy biến với CSS Variables. |
| **Static Code Analysis** | Oxlint | 1.81.0 | Phân tích tĩnh cú pháp và chuẩn hóa mã nguồn frontend. |
| **Containerization** | Docker & Docker Compose | Compose v2 | Đóng gói, cô lập và điều phối môi trường chạy cơ sở dữ liệu PostgreSQL. |
| **CI/CD Automation** | GitHub Actions | Workflows v4 | Tự động hóa kiểm tra mã nguồn (lint, test, build) trên môi trường tích hợp. |
