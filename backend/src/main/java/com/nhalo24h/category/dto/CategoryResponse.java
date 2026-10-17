package com.nhalo24h.category.dto;

import com.nhalo24h.category.domain.CategoryStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Thông tin chi tiết danh mục dịch vụ")
public record CategoryResponse(
    @Schema(description = "Mã định danh duy nhất (UUID)", example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    UUID id,

    @Schema(description = "Tên danh mục dịch vụ", example = "Điện dân dụng")
    String name,

    @Schema(description = "Slug duy nhất", example = "dien-dan-dung")
    String slug,

    @Schema(description = "Mô tả danh mục", example = "Các dịch vụ sửa chữa thiết bị điện gia đình")
    String description,

    @Schema(description = "Đường dẫn biểu tượng (icon URL)", example = "https://example.com/icons/electrical.png")
    String iconUrl,

    @Schema(description = "Trạng thái hoạt động (ACTIVE, INACTIVE)", example = "ACTIVE")
    CategoryStatus status,

    @Schema(description = "Thứ tự hiển thị ưu tiên", example = "1")
    Integer displayOrder,

    @Schema(description = "Thời điểm tạo danh mục", example = "2026-10-16T08:00:00Z")
    Instant createdAt,

    @Schema(description = "Thời điểm cập nhật gần nhất", example = "2026-10-16T08:00:00Z")
    Instant updatedAt
) {
}
