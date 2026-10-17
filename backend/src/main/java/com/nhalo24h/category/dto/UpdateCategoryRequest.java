package com.nhalo24h.category.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu cập nhật danh mục dịch vụ")
public record UpdateCategoryRequest(
    @Schema(description = "Tên danh mục mới", example = "Điện gia dụng & dân dụng")
    @Size(max = 100, message = "Tên danh mục không được vượt quá 100 ký tự")
    String name,

    @Schema(description = "Slug mới", example = "dien-gia-dung-dan-dung")
    @Size(max = 120, message = "Slug không được vượt quá 120 ký tự")
    String slug,

    @Schema(description = "Mô tả mới", example = "Mô tả cập nhật")
    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    String description,

    @Schema(description = "URL icon mới", example = "https://example.com/icons/electrical-v2.png")
    @Size(max = 500, message = "URL icon không được vượt quá 500 ký tự")
    String iconUrl,

    @Schema(description = "Thứ tự hiển thị mới (không được âm)", example = "2")
    @Min(value = 0, message = "Thứ tự hiển thị không được âm")
    Integer displayOrder
) {
}
