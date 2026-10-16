package com.nhalo24h.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.dto.CreateUserRequest;
import com.nhalo24h.user.dto.UpdateUserRequest;
import com.nhalo24h.user.dto.UpdateUserStatusRequest;
import com.nhalo24h.user.repository.UserRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("UC-USER-01: Tạo user thành công với vai trò mặc định là CUSTOMER")
    void createUser_WithDefaultRole_ShouldReturn201() throws Exception {
        CreateUserRequest request = new CreateUserRequest(
            "Nguyễn Văn An",
            "An.Nguyen@Example.com",
            "0901234567",
            null
        );

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").isNotEmpty())
            .andExpect(jsonPath("$.fullName").value("Nguyễn Văn An"))
            .andExpect(jsonPath("$.email").value("an.nguyen@example.com"))
            .andExpect(jsonPath("$.phone").value("0901234567"))
            .andExpect(jsonPath("$.role").value("CUSTOMER"))
            .andExpect(jsonPath("$.status").value("ACTIVE"))
            .andExpect(jsonPath("$.isEmailVerified").value(false))
            .andExpect(jsonPath("$.createdAt").isNotEmpty())
            .andExpect(jsonPath("$.updatedAt").isNotEmpty());
    }

    @Test
    @DisplayName("UC-USER-01: Tạo user thất bại khi email đã tồn tại (không phân biệt hoa/thường) -> 409 Conflict")
    void createUser_WithDuplicateEmail_ShouldReturn409() throws Exception {
        User existing = new User("Trần Thị B", "tranthib@example.com", "0911222333", UserRole.CUSTOMER);
        userRepository.save(existing);

        CreateUserRequest request = new CreateUserRequest(
            "Trần B Mới",
            "TRANTHIB@EXAMPLE.COM",
            "0988777666",
            UserRole.CUSTOMER
        );

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.errorCode").value("CONFLICT"))
            .andExpect(jsonPath("$.message", containsString("tranthib@example.com")));
    }

    @Test
    @DisplayName("UC-USER-01: Tạo user thất bại khi số điện thoại đã tồn tại -> 409 Conflict")
    void createUser_WithDuplicatePhone_ShouldReturn409() throws Exception {
        User existing = new User("Người Cũ", "nguoicu@example.com", "0909999888", UserRole.CUSTOMER);
        userRepository.save(existing);

        CreateUserRequest request = new CreateUserRequest(
            "Người Mới",
            "nguoimoi@example.com",
            "0909999888",
            UserRole.PROVIDER
        );

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.errorCode").value("CONFLICT"))
            .andExpect(jsonPath("$.message", containsString("0909999888")));
    }

    @Test
    @DisplayName("UC-USER-01: Tạo user thất bại khi thiếu thông tin bắt buộc hoặc email sai định dạng -> 400 Bad Request")
    void createUser_WithInvalidData_ShouldReturn400() throws Exception {
        CreateUserRequest request = new CreateUserRequest("", "not-an-email", null, null);

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"))
            .andExpect(jsonPath("$.details", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    @DisplayName("UC-USER-02: Xem chi tiết người dùng thành công theo ID")
    void getUserById_Success_ShouldReturn200() throws Exception {
        User user = new User("Lê Văn C", "levanc@example.com", "0933444555", UserRole.PROVIDER);
        User saved = userRepository.save(user);

        mockMvc.perform(get("/api/v1/users/{id}", saved.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(saved.getId().toString()))
            .andExpect(jsonPath("$.fullName").value("Lê Văn C"))
            .andExpect(jsonPath("$.email").value("levanc@example.com"))
            .andExpect(jsonPath("$.role").value("PROVIDER"));
    }

    @Test
    @DisplayName("UC-USER-02: Xem chi tiết người dùng không tồn tại -> 404 Not Found")
    void getUserById_NotFound_ShouldReturn404() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/users/{id}", nonExistentId))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"))
            .andExpect(jsonPath("$.message", containsString(nonExistentId.toString())));
    }

    @Test
    @DisplayName("UC-USER-02: Lấy danh sách người dùng có lọc theo role và status")
    void getUsers_WithFilter_ShouldReturnFilteredPage() throws Exception {
        userRepository.save(new User("Khách 1", "khach1@example.com", null, UserRole.CUSTOMER));
        userRepository.save(new User("Thợ 1", "tho1@example.com", null, UserRole.PROVIDER));
        User disabledWorker = new User("Thợ 2", "tho2@example.com", null, UserRole.PROVIDER);
        disabledWorker.setStatus(UserStatus.DISABLED);
        userRepository.save(disabledWorker);

        // Lọc PROVIDER có trạng thái ACTIVE
        mockMvc.perform(get("/api/v1/users")
                .param("role", "PROVIDER")
                .param("status", "ACTIVE"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.page.totalElements").value(1))
            .andExpect(jsonPath("$.content[0].email").value("tho1@example.com"));
    }

    @Test
    @DisplayName("UC-USER-03: Cập nhật thông tin hồ sơ (họ tên, số điện thoại) thành công")
    void updateUser_Success_ShouldReturn200() throws Exception {
        User user = userRepository.save(new User("Tên Cũ", "tencu@example.com", "0901111222", UserRole.CUSTOMER));

        UpdateUserRequest updateRequest = new UpdateUserRequest("Tên Mới Cập Nhật", "0909999111");

        mockMvc.perform(patch("/api/v1/users/{id}", user.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.fullName").value("Tên Mới Cập Nhật"))
            .andExpect(jsonPath("$.phone").value("0909999111"));
    }

    @Test
    @DisplayName("UC-USER-03: Cập nhật thất bại khi số điện thoại mới trùng với user khác -> 409 Conflict")
    void updateUser_WithDuplicatePhone_ShouldReturn409() throws Exception {
        userRepository.save(new User("User Khác", "other@example.com", "0908888777", UserRole.CUSTOMER));
        User currentUser = userRepository.save(new User("User Hiện Tại", "current@example.com", "0901111222", UserRole.CUSTOMER));

        UpdateUserRequest updateRequest = new UpdateUserRequest("User Hiện Tại", "0908888777");

        mockMvc.perform(patch("/api/v1/users/{id}", currentUser.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.errorCode").value("CONFLICT"))
            .andExpect(jsonPath("$.message", containsString("0908888777")));
    }

    @Test
    @DisplayName("UC-USER-04: Vô hiệu hóa và kích hoạt lại tài khoản người dùng thành công")
    void updateUserStatus_ShouldChangeStatus() throws Exception {
        User user = userRepository.save(new User("Phạm Văn D", "phamvand@example.com", null, UserRole.CUSTOMER));

        // 1. Vô hiệu hóa (DISABLED)
        UpdateUserStatusRequest disableRequest = new UpdateUserStatusRequest(UserStatus.DISABLED);
        mockMvc.perform(patch("/api/v1/users/{id}/status", user.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(disableRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("DISABLED"));

        // 2. Kích hoạt lại (ACTIVE)
        UpdateUserStatusRequest activateRequest = new UpdateUserStatusRequest(UserStatus.ACTIVE);
        mockMvc.perform(patch("/api/v1/users/{id}/status", user.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(activateRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("Tạo user thất bại khi số điện thoại không đúng 10 chữ số -> 400 Bad Request")
    void createUser_WithInvalidPhone_ShouldReturn400() throws Exception {
        // Test phone chỉ có 8 số
        CreateUserRequest request1 = new CreateUserRequest("User Test", "testphone1@example.com", "09012345", null);
        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"))
            .andExpect(jsonPath("$.details[0].field").value("phone"));

        // Test phone có chữ cái
        CreateUserRequest request2 = new CreateUserRequest("User Test", "testphone2@example.com", "090123456a", null);
        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request2)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"))
            .andExpect(jsonPath("$.details[0].field").value("phone"));
    }

    @Test
    @DisplayName("Tạo user thất bại khi role không hợp lệ -> 400 Bad Request thay vì 500")
    void createUser_WithInvalidRole_ShouldReturn400() throws Exception {
        String invalidJson = """
            {
                "fullName": "User Role Sai",
                "email": "rolesai@example.com",
                "role": "SUPER_ADMIN"
            }
            """;

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"))
            .andExpect(jsonPath("$.message", containsString("SUPER_ADMIN")));
    }

    @Test
    @DisplayName("Lọc user với role query param không hợp lệ -> 400 Bad Request thay vì 500")
    void getUsers_WithInvalidRoleQueryParam_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/api/v1/users").param("role", "SUPER_ADMIN"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"))
            .andExpect(jsonPath("$.message", containsString("SUPER_ADMIN")));
    }

    @Test
    @DisplayName("Cập nhật status với giá trị không hợp lệ -> 400 Bad Request thay vì 500")
    void updateUserStatus_WithInvalidStatus_ShouldReturn400() throws Exception {
        User user = userRepository.save(new User("Test User", "teststatus@example.com", null, UserRole.CUSTOMER));

        String invalidJson = """
            {
                "status": "PENDING_APPROVAL"
            }
            """;

        mockMvc.perform(patch("/api/v1/users/{id}/status", user.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"))
            .andExpect(jsonPath("$.message", containsString("PENDING_APPROVAL")));
    }

    @Test
    @DisplayName("Cập nhật user với số điện thoại không đúng 10 số -> 400 Bad Request")
    void updateUser_WithInvalidPhone_ShouldReturn400() throws Exception {
        User user = userRepository.save(new User("Test User", "testupdatephone@example.com", null, UserRole.CUSTOMER));

        UpdateUserRequest updateRequest = new UpdateUserRequest(null, "091234567890"); // 12 số

        mockMvc.perform(patch("/api/v1/users/{id}", user.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"));
    }
}
