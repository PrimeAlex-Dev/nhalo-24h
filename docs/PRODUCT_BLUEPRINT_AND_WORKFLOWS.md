# 📘 TÀI LIỆU TỔNG QUAN SẢN PHẨM & ĐẶC TẢ LUỒNG NGHIỆP VỤ
## NỀN TẢNG DỊCH VỤ SỬA CHỮA GIA DỤNG NHÀ LO 24H (PRODUCT BLUEPRINT & WORKFLOWS)

> **Phân loại tài liệu:** Tài liệu Nghiệp vụ & Vận hành Nội bộ (Business & Functional Blueprint)  
> **Phiên bản:** 1.0  
> **Đối tượng người đọc:** Thành viên Ban Quản trị, Khối Kinh tế, Tiếp thị / Truyền thông, Vận hành Sàn, Chăm sóc Khách hàng (CSKH) và Đội ngũ Phát triển Sản phẩm.  
> **Nguyên tắc biên soạn:** Diễn giải toàn bộ bối cảnh dự án, bài toán kinh doanh, dòng tiền và các luồng chức năng bằng ngôn ngữ thực tế, trực quan, thân thiện với người không chuyên công nghệ (Non-tech).

---

## MỤC LỤC

1. [Phần 1: Bối cảnh Dự án & Bài toán Thị trường](#phần-1-bối-cảnh-dự-án--bài-toán-thị-trường)
   - 1.1. Tầm nhìn & Sứ mệnh nền tảng
   - 1.2. Nỗi đau thị trường truyền thống & Cách Nhà Lo 24h giải quyết
   - 1.3. Ba trụ cột giá trị cốt lõi (USP - Unique Selling Points)
2. [Phần 2: Mô hình Kinh doanh & Dòng tiền Tài chính](#phần-2-mô-hình-kinh-doanh--dòng-tiền-tài-chính)
   - 2.1. Cấu trúc doanh thu nền tảng (Phí sàn)
   - 2.2. Nguyên tắc bóc tách 3 nhóm chi phí độc lập
   - 2.3. Cơ chế Quỹ Ký Quỹ Bảo Hành (2.000.000 VNĐ) & Quy tắc "Làm nguội 20 ngày"
3. [Phần 3: Bản đồ Vai trò & Quyền hạn (Stakeholder Matrix)](#phần-3-bản-đồ-vai-trò--quyền-hạn-stakeholder-matrix)
   - 3.1. Khách hàng (Customer)
   - 3.2. Đối tác Thợ (Provider)
   - 3.3. Ban Quản trị & Vận hành Sàn (Admin / CSKH)
4. [Phần 4: Quy trình Nghiệp vụ Tổng thể (End-to-End Core Workflows)](#phần-4-quy-trình-nghiệp-vụ-tổng-thể-end-to-end-core-workflows)
   - 4.1. Sơ đồ hành trình tổng quát
   - 4.2. Luồng 1: Đặt lịch & Phân bổ đơn hàng (Khảo sát trước vs Giá cố định)
   - 4.3. Luồng 2: Khảo sát hiện trường & Thiết lập báo giá minh bạch
   - 4.4. Luồng 3: Thi công & Cơ chế kiểm soát phát sinh vật tư
   - 4.5. Luồng 4: Nghiệm thu & Đối soát thanh toán tiền mặt 2 bước (Chống gian lận)
   - 4.6. Luồng 5: Đánh giá 4 chiều & Quy trình xử lý khiếu nại, đền bù tự động
5. [Phần 5: Bộ Quy tắc Vận hành & Xử lý Tình huống Ngoại lệ](#phần-5-bộ-quy-tắc-vận-hành--xử-lý-tình-huống-ngoại-lệ)
   - 5.1. Bảng quy chế thưởng phạt & Chế tài vi phạm
   - 5.2. Các tình huống thực tế và kịch bản can thiệp của CSKH
6. [Phần 6: Đặc tả Chức năng Chi tiết Từng Phân hệ](#phần-6-đặc-tả-chức-năng-chi-tiết-từng-phân-hệ)
   - 6.1. Phân hệ Khách hàng (Customer App)
   - 6.2. Phân hệ Đối tác Thợ (Provider App & Wallet)
   - 6.3. Phân hệ Bảng điều khiển Quản trị (Admin Dashboard)
7. [Phần 7: Bảng Thuật ngữ Nghiệp vụ Chung (Glossary)](#phần-7-bảng-thuật-ngữ-nghiệp-vụ-chung-glossary)

---

# PHẦN 1: BỐI CẢNH DỰ ÁN & BÀI TOÁN THỊ TRƯỜNG

### 1.1. Tầm nhìn & Sứ mệnh nền tảng
**Nhà Lo 24h** là nền tảng công nghệ số kết nối trực tiếp theo nhu cầu (On-demand Platform) giữa **Hộ gia đình có sự cố tiện ích sinh hoạt** và **Lực lượng thợ kỹ thuật lành nghề** hoạt động 24/7.
* **Sứ mệnh:** Xóa bỏ sự mập mờ, thiếu tin tưởng trong ngành dịch vụ gia đình; mang lại sự an tâm tuyệt đối cho khách hàng và thu nhập xứng đáng, tự hào cho người thợ sửa chữa.
* **Định vị thương hiệu:** Nền tảng dịch vụ kỹ thuật gia đình minh bạch và trách nhiệm nhất Việt Nam.

### 1.2. Nỗi đau thị trường truyền thống & Cách Nhà Lo 24h giải quyết

| Vấn đề của thị trường tự do | Thực tế nhức nhối ngoài đời | Cách Nhà Lo 24h giải quyết triệt để |
| :--- | :--- | :--- |
| **Giá cả "tùy mặt bắt hình dong"** | Thợ báo giá bằng miệng, nhìn nhà to thì báo giá cao; tháo thiết bị ra xong mới đòi thêm chi phí. | Bắt buộc kê khai báo giá 3 phần trên ứng dụng trước khi đụng vào thiết bị; khách xác nhận đồng ý mới được làm. |
| **Thợ "bỏ trốn", từ chối bảo hành** | Sửa xong vài ngày máy lại hỏng, gọi điện thì thợ chặn số, chối bỏ trách nhiệm. | Thợ phải ký quỹ 2.000.000đ; sàn đứng ra làm trọng tài bảo hành và tự động trích tiền cọc đền bù cho khách. |
| **Thợ bị bùng tiền, mất công đi lại** | Thợ đến tận nơi kiểm tra tốn thời gian, xăng xe nhưng khách đổi ý không sửa, không trả tiền công đi lại. | Tách riêng *Phí khảo sát & di chuyển*. Nếu khách không sửa, khách trả phí này cho thợ; nếu đồng ý sửa thì phí này được miễn giảm. |
| **Chất lượng thợ phập phù** | Đánh giá qua Facebook, tờ rơi không thể kiểm chứng tay nghề thật sự. | Hệ thống đánh giá 4 tiêu chí kèm ảnh bằng chứng sau khi hoàn thành; hồ sơ thợ hiển thị số đơn thành công và tỷ lệ hài lòng thực tế. |

### 1.3. Ba trụ cột giá trị cốt lõi (USP - Unique Selling Points)
1. **Minh bạch tài chính 100%:** Khách hàng biết chính xác từng đồng mình bỏ ra là cho tiền công hay cho linh kiện.
2. **Bảo hiểm trách nhiệm bằng Quỹ Ký Quỹ:** Khách hàng không bao giờ phải đối mặt với rủi ro "thợ vô trách nhiệm" vì sàn đã giữ tiền bảo chứng của thợ.
3. **Mô hình hợp tác công bằng với thợ:** Sàn đồng hành chứ không bóc lột sức lao động của thợ, chỉ thu phí sàn trên giá trị công việc thực tế.

---

# PHẦN 2: MÔ HÌNH KINH DOANH & DÒNG TIỀN TÀI CHÍNH

### 2.1. Cấu trúc doanh thu nền tảng (Phí sàn)
Khác với nhiều nền tảng thương mại điện tử thu phí trên tổng giá trị đơn hàng, **Nhà Lo 24h áp dụng chính sách hoa hồng lũy tiến có trách nhiệm:**
* **Tỷ lệ hoa hồng mặc định:** `10%` (có thể điều chỉnh linh hoạt theo từng danh mục dịch vụ trong trang Admin).
* **Quy tắc tính phí:** Hoa hồng chỉ thu trên **Tiền công kỹ thuật (Labor Fee)**.
* **Khoản sàn miễn thu phí:**
  * ❌ *Chi phí vật tư / Linh kiện thay thế:* Không thu hoa hồng. Sàn hoàn trả 100% cho thợ. *(Ý nghĩa kinh tế: Thợ không bị áp lực phải đội giá phụ tùng lên cao để bù cho tiền cắt phế của sàn).*
  * ❌ *Phí khảo sát & Di chuyển:* Không thu hoa hồng. Trả 100% cho thợ để bù đắp chi phí xăng xe đi lại.

### 2.2. Nguyên tắc bóc tách 3 nhóm chi phí độc lập
Mọi đơn hàng sửa chữa trên Nhà Lo 24h đều được chia tách thành công thức:

$$\text{Tổng tiền thanh toán} = \text{Phí khảo sát} + \text{Tiền công thợ} + \text{Tiền linh kiện}$$

* **1. Phí khảo sát & Di chuyển (Survey Fee):** Chi phí thợ di chuyển đến nhà khách và kiểm tra nguyên nhân hỏng hóc. Nếu khách chốt sửa chữa, cơ chế cam kết miễn giảm khoản phí này sẽ được kích hoạt.
* **2. Tiền công kỹ thuật (Labor Fee):** Mức thù lao chi trả cho kỹ năng và sức lao động của thợ.
* **3. Chi phí linh kiện / Vật tư (Material Fee):** Danh mục chi tiết từng loại ốc vít, ống nước, linh kiện thay mới (có ghi rõ đơn vị tính, số lượng, đơn giá thực tế).

### 2.3. Cơ chế Quỹ Ký Quỹ Bảo Hành (2.000.000 VNĐ) & Quy tắc "Làm nguội 20 ngày"
Để bảo vệ uy tín nền tảng và khách hàng, Nhà Lo 24h thiết lập cơ chế tài chính đặc thù:
* **Hạn mức ký quỹ:** Mỗi đối tác thợ khi gia nhập sàn phải duy trì số dư ký quỹ bảo hiểm tối thiểu là **2.000.000 VNĐ**. Tiền này nằm ở ngăn riêng trong ví, không được dùng để chi tiêu thông thường.
* **Cơ chế bồi thường tự động:** Khi khách hàng khiếu nại chất lượng dịch vụ và được Admin phê duyệt, hệ thống sẽ tự động trừ thẳng số tiền bồi thường từ quỹ này để chuyển khoản cho khách hàng.
* **Quy tắc "Làm nguội 20 ngày" (Cooling-off Period):**
  * Khi thợ ngừng hợp tác và yêu cầu rút 2.000.000 VNĐ tiền cọc về tài khoản ngân hàng, hệ thống sẽ **khóa quyền nhận đơn** và **bắt đầu đếm ngược 20 ngày** kể từ thời điểm hoàn tất đơn hàng cuối cùng.
  * *Ý nghĩa kinh tế & vận hành:* Các thiết bị sửa chữa gia dụng thường phát sinh lỗi tái diễn trong vòng 2 - 3 tuần đầu. Thời gian làm nguội 20 ngày đảm bảo mọi đơn hàng cũ đều hết thời hạn bảo hành an toàn trước khi hoàn vốn cọc cho đối tác.

---

# PHẦN 3: BẢN ĐỒ VAI TRÒ & QUYỀN HẠN (STAKEHOLDER MATRIX)

```
┌────────────────────────────────────────────────────────────────────────┐
│                          HỆ THỐNG NHÀ LO 24H                           │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ 1. KHÁCH HÀNG      │ 2. ĐỐI TÁC THỢ     │ 3. BAN QUẢN TRỊ / VẬN HÀNH   │
│ (Customer)         │ (Provider)         │ (Admin / Operations)         │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ • Đặt lịch & chọn  │ • Nhận việc quanh  │ • Kiểm duyệt hồ sơ & năng lực│
│   khung giờ        │   khu vực          │   thợ                        │
│ • Nhận báo giá     │ • Khảo sát & lập   │ • Quản lý danh mục & hoa     │
│   minh bạch        │   báo giá 3 phần   │   hồng dịch vụ               │
│ • Duyệt phát sinh  │ • Báo cáo thi công │ • Trọng tài phân xử tranh    │
│   linh kiện        │   bằng hình ảnh    │   chấp & hòa giải tiền mặt   │
│ • Nghiệm thu &     │ • Xác nhận tiền mặt│ • Kiểm soát chất lượng &     │
│   thanh toán       │ • Quản lý Ví &     │   chế tài phạt cọc           │
│ • Đánh giá 4 chiều │   Rút tiền về NH   │ • Giám sát chỉ số tài chính  │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

---

# PHẦN 4: QUY TRÌNH NGHIỆP VỤ TỔNG THỂ (CORE WORKFLOWS)

### 4.1. Sơ đồ hành trình đơn hàng tổng quát

```
[1. Đặt lịch] ──► [2. Báo giá sơ bộ] ──► [3. Khảo sát tại nhà]
                                                │
                                                ▼
[6. Nghiệm thu & Đánh giá] ◄── [5. Thi công] ◄── [4. Chốt Báo giá 3 phần]
         │
         ▼
[7. Thanh toán & Kích hoạt Bảo hành]
```

---

### 4.2. Luồng 1: Đặt lịch & Phân bổ đơn hàng

```
[Khách chọn dịch vụ] ──► [Điền địa chỉ & Chọn giờ hẹn] ──► [Tải ảnh sự cố (tối đa 5 ảnh)]
                                                                  │
                    ┌─────────────────────────────────────────────┴──────────────────┐
                    ▼                                                                ▼
      [Hình thức: Chỉ định thợ quen]                                 [Hình thức: Phát tán yêu cầu]
      - Xem hồ sơ, đánh giá, bảng giá                                - Hệ thống gửi thông báo đến các
      - Gửi lời mời trực tiếp đến thợ đó                              thợ đang bật chế độ nhận việc gần đó
```

* **Trường hợp Dịch vụ "Khảo sát trước" (SURVEY_FIRST):** Áp dụng cho các sự cố phức tạp (thấm dột, chập điện âm tường, máy lạnh không mát). Giá ban đầu chỉ là ước tính; thợ bắt buộc phải đến hiện trường để kiểm tra trước khi chốt chi phí.
* **Trường hợp Dịch vụ "Giá cố định" (FIXED_PRICE):** Áp dụng cho các dịch vụ tiêu chuẩn (vệ sinh máy giặt, thay lõi lọc nước). Khách hàng biết trước khung giá trọn gói trên hệ thống.

---

### 4.3. Luồng 2: Khảo sát hiện trường & Thiết lập báo giá minh bạch

```
[Thợ đến nhà khách] ──► [Kiểm tra tình trạng hỏng hóc] ──► [Lập Bảng kê chi phí trên App]
                                                                     │
                                                                     ▼
                                                   [Màn hình điện thoại Khách hàng]
                                                   - Phí khảo sát & di chuyển: 50.000đ
                                                   - Tiền công kỹ thuật: 150.000đ
                                                   - Linh kiện thay thế: 200.000đ
                                                                     │
                                 ┌───────────────────────────────────┴───────────────────────────────────┐
                                 ▼                                                                       ▼
                         [Khách bấm ĐỒNG Ý]                                                      [Khách TỪ CHỐI SỬA]
                         - Kích hoạt hợp đồng thi công                                           - Đơn kết thúc ngay lập tức
                         - Phí khảo sát được miễn giảm/tính gộp                                  - Khách trả phí khảo sát thỏa thuận
                         - Thợ bắt đầu thực hiện công việc                                       - Thợ ra về, không phát sinh thêm chi phí
```

---

### 4.4. Luồng 3: Thi công & Cơ chế kiểm soát phát sinh vật tư
Trong thực tế sửa chữa, rất nhiều trường hợp khi tháo máy móc ra mới phát hiện thêm linh kiện bị gãy, cháy hỏng. Nhà Lo 24h áp dụng quy tắc **"Không tự ý phát sinh chi phí"**:

```
[Thợ phát hiện thêm hư hỏng mới trong lúc sửa]
                         │
                         ▼
[Thợ tạo "Yêu cầu bổ sung linh kiện" trên App]
- Tên linh kiện mới
- Số lượng & Đơn giá niêm yết
                         │
                         ▼
[Hệ thống bắn thông báo đến máy Khách hàng]
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
 [Khách bấm XÁC NHẬN]            [Khách TỪ CHỐI]
 - Hóa đơn tự động cập nhật       - Thợ giữ nguyên hiện trạng
 - Thợ lắp đặt linh kiện mới      - Không được tự ý tính tiền thêm
```

---

### 4.5. Luồng 4: Nghiệm thu & Đối soát thanh toán tiền mặt 2 bước (Chống gian lận)
Sau khi thi công xong, thợ dọn dẹp hiện trường và gửi yêu cầu nghiệm thu kèm ảnh chụp hoàn thiện. Khách hàng kiểm tra thiết bị vận hành tốt thì xác nhận hoàn tất.

#### Cơ chế đối soát tiền mặt 2 bước (Two-Step Cash Settlement):
Để ngăn chặn trường hợp thợ khai báo gian lận giá trị tiền mặt để trốn phí sàn, hoặc khách hàng nhập sai số tiền:

```
[Bước 1: Khách thanh toán tiền mặt] ──► Khách mở App bấm: "Tôi đã trả 400.000 VNĐ"
                                                        │
                                                        ▼
[Bước 2: Đối soát phía Thợ] ─────────► Thợ nhận thông báo trên App
                                                        │
                      ┌─────────────────────────────────┴─────────────────────────────────┐
                      ▼                                                                   ▼
         [Khớp số tiền: Thợ bấm XÁC NHẬN]                                [LỆCH SỐ TIỀN: Thợ bấm BÁO LỆCH]
         - Đơn hàng hoàn tất hợp lệ                                       - Đơn hàng bị khóa trạng thái "Tranh chấp"
         - Hệ thống trích tự động 10% hoa hồng                            - Hệ thống gắn cờ Cảnh báo bất thường (Flagged)
           tiền công từ Ví của thợ                                        - CSKH can thiệp gọi điện đối chiếu chứng từ
```

---

### 4.6. Luồng 5: Đánh giá 4 chiều & Quy trình xử lý khiếu nại, đền bù

#### Đánh giá minh bạch 4 tiêu chí:
Khách hàng không chỉ chấm sao chung chung mà đánh giá rõ ràng 4 yếu tố then chốt:
1. **Đúng hẹn (Punctuality):** Có đến đúng giờ đã hẹn hay không?
2. **Tay nghề (Skill & Quality):** Thao tác chuyên nghiệp, máy móc chạy ổn định không?
3. **Thái độ (Attitude):** Lịch sự, sạch sẽ, tôn trọng tài sản gia đình không?
4. **Giá cả (Pricing):** Báo giá rõ ràng, không vòi vĩnh thêm tiền?

*Thợ có quyền phản hồi công khai dưới đánh giá của khách để đảm bảo tính khách quan hai chiều.*

#### Quy trình khiếu nại & Trích cọc đền bù tự động:

```
[Khách gặp sự cố trong hạn bảo hành] ──► [Gửi Khiếu nại kèm hình ảnh/video bằng chứng]
                                                           │
                                                           ▼
                                            [Hội đồng Vận hành Sàn (Admin) thẩm định]
                                                           │
                      ┌────────────────────────────────────┴────────────────────────────────────┐
                      ▼                                                                         ▼
           [Khiếu nại KHÔNG hợp lệ]                                                  [Khiếu nại CHÍNH XÁC DO LỖI THỢ]
           - Giải thích rõ cho khách hàng                                            - Admin ban hành quyết định kỷ luật
           - Giữ nguyên trạng thái đơn                                               - Trích tiền từ Quỹ ký quỹ 2.000.000đ của Thợ
                                                                                     - Bồi thường trực tiếp cho Khách hàng
                                                                                     - Thợ bị tạm khóa nhận đơn cho tới khi nạp bù cọc
```

---

# PHẦN 5: BỘ QUY TẮC VẬN HÀNH & XỬ LÝ TÌNH HUỐNG NGOẠI LỆ

### 5.1. Bảng quy chế thưởng phạt & Chế tài vi phạm

| Hành vi vi phạm của Đối tác Thợ | Mức độ nghiêm trọng | Chế tài xử lý của Hệ thống |
| :--- | :---: | :--- |
| **Đến trễ quá 30 phút không thông báo** | Nhẹ | Cảnh cáo qua tin nhắn, giảm thứ tự ưu tiên nhận đơn mới. |
| **Tự ý vòi thêm tiền ngoài bảng kê trên App** | Nặng | Hoàn lại tiền cho khách; phạt 200.000đ trích từ quỹ ký quỹ. |
| **Bỏ việc, không đến sau khi đã nhận đơn** | Nặng | Tạm đình chỉ nhận việc 3 ngày; phạt 100.000đ phí cơ hội. |
| **Gạ gẫm khách giao dịch ngoài sàn để trốn phí** | Rất nặng | Phạt 500.000đ từ quỹ ký quỹ; tái phạm khóa tài khoản vĩnh viễn. |
| **Từ chối bảo hành khi thiết bị tái phát lỗi** | Nghiêm trọng | Trích 100% tiền sửa chữa từ quỹ ký quỹ trả cho khách; đình chỉ tài khoản đến khi giải trình. |

### 5.2. Các tình huống thực tế và kịch bản can thiệp của CSKH

#### Tình huống 1: Thợ đã đến chân công trình nhưng khách không nghe máy
* **Quy tắc:** Thợ phải chờ tối thiểu 15 phút và thực hiện ít nhất 3 cuộc gọi.
* **Xử lý trên App:** Thợ bấm nút "Khách không liên lạc được".
* **Hệ thống:** Gửi tin nhắn cảnh báo đến khách. Sau 30 phút không phản hồi, đơn tự hủy. Khách hàng bị đánh giá điểm tín nhiệm tài khoản xấu; thợ được sàn hỗ trợ khoản trợ cấp di chuyển nhỏ từ ngân sách vận hành.

#### Tình huống 2: Khách hàng và thợ cãi nhau gay gắt về hư hỏng mới phát sinh
* **Kịch bản:** Khách cho rằng thợ làm vỡ ống nước; thợ khẳng định ống nước đã bị mục nát từ trước lúc mở máy.
* **Căn cứ xử lý:** CSKH mở hồ sơ đơn hàng, đối chiếu **5 bức ảnh ban đầu** mà khách chụp lúc tạo đơn và **ảnh chụp khảo sát** thợ gửi lên trước khi tháo máy:
  * Nếu ảnh ban đầu đã có dấu vết rò rỉ: Lỗi thuộc về hiện trạng nhà khách -> Thợ đúng.
  * Nếu ảnh ban đầu còn nguyên vẹn, ảnh thợ chụp sau thi công bị nứt vỡ: Thợ chịu trách nhiệm khắc phục miễn phí.

---

# PHẦN 6: ĐẶC TẢ CHỨC NĂNG CHI TIẾT TỪNG PHÂN HỆ

*(Phần này chi tiết hóa từng màn hình và tính năng giúp đội ngũ phát triển sản phẩm, kiểm thử và thiết kế giao diện đồng bộ chính xác với khối nghiệp vụ).*

### 6.1. Phân hệ Khách hàng (Customer Portal)

#### 1. Quản lý Hồ sơ & Sổ địa chỉ:
* Lưu trữ họ tên, số điện thoại, ảnh đại diện.
* Danh sách nhiều địa chỉ thi công (Nhà riêng, Cơ quan, Nhà bố mẹ...), gắn nhãn địa chỉ mặc định để đặt lịch nhanh chóng chỉ bằng 1 thao tác.

#### 2. Khám phá & Tìm kiếm Thợ:
* Danh mục dịch vụ dạng lưới trực quan với biểu tượng sinh động (Điện dân dụng, Ống nước, Máy giặt, Điều hòa, Khóa cửa...).
* Bộ lọc đa chiều: Lọc theo chuyên ngành, phạm vi bán kính (km), điểm đánh giá uy tín (4 sao trở lên), trạng thái thợ đang sẵn sàng nhận việc.
* Trang chi tiết hồ sơ thợ (Profile): Hiển thị số năm kinh nghiệm, khu vực hoạt động, bảng giá cơ sở và thư viện các đánh giá thực tế từ khách hàng cũ.

#### 3. Tạo Đơn hàng & Đặt lịch sửa chữa:
* Chọn chuyên mục dịch vụ cần hỗ trợ.
* Chọn ngày, giờ mong muốn thợ có mặt.
* Khu vực nhập mô tả triệu chứng và khu vực tải tối đa **5 hình ảnh/video hiện trường**.
* Lựa chọn: Chỉ định một thợ quen cụ thể hoặc Đăng yêu cầu lên bảng tin để nhận báo giá cạnh tranh từ nhiều thợ.

#### 4. Kênh Chat Trao đổi Trực tiếp:
* Khung chat tích hợp riêng cho từng đơn hàng.
* Khách và thợ trao đổi thông tin chi tiết, gửi thêm vị trí định vị hoặc ảnh chụp bổ sung mà không cần chia sẻ số điện thoại cá nhân (bảo vệ quyền riêng tư).

#### 5. Duyệt Báo giá & Quản lý Biến động Chi phí:
* Màn hình trực quan hiển thị chi tiết 3 nhóm chi phí: *Phí khảo sát*, *Tiền công*, *Vật tư*.
* Nút bấm hành động nhanh: **Duyệt báo giá** hoặc **Từ chối sửa chữa**.
* Hộp thoại tiếp nhận "Đề xuất phát sinh linh kiện": Khách hàng xem ảnh chụp linh kiện cũ bị hỏng và giá linh kiện mới thay thế trước khi bấm đồng ý.

#### 6. Nghiệm thu, Thanh toán & Khiếu nại:
* Màn hình xác nhận hoàn thành công việc kèm ghi chú và ảnh nghiệm thu từ thợ.
* Tùy chọn phương thức thanh toán: Chuyển khoản trực tuyến qua cổng thanh toán giả lập hoặc Thanh toán tiền mặt tại nhà kèm xác nhận số tiền đã giao.
* Đánh giá chất lượng 4 tiêu chí kèm tải ảnh thực tế.
* Nút gửi đơn khiếu nại (báo cáo vi phạm về giá, thái độ, hoặc chất lượng bảo hành) được kết nối thẳng đến phòng CSKH.

---

### 6.2. Phân hệ Đối tác Thợ (Provider Portal & Wallet)

#### 1. Hồ sơ Kỹ thuật & Trạng thái Hoạt động:
* Khai báo chuyên môn chính, số năm trong nghề, khu vực quận/huyện nhận việc.
* Nút gạt chuyển đổi trạng thái: **"Đang sẵn sàng nhận việc"** (Online) hoặc **"Tạm nghỉ"** (Offline). Khi tắt, hệ thống sẽ không phân bổ đơn hàng mới để thợ tập trung nghỉ ngơi hoặc thi công đơn hiện tại.

#### 2. Tiếp nhận & Xử lý Yêu cầu Đơn hàng:
* Bảng danh sách đơn hàng mới quanh khu vực kèm chuông thông báo.
* Xem thông tin sự cố, khoảng cách di chuyển và ảnh chụp của khách.
* Hành động: Gửi báo giá sơ bộ ban đầu, Bấm nhận việc đến khảo sát, hoặc Từ chối kèm lý do (quá xa, bận việc, không đúng chuyên môn).

#### 3. Lập Bảng kê Chi phí Hiện trường (Digital Quotation):
* Công cụ thêm danh mục linh kiện trực tiếp trên điện thoại: Nhập tên linh kiện, chọn đơn vị tính (cái, mét, bộ), nhập số lượng và đơn giá.
* Tự động tính toán tổng hóa đơn hiển thị trước cho thợ kiểm tra.
* Tạo yêu cầu phát sinh linh kiện khi có biến động thực tế tại công trình.

#### 4. Báo cáo Nghiệm thu & Chốt Tiền mặt:
* Tải ảnh chụp thiết bị sau khi đã sửa xong và hoạt động bình thường.
* Nhập số tiền mặt thực tế đã thu từ khách hàng; nếu khách hàng bấm lệch số tiền, thợ có quyền bấm "Báo lệch" để bảo vệ hoa hồng của mình.

#### 5. Quản trị Ví Tài chính (Provider Wallet):
* Màn hình hiển thị 2 ngăn số dư minh bạch:
  * **Số dư khả dụng:** Doanh thu tiền công sau khi đã trừ phí sàn 10%. Thợ có thể tạo lệnh rút tiền về tài khoản ngân hàng bất cứ lúc nào.
  * **Quỹ ký quỹ bảo hành:** Số dư bảo chứng 2.000.000 VNĐ.
* Chức năng nạp bù tiền ký quỹ thông qua:
  * Trích từ số dư khả dụng sang.
  * Quét mã VietQR chuyển khoản nhanh từ tài khoản ngân hàng cá nhân.
* Chức năng tạo yêu cầu hoàn cọc ký quỹ kèm màn hình đếm ngược **Thời gian làm nguội 20 ngày**.

#### 6. Tương tác Phản hồi Đánh giá:
* Xem danh sách đánh giá và số sao nhận được từ khách hàng.
* Viết nội dung phản hồi công khai đối với từng bình luận để giải thích rõ ràng nếu có hiểu lầm.

---

### 6.3. Phân hệ Bảng điều khiển Quản trị (Admin Dashboard)

#### 1. Trung tâm Điều hành & Đo lường Chỉ số (KPI Dashboard):
* Thống kê theo thời gian thực: Tổng giá trị giao dịch toàn sàn (GMV), Tổng doanh thu hoa hồng của sàn, Tổng số đơn hàng thành công, Tỷ lệ đơn bị hủy.
* Biểu đồ tăng trưởng số lượng người dùng mới (Khách hàng vs Thợ kỹ thuật).

#### 2. Quản trị Tài khoản & Thẩm định Thợ:
* Danh sách toàn bộ tài khoản trên hệ thống.
* Quy trình thẩm định hồ sơ thợ: Xem xét tay nghề, kinh nghiệm, thông tin nhân thân trước khi kích hoạt trạng thái "Đủ điều kiện nhận việc".
* Công cụ khóa, tạm dừng hoặc mở khóa tài khoản người dùng vi phạm.

#### 3. Quản trị Danh mục Dịch vụ:
* Thêm mới, chỉnh sửa các nhóm dịch vụ (Điện lạnh, Ống nước, Khóa cửa...).
* Cấu hình tỷ lệ hoa hồng riêng cho từng dịch vụ (ví dụ: Dịch vụ phổ thông 10%, Dịch vụ đòi hỏi chuyên môn cao 12%).
* Cấu hình luồng làm việc mặc định: `SURVEY_FIRST` (Khảo sát trước) hoặc `FIXED_PRICE` (Giá cố định trọn gói).

#### 4. Giám sát Đơn hàng & Phòng chống Gian lận:
* Bảng theo dõi toàn bộ trạng thái đơn hàng trên sàn.
* Bộ lọc đơn hàng gắn cờ nghi vấn (**Flagged Abnormal Orders**): Lọc ra các đơn hàng có biểu hiện khai báo tiền mặt thấp bất thường, đơn hàng có khiếu nại hoặc đơn lệch tiền mặt giữa thợ và khách.
* Quyền can thiệp trực tiếp của Admin: Điều chỉnh lại hóa đơn trước thanh toán khi có thỏa thuận hòa giải.

#### 5. Quản lý Tài chính & Phê duyệt Lệnh Rút tiền:
* Theo dõi doanh thu hoa hồng chi tiết đến từng mã đơn hàng.
* Thẩm định và bấm phê duyệt / từ chối các yêu cầu rút tiền khả dụng của thợ về ngân hàng.
* Kiểm tra lịch sử nạp cọc ký quỹ và quản lý giải ngân hoàn cọc sau thời gian làm nguội 20 ngày.

#### 6. Tòa Trọng tài Phân xử Khiếu nại (Disputes & Penalties):
* Tiếp nhận hồ sơ khiếu nại kèm ảnh bằng chứng của cả khách và thợ.
* Ban hành phán quyết:
  * Trích phạt tiền ký quỹ của thợ để bồi thường cho khách.
  * Đình chỉ hoạt động thợ có thời hạn hoặc vĩnh viễn.
  * Ghi nhận hoàn phạt hoặc gỡ đình chỉ khi thợ và khách đã tự hòa giải thành công.

#### 7. Kiểm duyệt Đánh giá (Review Moderation):
* Giám sát toàn bộ đánh giá trên sàn.
* Quyền ẩn các đánh giá chứa từ ngữ xúc phạm, thô tục hoặc thông tin cá nhân vi phạm pháp luật.

---

# PHẦN 7: BẢNG THUẬT NGỮ NGHIỆP VỤ CHUNG (GLOSSARY)

*Bảng tra cứu dùng chung cho tất cả các phòng ban trong công ty:*

| Thuật ngữ | Tên tiếng Anh | Giải thích nghiệp vụ đơn giản |
| :--- | :--- | :--- |
| **Báo giá 3 phần** | 3-Tier Pricing | Bảng kê bắt buộc tách riêng: Phí đi lại + Tiền công + Tiền linh kiện. |
| **Quỹ ký quỹ bảo hành** | Escrow / Warranty Deposit | Khoản tiền cọc 2.000.000đ thợ gửi tại sàn để bảo chứng chất lượng và bồi thường sự cố. |
| **Thời gian làm nguội** | Cooling-off Period | 20 ngày phong tỏa tiền cọc sau đơn cuối cùng để phòng ngừa rủi ro bảo hành trước khi thợ rút vốn. |
| **Đối soát 2 bước** | Two-Step Settlement | Quy trình cả khách và thợ cùng bấm xác nhận số tiền mặt để tránh gian lận trốn phí sàn. |
| **Khảo sát trước** | Survey First | Luồng dịch vụ cần thợ đến tận nhà xem xét tình trạng thực tế trước khi chốt giá. |
| **Giá cố định** | Fixed Price | Luồng dịch vụ có khung giá trọn gói niêm yết sẵn, không cần khảo sát giá. |
| **Số dư khả dụng** | Available Balance | Tiền thợ kiếm được từ công việc, có thể rút về tài khoản ngân hàng ngay. |
| **Gắn cờ bất thường** | Flagged Order | Đơn hàng có dấu hiệu mâu thuẫn số tiền hoặc khiếu nại, được hệ thống đánh dấu để Admin can thiệp. |

---
*Tài liệu được bảo lưu quyền chỉnh sửa và phát triển bởi Ban Quản lý Sản phẩm Nhà Lo 24h.*
