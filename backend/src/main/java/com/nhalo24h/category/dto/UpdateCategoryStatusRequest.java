package com.nhalo24h.category.dto;

import com.nhalo24h.category.domain.CategoryStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Yêu cầu thay đổi trạng thái danh mục dịch vụ")
public record UpdateCategoryStatusRequest(
    @Schema(description = "Trạng thái mới của danh mục (ACTIVE hoặc INACTIVE)", example = "INACTIVE")
    @NotNull(message = "Trạng thái không được để trống")
    CategoryStatus status
) {
}
