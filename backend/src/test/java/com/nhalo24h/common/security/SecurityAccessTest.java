package com.nhalo24h.common.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityAccessTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Endpoint /api/v1/health được phép truy cập công khai không cần xác thực")
    void healthEndpoint_ShouldBePermitted() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Endpoint OpenAPI docs /v3/api-docs được phép truy cập công khai")
    void openApiDocs_ShouldBePermitted() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("GET /api/v1/service-categories cho phép khách (anonymous) xem công khai")
    void getCategories_Anonymous_ShouldBePermitted() throws Exception {
        mockMvc.perform(get("/api/v1/service-categories"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Chưa đăng nhập truy cập /api/v1/users phải nhận 401 UNAUTHORIZED")
    void getUsers_Anonymous_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isUnauthorized())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status").value(401))
            .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("Vai trò CUSTOMER truy cập /api/v1/users bị từ chối 403 FORBIDDEN")
    void getUsers_WithCustomerRole_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isForbidden())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status").value(403))
            .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    @DisplayName("Vai trò PROVIDER truy cập /api/v1/users bị từ chối 403 FORBIDDEN")
    void getUsers_WithProviderRole_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isForbidden())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status").value(403))
            .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Vai trò ADMIN truy cập /api/v1/users được phép 200 OK")
    void getUsers_WithAdminRole_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Chưa đăng nhập gọi POST /api/v1/service-categories phải nhận 401 UNAUTHORIZED")
    void createCategory_Anonymous_ShouldReturn401() throws Exception {
        mockMvc.perform(post("/api/v1/service-categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("Vai trò CUSTOMER gọi POST /api/v1/service-categories bị từ chối 403 FORBIDDEN")
    void createCategory_WithCustomerRole_ShouldReturn403() throws Exception {
        mockMvc.perform(post("/api/v1/service-categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    @DisplayName("Vai trò PROVIDER gọi POST /api/v1/service-categories bị từ chối 403 FORBIDDEN")
    void createCategory_WithProviderRole_ShouldReturn403() throws Exception {
        mockMvc.perform(post("/api/v1/service-categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("API chưa được cấu hình permitAll phải trả về 401 UNAUTHORIZED với format ErrorResponse chuẩn")
    void securedEndpoint_ShouldReturnUnauthorizedWithStandardErrorResponse() throws Exception {
        mockMvc.perform(get("/api/v1/orders"))
            .andExpect(status().isUnauthorized())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status").value(401))
            .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"))
            .andExpect(jsonPath("$.message").isNotEmpty())
            .andExpect(jsonPath("$.path").value("/api/v1/orders"))
            .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }
}
