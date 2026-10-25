package com.nhalo24h.wallet;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhalo24h.auth.dto.LoginRequest;
import com.nhalo24h.auth.repository.InvalidatedTokenRepository;
import com.nhalo24h.category.domain.CategoryStatus;
import com.nhalo24h.category.domain.ServiceCategory;
import com.nhalo24h.category.repository.ServiceCategoryRepository;
import com.nhalo24h.order.domain.Order;
import com.nhalo24h.order.domain.OrderStatus;
import com.nhalo24h.order.domain.PaymentMethod;
import com.nhalo24h.order.domain.PaymentStatus;
import com.nhalo24h.order.domain.QuoteMode;
import com.nhalo24h.order.dto.ConfirmOnlinePaymentRequest;
import com.nhalo24h.order.repository.OrderAuditLogRepository;
import com.nhalo24h.order.repository.OrderQuoteItemRepository;
import com.nhalo24h.order.repository.OrderQuoteVersionRepository;
import com.nhalo24h.order.repository.OrderRepository;
import com.nhalo24h.order.repository.OrderRequestRepository;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.provider.repository.ProviderProfileRepository;
import com.nhalo24h.user.domain.CustomerAddress;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.repository.CustomerAddressRepository;
import com.nhalo24h.user.repository.UserRepository;
import com.nhalo24h.wallet.domain.PayoutStatus;
import com.nhalo24h.wallet.domain.ProviderWallet;
import com.nhalo24h.wallet.domain.WalletStatus;
import com.nhalo24h.wallet.dto.AdminDisputePenaltyRequestDto;
import com.nhalo24h.wallet.dto.AdminReviewPayoutRequestDto;
import com.nhalo24h.wallet.dto.AdminTopupDepositRequestDto;
import com.nhalo24h.wallet.dto.CreatePayoutRequestDto;
import com.nhalo24h.wallet.dto.RequestDepositRefundDto;
import com.nhalo24h.wallet.repository.PayoutRequestRepository;
import com.nhalo24h.wallet.repository.PlatformFinancialRecordRepository;
import com.nhalo24h.wallet.repository.ProviderWalletRepository;
import com.nhalo24h.wallet.repository.WalletTransactionRepository;
import com.nhalo24h.wallet.service.WalletService;
import java.math.BigDecimal;
import java.time.Instant;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class WalletFinancialIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private PasswordEncoder passwordEncoder;

    @Autowired private UserRepository userRepository;
    @Autowired private ProviderProfileRepository providerProfileRepository;
    @Autowired private CustomerAddressRepository customerAddressRepository;
    @Autowired private ServiceCategoryRepository serviceCategoryRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderRequestRepository orderRequestRepository;
    @Autowired private OrderQuoteVersionRepository orderQuoteVersionRepository;
    @Autowired private OrderQuoteItemRepository orderQuoteItemRepository;
    @Autowired private OrderAuditLogRepository orderAuditLogRepository;
    @Autowired private InvalidatedTokenRepository invalidatedTokenRepository;

    @Autowired private ProviderWalletRepository walletRepository;
    @Autowired private WalletTransactionRepository transactionRepository;
    @Autowired private PayoutRequestRepository payoutRequestRepository;
    @Autowired private PlatformFinancialRecordRepository financialRecordRepository;
    @Autowired private WalletService walletService;

    private User adminUser;
    private User providerUser;
    private User customerUser;
    private ProviderProfile providerProfile;
    private ServiceCategory testCategory;
    private CustomerAddress customerAddress;

    private String adminToken;
    private String providerToken;
    private String customerToken;

    @BeforeEach
    void setUp() throws Exception {
        cleanupDb();

        adminUser = new User("Quản Trị Viên Tài Chính", "admin.wallet@nhalo24h.vn", "0901234500", UserRole.ADMIN);
        adminUser.setPasswordHash(passwordEncoder.encode("Password@123"));
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUser.setEmailVerified(true);
        adminUser = userRepository.save(adminUser);

        providerUser = new User("Thợ Nguyễn Văn Tài", "provider.wallet@nhalo24h.vn", "0901234501", UserRole.PROVIDER);
        providerUser.setPasswordHash(passwordEncoder.encode("Password@123"));
        providerUser.setStatus(UserStatus.ACTIVE);
        providerUser.setEmailVerified(true);
        providerUser = userRepository.save(providerUser);

        providerProfile = new ProviderProfile(providerUser);
        providerProfile.setHeadline("Thợ điện nước lành nghề");
        providerProfile.setExperienceYears(6);
        providerProfile.setPricePerHour(150000L);
        providerProfile.setIsAvailable(true);
        providerProfile = providerProfileRepository.save(providerProfile);

        customerUser = new User("Khách Hàng Trần Thị Mai", "customer.wallet@nhalo24h.vn", "0901234502", UserRole.CUSTOMER);
        customerUser.setPasswordHash(passwordEncoder.encode("Password@123"));
        customerUser.setStatus(UserStatus.ACTIVE);
        customerUser.setEmailVerified(true);
        customerUser = userRepository.save(customerUser);

        customerAddress = customerAddressRepository.save(new CustomerAddress(
                customerUser,
                "Nhà riêng",
                "123 Nguyễn Thị Minh Khai, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
                true
        ));

        testCategory = new ServiceCategory();
        testCategory.setName("Sửa Điện Nước");
        testCategory.setSlug("sua-dien-nuoc-" + UUID.randomUUID());
        testCategory.setStatus(CategoryStatus.ACTIVE);
        testCategory.setCommissionRate(BigDecimal.valueOf(10.0));
        testCategory = serviceCategoryRepository.save(testCategory);

        adminToken = obtainAccessToken("admin.wallet@nhalo24h.vn", "Password@123");
        providerToken = obtainAccessToken("provider.wallet@nhalo24h.vn", "Password@123");
        customerToken = obtainAccessToken("customer.wallet@nhalo24h.vn", "Password@123");
    }

    @AfterEach
    void tearDown() {
        cleanupDb();
    }

    private void cleanupDb() {
        payoutRequestRepository.deleteAll();
        transactionRepository.deleteAll();
        financialRecordRepository.deleteAll();
        walletRepository.deleteAll();

        orderAuditLogRepository.deleteAll();
        orderQuoteItemRepository.deleteAll();
        orderQuoteVersionRepository.deleteAll();
        orderRequestRepository.deleteAll();
        orderRepository.deleteAll();

        customerAddressRepository.deleteAll();
        providerProfileRepository.deleteAll();
        invalidatedTokenRepository.deleteAll();
        userRepository.deleteAll();
        serviceCategoryRepository.deleteAll();
    }

    private String obtainAccessToken(String email, String password) throws Exception {
        LoginRequest request = new LoginRequest(email, password);
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.get("accessToken").asText();
    }

    @Test
    @DisplayName("Thợ xem ví lần đầu: Tự động khởi tạo ví và cấp quỹ ký quỹ 2.000.000đ")
    void shouldAutoInitializeWalletWithDeposit() throws Exception {
        mockMvc.perform(get("/api/v1/provider/wallet")
                        .header("Authorization", "Bearer " + providerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableBalance").value(0))
                .andExpect(jsonPath("$.depositBalance").value(2000000))
                .andExpect(jsonPath("$.depositTarget").value(2000000))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.eligibleToAcceptOrders").value(true));

        // Kiểm tra lịch sử giao dịch ban đầu
        mockMvc.perform(get("/api/v1/provider/wallet/transactions")
                        .header("Authorization", "Bearer " + providerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].type").value("ADMIN_INITIAL_DEPOSIT"))
                .andExpect(jsonPath("$.content[0].amount").value(2000000));
    }

    @Test
    @DisplayName("Khách thanh toán Online: Tự động phân bổ 10% công về Sàn, 90% công + 100% vật tư về ví Thợ")
    void shouldDistributeRevenueCorrectlyOnOnlinePayment() throws Exception {
        // Tạo đơn hàng chờ thanh toán
        Order order = new Order();
        order.setOrderCode("DH-TEST-FIN");
        order.setCustomer(customerUser);
        order.setAssignedProvider(providerProfile);
        order.setCategory(testCategory);
        order.setAddress(customerAddress);
        order.setAddressSnapshot(customerAddress.getFullAddress());
        order.setContactName(customerUser.getFullName());
        order.setContactPhone(customerUser.getPhone());
        order.setDescription("Mô tả chập điện âm tường");
        order.setTitle("Sửa chập điện âm tường");
        order.setExpectedScheduleTime(Instant.now().plusSeconds(86400));
        order.setStatus(OrderStatus.AWAITING_COMPLETION_CONFIRMATION);
        order.setWorkflowMode(QuoteMode.SURVEY_REQUIRED);
        order.setFinalLaborFee(200000L); // Công: 200.000đ -> Sàn 10% = 20.000đ, Thợ 90% = 180.000đ
        order.setFinalMaterialsFee(300000L); // Vật tư: 300.000đ -> Thợ nhận đủ 300.000đ
        order.setFinalPrice(500000L); // Tổng hóa đơn: 500.000đ
        order.setCommissionRateSnapshot(BigDecimal.valueOf(10.0));
        order.setPaymentStatus(PaymentStatus.PAYMENT_PENDING);
        order.setPaymentMethod(PaymentMethod.ONLINE);
        order.setOnlineTransactionRef("REF-TX-999");
        order = orderRepository.save(order);

        // Khách xác nhận thanh toán Online thành công
        ConfirmOnlinePaymentRequest confirmReq = new ConfirmOnlinePaymentRequest("REF-TX-999", true);
        mockMvc.perform(post("/api/v1/customer/orders/{id}/pay-online/confirm", order.getId())
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(confirmReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.paymentStatus").value("PAID_ONLINE"));

        // Kiểm tra ví thợ: Khả dụng phải tăng +480.000đ (180k công + 300k vật tư)
        mockMvc.perform(get("/api/v1/provider/wallet")
                        .header("Authorization", "Bearer " + providerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableBalance").value(480000))
                .andExpect(jsonPath("$.depositBalance").value(2000000))
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        // Kiểm tra Dashboard Quản trị tài chính Admin:
        // GMV = 500k, Hoa hồng sàn = 20k, Thu nhập thợ = 480k, Quỹ cọc = 2tr
        mockMvc.perform(get("/api/v1/admin/financial/summary")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGmv").value(500000))
                .andExpect(jsonPath("$.totalPlatformRevenue").value(20000))
                .andExpect(jsonPath("$.totalProviderEarnings").value(480000))
                .andExpect(jsonPath("$.totalDepositFunds").value(2000000));
    }

    @Test
    @DisplayName("Thợ tạo lệnh rút thu nhập khả dụng và Admin duyệt hoàn tất")
    void shouldHandleAvailableBalancePayoutFlow() throws Exception {
        // Nạp sẵn 500.000đ vào số dư khả dụng
        ProviderWallet wallet = walletService.getOrCreateWallet(providerProfile.getId());
        wallet.creditAvailable(500000L);
        walletRepository.save(wallet);

        // Thợ tạo lệnh rút 300.000đ
        CreatePayoutRequestDto payoutDto = new CreatePayoutRequestDto(
                300000L,
                "MBBANK",
                "0987654321",
                "NGUYEN VAN TAI"
        );

        MvcResult createResult = mockMvc.perform(post("/api/v1/provider/wallet/payouts")
                        .header("Authorization", "Bearer " + providerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payoutDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(300000))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.sourceWalletType").value("AVAILABLE"))
                .andReturn();

        JsonNode root = objectMapper.readTree(createResult.getResponse().getContentAsString());
        UUID payoutId = UUID.fromString(root.path("id").asText());

        // Số dư khả dụng của thợ bị tạm trừ ngay lập tức xuống 200.000đ
        assertThat(walletRepository.findByProviderProfileId(providerProfile.getId()).get().getAvailableBalance())
                .isEqualTo(200000L);

        // Admin duyệt lệnh rút tiền
        AdminReviewPayoutRequestDto reviewDto = new AdminReviewPayoutRequestDto("APPROVE", "Đã chuyển khoản thành công");
        mockMvc.perform(post("/api/v1/admin/financial/payouts/{id}/review", payoutId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    @DisplayName("Tranh chấp bảo hành: Admin trừ cọc thợ -> Thợ bị hụt cọc -> Nạp bù kích hoạt lại")
    void shouldHandleDisputePenaltyAndTopupFlow() throws Exception {
        // 1. Admin trích phạt 600.000đ từ tiền cọc của thợ do từ chối bảo hành
        AdminDisputePenaltyRequestDto penaltyDto = new AdminDisputePenaltyRequestDto(
                600000L,
                "Thợ từ chối quay lại bảo hành vòi nước bị rò rỉ",
                null
        );

        mockMvc.perform(post("/api/v1/admin/financial/providers/{providerId}/dispute-penalty", providerProfile.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(penaltyDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.depositBalance").value(1400000))
                .andExpect(jsonPath("$.status").value("DEPOSIT_DEFICIT"))
                .andExpect(jsonPath("$.eligibleToAcceptOrders").value(false));

        // 2. Thợ nộp tiền bù cọc bên ngoài cho Admin, Admin ghi nhận nạp bù 600.000đ
        AdminTopupDepositRequestDto topupDto = new AdminTopupDepositRequestDto(
                600000L,
                "Thợ đã nộp bù tiền mặt tại văn phòng Nhà Lo"
        );

        mockMvc.perform(post("/api/v1/admin/financial/providers/{providerId}/topup-deposit", providerProfile.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(topupDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.depositBalance").value(2000000))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.eligibleToAcceptOrders").value(true));
    }

    @Test
    @DisplayName("Thợ yêu cầu rút cọc rời sàn: Kích hoạt thời gian đóng băng 20 ngày")
    void shouldHandleDepositRefundAndCoolingPeriod() throws Exception {
        // Giả lập đơn hoàn thành cách đây 5 ngày
        ProviderWallet wallet = walletService.getOrCreateWallet(providerProfile.getId());
        wallet.setLastCompletedOrderAt(Instant.now().minusSeconds(5 * 86400));
        walletRepository.save(wallet);

        RequestDepositRefundDto refundDto = new RequestDepositRefundDto(
                "VIETCOMBANK",
                "1012345678",
                "NGUYEN VAN TAI",
                "Nghỉ làm việc do chuyển nơi ở"
        );

        MvcResult result = mockMvc.perform(post("/api/v1/provider/wallet/deposit-refund")
                        .header("Authorization", "Bearer " + providerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refundDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(2000000))
                .andExpect(jsonPath("$.status").value("COOLING_WAIT"))
                .andExpect(jsonPath("$.sourceWalletType").value("DEPOSIT"))
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        UUID payoutId = UUID.fromString(root.path("id").asText());

        // Trạng thái ví chuyển sang FROZEN_COOLING
        ProviderWallet updatedWallet = walletRepository.findByProviderProfileId(providerProfile.getId()).get();
        assertThat(updatedWallet.getStatus()).isEqualTo(WalletStatus.FROZEN_COOLING);
        assertThat(updatedWallet.isEligibleToAcceptOrders()).isFalse();

        // Hồ sơ thợ tự động chuyển isAvailable = false
        ProviderProfile updatedProfile = providerProfileRepository.findById(providerProfile.getId()).get();
        assertThat(updatedProfile.getIsAvailable()).isFalse();

        // Thợ cố tình bật lại isAvailable = true -> Bị từ chối 409 CONFLICT
        mockMvc.perform(put("/api/v1/provider/profile/me")
                        .header("Authorization", "Bearer " + providerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"isAvailable\": true}"))
                .andExpect(status().isConflict());

        // Admin cố tình duyệt khi chưa hết 20 ngày đóng băng -> Phải bị từ chối 409 CONFLICT
        AdminReviewPayoutRequestDto reviewDto = new AdminReviewPayoutRequestDto("APPROVE", "Duyệt trả cọc");
        mockMvc.perform(post("/api/v1/admin/financial/payouts/{id}/review", payoutId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewDto)))
                .andExpect(status().isConflict());
    }
}
