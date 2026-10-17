package com.nhalo24h.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu cập nhật địa chỉ trong sổ địa chỉ")
public record UpdateCustomerAddressRequest(
    @Schema(description = "Tên gợi nhớ", example = "Nhà riêng", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Tên gợi nhớ không được để trống")
    @Size(min = 1, max = 100, message = "Tên gợi nhớ tối đa 100 ký tự")
    String label,

    @Schema(description = "Địa chỉ chi tiết", example = "Số 123 Đường Cầu Giấy, Cầu Giấy, Hà Nội", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    @Size(min = 5, max = 500, message = "Địa chỉ chi tiết từ 5 đến 500 ký tự")
    String fullAddress,

    @Schema(description = "Đặt làm địa chỉ mặc định", example = "false")
    Boolean isDefault
) {
}
