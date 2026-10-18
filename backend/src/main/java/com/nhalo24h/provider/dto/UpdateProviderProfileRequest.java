package com.nhalo24h.provider.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

@Schema(description = "Yêu cầu cập nhật hồ sơ thợ")
public record UpdateProviderProfileRequest(
    @Schema(description = "Họ và tên thợ", example = "Nguyễn Văn Minh")
    @Size(max = 100, message = "Họ và tên không được vượt quá 100 ký tự")
    String fullName,

    @Schema(description = "URL ảnh đại diện", example = "https://example.com/avatar.jpg")
    @Size(max = 500, message = "URL ảnh đại diện không được vượt quá 500 ký tự")
    String avatarUrl,

    @Schema(description = "Chức danh / Tiêu đề ngắn", example = "Thợ Kỹ Thuật Điện Nước 5★")
    @Size(max = 150, message = "Tiêu đề không được vượt quá 150 ký tự")
    String headline,

    @Schema(description = "Mô tả kinh nghiệm, giới thiệu bản thân", example = "Hơn 5 năm kinh nghiệm sửa chữa điện nước gia dụng.")
    String bio,

    @Schema(description = "Số năm kinh nghiệm", example = "5")
    @Min(value = 0, message = "Số năm kinh nghiệm không được âm")
    Integer experienceYears,

    @Schema(description = "Đơn giá tham khảo (VNĐ/giờ)", example = "150000")
    @Min(value = 0, message = "Đơn giá không được âm")
    Long pricePerHour,

    @Schema(description = "Khu vực nhận việc", example = "Quận Ninh Kiều, Cần Thơ")
    @Size(max = 255, message = "Khu vực nhận việc không được vượt quá 255 ký tự")
    String serviceArea,

    @Schema(description = "Trạng thái sẵn sàng nhận việc", example = "true")
    Boolean isAvailable,

    @Schema(description = "Danh sách ID danh mục dịch vụ phụ trách")
    List<UUID> categoryIds
) {
}
