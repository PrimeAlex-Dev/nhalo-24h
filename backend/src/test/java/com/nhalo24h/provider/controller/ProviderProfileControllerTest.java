package com.nhalo24h.provider.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.auth.dto.LoginRequest;
import com.nhalo24h.auth.repository.InvalidatedTokenRepository;
import com.nhalo24h.category.domain.CategoryStatus;
import com.nhalo24h.category.domain.ServiceCategory;
import com.nhalo24h.category.repository.ServiceCategoryRepository;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.provider.dto.UpdateProviderProfileRequest;
import com.nhalo24h.provider.repository.ProviderCategoryRepository;
import com.nhalo24h.provider.repository.ProviderProfileRepository;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.repository.UserRepository;
import java.util.List;
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
class ProviderProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProviderProfileRepository providerProfileRepository;

    @Autowired
    private ProviderCategoryRepository providerCategoryRepository;

    @Autowired
    private ServiceCategoryRepository serviceCategoryRepository;

    @Autowired
    private InvalidatedTokenRepository invalidatedTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        providerCategoryRepository.deleteAll();
        providerProfileRepository.deleteAll();
        invalidatedTokenRepository.deleteAll();
        userRepository.deleteAll();
        serviceCategoryRepository.deleteAll();
    }

    private User createProviderUser(String email, String rawPassword) {
        User user = new User("Thợ Nguyễn Văn A", email, "0939111222", UserRole.PROVIDER);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    private User createCustomerUser(String email, String rawPassword) {
        User user = new User("Khách Hàng B", email, "0939333444", UserRole.CUSTOMER);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest(email, password);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isOk())
            .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        return objectMapper.readTree(responseBody).get("accessToken").asText();
    }

    @Test
    @DisplayName("Thợ xem hồ sơ cá nhân lần đầu sẽ tự động khởi tạo hồ sơ và trả về 200")
    void getMyProfile_ShouldAutoCreateAndReturn200() throws Exception {
        createProviderUser("tho1@example.com", "Password123");
        String token = loginAndGetToken("tho1@example.com", "Password123");

        mockMvc.perform(get("/api/v1/provider/profile/me")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.fullName", is("Thợ Nguyễn Văn A")))
            .andExpect(jsonPath("$.email", is("tho1@example.com")))
            .andExpect(jsonPath("$.phone", is("0939111222")))
            .andExpect(jsonPath("$.isAvailable", is(true)))
            .andExpect(jsonPath("$.experienceYears", is(0)));
    }

    @Test
    @DisplayName("Chưa đăng nhập gọi API xem hồ sơ thợ trả về 401 Unauthorized")
    void getMyProfile_WithoutToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/provider/profile/me"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Tài khoản CUSTOMER cố gắng truy cập hồ sơ thợ sẽ bị 403 Forbidden")
    void getMyProfile_WithCustomerRole_ShouldReturn403() throws Exception {
        createCustomerUser("customer@example.com", "Password123");
        String token = loginAndGetToken("customer@example.com", "Password123");

        mockMvc.perform(get("/api/v1/provider/profile/me")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Thợ cập nhật thông tin nghề nghiệp thành công")
    void updateMyProfile_ShouldUpdateFieldsAndReturn200() throws Exception {
        createProviderUser("tho2@example.com", "Password123");
        String token = loginAndGetToken("tho2@example.com", "Password123");

        ServiceCategory cat1 = new ServiceCategory("Điện dân dụng", "dien-dan-dung", "Sửa điện", "zap", CategoryStatus.ACTIVE, 1);
        cat1 = serviceCategoryRepository.save(cat1);

        UpdateProviderProfileRequest updateReq = new UpdateProviderProfileRequest(
            "Thợ Nguyễn Văn A Đã Sửa",
            "https://example.com/avatar-new.jpg",
            "Kỹ thuật viên điện nước 5 sao",
            "Hơn 6 năm kinh nghiệm, làm việc nhiệt tình, tận tâm",
            6,
            180000L,
            "Quận Ninh Kiều & Cái Răng",
            false,
            List.of(cat1.getId())
        );

        mockMvc.perform(put("/api/v1/provider/profile/me")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.fullName", is("Thợ Nguyễn Văn A Đã Sửa")))
            .andExpect(jsonPath("$.headline", is("Kỹ thuật viên điện nước 5 sao")))
            .andExpect(jsonPath("$.experienceYears", is(6)))
            .andExpect(jsonPath("$.pricePerHour", is(180000)))
            .andExpect(jsonPath("$.serviceArea", is("Quận Ninh Kiều & Cái Răng")))
            .andExpect(jsonPath("$.isAvailable", is(false)))
            .andExpect(jsonPath("$.categories", hasSize(1)))
            .andExpect(jsonPath("$.categories[0].name", is("Điện dân dụng")));

        User updatedUser = userRepository.findByEmailIgnoreCase("tho2@example.com").orElseThrow();
        assertThat(updatedUser.getFullName()).isEqualTo("Thợ Nguyễn Văn A Đã Sửa");
    }

    @Test
    @DisplayName("Thợ cập nhật danh mục phụ trách riêng qua endpoint categories")
    void updateMyCategories_ShouldUpdateRegisteredCategories() throws Exception {
        createProviderUser("tho3@example.com", "Password123");
        String token = loginAndGetToken("tho3@example.com", "Password123");

        ServiceCategory cat1 = serviceCategoryRepository.save(new ServiceCategory("Sửa điều hòa", "sua-dieu-hoa", "Mô tả", "snowflake", CategoryStatus.ACTIVE, 1));
        ServiceCategory cat2 = serviceCategoryRepository.save(new ServiceCategory("Sửa ống nước", "sua-ong-nuoc", "Mô tả", "wrench", CategoryStatus.ACTIVE, 2));

        mockMvc.perform(put("/api/v1/provider/profile/me/categories")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(List.of(cat1.getId(), cat2.getId()))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.categories", hasSize(2)));
    }
}
