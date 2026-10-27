package com.nhalo24h.auth.controller;
import com.nhalo24h.auth.dto.AuthResponse;
import com.nhalo24h.auth.dto.LoginRequest;
import com.nhalo24h.auth.dto.MessageResponse;
import com.nhalo24h.auth.security.UserPrincipal;
import com.nhalo24h.auth.service.AuthService;
import com.nhalo24h.common.error.AppException;
import com.nhalo24h.common.error.ErrorCode;
import com.nhalo24h.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Các API phục vụ xác thực: Đăng nhập, Đăng xuất và Lấy thông tin tài khoản hiện tại")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập", description = "Xác thực email và mật khẩu của người dùng, trả về JWT access token.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất", description = "Vô hiệu hóa hiệu lực của JWT token trên hệ thống, ngăn chặn tái sử dụng token sau khi đã logout.")
    public ResponseEntity<MessageResponse> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        MessageResponse response = authService.logout(authHeader);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy hồ sơ cá nhân", description = "Lấy thông tin tài khoản người dùng đang đăng nhập thông qua JWT Bearer token.")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên làm việc đã kết thúc");
        }
        UserResponse response = authService.getCurrentUser(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }
}
