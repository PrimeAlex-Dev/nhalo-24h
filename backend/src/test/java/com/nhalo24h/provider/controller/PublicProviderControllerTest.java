package com.nhalo24h.provider.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.category.domain.CategoryStatus;
import com.nhalo24h.category.domain.ServiceCategory;
import com.nhalo24h.category.repository.ServiceCategoryRepository;
import com.nhalo24h.provider.domain.ProviderCategory;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.provider.repository.ProviderCategoryRepository;
import com.nhalo24h.provider.repository.ProviderProfileRepository;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.repository.UserRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicProviderControllerTest {

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
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        providerCategoryRepository.deleteAll();
        providerProfileRepository.deleteAll();
        userRepository.deleteAll();
        serviceCategoryRepository.deleteAll();
    }

    private ProviderProfile createTestProvider(String name, String email, String headline, String area, boolean isAvailable, ServiceCategory category) {
        User user = new User(name, email, "0939" + System.nanoTime() % 1000000, UserRole.PROVIDER);
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);
        user = userRepository.save(user);

        ProviderProfile profile = new ProviderProfile(user);
        profile.setHeadline(headline);
        profile.setServiceArea(area);
        profile.setExperienceYears(4);
        profile.setPricePerHour(150000L);
        profile.setIsAvailable(isAvailable);
        profile = providerProfileRepository.save(profile);

        if (category != null) {
            ProviderCategory pc = new ProviderCategory(profile, category);
            providerCategoryRepository.save(pc);
            profile.getProviderCategories().add(pc);
        }

        return profile;
    }

    @Test
    @DisplayName("Khách hàng xem danh sách thợ công khai không cần token trả về 200")
    void getProviders_PublicAccess_ShouldReturn200() throws Exception {
        ServiceCategory cat = serviceCategoryRepository.save(new ServiceCategory("Sửa điều hòa", "sua-dieu-hoa", "Mô tả", "snowflake", CategoryStatus.ACTIVE, 1));
        createTestProvider("Thợ Minh", "minh@example.com", "Chuyên sửa máy lạnh", "Ninh Kiều", true, cat);
        createTestProvider("Thợ Hùng", "hung@example.com", "Chuyên sửa điện", "Cái Răng", true, null);

        mockMvc.perform(get("/api/v1/providers"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].name", anyOf(is("Thợ Minh"), is("Thợ Hùng"))));
    }

    @Test
    @DisplayName("Khách hàng lọc thợ theo danh mục dịch vụ")
    void getProviders_FilterByCategory_ShouldReturnMatchingProviders() throws Exception {
        ServiceCategory catAc = serviceCategoryRepository.save(new ServiceCategory("Sửa điều hòa", "sua-dieu-hoa", "Mô tả", "snowflake", CategoryStatus.ACTIVE, 1));
        ServiceCategory catWater = serviceCategoryRepository.save(new ServiceCategory("Sửa ống nước", "sua-ong-nuoc", "Mô tả", "wrench", CategoryStatus.ACTIVE, 2));

        createTestProvider("Thợ Máy Lạnh", "ac@example.com", "Thợ lạnh", "Ninh Kiều", true, catAc);
        createTestProvider("Thợ Nước", "water@example.com", "Thợ nước", "Ninh Kiều", true, catWater);

        mockMvc.perform(get("/api/v1/providers")
                .param("category", "sua-dieu-hoa"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].name", is("Thợ Máy Lạnh")));
    }

    @Test
    @DisplayName("Khách hàng tìm kiếm thợ theo từ khóa")
    void getProviders_Search_ShouldReturnMatchingProviders() throws Exception {
        createTestProvider("Nguyễn Văn Hùng", "hung@example.com", "Thợ cơ khí chuyên nghiệp", "Ninh Kiều", true, null);
        createTestProvider("Trần Tuấn Kiệt", "kiet@example.com", "Thợ sửa khóa tận nơi", "Cái Răng", true, null);

        mockMvc.perform(get("/api/v1/providers")
                .param("search", "khóa"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].name", is("Trần Tuấn Kiệt")));
    }

    @Test
    @DisplayName("Khách hàng xem chi tiết một thợ theo ID trả về 200")
    void getProviderById_ShouldReturn200() throws Exception {
        ServiceCategory cat = serviceCategoryRepository.save(new ServiceCategory("Sửa khóa", "sua-khoa", "Mô tả", "key", CategoryStatus.ACTIVE, 1));
        ProviderProfile profile = createTestProvider("Thợ Khóa Toàn", "toan@example.com", "Thợ khóa 24/7", "Bình Thủy", true, cat);

        mockMvc.perform(get("/api/v1/providers/" + profile.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name", is("Thợ Khóa Toàn")))
            .andExpect(jsonPath("$.headline", is("Thợ khóa 24/7")))
            .andExpect(jsonPath("$.serviceArea", is("Bình Thủy")))
            .andExpect(jsonPath("$.pricePerHour", is(150000)))
            .andExpect(jsonPath("$.categories", hasSize(1)))
            .andExpect(jsonPath("$.categories[0].name", is("Sửa khóa")));
    }

    @Test
    @DisplayName("Xem chi tiết thợ với ID không tồn tại trả về 404")
    void getProviderById_NotFound_ShouldReturn404() throws Exception {
        mockMvc.perform(get("/api/v1/providers/" + UUID.randomUUID()))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Nâng cấp: Thợ ở trạng thái không hoạt động (tắt nhận việc hoặc bị đình chỉ) KHÔNG hiển thị trên danh sách provider")
    void getProviders_ShouldExcludeInactiveAndSuspendedProviders() throws Exception {
        // 1. Thợ đang hoạt động bình thường
        createTestProvider("Thợ Sẵn Sàng", "active@example.com", "Thợ điện thoại", "Ninh Kiều", true, null);

        // 2. Thợ đã tắt nhận việc (offline)
        createTestProvider("Thợ Tạm Ngưng", "offline@example.com", "Thợ nghỉ phép", "Ninh Kiều", false, null);

        // 3. Thợ đang bị kỷ luật đình chỉ 7 ngày
        ProviderProfile suspendedProfile = createTestProvider("Thợ Kỷ Luật", "suspended@example.com", "Thợ bị phạt", "Ninh Kiều", true, null);
        suspendedProfile.setSuspendedUntil(Instant.now().plus(7, ChronoUnit.DAYS));
        providerProfileRepository.save(suspendedProfile);

        // Khách hàng gọi API tìm kiếm danh sách thợ công khai
        mockMvc.perform(get("/api/v1/providers"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].name", is("Thợ Sẵn Sàng")));
    }
}
