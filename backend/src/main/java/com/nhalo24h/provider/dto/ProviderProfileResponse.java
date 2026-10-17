package com.nhalo24h.provider.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Schema(description = "Thông tin chi tiết hồ sơ thợ (dành cho chính thợ)")
public record ProviderProfileResponse(
    @Schema(description = "ID hồ sơ thợ", example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    UUID id,

    @Schema(description = "ID tài khoản người dùng", example = "0d9e48cb-6fdb-4b6d-a291-6f50e1179af9")
    UUID userId,

    @Schema(description = "Họ và tên thợ", example = "Nguyễn Văn Minh")
    String fullName,

    @Schema(description = "Email đăng nhập", example = "minh.nguyen@nhalo24h.vn")
    String email,

    @Schema(description = "Số điện thoại liên hệ", example = "0939123456")
    String phone,

    @Schema(description = "URL ảnh đại diện", example = "https://example.com/avatar.jpg")
    String avatarUrl,

    @Schema(description = "Chức danh / Tiêu đề ngắn", example = "Thợ Kỹ Thuật Điện Nước 5★")
    String headline,

    @Schema(description = "Mô tả kinh nghiệm, giới thiệu bản thân", example = "Chuyên sửa chữa điện nước gia đình, bảo hành uy tín.")
    String bio,

    @Schema(description = "Số năm kinh nghiệm", example = "5")
    Integer experienceYears,

    @Schema(description = "Đơn giá tham khảo (VNĐ/giờ)", example = "150000")
    Long pricePerHour,

    @Schema(description = "Khu vực nhận việc", example = "Quận Ninh Kiều, Cần Thơ")
    String serviceArea,

    @Schema(description = "Trạng thái sẵn sàng nhận việc", example = "true")
    Boolean isAvailable,

    @Schema(description = "Danh sách danh mục dịch vụ thợ nhận làm")
    List<ProviderCategoryDto> categories,

    @Schema(description = "Thời gian tạo hồ sơ")
    Instant createdAt,

    @Schema(description = "Thời gian cập nhật hồ sơ gần nhất")
    Instant updatedAt
) {
}
