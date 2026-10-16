package com.nhalo24h.common.error;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser
@Import(GlobalExceptionHandlerTest.TestErrorController.class)
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @RestController
    @RequestMapping("/api/v1/test-error")
    static class TestErrorController {

        @GetMapping("/app-exception")
        public void throwAppException() {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy dữ liệu thử nghiệm");
        }

        @PostMapping("/validation")
        public void validateInput(@Valid @RequestBody TestInput input) {
            // endpoint để kiểm tra validation
        }

        record TestInput(@NotBlank(message = "Tên không được để trống") String name) {}
    }

    @Test
    @DisplayName("Ném AppException phải được GlobalExceptionHandler chuyển đổi thành HTTP status và ErrorResponse tương ứng")
    void handleAppException_ShouldReturnFormattedError() throws Exception {
        mockMvc.perform(get("/api/v1/test-error/app-exception"))
            .andExpect(status().isNotFound())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"))
            .andExpect(jsonPath("$.message").value("Không tìm thấy dữ liệu thử nghiệm"))
            .andExpect(jsonPath("$.path").value("/api/v1/test-error/app-exception"));
    }

    @Test
    @DisplayName("Request body vi phạm Bean Validation phải trả về 400 Bad Request kèm chi tiết lỗi trường (details)")
    void handleValidationException_ShouldReturnFieldErrors() throws Exception {
        mockMvc.perform(post("/api/v1/test-error/validation")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\": \"\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.errorCode").value("INVALID_INPUT"))
            .andExpect(jsonPath("$.details[0].field").value("name"))
            .andExpect(jsonPath("$.details[0].message").value("Tên không được để trống"));
    }
}
