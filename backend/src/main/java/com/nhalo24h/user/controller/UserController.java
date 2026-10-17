package com.nhalo24h.user.controller;

import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.dto.CreateUserRequest;
import com.nhalo24h.user.dto.UpdateUserRequest;
import com.nhalo24h.user.dto.UpdateUserStatusRequest;
import com.nhalo24h.user.dto.UserResponse;
import com.nhalo24h.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "User Management", description = "Các API phục vụ quản lý người dùng: Tạo, Xem, Cập nhật thông tin và Trạng thái tài khoản (Yêu cầu quyền ADMIN)")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @Operation(summary = "UC-USER-01: Tạo người dùng mới", description = "Tạo một tài khoản người dùng mới. Mặc định vai trò là CUSTOMER nếu không cung cấp.")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "UC-USER-02: Lấy danh sách người dùng", description = "Lấy danh sách người dùng có hỗ trợ lọc theo vai trò, trạng thái, tìm kiếm theo họ tên/email/SĐT và phân trang.")
    public ResponseEntity<Page<UserResponse>> getUsers(
        @Parameter(description = "Lọc theo vai trò (CUSTOMER, PROVIDER, ADMIN)")
        @RequestParam(required = false) UserRole role,

        @Parameter(description = "Lọc theo trạng thái (ACTIVE, DISABLED)")
        @RequestParam(required = false) UserStatus status,

        @Parameter(description = "Từ khóa tìm kiếm theo tên, email hoặc số điện thoại")
        @RequestParam(required = false) String search,

        @ParameterObject
        @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable
    ) {
        Page<UserResponse> response = userService.getUsers(role, status, search, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "UC-USER-02: Xem chi tiết người dùng", description = "Lấy thông tin chi tiết của một người dùng theo UUID.")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "UC-USER-03: Cập nhật thông tin hồ sơ", description = "Cập nhật các thông tin hồ sơ được phép thay đổi (họ tên, số điện thoại).")
    public ResponseEntity<UserResponse> updateUser(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateUserRequest request
    ) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "UC-USER-04: Vô hiệu hóa hoặc kích hoạt lại user", description = "Thay đổi trạng thái tài khoản sang DISABLED (vô hiệu hóa) hoặc ACTIVE (kích hoạt lại) mà vẫn giữ nguyên dữ liệu.")
    public ResponseEntity<UserResponse> updateUserStatus(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        UserResponse response = userService.updateUserStatus(id, request);
        return ResponseEntity.ok(response);
    }
}
