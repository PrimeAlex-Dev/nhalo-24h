package com.nhalo24h.user.dto;

import com.nhalo24h.user.domain.Gender;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu cập nhật hồ sơ khách hàng")
public record UpdateCustomerProfileRequest(
    @Schema(description = "Họ và tên khách hàng", example = "Nguyễn Văn An", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Họ và tên không được để trống")
    @Size(min = 2, max = 100, message = "Họ và tên phải từ 2 đến 100 ký tự")
    String fullName,

    @Schema(description = "Giới tính (MALE, FEMALE, OTHER)", example = "MALE")
    Gender gender,

    @Schema(description = "Địa chỉ liên hệ", example = "Số 123 Đường Cầu Giấy, Hà Nội")
    @Size(max = 500, message = "Địa chỉ tối đa 500 ký tự")
    String address
) {
}
