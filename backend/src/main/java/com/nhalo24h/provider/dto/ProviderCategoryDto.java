package com.nhalo24h.provider.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

@Schema(description = "Thông tin danh mục dịch vụ mà thợ đảm nhận")
public record ProviderCategoryDto(
    @Schema(description = "ID danh mục", example = "fc28b329-aebd-438b-ae68-279310a9fb2e")
    UUID id,

    @Schema(description = "Tên danh mục", example = "Sửa điều hòa & Máy lạnh")
    String name,

    @Schema(description = "Slug danh mục", example = "sua-dieu-hoa-may-lanh")
    String slug,

    @Schema(description = "Icon danh mục", example = "snowflake")
    String iconUrl
) {
}
