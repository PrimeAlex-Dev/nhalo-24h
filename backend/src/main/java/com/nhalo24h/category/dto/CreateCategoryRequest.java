package com.nhalo24h.category.dto;

import com.nhalo24h.category.domain.CategoryStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu tạo danh mục dịch vụ mới")
public record CreateCategoryRequest(
    @Schema(description = "Tên danh mục dịch vụ", example = "Điện dân dụng")
    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục không được vượt quá 100 ký tự")
    String name,

    @Schema(description = "Định danh slug duy nhất (nếu không truyền sẽ tự động tạo từ tên)", example = "dien-dan-dung")
    @Size(max = 120, message = "Slug không được vượt quá 120 ký tự")
    String slug,

    @Schema(description = "Mô tả danh mục dịch vụ", example = "Các dịch vụ sửa chữa, bảo trì và lắp đặt thiết bị điện gia đình")
    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    String description,

    @Schema(description = "Đường dẫn biểu tượng (icon URL)", example = "https://example.com/icons/electrical.png")
    @Size(max = 500, message = "URL icon không được vượt quá 500 ký tự")
    String iconUrl,

    @Schema(description = "Thứ tự hiển thị ưu tiên (mặc định 0, không được âm)", example = "1")
    @Min(value = 0, message = "Thứ tự hiển thị không được âm")
    Integer displayOrder,

    @Schema(description = "Trạng thái hoạt động (mặc định ACTIVE)", example = "ACTIVE")
    CategoryStatus status
) {
}
