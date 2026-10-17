package com.nhalo24h.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.auth.dto.LoginRequest;
import com.nhalo24h.auth.repository.InvalidatedTokenRepository;
import com.nhalo24h.user.domain.CustomerAddress;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.dto.CreateCustomerAddressRequest;
import com.nhalo24h.user.dto.UpdateCustomerAddressRequest;
import com.nhalo24h.user.repository.CustomerAddressRepository;
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

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CustomerAddressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerAddressRepository customerAddressRepository;

    @Autowired
    private InvalidatedTokenRepository invalidatedTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        customerAddressRepository.deleteAll();
        invalidatedTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    private User createCustomerUser(String email, String rawPassword) {
        User user = new User("Khách Hàng Test", email, "0901112233", UserRole.CUSTOMER);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    private User createAdminUser(String email, String rawPassword) {
        User user = new User("Quản Trị Viên", email, "0908887766", UserRole.ADMIN);
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
    @DisplayName("GET /api/v1/customer/addresses khi chưa có địa chỉ -> Trả về danh sách rỗng 200 OK")
    void getAddresses_WhenEmpty_ShouldReturnEmptyList() throws Exception {
        createCustomerUser("cust1@example.com", "Password123@");
        String token = obtainAccessToken("cust1@example.com", "Password123@");

        mockMvc.perform(get("/api/v1/customer/addresses")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("GET /api/v1/customer/addresses không có token -> Trả về 401 UNAUTHORIZED")
    void getAddresses_WithoutToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/customer/addresses"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("GET /api/v1/customer/addresses với vai trò ADMIN -> Trả về 403 FORBIDDEN")
    void getAddresses_WithAdminRole_ShouldReturn403() throws Exception {
        createAdminUser("admin@example.com", "Password123@");
        String token = obtainAccessToken("admin@example.com", "Password123@");

        mockMvc.perform(get("/api/v1/customer/addresses")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("POST /api/v1/customer/addresses tạo địa chỉ đầu tiên -> Tự động đặt làm mặc định (isDefault = true)")
    void createAddress_FirstAddress_ShouldBeAutoDefault() throws Exception {
        User user = createCustomerUser("cust2@example.com", "Password123@");
        String token = obtainAccessToken("cust2@example.com", "Password123@");

        CreateCustomerAddressRequest request = new CreateCustomerAddressRequest(
            "Nhà riêng",
            "Số 123 Đường Cầu Giấy, Hà Nội",
            false // Dù gửi false thì địa chỉ đầu tiên vẫn tự thành default
        );

        mockMvc.perform(post("/api/v1/customer/addresses")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNotEmpty())
            .andExpect(jsonPath("$.label").value("Nhà riêng"))
            .andExpect(jsonPath("$.fullAddress").value("Số 123 Đường Cầu Giấy, Hà Nội"))
            .andExpect(jsonPath("$.isDefault").value(true));

        List<CustomerAddress> addresses = customerAddressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId());
        assertThat(addresses).hasSize(1);
        assertThat(addresses.get(0).isDefault()).isTrue();
    }

    @Test
    @DisplayName("POST /api/v1/customer/addresses tạo địa chỉ thứ 2 đánh dấu mặc định -> Địa chỉ cũ tự động bỏ mặc định")
    void createAddress_SecondAddressAsDefault_ShouldSwitchDefault() throws Exception {
        User user = createCustomerUser("cust3@example.com", "Password123@");
        String token = obtainAccessToken("cust3@example.com", "Password123@");

        // Địa chỉ 1 (mặc định)
        CustomerAddress addr1 = customerAddressRepository.save(new CustomerAddress(user, "Nhà riêng", "Số 123 Cầu Giấy", true));

        // Thêm địa chỉ 2 có isDefault = true
        CreateCustomerAddressRequest request = new CreateCustomerAddressRequest(
            "Công ty",
            "Tòa nhà Keangnam, Mễ Trì, Nam Từ Liêm, Hà Nội",
            true
        );

        mockMvc.perform(post("/api/v1/customer/addresses")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.label").value("Công ty"))
            .andExpect(jsonPath("$.isDefault").value(true));

        // Kiểm tra địa chỉ 1 đã bị unset isDefault
        CustomerAddress oldDefault = customerAddressRepository.findById(addr1.getId()).orElseThrow();
        assertThat(oldDefault.isDefault()).isFalse();
    }

    @Test
    @DisplayName("PUT /api/v1/customer/addresses/{id} cập nhật địa chỉ thành công -> 200 OK")
    void updateAddress_Success() throws Exception {
        User user = createCustomerUser("cust4@example.com", "Password123@");
        String token = obtainAccessToken("cust4@example.com", "Password123@");

        CustomerAddress address = customerAddressRepository.save(new CustomerAddress(user, "Nhà cũ", "Số 10 Tây Hồ", true));

        UpdateCustomerAddressRequest updateReq = new UpdateCustomerAddressRequest(
            "Nhà riêng mới",
            "Số 20 Hoàng Hoa Thám, Ba Đình, Hà Nội",
            true
        );

        mockMvc.perform(put("/api/v1/customer/addresses/" + address.getId())
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.label").value("Nhà riêng mới"))
            .andExpect(jsonPath("$.fullAddress").value("Số 20 Hoàng Hoa Thám, Ba Đình, Hà Nội"))
            .andExpect(jsonPath("$.isDefault").value(true));
    }

    @Test
    @DisplayName("PUT /api/v1/customer/addresses/{id} của user khác -> 404 NOT_FOUND (Chống IDOR)")
    void updateAddress_OtherUserAddress_ShouldReturn404() throws Exception {
        User userA = createCustomerUser("usera@example.com", "Password123@");
        User userB = createCustomerUser("userb@example.com", "Password123@");

        CustomerAddress addressOfUserA = customerAddressRepository.save(new CustomerAddress(userA, "Nhà A", "Địa chỉ A", true));
        String tokenB = obtainAccessToken("userb@example.com", "Password123@");

        UpdateCustomerAddressRequest updateReq = new UpdateCustomerAddressRequest("Hack", "Địa chỉ hack", false);

        mockMvc.perform(put("/api/v1/customer/addresses/" + addressOfUserA.getId())
                .header("Authorization", "Bearer " + tokenB)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("PATCH /api/v1/customer/addresses/{id}/default đặt địa chỉ làm mặc định -> 200 OK")
    void setDefaultAddress_Success() throws Exception {
        User user = createCustomerUser("cust5@example.com", "Password123@");
        String token = obtainAccessToken("cust5@example.com", "Password123@");

        CustomerAddress addr1 = customerAddressRepository.save(new CustomerAddress(user, "Nhà riêng", "Số 1 Cầu Giấy", true));
        CustomerAddress addr2 = customerAddressRepository.save(new CustomerAddress(user, "Công ty", "Số 2 Duy Tân", false));

        mockMvc.perform(patch("/api/v1/customer/addresses/" + addr2.getId() + "/default")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(addr2.getId().toString()))
            .andExpect(jsonPath("$.isDefault").value(true));

        CustomerAddress updatedAddr1 = customerAddressRepository.findById(addr1.getId()).orElseThrow();
        assertThat(updatedAddr1.isDefault()).isFalse();

        CustomerAddress updatedAddr2 = customerAddressRepository.findById(addr2.getId()).orElseThrow();
        assertThat(updatedAddr2.isDefault()).isTrue();
    }

    @Test
    @DisplayName("DELETE /api/v1/customer/addresses/{id} khi xóa địa chỉ mặc định -> Tự động chuyển mặc định sang địa chỉ còn lại")
    void deleteAddress_DefaultAddress_ShouldPromoteRemaining() throws Exception {
        User user = createCustomerUser("cust6@example.com", "Password123@");
        String token = obtainAccessToken("cust6@example.com", "Password123@");

        CustomerAddress addr1 = customerAddressRepository.save(new CustomerAddress(user, "Địa chỉ 1 (Default)", "Số 1 Cầu Giấy", true));
        CustomerAddress addr2 = customerAddressRepository.save(new CustomerAddress(user, "Địa chỉ 2", "Số 2 Duy Tân", false));

        mockMvc.perform(delete("/api/v1/customer/addresses/" + addr1.getId())
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isNoContent());

        assertThat(customerAddressRepository.existsById(addr1.getId())).isFalse();

        // Địa chỉ 2 phải tự động thành mặc định
        CustomerAddress remaining = customerAddressRepository.findById(addr2.getId()).orElseThrow();
        assertThat(remaining.isDefault()).isTrue();
    }
}
