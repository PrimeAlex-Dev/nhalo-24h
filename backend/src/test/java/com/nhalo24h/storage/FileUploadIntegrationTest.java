package com.nhalo24h.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.auth.dto.LoginRequest;
import com.nhalo24h.auth.repository.InvalidatedTokenRepository;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.repository.UserRepository;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class FileUploadIntegrationTest {

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

    private String customerToken;

    @BeforeEach
    void setUp() throws Exception {
        invalidatedTokenRepository.deleteAll();
        userRepository.deleteAll();

        User customer = new User("Khách Hàng Test", "customer.upload@test.com", "0901234567", UserRole.CUSTOMER);
        customer.setPasswordHash(passwordEncoder.encode("Password@123"));
        customer.setStatus(UserStatus.ACTIVE);
        userRepository.save(customer);

        LoginRequest loginRequest = new LoginRequest("customer.upload@test.com", "Password@123");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode jsonNode = objectMapper.readTree(result.getResponse().getContentAsString());
        customerToken = jsonNode.get("accessToken").asText();
    }

    @AfterEach
    void tearDown() throws Exception {
        invalidatedTokenRepository.deleteAll();
        userRepository.deleteAll();

        // Xóa thư mục test upload nếu có
        Path uploadDir = Paths.get("uploads");
        if (Files.exists(uploadDir)) {
            Files.walk(uploadDir)
                .sorted(Comparator.reverseOrder())
                .map(Path::toFile)
                .forEach(File::delete);
        }
    }

    @Test
    @DisplayName("Upload danh sách ảnh sự cố hợp lệ (PNG, JPG) thành công")
    void testUploadImagesSuccess() throws Exception {
        MockMultipartFile file1 = new MockMultipartFile(
            "files",
            "broken-sink.png",
            "image/png",
            "fake-png-content".getBytes()
        );

        MockMultipartFile file2 = new MockMultipartFile(
            "files",
            "leaking-pipe.jpg",
            "image/jpeg",
            "fake-jpeg-content".getBytes()
        );

        MvcResult result = mockMvc.perform(multipart("/api/v1/files/upload-images")
                .file(file1)
                .file(file2)
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.fileUrls").isArray())
            .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        JsonNode fileUrls = root.get("fileUrls");
        assertThat(fileUrls.size()).isEqualTo(2);

        String url1 = fileUrls.get(0).asText();
        String url2 = fileUrls.get(1).asText();

        assertThat(url1).contains("/uploads/orders/");
        assertThat(url1).endsWith(".png");

        assertThat(url2).contains("/uploads/orders/");
        assertThat(url2).endsWith(".jpg");
    }

    @Test
    @DisplayName("Upload file không phải ảnh (PDF, EXE) phải thất bại (HTTP 400)")
    void testUploadInvalidFileTypeShouldFail() throws Exception {
        MockMultipartFile invalidFile = new MockMultipartFile(
            "files",
            "document.pdf",
            "application/pdf",
            "fake-pdf-content".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/files/upload-images")
                .file(invalidFile)
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Upload không đính kèm file nào phải thất bại (HTTP 400)")
    void testUploadNoFilesShouldFail() throws Exception {
        mockMvc.perform(multipart("/api/v1/files/upload-images")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Upload không truyền Authorization Token phải bị từ chối (HTTP 401)")
    void testUploadWithoutTokenShouldFail() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "files",
            "test.png",
            "image/png",
            "fake-content".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/files/upload-images")
                .file(file))
            .andExpect(status().isUnauthorized());
    }
}
