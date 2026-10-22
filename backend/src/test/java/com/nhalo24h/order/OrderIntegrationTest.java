package com.nhalo24h.order;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.auth.dto.LoginRequest;
import com.nhalo24h.auth.repository.InvalidatedTokenRepository;
import com.nhalo24h.category.domain.CategoryStatus;
import com.nhalo24h.category.domain.ServiceCategory;
import com.nhalo24h.category.repository.ServiceCategoryRepository;
import com.nhalo24h.order.domain.Order;
import com.nhalo24h.order.domain.OrderRequest;
import com.nhalo24h.order.domain.OrderRequestStatus;
import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.dto.CreateOrderRequest;
import com.nhalo24h.order.dto.DispatchOrderRequestsDto;
import com.nhalo24h.order.dto.RejectOrderRequestDto;
import com.nhalo24h.order.dto.SendChatMessageRequest;
import com.nhalo24h.order.dto.SubmitQuotationRequest;
import com.nhalo24h.order.repository.OrderImageRepository;
import com.nhalo24h.order.repository.OrderRepository;
import com.nhalo24h.order.repository.OrderRequestMessageRepository;
import com.nhalo24h.order.repository.OrderRequestRepository;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.provider.repository.ProviderCategoryRepository;
import com.nhalo24h.provider.repository.ProviderProfileRepository;
import com.nhalo24h.user.domain.CustomerAddress;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.repository.CustomerAddressRepository;
import com.nhalo24h.user.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerAddressRepository customerAddressRepository;

    @Autowired
    private ServiceCategoryRepository serviceCategoryRepository;

    @Autowired
    private ProviderProfileRepository providerProfileRepository;

    @Autowired
    private ProviderCategoryRepository providerCategoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderImageRepository orderImageRepository;

    @Autowired
    private OrderRequestRepository orderRequestRepository;

    @Autowired
    private OrderRequestMessageRepository orderRequestMessageRepository;

    @Autowired
    private InvalidatedTokenRepository invalidatedTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User customer;
    private User providerUser1;
    private User providerUser2;
    private ProviderProfile providerProfile1;
    private ProviderProfile providerProfile2;
    private ServiceCategory category;
    private CustomerAddress customerAddress;
    private String customerToken;
    private String provider1Token;
    private String provider2Token;

    @BeforeEach
    void setUp() throws Exception {
        orderRequestMessageRepository.deleteAll();
        orderRequestRepository.deleteAll();
        orderImageRepository.deleteAll();
        orderRepository.deleteAll();
        providerCategoryRepository.deleteAll();
        providerProfileRepository.deleteAll();
        customerAddressRepository.deleteAll();
        invalidatedTokenRepository.deleteAll();
        userRepository.deleteAll();
        serviceCategoryRepository.deleteAll();

        // 1. Khởi tạo Khách hàng
        customer = new User("Nguyễn Văn Khách", "customer@test.com", "0901111222", UserRole.CUSTOMER);
        customer.setPasswordHash(passwordEncoder.encode("Password@123"));
        customer.setStatus(UserStatus.ACTIVE);
        customer.setEmailVerified(true);
        customer = userRepository.save(customer);

        // Tạo địa chỉ cho khách
        customerAddress = new CustomerAddress(customer, "Nhà riêng", "123 Đường 30/4, P. An Khánh, Q. Ninh Kiều, Cần Thơ", true);
        customerAddress = customerAddressRepository.save(customerAddress);

        // 2. Khởi tạo Thợ 1
        providerUser1 = new User("Trần Thợ 1", "provider1@test.com", "0902222333", UserRole.PROVIDER);
        providerUser1.setPasswordHash(passwordEncoder.encode("Password@123"));
        providerUser1.setStatus(UserStatus.ACTIVE);
        providerUser1.setEmailVerified(true);
        providerUser1 = userRepository.save(providerUser1);

        providerProfile1 = new ProviderProfile(providerUser1);
        providerProfile1.setHeadline("Thợ Điện Nước 5 sao");
        providerProfile1.setPricePerHour(150000L);
        providerProfile1 = providerProfileRepository.save(providerProfile1);

        // 3. Khởi tạo Thợ 2
        providerUser2 = new User("Lê Thợ 2", "provider2@test.com", "0903333444", UserRole.PROVIDER);
        providerUser2.setPasswordHash(passwordEncoder.encode("Password@123"));
        providerUser2.setStatus(UserStatus.ACTIVE);
        providerUser2.setEmailVerified(true);
        providerUser2 = userRepository.save(providerUser2);

        providerProfile2 = new ProviderProfile(providerUser2);
        providerProfile2.setHeadline("Thợ Điện Lạnh Chuyên Nghiệp");
        providerProfile2.setPricePerHour(200000L);
        providerProfile2 = providerProfileRepository.save(providerProfile2);

        // 4. Khởi tạo Danh mục dịch vụ
        category = new ServiceCategory("Sửa chữa điện nước", "sua-chua-dien-nuoc", "Mô tả danh mục", "https://example.com/icon.svg", CategoryStatus.ACTIVE, 1);
        category = serviceCategoryRepository.save(category);

        // 5. Đăng nhập lấy Token
        customerToken = obtainToken("customer@test.com", "Password@123");
        provider1Token = obtainToken("provider1@test.com", "Password@123");
        provider2Token = obtainToken("provider2@test.com", "Password@123");
    }

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        orderRequestMessageRepository.deleteAll();
        orderRequestRepository.deleteAll();
        orderImageRepository.deleteAll();
        orderRepository.deleteAll();
        providerCategoryRepository.deleteAll();
        providerProfileRepository.deleteAll();
        customerAddressRepository.deleteAll();
        invalidatedTokenRepository.deleteAll();
        userRepository.deleteAll();
        serviceCategoryRepository.deleteAll();
    }

    private String obtainToken(String email, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest(email, password);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode jsonNode = objectMapper.readTree(result.getResponse().getContentAsString());
        return jsonNode.get("accessToken").asText();
    }

    @Test
    @DisplayName("Kiểm thử luồng hoàn chỉnh 5 bước: Khách tạo đơn -> Thợ báo giá -> Chat -> Chốt thợ -> Hoàn thành")
    void testCompleteBookingWorkflow() throws Exception {
        // ==========================================
        // BƯỚC 1: Khách tạo đơn hàng với địa chỉ từ sổ và ảnh sự cố
        // ==========================================
        CreateOrderRequest createRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Bồn rửa chén bị rò rỉ nước",
            "Nước chảy tràn dưới tủ bếp cần xử lý gấp",
            Instant.now().plusSeconds(7200),
            "Nguyễn Văn Khách",
            "0901111222",
            List.of("https://res.cloudinary.com/nhalo/img1.jpg", "https://res.cloudinary.com/nhalo/img2.jpg"),
            List.of(providerProfile1.getId()) // Gửi yêu cầu trước cho thợ 1
        );

        MvcResult createResult = mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("Bồn rửa chén bị rò rỉ nước"))
            .andExpect(jsonPath("$.status").value("PENDING_PROVIDER"))
            .andExpect(jsonPath("$.addressSnapshot").value(customerAddress.getFullAddress()))
            .andExpect(jsonPath("$.images.length()").value(2))
            .andExpect(jsonPath("$.quotations.length()").value(1))
            .andReturn();

        JsonNode orderNode = objectMapper.readTree(createResult.getResponse().getContentAsString());
        UUID orderId = UUID.fromString(orderNode.get("id").asText());
        UUID requestId1 = UUID.fromString(orderNode.get("quotations").get(0).get("requestId").asText());

        // ==========================================
        // BƯỚC 2: Khách gửi thêm yêu cầu cho thợ 2 (dispatch thêm)
        // ==========================================
        DispatchOrderRequestsDto dispatchDto = new DispatchOrderRequestsDto(List.of(providerProfile2.getId()));
        mockMvc.perform(post("/api/v1/customer/orders/" + orderId + "/dispatch")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dispatchDto)))
            .andExpect(status().isOk());

        // Kiểm tra xem thợ 2 đã nhận được yêu cầu chưa
        MvcResult p2Requests = mockMvc.perform(get("/api/v1/provider/requests")
                .header("Authorization", "Bearer " + provider2Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.page.totalElements").value(1))
            .andExpect(jsonPath("$.content[0].orderId").value(orderId.toString()))
            .andExpect(jsonPath("$.content[0].requestStatus").value("PENDING_RESPONSE"))
            .andReturn();

        UUID requestId2 = UUID.fromString(objectMapper.readTree(p2Requests.getResponse().getContentAsString()).get("content").get(0).get("requestId").asText());

        // ==========================================
        // BƯỚC 3: Thợ 1 gửi báo giá và nhắn tin trao đổi
        // ==========================================
        SubmitQuotationRequest quote1 = new SubmitQuotationRequest(
            250000L,
            "Đã gồm công và ống dẫn mới, bảo hành 6 tháng",
            Instant.now().plusSeconds(3600)
        );
        mockMvc.perform(post("/api/v1/provider/requests/" + requestId1 + "/quote")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(quote1)))
            .andExpect(status().isOk());

        // Thợ 1 nhắn tin cho khách
        SendChatMessageRequest chat1 = new SendChatMessageRequest("Chào anh, em có mặt sau 30 phút nữa được không ạ?");
        mockMvc.perform(post("/api/v1/orders/requests/" + requestId1 + "/messages")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(chat1)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.senderRole").value("PROVIDER"))
            .andExpect(jsonPath("$.content").value("Chào anh, em có mặt sau 30 phút nữa được không ạ?"));

        // Khách trả lời tin nhắn
        SendChatMessageRequest chatReply = new SendChatMessageRequest("Ok bạn nhé, bạn qua sớm giúp mình.");
        mockMvc.perform(post("/api/v1/orders/requests/" + requestId1 + "/messages")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(chatReply)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.senderRole").value("CUSTOMER"));

        // Xem lịch sử tin nhắn
        mockMvc.perform(get("/api/v1/orders/requests/" + requestId1 + "/messages")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2));

        // ==========================================
        // BƯỚC 4: Khách xác nhận chọn thợ 1 (Chốt đơn)
        // ==========================================
        mockMvc.perform(post("/api/v1/customer/orders/requests/" + requestId1 + "/accept")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk());

        // Kiểm tra trạng thái đơn: đơn sang IN_PROGRESS, gán thợ 1, giá chốt 250,000đ
        Order updatedOrder = orderRepository.findById(orderId).orElseThrow();
        assertThat(updatedOrder.getStatus()).isEqualTo(OrderStatus.IN_PROGRESS);
        assertThat(updatedOrder.getFinalPrice()).isEqualTo(250000L);
        assertThat(updatedOrder.getAssignedProvider().getId()).isEqualTo(providerProfile1.getId());

        // Kiểm tra request của thợ 1 là ACCEPTED
        OrderRequest req1 = orderRequestRepository.findById(requestId1).orElseThrow();
        assertThat(req1.getStatus()).isEqualTo(OrderRequestStatus.ACCEPTED);

        // Kiểm tra request của thợ 2 tự động chuyển thành CANCELED
        OrderRequest req2 = orderRequestRepository.findById(requestId2).orElseThrow();
        assertThat(req2.getStatus()).isEqualTo(OrderRequestStatus.CANCELED);

        // Thợ 1 kiểm tra danh sách việc đã nhận
        mockMvc.perform(get("/api/v1/provider/orders")
                .header("Authorization", "Bearer " + provider1Token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.page.totalElements").value(1))
            .andExpect(jsonPath("$.content[0].orderId").value(orderId.toString()))
            .andExpect(jsonPath("$.content[0].orderStatus").value("IN_PROGRESS"))
            .andExpect(jsonPath("$.content[0].customerPhone").value("0901111222"));

        // ==========================================
        // BƯỚC 5: Thợ 1 hoàn thành công việc
        // ==========================================
        mockMvc.perform(post("/api/v1/provider/orders/" + orderId + "/complete")
                .header("Authorization", "Bearer " + provider1Token))
            .andExpect(status().isOk());

        Order completedOrder = orderRepository.findById(orderId).orElseThrow();
        assertThat(completedOrder.getStatus()).isEqualTo(OrderStatus.COMPLETED);
    }

    @Test
    @DisplayName("Khách hàng tạo đơn với thời gian mong muốn trong quá khứ phải thất bại (HTTP 400)")
    void testCreateOrderWithPastScheduleTimeShouldFail() throws Exception {
        CreateOrderRequest pastRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Bồn rửa chén bị rò rỉ nước",
            "Nước chảy tràn dưới tủ bếp cần xử lý gấp",
            Instant.now().minusSeconds(3600), // 1 giờ trước trong quá khứ
            "Nguyễn Văn Khách",
            "0901111222",
            null,
            null
        );

        mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pastRequest)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Khách hàng tạo đơn với số điện thoại tùy chọn sai định dạng phải thất bại (HTTP 400)")
    void testCreateOrderWithInvalidContactPhoneShouldFail() throws Exception {
        CreateOrderRequest invalidPhoneRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Bồn rửa chén bị rò rỉ nước",
            "Nước chảy tràn dưới tủ bếp cần xử lý gấp",
            Instant.now().plusSeconds(86400),
            "Nguyễn Văn Khách",
            "0912345", // Sai: chỉ có 7 chữ số
            null,
            null
        );

        mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidPhoneRequest)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Khách hàng tạo đơn với tên người liên hệ quá dài phải thất bại (HTTP 400)")
    void testCreateOrderWithOverlongContactNameShouldFail() throws Exception {
        String overlongName = "A".repeat(105);
        CreateOrderRequest overlongNameRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Bồn rửa chén bị rò rỉ nước",
            "Nước chảy tràn dưới tủ bếp cần xử lý gấp",
            Instant.now().plusSeconds(86400),
            overlongName,
            "0901111222",
            null,
            null
        );

        mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(overlongNameRequest)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Khách hàng tạo đơn với tên liên hệ quá ngắn < 2 ký tự phải thất bại (HTTP 400)")
    void testCreateOrderWithShortContactNameShouldFail() throws Exception {
        CreateOrderRequest shortNameRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Bồn rửa chén bị rò rỉ nước",
            "Nước chảy tràn dưới tủ bếp cần xử lý gấp",
            Instant.now().plusSeconds(86400),
            "A", // Chỉ có 1 ký tự
            "0901111222",
            null,
            null
        );

        mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(shortNameRequest)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Khách hàng tạo đơn để trống tên và SĐT liên hệ thì tự động fallback lấy từ tài khoản User")
    void testCreateOrderWithEmptyContactFieldsShouldFallbackToUser() throws Exception {
        CreateOrderRequest emptyContactRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Sửa chữa vòi sen",
            "Vòi sen rò rỉ nước",
            Instant.now().plusSeconds(86400),
            null, // Để trống
            "",   // Để trống
            null,
            null
        );

        MvcResult result = mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(emptyContactRequest)))
            .andExpect(status().isCreated())
            .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(responseNode.get("contactName").asText()).isEqualTo(customer.getFullName());
        assertThat(responseNode.get("contactPhone").asText()).isEqualTo(customer.getPhone());
    }
}
