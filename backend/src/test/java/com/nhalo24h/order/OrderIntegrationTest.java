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
import com.nhalo24h.order.domain.PaymentStatus;
import com.nhalo24h.order.domain.QuoteMode;
import com.nhalo24h.order.dto.AdjustInvoiceRequest;
import com.nhalo24h.order.dto.CancelOrderDto;
import com.nhalo24h.order.dto.CompleteOrderRequest;
import com.nhalo24h.order.dto.ConfirmCashPaymentRequest;
import com.nhalo24h.order.dto.ConfirmOnlinePaymentRequest;
import com.nhalo24h.order.dto.CreateOrderRequest;
import com.nhalo24h.order.dto.DeclareCashPaymentRequest;
import com.nhalo24h.order.dto.DismissAbnormalFlagRequest;
import com.nhalo24h.order.dto.DispatchOrderRequestsDto;
import com.nhalo24h.order.dto.QuoteItemDto;
import com.nhalo24h.order.dto.ResolveDisputeRequest;
import com.nhalo24h.order.dto.SendChatMessageRequest;
import com.nhalo24h.order.dto.SubmitQuotationRequest;
import com.nhalo24h.order.dto.SubmitSurveyQuoteRequest;
import com.nhalo24h.order.repository.OrderAuditLogRepository;
import com.nhalo24h.order.repository.OrderImageRepository;
import com.nhalo24h.order.repository.OrderQuoteItemRepository;
import com.nhalo24h.order.repository.OrderQuoteVersionRepository;
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
import org.junit.jupiter.api.AfterEach;
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
    private OrderQuoteVersionRepository orderQuoteVersionRepository;

    @Autowired
    private OrderQuoteItemRepository orderQuoteItemRepository;

    @Autowired
    private OrderAuditLogRepository orderAuditLogRepository;

    @Autowired
    private InvalidatedTokenRepository invalidatedTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User customer;
    private User providerUser1;
    private User providerUser2;
    private User adminUser;
    private ProviderProfile providerProfile1;
    private ProviderProfile providerProfile2;
    private ServiceCategory category;
    private CustomerAddress customerAddress;
    private String customerToken;
    private String provider1Token;
    private String provider2Token;
    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        cleanDatabase();

        // 1. Khởi tạo Khách hàng
        customer = new User("Nguyễn Văn Khách", "customer@test.com", "0901111222", UserRole.CUSTOMER);
        customer.setPasswordHash(passwordEncoder.encode("Password@123"));
        customer.setStatus(UserStatus.ACTIVE);
        customer.setEmailVerified(true);
        customer = userRepository.save(customer);

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

        // 4. Khởi tạo Admin
        adminUser = new User("Quản Trị Viên", "admin@test.com", "0909999999", UserRole.ADMIN);
        adminUser.setPasswordHash(passwordEncoder.encode("Password@123"));
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUser.setEmailVerified(true);
        adminUser = userRepository.save(adminUser);

        // 5. Khởi tạo Danh mục dịch vụ (Mặc định hoa hồng 10%)
        category = new ServiceCategory("Sửa chữa điện nước", "sua-chua-dien-nuoc", "Mô tả danh mục", "https://example.com/icon.svg", CategoryStatus.ACTIVE, 1);
        category = serviceCategoryRepository.save(category);

        // 6. Đăng nhập lấy Token
        customerToken = obtainToken("customer@test.com", "Password@123");
        provider1Token = obtainToken("provider1@test.com", "Password@123");
        provider2Token = obtainToken("provider2@test.com", "Password@123");
        adminToken = obtainToken("admin@test.com", "Password@123");
    }

    @AfterEach
    void tearDown() {
        cleanDatabase();
    }

    private void cleanDatabase() {
        orderAuditLogRepository.deleteAll();
        orderQuoteItemRepository.deleteAll();
        orderQuoteVersionRepository.deleteAll();
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
    @DisplayName("Kiểm thử Luồng 1 (Gói giá cố định cam kết + Thanh toán Online): Tạo đơn -> Báo giá cố định -> Chat -> Chọn thợ -> Báo hoàn thành -> Thanh toán Online")
    void testCommittedFixedWorkflowWithOnlinePayment() throws Exception {
        CreateOrderRequest createRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Dọn vệ sinh phòng trọ 20m2",
            "Phòng trống, lau sàn và vệ sinh nhà tắm theo gói chuẩn",
            Instant.now().plusSeconds(7200),
            "Nguyễn Văn Khách",
            "0901111222",
            List.of("https://res.cloudinary.com/nhalo/img1.jpg", "https://res.cloudinary.com/nhalo/img2.jpg"),
            List.of(providerProfile1.getId())
        );

        MvcResult createResult = mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("PENDING_PROVIDER"))
            .andExpect(jsonPath("$.paymentStatus").value("UNPAID"))
            .andReturn();

        JsonNode orderNode = objectMapper.readTree(createResult.getResponse().getContentAsString());
        UUID orderId = UUID.fromString(orderNode.get("id").asText());
        UUID requestId1 = UUID.fromString(orderNode.get("quotations").get(0).get("requestId").asText());

        // Gửi thêm yêu cầu cho thợ 2
        DispatchOrderRequestsDto dispatchDto = new DispatchOrderRequestsDto(List.of(providerProfile2.getId()));
        mockMvc.perform(post("/api/v1/customer/orders/" + orderId + "/dispatch")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dispatchDto)))
            .andExpect(status().isOk());

        MvcResult p2Requests = mockMvc.perform(get("/api/v1/provider/requests")
                .header("Authorization", "Bearer " + provider2Token))
            .andExpect(status().isOk())
            .andReturn();
        UUID requestId2 = UUID.fromString(objectMapper.readTree(p2Requests.getResponse().getContentAsString()).get("content").get(0).get("requestId").asText());

        // Thợ 1 gửi báo giá cố định cam kết (COMMITTED_FIXED): Tiền công 250.000đ
        SubmitQuotationRequest quote1 = new SubmitQuotationRequest(
            250000L,
            "Nhận dọn trọn gói đúng mô tả 20m2",
            Instant.now().plusSeconds(3600)
        );
        mockMvc.perform(post("/api/v1/provider/requests/" + requestId1 + "/quote")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(quote1)))
            .andExpect(status().isOk());

        // Chat trao đổi
        SendChatMessageRequest chat1 = new SendChatMessageRequest("Chào anh, em mang đầy đủ dụng cụ qua nhé.");
        mockMvc.perform(post("/api/v1/orders/requests/" + requestId1 + "/messages")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(chat1)))
            .andExpect(status().isCreated());

        // Khách chọn thợ 1 -> Với gói COMMITTED_FIXED, đơn vào thẳng IN_PROGRESS
        mockMvc.perform(post("/api/v1/customer/orders/requests/" + requestId1 + "/accept")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk());

        Order updatedOrder = orderRepository.findById(orderId).orElseThrow();
        assertThat(updatedOrder.getStatus()).isEqualTo(OrderStatus.IN_PROGRESS);
        assertThat(updatedOrder.getFinalPrice()).isEqualTo(250000L);
        assertThat(updatedOrder.getFinalLaborFee()).isEqualTo(250000L);
        assertThat(updatedOrder.getCommissionAmount()).isEqualTo(25000L); // 10% của 250.000đ

        OrderRequest req2 = orderRequestRepository.findById(requestId2).orElseThrow();
        assertThat(req2.getStatus()).isEqualTo(OrderRequestStatus.CANCELED);

        // Thợ 1 báo hoàn thành công việc -> Chuyển sang AWAITING_COMPLETION_CONFIRMATION
        CompleteOrderRequest completeReq = new CompleteOrderRequest("Đã dọn sạch sẽ toàn bộ phòng và nhà tắm", List.of("https://res.cloudinary.com/nhalo/done1.jpg"));
        mockMvc.perform(post("/api/v1/provider/orders/" + orderId + "/complete")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(completeReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderStatus").value("AWAITING_COMPLETION_CONFIRMATION"));

        // Khách khởi tạo thanh toán Online
        MvcResult initPayRes = mockMvc.perform(post("/api/v1/customer/orders/" + orderId + "/pay-online/init")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.paymentStatus").value("PAYMENT_PENDING"))
            .andExpect(jsonPath("$.amountToPay").value(250000))
            .andReturn();

        String txnRef = objectMapper.readTree(initPayRes.getResponse().getContentAsString()).get("transactionRef").asText();

        // Xác nhận thanh toán Online thành công -> Đơn chuyển sang COMPLETED & PAID_ONLINE
        ConfirmOnlinePaymentRequest confirmOnline = new ConfirmOnlinePaymentRequest(txnRef, true);
        mockMvc.perform(post("/api/v1/customer/orders/" + orderId + "/pay-online/confirm")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(confirmOnline)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("COMPLETED"))
            .andExpect(jsonPath("$.paymentStatus").value("PAID_ONLINE"))
            .andExpect(jsonPath("$.commissionAmount").value(25000));
    }

    @Test
    @DisplayName("Kiểm thử Luồng 2 (Sửa chữa chuẩn có Khảo sát + Vật tư + Phát sinh + Tiền mặt 2 bước xác nhận + Tính hoa hồng chuẩn trên tiền công)")
    void testSurveyRepairWorkflowWithMaterialsAndCashConfirmation() throws Exception {
        // 1. Tạo đơn sửa chữa máy lạnh
        CreateOrderRequest createRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Máy lạnh mở không lạnh, kêu to ở cục nóng",
            "Máy lạnh Inverter 1.5HP chạy nhưng chỉ ra gió, cần thợ kiểm tra",
            Instant.now().plusSeconds(7200),
            "Nguyễn Văn Khách",
            "0901111222",
            List.of("https://res.cloudinary.com/nhalo/ac1.jpg"),
            List.of(providerProfile1.getId()),
            "URGENT",
            null
        );

        MvcResult createRes = mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andReturn();

        JsonNode orderJson = objectMapper.readTree(createRes.getResponse().getContentAsString());
        UUID orderId = UUID.fromString(orderJson.get("id").asText());
        UUID requestId1 = UUID.fromString(orderJson.get("quotations").get(0).get("requestId").asText());

        // 2. Thợ 1 gửi báo giá sơ bộ (SURVEY_REQUIRED):
        // Phí khảo sát: 50.000đ, Phí di chuyển: 30.000đ (Miễn cả 2 nếu đồng ý sửa)
        // Tiền công dự kiến: 200.000đ, Vật tư dự kiến: 100.000đ
        SubmitQuotationRequest initialQuote = new SubmitQuotationRequest(
            300000L,
            "Kiểm tra bo mạch và tụ đề cục nóng. Miễn phí khảo sát & di chuyển nếu anh đồng ý sửa.",
            Instant.now().plusSeconds(3600),
            QuoteMode.SURVEY_REQUIRED,
            50000L,
            30000L,
            true,
            true,
            200000L,
            100000L,
            "Miễn 100% phí khảo sát (50k) và di chuyển (30k) khi đồng ý sửa chữa.",
            List.of(new QuoteItemDto(null, "Tụ đề dự kiến", "Cái", 1, 100000L, 100000L, "Dự kiến"))
        );

        mockMvc.perform(post("/api/v1/provider/requests/" + requestId1 + "/quote")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(initialQuote)))
            .andExpect(status().isOk());

        // 3. Khách chọn thợ 1 và đồng ý điều kiện khảo sát -> Đơn chuyển sang AWAITING_SURVEY
        mockMvc.perform(post("/api/v1/customer/orders/requests/" + requestId1 + "/accept")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk());

        Order afterAccept = orderRepository.findById(orderId).orElseThrow();
        assertThat(afterAccept.getStatus()).isEqualTo(OrderStatus.AWAITING_SURVEY);
        assertThat(afterAccept.getAgreedSurveyFee()).isEqualTo(50000L);
        assertThat(afterAccept.getAgreedTravelFee()).isEqualTo(30000L);

        // 4. Thợ 1 đến khảo sát thực tế và gửi Báo giá cuối:
        // Tiền công thực tế: 250.000đ, Vật tư thực tế: 180.000đ (Tụ đề 120k + Bổ sung gas 60k)
        SubmitSurveyQuoteRequest surveyQuote = new SubmitSurveyQuoteRequest(
            250000L,
            "Phát hiện hỏng tụ đề 35uF và thiếu gas nhẹ đầu tán. Cần thay tụ và nạp bổ sung gas.",
            List.of(
                new QuoteItemDto(null, "Tụ đề máy lạnh 35uF", "Cái", 1, 120000L, 120000L, "Bảo hành 6 tháng"),
                new QuoteItemDto(null, "Nạp bổ sung gas R32", "Lần", 1, 60000L, 60000L, "Đủ áp suất tiêu chuẩn")
            ),
            List.of("https://res.cloudinary.com/nhalo/survey_evidence.jpg")
        );

        mockMvc.perform(post("/api/v1/provider/orders/" + orderId + "/survey-quote")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(surveyQuote)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderStatus").value("AWAITING_CUSTOMER_APPROVAL"));

        // 5. Khách đồng ý Báo giá cuối -> Đơn chuyển sang IN_PROGRESS
        // Kiểm tra đúng ví dụ trong tài liệu:
        // Phí khảo sát áp dụng = 0đ, Phí di chuyển áp dụng = 0đ, Tiền công = 250.000đ, Vật tư = 180.000đ
        // Tổng khách trả = 430.000đ, Hoa hồng (10% trên tiền công 250.000đ) = 25.000đ!
        mockMvc.perform(post("/api/v1/customer/orders/" + orderId + "/approve-quote")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
            .andExpect(jsonPath("$.appliedSurveyFee").value(0))
            .andExpect(jsonPath("$.appliedTravelFee").value(0))
            .andExpect(jsonPath("$.finalLaborFee").value(250000))
            .andExpect(jsonPath("$.finalMaterialsFee").value(180000))
            .andExpect(jsonPath("$.finalPrice").value(430000))
            .andExpect(jsonPath("$.commissionAmount").value(25000));

        // 6. Trong khi sửa, phát sinh thêm 1 dây ống thoát nước 30.000đ -> Thợ gửi yêu cầu điều chỉnh
        SubmitSurveyQuoteRequest changeReq = new SubmitSurveyQuoteRequest(
            250000L,
            "Ống thoát nước thải bị mục gãy, khách đồng ý thay thêm 2m ống mềm",
            List.of(
                new QuoteItemDto(null, "Tụ đề máy lạnh 35uF", "Cái", 1, 120000L, 120000L, "Bảo hành 6 tháng"),
                new QuoteItemDto(null, "Nạp bổ sung gas R32", "Lần", 1, 60000L, 60000L, "Đủ áp suất tiêu chuẩn"),
                new QuoteItemDto(null, "Ống thoát nước mềm", "Mét", 2, 15000L, 30000L, "Phát sinh thêm")
            ),
            null
        );

        mockMvc.perform(post("/api/v1/provider/orders/" + orderId + "/change-request")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(changeReq)))
            .andExpect(status().isOk());

        // Trước khi khách duyệt phát sinh, tổng hóa đơn vẫn giữ nguyên 430.000đ (không tự động cộng phát sinh!)
        Order beforeApproveChange = orderRepository.findById(orderId).orElseThrow();
        assertThat(beforeApproveChange.getFinalPrice()).isEqualTo(430000L);

        // Khách bấm duyệt khoản phát sinh -> Tổng vật tư = 210.000đ, Tổng hóa đơn = 460.000đ, Hoa hồng vẫn = 25.000đ (chỉ tính trên tiền công!)
        mockMvc.perform(post("/api/v1/customer/orders/" + orderId + "/approve-quote")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.finalLaborFee").value(250000))
            .andExpect(jsonPath("$.finalMaterialsFee").value(210000))
            .andExpect(jsonPath("$.finalPrice").value(460000))
            .andExpect(jsonPath("$.commissionAmount").value(25000));

        // 7. Thợ báo hoàn thành công việc
        CompleteOrderRequest completeReq = new CompleteOrderRequest(
            "Máy lạnh đã hoạt động êm và lạnh sâu 18 độ.",
            List.of("https://res.cloudinary.com/nhalo/ac_done.jpg")
        );
        mockMvc.perform(post("/api/v1/provider/orders/" + orderId + "/complete")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(completeReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderStatus").value("AWAITING_COMPLETION_CONFIRMATION"))
            .andExpect(jsonPath("$.paymentStatus").value("UNPAID"));

        // 8. Khách khai báo trả tiền mặt 460.000đ (Bước 1 tiền mặt)
        DeclareCashPaymentRequest declareCash = new DeclareCashPaymentRequest(460000L, "Đã gửi đủ tiền mặt cho anh thợ");
        mockMvc.perform(post("/api/v1/customer/orders/" + orderId + "/pay-cash")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(declareCash)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("AWAITING_COMPLETION_CONFIRMATION"))
            .andExpect(jsonPath("$.paymentStatus").value("CASH_PENDING_CONFIRMATION"))
            .andExpect(jsonPath("$.customerDeclaredAmount").value(460000));

        // 9. Thợ xác nhận đã nhận đúng 460.000đ (Bước 2 tiền mặt) -> Đơn chuyển sang COMPLETED & CASH_CONFIRMED
        ConfirmCashPaymentRequest confirmCash = new ConfirmCashPaymentRequest(true, 460000L, null);
        mockMvc.perform(post("/api/v1/provider/orders/" + orderId + "/confirm-cash")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(confirmCash)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderStatus").value("COMPLETED"))
            .andExpect(jsonPath("$.paymentStatus").value("CASH_CONFIRMED"))
            .andExpect(jsonPath("$.commissionAmount").value(25000));
    }

    @Test
    @DisplayName("Kiểm thử Luồng 3: Khách từ chối sửa sau khảo sát (DECLINED_AFTER_SURVEY) -> Chỉ tính Phí khảo sát + Phí di chuyển, Hoa hồng = 0đ")
    void testDeclineAfterSurveyChargesOnlySurveyAndTravelFees() throws Exception {
        CreateOrderRequest createRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Sửa máy giặt không vắt",
            "Máy giặt báo lỗi E3",
            Instant.now().plusSeconds(7200),
            "Nguyễn Văn Khách",
            "0901111222",
            null,
            List.of(providerProfile1.getId())
        );

        MvcResult createRes = mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andReturn();

        JsonNode orderJson = objectMapper.readTree(createRes.getResponse().getContentAsString());
        UUID orderId = UUID.fromString(orderJson.get("id").asText());
        UUID requestId1 = UUID.fromString(orderJson.get("quotations").get(0).get("requestId").asText());

        // Thợ báo giá sơ bộ: KS 50k, Di chuyển 30k, Công 300k, Vật tư 500k
        SubmitQuotationRequest initialQuote = new SubmitQuotationRequest(
            800000L,
            "Kiểm tra hộp số máy giặt",
            Instant.now().plusSeconds(3600),
            QuoteMode.SURVEY_REQUIRED,
            50000L,
            30000L,
            true,
            true,
            300000L,
            500000L,
            "Nếu không sửa sau khi kiểm tra, khách vui lòng thanh toán phí khảo sát 50k và di chuyển 30k.",
            null
        );
        mockMvc.perform(post("/api/v1/provider/requests/" + requestId1 + "/quote")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(initialQuote)))
            .andExpect(status().isOk());

        // Khách chọn thợ -> AWAITING_SURVEY
        mockMvc.perform(post("/api/v1/customer/orders/requests/" + requestId1 + "/accept")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk());

        // Thợ gửi báo giá cuối sau khảo sát: Cần thay chảng ba + hộp số tổng 1.500.000đ
        SubmitSurveyQuoteRequest surveyQuote = new SubmitSurveyQuoteRequest(
            400000L,
            "Gãy chảng ba lồng giặt và hỏng hộp số",
            List.of(new QuoteItemDto(null, "Chảng ba + Hộp số chính hãng", "Bộ", 1, 1100000L, 1100000L, null)),
            null
        );
        mockMvc.perform(post("/api/v1/provider/orders/" + orderId + "/survey-quote")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(surveyQuote)))
            .andExpect(status().isOk());

        // Khách quyết định TỪ CHỐI SỬA vì muốn mua máy mới -> Đơn sang DECLINED_AFTER_SURVEY
        // Hóa đơn chỉ tính 50.000đ (KS) + 30.000đ (Di chuyển) = 80.000đ. Tiền công = 0, Vật tư = 0, Hoa hồng = 0!
        CancelOrderDto declineDto = new CancelOrderDto("Chi phí thay linh kiện cao nên gia đình quyết định mua máy mới");
        mockMvc.perform(post("/api/v1/customer/orders/" + orderId + "/decline-after-survey")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(declineDto)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("DECLINED_AFTER_SURVEY"))
            .andExpect(jsonPath("$.appliedSurveyFee").value(50000))
            .andExpect(jsonPath("$.appliedTravelFee").value(30000))
            .andExpect(jsonPath("$.finalLaborFee").value(0))
            .andExpect(jsonPath("$.finalMaterialsFee").value(0))
            .andExpect(jsonPath("$.finalPrice").value(80000))
            .andExpect(jsonPath("$.commissionAmount").value(0));
    }

    @Test
    @DisplayName("Kiểm thử Luồng 4: 4 lớp bảo vệ chống khai lệch tiền mặt (5 triệu vs 430k) & Xử lý tranh chấp PAYMENT_DISPUTED bởi Admin")
    void testCashPaymentDisputeProtectionAndAdminResolution() throws Exception {
        CreateOrderRequest createRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Sửa ổ cắm điện bị chập",
            "Ổ cắm phòng khách bị đánh lửa",
            Instant.now().plusSeconds(7200),
            "Nguyễn Văn Khách",
            "0901111222",
            null,
            List.of(providerProfile1.getId())
        );

        MvcResult createRes = mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andReturn();

        JsonNode orderJson = objectMapper.readTree(createRes.getResponse().getContentAsString());
        UUID orderId = UUID.fromString(orderJson.get("id").asText());
        UUID requestId1 = UUID.fromString(orderJson.get("quotations").get(0).get("requestId").asText());

        // Thợ báo giá trọn gói: Tiền công 250k + Vật tư 180k = 430k
        SubmitQuotationRequest quote = new SubmitQuotationRequest(
            430000L,
            "Thay mặt ổ cắm Panasonic và xử lý dây âm tường",
            Instant.now().plusSeconds(3600),
            QuoteMode.COMMITTED_FIXED,
            0L,
            0L,
            true,
            true,
            250000L,
            180000L,
            null,
            null
        );
        mockMvc.perform(post("/api/v1/provider/requests/" + requestId1 + "/quote")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(quote)))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/customer/orders/requests/" + requestId1 + "/accept")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/provider/orders/" + orderId + "/complete")
                .header("Authorization", "Bearer " + provider1Token))
            .andExpect(status().isOk());

        // Lớp bảo vệ: Khách nhập 5.000.000đ (lệch với hóa đơn 430.000đ) mà không có lý do giải trình -> Bị từ chối HTTP 400!
        DeclareCashPaymentRequest invalidDeclare = new DeclareCashPaymentRequest(5000000L, "");
        mockMvc.perform(post("/api/v1/customer/orders/" + orderId + "/pay-cash")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDeclare)))
            .andExpect(status().isBadRequest());

        // Khách khai báo 50.000đ kèm ghi chú -> Được ghi nhận nhưng tự động gắn cờ bất thường (isFlaggedAbnormal = true)
        DeclareCashPaymentRequest mismatchedDeclare = new DeclareCashPaymentRequest(50000L, "Tôi mới đưa trước 50k tiền lẻ");
        mockMvc.perform(post("/api/v1/customer/orders/" + orderId + "/pay-cash")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mismatchedDeclare)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.isFlaggedAbnormal").value(true))
            .andExpect(jsonPath("$.paymentStatus").value("CASH_PENDING_CONFIRMATION"));

        // Thợ báo KHÔNG KHỚP (Thực tế khách trả đủ 430k hoặc đang tranh chấp) -> Chuyển sang PAYMENT_DISPUTED
        ConfirmCashPaymentRequest disputeConfirm = new ConfirmCashPaymentRequest(false, 430000L, "Khách đã trả đủ 430.000đ nhưng nhập nhầm trên app");
        mockMvc.perform(post("/api/v1/provider/orders/" + orderId + "/confirm-cash")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(disputeConfirm)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.paymentStatus").value("PAYMENT_DISPUTED"));

        // Admin vào đối soát và xử lý tranh chấp -> Chốt tiền công 250k, vật tư 180k, tổng trả 430k, hoa hồng 25k
        ResolveDisputeRequest resolveReq = new ResolveDisputeRequest(
            250000L,
            180000L,
            430000L,
            "Đã gọi điện xác minh 2 bên: Khách gõ thiếu số, thực tế đã thanh toán đủ 430.000đ."
        );
        mockMvc.perform(post("/api/v1/admin/orders/" + orderId + "/resolve-payment")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resolveReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("COMPLETED"))
            .andExpect(jsonPath("$.paymentStatus").value("CASH_CONFIRMED"))
            .andExpect(jsonPath("$.finalPrice").value(430000))
            .andExpect(jsonPath("$.commissionAmount").value(25000));
    }

    @Test
    @DisplayName("Khách hàng tạo đơn với thời gian mong muốn trong quá khứ phải thất bại (HTTP 400)")
    void testCreateOrderWithPastScheduleTimeShouldFail() throws Exception {
        CreateOrderRequest pastRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Bồn rửa chén bị rò rỉ nước",
            "Nước chảy tràn dưới tủ bếp cần xử lý gấp",
            Instant.now().minusSeconds(3600),
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
            "0912345",
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
            "A",
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
            null,
            "",
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

    @Test
    @DisplayName("Admin đối soát tranh chấp tiền mặt nhưng nhập tổng tiền lệch toán học phải bị từ chối (HTTP 400)")
    void testAdminResolveDisputeWithMismatchedAmountShouldFail() throws Exception {
        // Tạo đơn, thợ làm và hoàn thành, thanh toán tiền mặt bị dispute
        CreateOrderRequest createRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Sửa quạt hút mùi kêu to",
            "Quạt kêu to và rung",
            Instant.now().plusSeconds(3600),
            "Khách",
            "0901111222",
            null,
            List.of(providerProfile1.getId())
        );
        MvcResult res = mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andReturn();
        UUID orderId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText());
        UUID reqId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("quotations").get(0).get("requestId").asText());

        SubmitQuotationRequest quote = new SubmitQuotationRequest(200000L, "Nhận làm trọn gói", Instant.now().plusSeconds(1800));
        mockMvc.perform(post("/api/v1/provider/requests/" + reqId + "/quote")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(quote)))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/customer/orders/requests/" + reqId + "/accept")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk());

        CompleteOrderRequest completeReq = new CompleteOrderRequest("Xong việc", null);
        mockMvc.perform(post("/api/v1/provider/orders/" + orderId + "/complete")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(completeReq)))
            .andExpect(status().isOk());

        // Khách khai báo trả tiền mặt nhưng thợ dispute
        DeclareCashPaymentRequest declareCash = new DeclareCashPaymentRequest(200000L, "Trả đủ");
        mockMvc.perform(post("/api/v1/customer/orders/" + orderId + "/pay-cash")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(declareCash)))
            .andExpect(status().isOk());

        ConfirmCashPaymentRequest disputeCash = new ConfirmCashPaymentRequest(false, 150000L, "Mới đưa 150k");
        mockMvc.perform(post("/api/v1/provider/orders/" + orderId + "/confirm-cash")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(disputeCash)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.paymentStatus").value("PAYMENT_DISPUTED"));

        // Admin nhập tiền công 50k, vật tư 0k nhưng nhập tổng 500k -> Bị từ chối HTTP 400!
        ResolveDisputeRequest invalidMath = new ResolveDisputeRequest(50000L, 0L, 500000L, "Nhập thử lệch toán học");
        mockMvc.perform(post("/api/v1/admin/orders/" + orderId + "/resolve-payment")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidMath)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Admin điều chỉnh hóa đơn hòa giải trước thanh toán -> Trạng thái vẫn là AWAITING_COMPLETION_CONFIRMATION & UNPAID để khách tự thanh toán")
    void testAdminAdjustInvoiceBeforePaymentKeepsOrderUnpaidAndAwaitingPayment() throws Exception {
        CreateOrderRequest createRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Vệ sinh bể nước",
            "Bể ngầm 2m3",
            Instant.now().plusSeconds(3600),
            "Khách",
            "0901111222",
            null,
            List.of(providerProfile1.getId())
        );
        MvcResult res = mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andReturn();
        UUID orderId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText());
        UUID reqId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("quotations").get(0).get("requestId").asText());

        SubmitQuotationRequest quote = new SubmitQuotationRequest(500000L, "Vệ sinh bể ngầm", Instant.now().plusSeconds(1800));
        mockMvc.perform(post("/api/v1/provider/requests/" + reqId + "/quote")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(quote)))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/customer/orders/requests/" + reqId + "/accept")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk());

        CompleteOrderRequest completeReq = new CompleteOrderRequest("Đã vệ sinh xong", null);
        mockMvc.perform(post("/api/v1/provider/orders/" + orderId + "/complete")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(completeReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderStatus").value("AWAITING_COMPLETION_CONFIRMATION"));

        // Khách khiếu nại làm chưa kỹ, Admin hòa giải giảm tiền công từ 500k xuống 350k
        AdjustInvoiceRequest adjustReq = new AdjustInvoiceRequest(350000L, 0L, "Thợ đồng ý giảm 150k tiền công do bể nhỏ hơn dự kiến");
        mockMvc.perform(post("/api/v1/admin/orders/" + orderId + "/adjust-invoice")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adjustReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("AWAITING_COMPLETION_CONFIRMATION"))
            .andExpect(jsonPath("$.paymentStatus").value("UNPAID"))
            .andExpect(jsonPath("$.finalPrice").value(350000))
            .andExpect(jsonPath("$.finalLaborFee").value(350000))
            .andExpect(jsonPath("$.commissionAmount").value(35000));

        // Khách hàng tự mở app lên và vẫn bấm thanh toán bình thường!
        DeclareCashPaymentRequest declareCash = new DeclareCashPaymentRequest(350000L, "Thanh toán theo giá hòa giải 350k");
        mockMvc.perform(post("/api/v1/customer/orders/" + orderId + "/pay-cash")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(declareCash)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.paymentStatus").value("CASH_PENDING_CONFIRMATION"))
            .andExpect(jsonPath("$.customerDeclaredAmount").value(350000));
    }

    @Test
    @DisplayName("Admin gỡ bỏ cờ cảnh báo bất thường sau khi đã xác minh giải trình của thợ")
    void testAdminDismissAbnormalFlag() throws Exception {
        CreateOrderRequest createRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Kiểm tra aptomat",
            "Nhảy áp liên tục",
            Instant.now().plusSeconds(3600),
            "Khách",
            "0901111222",
            null,
            List.of(providerProfile1.getId())
        );
        MvcResult res = mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andReturn();
        UUID orderId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText());

        Order order = orderRepository.findById(orderId).orElseThrow();
        order.flagAbnormal("Tiền công giảm đột biến cần xác minh");
        orderRepository.save(order);

        DismissAbnormalFlagRequest dismissReq = new DismissAbnormalFlagRequest("Đã gọi kiểm tra thợ, do đứt dây nhẹ nên thợ giảm tiền công.");
        mockMvc.perform(post("/api/v1/admin/orders/" + orderId + "/dismiss-abnormal-flag")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dismissReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.isFlaggedAbnormal").value(false));
    }

    @Test
    @DisplayName("Phương án A: Khách tự do hủy đơn khi chưa chốt thợ (PENDING_PROVIDER)")
    void testCustomerCancelOrderPendingProviderAllowed() throws Exception {
        CreateOrderRequest createRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Thay bóng đèn phòng khách",
            "Bóng tuýp LED bị cháy",
            Instant.now().plusSeconds(3600),
            "Khách A",
            "0901111222",
            null,
            List.of(providerProfile1.getId())
        );
        MvcResult res = mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andReturn();
        UUID orderId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText());

        CancelOrderDto cancelDto = new CancelOrderDto("Tự thay được bóng mới");
        mockMvc.perform(post("/api/v1/customer/orders/" + orderId + "/cancel")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cancelDto)))
            .andExpect(status().isOk());

        Order order = orderRepository.findById(orderId).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(OrderStatus.CANCELED, order.getStatus());
    }

    @Test
    @DisplayName("Phương án A: Chặn khách hủy đơn 1 chạm khi thợ đang chuẩn bị đến (AWAITING_SURVEY)")
    void testCustomerCancelOrderAwaitingSurveyBlocked() throws Exception {
        // 1. Tạo đơn & gửi thợ 1
        CreateOrderRequest createRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Kiểm tra máy lạnh chảy nước",
            "Nước nhỏ giọt trong phòng ngủ",
            Instant.now().plusSeconds(3600),
            "Khách B",
            "0901111222",
            null,
            List.of(providerProfile1.getId())
        );
        MvcResult res = mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andReturn();
        UUID orderId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText());

        OrderRequest req1 = orderRequestRepository.findByOrderIdAndProviderId(orderId, providerProfile1.getId()).orElseThrow();

        // 2. Thợ 1 gửi báo giá ban đầu: Chế độ khảo sát
        SubmitQuotationRequest quoteReq = new SubmitQuotationRequest(
            300000L,
            "Có mặt sau 20 phút",
            Instant.now().plusSeconds(3600),
            QuoteMode.SURVEY_REQUIRED,
            50000L,
            20000L,
            true,
            true,
            200000L,
            100000L,
            "Khảo sát thực tế",
            List.of()
        );
        mockMvc.perform(post("/api/v1/provider/requests/" + req1.getId() + "/quote")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(quoteReq)))
            .andExpect(status().isOk());

        // 3. Khách chấp nhận báo giá -> Chuyển sang AWAITING_SURVEY
        mockMvc.perform(post("/api/v1/customer/orders/requests/" + req1.getId() + "/accept")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk());

        Order order = orderRepository.findById(orderId).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(OrderStatus.AWAITING_SURVEY, order.getStatus());

        // 4. Khách cố tình gọi API hủy đơn -> BỊ CHẶN 409 CONFLICT
        CancelOrderDto cancelDto = new CancelOrderDto("Đổi ý không muốn sửa nữa");
        mockMvc.perform(post("/api/v1/customer/orders/" + orderId + "/cancel")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cancelDto)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Thợ đang chuẩn bị đồ nghề và trên đường đến nhà bạn")));
    }

    @Test
    @DisplayName("Phương án A: Khách gửi thông báo yêu cầu hủy tới thợ & Thợ xác nhận hủy đơn")
    void testCustomerNotifyCancelAndProviderCancelOrder() throws Exception {
        // 1. Tạo đơn & chốt thợ sang AWAITING_SURVEY
        CreateOrderRequest createRequest = new CreateOrderRequest(
            category.getId(),
            customerAddress.getId(),
            "Bảo dưỡng bình nóng lạnh",
            "Bình bật không nóng",
            Instant.now().plusSeconds(3600),
            "Khách C",
            "0901111222",
            null,
            List.of(providerProfile1.getId())
        );
        MvcResult res = mockMvc.perform(post("/api/v1/customer/orders")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andExpect(status().isCreated())
            .andReturn();
        UUID orderId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText());

        OrderRequest req1 = orderRequestRepository.findByOrderIdAndProviderId(orderId, providerProfile1.getId()).orElseThrow();
        SubmitQuotationRequest quoteReq = new SubmitQuotationRequest(
            150000L,
            "Đang chuẩn bị dụng cụ",
            Instant.now().plusSeconds(3600),
            QuoteMode.SURVEY_REQUIRED,
            50000L,
            30000L,
            true,
            true,
            150000L,
            0L,
            "Kiểm tra thanh nhiệt",
            List.of()
        );
        mockMvc.perform(post("/api/v1/provider/requests/" + req1.getId() + "/quote")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(quoteReq)))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/customer/orders/requests/" + req1.getId() + "/accept")
                .header("Authorization", "Bearer " + customerToken))
            .andExpect(status().isOk());

        // 2. Khách gửi thông báo yêu cầu hủy / dời lịch tới thợ
        CancelOrderDto notifyDto = new CancelOrderDto("Nhà có việc đột xuất phải ra ngoài gấp");
        mockMvc.perform(post("/api/v1/customer/orders/" + orderId + "/notify-cancel")
                .header("Authorization", "Bearer " + customerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(notifyDto)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("AWAITING_SURVEY"));

        // 3. Thợ nhận thông báo hoặc khách gọi thỏa thuận, Thợ xác nhận hủy đơn
        CancelOrderDto providerCancelDto = new CancelOrderDto("Đã trao đổi với khách, thống nhất hủy đơn để hôm khác làm");
        mockMvc.perform(post("/api/v1/provider/orders/" + orderId + "/cancel")
                .header("Authorization", "Bearer " + provider1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(providerCancelDto)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderStatus").value("CANCELED"));

        Order order = orderRepository.findById(orderId).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(OrderStatus.CANCELED, order.getStatus());
        org.junit.jupiter.api.Assertions.assertTrue(order.getCancelReason().contains("Thợ xác nhận hủy"));
    }
}
