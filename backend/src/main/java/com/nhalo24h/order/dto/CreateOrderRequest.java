package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Schema(description = "Yêu cầu tạo đơn hàng mới của khách hàng")
public record CreateOrderRequest(
    @Schema(description = "ID danh mục sự cố cần sửa", example = "d290f1ee-6c54-4b01-90e6-d701748f0851")
    @NotNull(message = "Danh mục dịch vụ không được để trống")
    UUID categoryId,

    @Schema(description = "ID địa chỉ đã lưu trong sổ địa chỉ của khách hàng", example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    @NotNull(message = "Vui lòng chọn địa chỉ từ sổ địa chỉ")
    UUID addressId,

    @Schema(description = "Tiêu đề ngắn về sự cố", example = "Ống nước bồn rửa chén bị rò rỉ")
    @NotBlank(message = "Tiêu đề sự cố không được để trống")
    @Size(max = 200, message = "Tiêu đề tối đa 200 ký tự")
    String title,

    @Schema(description = "Mô tả chi tiết sự cố", example = "Bồn rửa chén chảy nước xuống sàn bếp liên tục từ tối qua, cần thợ kiểm tra thay ống dẫn.")
    @NotBlank(message = "Mô tả chi tiết sự cố không được để trống")
    String description,

    @Schema(description = "Thời gian mong muốn thợ tới (ISO 8601)", example = "2026-10-18T14:00:00Z")
    @NotNull(message = "Thời gian mong muốn không được để trống")
    @Future(message = "Thời gian mong muốn phải là thời gian trong tương lai")
    Instant expectedScheduleTime,

    @Schema(description = "Tên người liên hệ (tùy chọn, mặc định lấy từ hồ sơ, tối đa 100 ký tự)", example = "Nguyễn Văn A")
    @Size(max = 100, message = "Tên người liên hệ không được vượt quá 100 ký tự")
    String contactName,

    @Schema(description = "Số điện thoại liên hệ (tùy chọn, nếu có phải gồm đúng 10 chữ số và bắt đầu bằng số 0)", example = "0901234567")
    @Pattern(regexp = "^$|^0[0-9]{9}$", message = "Số điện thoại liên hệ phải gồm đúng 10 chữ số và bắt đầu bằng số 0")
    String contactPhone,

    @Schema(description = "Danh sách URL hình ảnh minh chứng sự cố")
    List<String> imageUrls,

    @Schema(description = "Danh sách ID hồ sơ thợ (ProviderProfile id) muốn gửi yêu cầu báo giá ban đầu (tùy chọn)")
    List<UUID> initialProviderIds
) {
}
