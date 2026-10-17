package com.nhalo24h.category.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.category.domain.CategoryStatus;
import com.nhalo24h.category.domain.ServiceCategory;
import com.nhalo24h.category.dto.CreateCategoryRequest;
import com.nhalo24h.category.dto.UpdateCategoryRequest;
import com.nhalo24h.category.dto.UpdateCategoryStatusRequest;
import com.nhalo24h.category.repository.ServiceCategoryRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(roles = "ADMIN")
class ServiceCategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ServiceCategoryRepository categoryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        categoryRepository.deleteAll();
    }

    @Test
    @DisplayName("Tạo danh mục thành công khi truyền đầy đủ thông tin và slug chỉ định")
    void createCategory_WithExplicitSlug_ShouldReturn201() throws Exception {
        CreateCategoryRequest request = new CreateCategoryRequest(
            "Điện dân dụng",
            "dien-dan-dung",
            "Sửa chữa và lắp đặt thiết bị điện gia đình",
            "https://example.com/icons/electric.png",
            1,
            CategoryStatus.ACTIVE
        );

        mockMvc.perform(post("/api/v1/service-categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").isNotEmpty())
            .andExpect(jsonPath("$.name").value("Điện dân dụng"))
            .andExpect(jsonPath("$.slug").value("dien-dan-dung"))
            .andExpect(jsonPath("$.description").value("Sửa chữa và lắp đặt thiết bị điện gia đình"))
            .andExpect(jsonPath("$.iconUrl").value("https://example.com/icons/electric.png"))
            .andExpect(jsonPath("$.displayOrder").value(1))
            .andExpect(jsonPath("$.status").value("ACTIVE"))
            .andExpect(jsonPath("$.createdAt").isNotEmpty())
            .andExpect(jsonPath("$.updatedAt").isNotEmpty());
    }

    @Test
    @DisplayName("Tạo danh mục thành công và tự động sinh slug từ name khi không truyền slug")
    void createCategory_WithoutSlug_ShouldAutoGenerateSlugAndReturn201() throws Exception {
        CreateCategoryRequest request = new CreateCategoryRequest(
            "Vệ sinh nhà cửa & văn phòng",
            null,
            "Dọn dẹp vệ sinh tổng quát",
            null,
            null,
            null
        );

        mockMvc.perform(post("/api/v1/service-categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNotEmpty())
            .andExpect(jsonPath("$.name").value("Vệ sinh nhà cửa & văn phòng"))
            .andExpect(jsonPath("$.slug").value("ve-sinh-nha-cua-van-phong"))
            .andExpect(jsonPath("$.displayOrder").value(0))
            .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("Tạo danh mục thất bại khi thiếu tên (name trống)")
    void createCategory_WhenNameBlank_ShouldReturn400() throws Exception {
        CreateCategoryRequest request = new CreateCategoryRequest(
            "   ",
            "dien-nuoc",
            null,
            null,
            0,
            CategoryStatus.ACTIVE
        );

        mockMvc.perform(post("/api/v1/service-categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"))
            .andExpect(jsonPath("$.details", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Tạo danh mục thất bại khi thứ tự hiển thị displayOrder âm")
    void createCategory_WhenDisplayOrderNegative_ShouldReturn400() throws Exception {
        CreateCategoryRequest request = new CreateCategoryRequest(
            "Điện nước",
            "dien-nuoc",
            null,
            null,
            -1,
            CategoryStatus.ACTIVE
        );

        mockMvc.perform(post("/api/v1/service-categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"));
    }

    @Test
    @DisplayName("Tạo danh mục thất bại khi slug đã tồn tại (409 Conflict)")
    void createCategory_WhenSlugDuplicate_ShouldReturn409() throws Exception {
        ServiceCategory existing = new ServiceCategory("Điện lạnh", "dien-lanh", "Mô tả", null, CategoryStatus.ACTIVE, 0);
        categoryRepository.save(existing);

        CreateCategoryRequest request = new CreateCategoryRequest(
            "Điện lạnh sửa chữa",
            "dien-lanh",
            null,
            null,
            0,
            CategoryStatus.ACTIVE
        );

        mockMvc.perform(post("/api/v1/service-categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.errorCode").value("CONFLICT"))
            .andExpect(jsonPath("$.message", containsString("dien-lanh")));
    }

    @Test
    @DisplayName("Lấy danh sách danh mục có phân trang và sắp xếp mặc định theo displayOrder ASC")
    void getCategories_PaginationAndDefaultSort_ShouldReturnList() throws Exception {
        categoryRepository.save(new ServiceCategory("Sửa nước", "sua-nuoc", null, null, CategoryStatus.ACTIVE, 2));
        categoryRepository.save(new ServiceCategory("Điện gia dụng", "dien-gia-dung", null, null, CategoryStatus.ACTIVE, 1));
        categoryRepository.save(new ServiceCategory("Khóa cửa", "khoa-cua", null, null, CategoryStatus.INACTIVE, 0));

        mockMvc.perform(get("/api/v1/service-categories")
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(3)))
            .andExpect(jsonPath("$.content[0].slug").value("khoa-cua"))
            .andExpect(jsonPath("$.content[1].slug").value("dien-gia-dung"))
            .andExpect(jsonPath("$.content[2].slug").value("sua-nuoc"));
    }

    @Test
    @DisplayName("Lọc danh mục theo status ACTIVE")
    void getCategories_FilterByStatus_ShouldReturnOnlyActive() throws Exception {
        categoryRepository.save(new ServiceCategory("Điện dân dụng", "dien-dan-dung", null, null, CategoryStatus.ACTIVE, 1));
        categoryRepository.save(new ServiceCategory("Dọn dẹp cũ", "don-dep-cu", null, null, CategoryStatus.INACTIVE, 2));

        mockMvc.perform(get("/api/v1/service-categories")
                .param("status", "ACTIVE"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(1)))
            .andExpect(jsonPath("$.content[0].status").value("ACTIVE"))
            .andExpect(jsonPath("$.content[0].slug").value("dien-dan-dung"));
    }

    @Test
    @DisplayName("Tìm kiếm danh mục theo từ khóa search")
    void getCategories_SearchKeyword_ShouldReturnMatching() throws Exception {
        categoryRepository.save(new ServiceCategory("Điện lạnh", "dien-lanh", null, null, CategoryStatus.ACTIVE, 1));
        categoryRepository.save(new ServiceCategory("Vệ sinh máy lạnh", "ve-sinh-may-lanh", null, null, CategoryStatus.ACTIVE, 2));
        categoryRepository.save(new ServiceCategory("Điện nước", "dien-nuoc", null, null, CategoryStatus.ACTIVE, 3));

        mockMvc.perform(get("/api/v1/service-categories")
                .param("search", "lanh"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content", hasSize(2)));
    }

    @Test
    @DisplayName("Lọc danh mục với status không hợp lệ phải trả về 400 Bad Request")
    void getCategories_InvalidStatusParam_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/api/v1/service-categories")
                .param("status", "UNKNOWN_STATUS"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"))
            .andExpect(jsonPath("$.message", containsString("ACTIVE, INACTIVE")));
    }

    @Test
    @DisplayName("Lấy chi tiết danh mục theo ID thành công")
    void getCategoryById_Success_ShouldReturn200() throws Exception {
        ServiceCategory saved = categoryRepository.save(
            new ServiceCategory("Điện dân dụng", "dien-dan-dung", "Mô tả chi tiết", "https://icon.png", CategoryStatus.ACTIVE, 1)
        );

        mockMvc.perform(get("/api/v1/service-categories/{id}", saved.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(saved.getId().toString()))
            .andExpect(jsonPath("$.name").value("Điện dân dụng"))
            .andExpect(jsonPath("$.slug").value("dien-dan-dung"))
            .andExpect(jsonPath("$.description").value("Mô tả chi tiết"))
            .andExpect(jsonPath("$.iconUrl").value("https://icon.png"))
            .andExpect(jsonPath("$.status").value("ACTIVE"))
            .andExpect(jsonPath("$.displayOrder").value(1));
    }

    @Test
    @DisplayName("Lấy chi tiết danh mục khi không tìm thấy ID phải trả về 404 Not Found")
    void getCategoryById_NotFound_ShouldReturn404() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/service-categories/{id}", nonExistentId))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"))
            .andExpect(jsonPath("$.message", containsString(nonExistentId.toString())));
    }

    @Test
    @DisplayName("Lấy chi tiết danh mục với định dạng UUID không hợp lệ phải trả về 400 Bad Request")
    void getCategoryById_MalformedUUID_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/api/v1/service-categories/not-a-valid-uuid"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"));
    }

    @Test
    @DisplayName("Cập nhật danh mục thành công")
    void updateCategory_Success_ShouldReturn200() throws Exception {
        ServiceCategory saved = categoryRepository.save(
            new ServiceCategory("Điện lạnh", "dien-lanh", "Mô tả cũ", null, CategoryStatus.ACTIVE, 0)
        );

        UpdateCategoryRequest request = new UpdateCategoryRequest(
            "Điện lạnh & Điều hòa",
            "dien-lanh-dieu-hoa",
            "Mô tả mới cập nhật",
            "https://icon.png",
            5
        );

        mockMvc.perform(patch("/api/v1/service-categories/{id}", saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(saved.getId().toString()))
            .andExpect(jsonPath("$.name").value("Điện lạnh & Điều hòa"))
            .andExpect(jsonPath("$.slug").value("dien-lanh-dieu-hoa"))
            .andExpect(jsonPath("$.description").value("Mô tả mới cập nhật"))
            .andExpect(jsonPath("$.iconUrl").value("https://icon.png"))
            .andExpect(jsonPath("$.displayOrder").value(5));
    }

    @Test
    @DisplayName("Cập nhật danh mục với slug đã thuộc danh mục khác phải trả về 409 Conflict")
    void updateCategory_WhenSlugDuplicate_ShouldReturn409() throws Exception {
        ServiceCategory cat1 = categoryRepository.save(
            new ServiceCategory("Điện lạnh", "dien-lanh", null, null, CategoryStatus.ACTIVE, 0)
        );
        ServiceCategory cat2 = categoryRepository.save(
            new ServiceCategory("Điện nước", "dien-nuoc", null, null, CategoryStatus.ACTIVE, 1)
        );

        UpdateCategoryRequest request = new UpdateCategoryRequest(
            null,
            "dien-lanh",
            null,
            null,
            null
        );

        mockMvc.perform(patch("/api/v1/service-categories/{id}", cat2.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.errorCode").value("CONFLICT"))
            .andExpect(jsonPath("$.message", containsString("dien-lanh")));
    }

    @Test
    @DisplayName("Cập nhật danh mục với displayOrder âm phải trả về 400 Bad Request")
    void updateCategory_WhenDisplayOrderNegative_ShouldReturn400() throws Exception {
        ServiceCategory saved = categoryRepository.save(
            new ServiceCategory("Điện lạnh", "dien-lanh", null, null, CategoryStatus.ACTIVE, 0)
        );

        UpdateCategoryRequest request = new UpdateCategoryRequest(
            null,
            null,
            null,
            null,
            -5
        );

        mockMvc.perform(patch("/api/v1/service-categories/{id}", saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"));
    }

    @Test
    @DisplayName("Cập nhật danh mục không tồn tại phải trả về 404 Not Found")
    void updateCategory_NotFound_ShouldReturn404() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        UpdateCategoryRequest request = new UpdateCategoryRequest(
            "Tên mới",
            "ten-moi",
            null,
            null,
            1
        );

        mockMvc.perform(patch("/api/v1/service-categories/{id}", nonExistentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("Bật/tắt trạng thái danh mục sang INACTIVE và ngược lại")
    void updateCategoryStatus_ToggleStatus_ShouldReturn200() throws Exception {
        ServiceCategory saved = categoryRepository.save(
            new ServiceCategory("Điện gia dụng", "dien-gia-dung", null, null, CategoryStatus.ACTIVE, 0)
        );

        // Chuyển sang INACTIVE
        UpdateCategoryStatusRequest inactiveReq = new UpdateCategoryStatusRequest(CategoryStatus.INACTIVE);
        mockMvc.perform(patch("/api/v1/service-categories/{id}/status", saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inactiveReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("INACTIVE"));

        // Chuyển lại sang ACTIVE
        UpdateCategoryStatusRequest activeReq = new UpdateCategoryStatusRequest(CategoryStatus.ACTIVE);
        mockMvc.perform(patch("/api/v1/service-categories/{id}/status", saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(activeReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("Bật/tắt trạng thái với status không hợp lệ trong body phải trả về 400 Bad Request")
    void updateCategoryStatus_InvalidStatusEnum_ShouldReturn400() throws Exception {
        ServiceCategory saved = categoryRepository.save(
            new ServiceCategory("Điện gia dụng", "dien-gia-dung", null, null, CategoryStatus.ACTIVE, 0)
        );

        String invalidJson = "{\"status\": \"DELETED\"}";

        mockMvc.perform(patch("/api/v1/service-categories/{id}/status", saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"))
            .andExpect(jsonPath("$.message", containsString("ACTIVE, INACTIVE")));
    }

    @Test
    @DisplayName("Bật/tắt trạng thái danh mục không tồn tại phải trả về 404 Not Found")
    void updateCategoryStatus_NotFound_ShouldReturn404() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        UpdateCategoryStatusRequest req = new UpdateCategoryStatusRequest(CategoryStatus.INACTIVE);

        mockMvc.perform(patch("/api/v1/service-categories/{id}/status", nonExistentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"));
    }
}
