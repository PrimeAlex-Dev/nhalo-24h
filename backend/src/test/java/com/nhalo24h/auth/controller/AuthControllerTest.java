package com.nhalo24h.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.auth.dto.LoginRequest;
import com.nhalo24h.auth.repository.InvalidatedTokenRepository;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvalidatedTokenRepository invalidatedTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        invalidatedTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    private User createTestUser(String email, String rawPassword, UserStatus status) {
        User user = new User("Nguyễn Văn An", email, "0901234567", UserRole.CUSTOMER);
        if (rawPassword != null) {
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
        }
        user.setStatus(status);
        return userRepository.save(user);
    }

    @Test
    @DisplayName("Đăng nhập thành công với email và mật khẩu chính xác -> 200 OK và trả về JWT")
    void login_Success_ShouldReturnTokenAndUser() throws Exception {
        createTestUser("an.nguyen@example.com", "Password123@", UserStatus.ACTIVE);

        LoginRequest request = new LoginRequest("an.nguyen@example.com", "Password123@");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.tokenType").value("Bearer"))
            .andExpect(jsonPath("$.expiresIn").value(greaterThan(0)))
            .andExpect(jsonPath("$.user.email").value("an.nguyen@example.com"))
            .andExpect(jsonPath("$.user.fullName").value("Nguyễn Văn An"))
            .andExpect(jsonPath("$.user.role").value("CUSTOMER"))
            .andExpect(jsonPath("$.user.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi sai mật khẩu -> 401 UNAUTHORIZED")
    void login_WrongPassword_ShouldReturn401() throws Exception {
        createTestUser("an.nguyen@example.com", "Password123@", UserStatus.ACTIVE);

        LoginRequest request = new LoginRequest("an.nguyen@example.com", "WrongPassword999");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"))
            .andExpect(jsonPath("$.message").value("Email hoặc mật khẩu không chính xác"));
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi email không tồn tại -> 401 UNAUTHORIZED")
    void login_NonExistentEmail_ShouldReturn401() throws Exception {
        LoginRequest request = new LoginRequest("notfound@example.com", "Password123@");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"))
            .andExpect(jsonPath("$.message").value("Email hoặc mật khẩu không chính xác"));
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi tài khoản chưa thiết lập mật khẩu -> 401 UNAUTHORIZED")
    void login_UserWithoutPassword_ShouldReturn401() throws Exception {
        createTestUser("nopassword@example.com", null, UserStatus.ACTIVE);

        LoginRequest request = new LoginRequest("nopassword@example.com", "Password123@");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"))
            .andExpect(jsonPath("$.message").value("Tài khoản chưa được thiết lập mật khẩu"));
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi tài khoản đã bị vô hiệu hóa -> 403 FORBIDDEN")
    void login_DisabledUser_ShouldReturn403() throws Exception {
        createTestUser("disabled@example.com", "Password123@", UserStatus.DISABLED);

        LoginRequest request = new LoginRequest("disabled@example.com", "Password123@");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"))
            .andExpect(jsonPath("$.message").value("Tài khoản của bạn đã bị vô hiệu hóa"));
    }

    @Test
    @DisplayName("Xem thông tin cá nhân /me thành công với JWT hợp lệ -> 200 OK")
    void getCurrentUser_WithValidToken_ShouldReturn200() throws Exception {
        createTestUser("an.nguyen@example.com", "Password123@", UserStatus.ACTIVE);

        LoginRequest request = new LoginRequest("an.nguyen@example.com", "Password123@");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString())
            .get("accessToken").asText();

        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("an.nguyen@example.com"))
            .andExpect(jsonPath("$.fullName").value("Nguyễn Văn An"));
    }

    @Test
    @DisplayName("Xem thông tin cá nhân /me khi không có token -> 401 UNAUTHORIZED")
    void getCurrentUser_WithoutToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Xem thông tin cá nhân /me với token không hợp lệ -> 401 UNAUTHORIZED")
    void getCurrentUser_WithInvalidToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer invalid.tampered.token"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Đăng xuất thực chất: Token sau khi logout sẽ bị vô hiệu hóa và từ chối ở các request tiếp theo")
    void logout_ShouldInvalidateToken_SubsequentRequestsFailWith401() throws Exception {
        createTestUser("an.nguyen@example.com", "Password123@", UserStatus.ACTIVE);

        // 1. Đăng nhập để nhận token
        LoginRequest loginReq = new LoginRequest("an.nguyen@example.com", "Password123@");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
            .andExpect(status().isOk())
            .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString())
            .get("accessToken").asText();

        // 2. Xác nhận token dùng được
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());

        // 3. Gọi endpoint logout
        mockMvc.perform(post("/api/v1/auth/logout")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Đăng xuất thành công"));

        // 4. Kiểm tra lại: Dùng token cũ gọi /me phải bị từ chối 401 UNAUTHORIZED
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Đăng xuất khi không truyền token -> Vẫn trả về 200 OK thành công")
    void logout_WithoutToken_ShouldStillReturn200() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Đăng xuất thành công"));
    }
}
