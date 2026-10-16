package com.nhalo24h.common.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
