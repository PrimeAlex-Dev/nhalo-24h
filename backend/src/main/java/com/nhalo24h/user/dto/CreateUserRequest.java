package com.nhalo24h.user.dto;

import com.nhalo24h.user.domain.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu tạo người dùng mới")
public record CreateUserRequest(
    @Schema(description = "Họ và tên người dùng", example = "Nguyễn Văn An")
    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100, message = "Họ tên không được vượt quá 100 ký tự")
    String fullName,

    @Schema(description = "Địa chỉ email (duy nhất, dùng để đăng nhập)", example = "nguyenvanan@example.com")
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 255, message = "Email không được vượt quá 255 ký tự")
    String email,

    @Schema(description = "Số điện thoại liên hệ (tùy chọn, nếu có phải gồm đúng 10 chữ số)", example = "0901234567")
    @jakarta.validation.constraints.Pattern(regexp = "^$|^0[0-9]{9}$", message = "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0")
    String phone,

    @Schema(description = "Vai trò của người dùng (mặc định là CUSTOMER nếu không truyền)", example = "CUSTOMER")
    UserRole role
) {
}
