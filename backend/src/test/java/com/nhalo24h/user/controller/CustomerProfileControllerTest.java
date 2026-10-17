package com.nhalo24h.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.auth.dto.LoginRequest;
import com.nhalo24h.auth.repository.InvalidatedTokenRepository;
import com.nhalo24h.user.domain.CustomerProfile;
import com.nhalo24h.user.domain.Gender;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.dto.UpdateCustomerProfileRequest;
import com.nhalo24h.user.repository.CustomerProfileRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CustomerProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerProfileRepository customerProfileRepository;

    @Autowired
    private InvalidatedTokenRepository invalidatedTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        customerProfileRepository.deleteAll();
        invalidatedTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    private User createCustomerUser(String email, String rawPassword) {
        User user = new User("Khách Hàng An", email, "0901234567", UserRole.CUSTOMER);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    private User createAdminUser(String email, String rawPassword) {
        User user = new User("Quản Trị Viên", email, "0909999888", UserRole.ADMIN);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    private String obtainAccessToken(String email, String password) throws Exception {
        LoginRequest loginReq = new LoginRequest(email, password);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
            .andExpect(status().isOk())
            .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
            .get("accessToken").asText();
    }

    @Test
    @DisplayName("GET /customer/profile khi chưa có profile -> Trả về 200 OK với thông tin từ User và profile null")
    void getProfile_WhenNoProfileRecord_ShouldReturnDefaults() throws Exception {
        User user = createCustomerUser("customer1@example.com", "Password123@");
        String token = obtainAccessToken("customer1@example.com", "Password123@");

        mockMvc.perform(get("/api/v1/customer/profile")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(user.getId().toString()))
            .andExpect(jsonPath("$.fullName").value("Khách Hàng An"))
            .andExpect(jsonPath("$.email").value("customer1@example.com"))
            .andExpect(jsonPath("$.phone").value("0901234567"))
            .andExpect(jsonPath("$.gender").doesNotExist())
            .andExpect(jsonPath("$.address").doesNotExist())
            .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }

    @Test
    @DisplayName("GET /customer/profile khi đã có profile -> Trả về 200 OK kèm gender và address")
    void getProfile_WhenProfileRecordExists_ShouldReturnFullProfile() throws Exception {
        User user = createCustomerUser("customer2@example.com", "Password123@");
        CustomerProfile profile = new CustomerProfile(user, Gender.FEMALE, "123 Đường Cầu Giấy, Hà Nội");
        customerProfileRepository.save(profile);

        String token = obtainAccessToken("customer2@example.com", "Password123@");

        mockMvc.perform(get("/api/v1/customer/profile")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(user.getId().toString()))
            .andExpect(jsonPath("$.fullName").value("Khách Hàng An"))
            .andExpect(jsonPath("$.gender").value("FEMALE"))
            .andExpect(jsonPath("$.address").value("123 Đường Cầu Giấy, Hà Nội"));
    }

    @Test
    @DisplayName("GET /customer/profile khi chưa đăng nhập -> Trả về 401 UNAUTHORIZED")
    void getProfile_WithoutToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/customer/profile"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("GET /customer/profile khi đăng nhập với vai trò ADMIN -> Trả về 403 FORBIDDEN")
    void getProfile_WithAdminRole_ShouldReturn403() throws Exception {
        createAdminUser("admin@example.com", "AdminPassword123@");
        String adminToken = obtainAccessToken("admin@example.com", "AdminPassword123@");

        mockMvc.perform(get("/api/v1/customer/profile")
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("PATCH /customer/profile cập nhật thành công họ tên, giới tính, địa chỉ -> 200 OK")
    void updateProfile_Success_ShouldUpdateBothTables() throws Exception {
        User user = createCustomerUser("customer3@example.com", "Password123@");
        String token = obtainAccessToken("customer3@example.com", "Password123@");

        UpdateCustomerProfileRequest request = new UpdateCustomerProfileRequest(
            "Nguyễn Văn Bình",
            Gender.MALE,
            "Số 456 Nguyễn Trãi, Thanh Xuân, Hà Nội"
        );

        mockMvc.perform(patch("/api/v1/customer/profile")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.fullName").value("Nguyễn Văn Bình"))
            .andExpect(jsonPath("$.gender").value("MALE"))
            .andExpect(jsonPath("$.address").value("Số 456 Nguyễn Trãi, Thanh Xuân, Hà Nội"))
            .andExpect(jsonPath("$.email").value("customer3@example.com"))
            .andExpect(jsonPath("$.phone").value("0901234567"));

        // Kiểm tra trực tiếp trong Database
        User updatedUser = userRepository.findById(user.getId()).orElseThrow();
        assertThat(updatedUser.getFullName()).isEqualTo("Nguyễn Văn Bình");

        CustomerProfile profile = customerProfileRepository.findByUserId(user.getId()).orElseThrow();
        assertThat(profile.getGender()).isEqualTo(Gender.MALE);
        assertThat(profile.getAddress()).isEqualTo("Số 456 Nguyễn Trãi, Thanh Xuân, Hà Nội");
    }

    @Test
    @DisplayName("PATCH /customer/profile cố ý truyền email và phone -> Hệ thống bảo vệ và KHÔNG thay đổi email, phone")
    void updateProfile_WithTamperedEmailAndPhone_ShouldNotChangeEmailOrPhone() throws Exception {
        User user = createCustomerUser("customer4@example.com", "Password123@");
        String token = obtainAccessToken("customer4@example.com", "Password123@");

        // Payload cố ý chứa email và phone lạ
        String rawTamperedJson = """
            {
                "fullName": "Tên Đã Đổi",
                "gender": "OTHER",
                "address": "Địa chỉ mới",
                "email": "hacker@domain.com",
                "phone": "0999999999"
            }
            """;

        mockMvc.perform(patch("/api/v1/customer/profile")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(rawTamperedJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.fullName").value("Tên Đã Đổi"))
            .andExpect(jsonPath("$.gender").value("OTHER"))
            .andExpect(jsonPath("$.email").value("customer4@example.com")) // Email cũ không đổi
            .andExpect(jsonPath("$.phone").value("0901234567")); // SĐT cũ không đổi

        // Kiểm tra trong DB: Email và SĐT phải tuyệt đối nguyên vẹn
        User dbUser = userRepository.findById(user.getId()).orElseThrow();
        assertThat(dbUser.getEmail()).isEqualTo("customer4@example.com");
        assertThat(dbUser.getPhone()).isEqualTo("0901234567");
    }

    @Test
    @DisplayName("PATCH /customer/profile khi họ tên bị để trống -> 400 BAD_REQUEST")
    void updateProfile_EmptyFullName_ShouldReturn400() throws Exception {
        createCustomerUser("customer5@example.com", "Password123@");
        String token = obtainAccessToken("customer5@example.com", "Password123@");

        UpdateCustomerProfileRequest invalidRequest = new UpdateCustomerProfileRequest(
            "",
            Gender.MALE,
            "Địa chỉ hợp lệ"
        );

        mockMvc.perform(patch("/api/v1/customer/profile")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"));
    }

    @Test
    @DisplayName("PATCH /customer/profile khi địa chỉ vượt quá 500 ký tự -> 400 BAD_REQUEST")
    void updateProfile_TooLongAddress_ShouldReturn400() throws Exception {
        createCustomerUser("customer6@example.com", "Password123@");
        String token = obtainAccessToken("customer6@example.com", "Password123@");

        String longAddress = "A".repeat(501);
        UpdateCustomerProfileRequest invalidRequest = new UpdateCustomerProfileRequest(
            "Họ Tên Hợp Lệ",
            Gender.MALE,
            longAddress
        );

        mockMvc.perform(patch("/api/v1/customer/profile")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"));
    }
}
