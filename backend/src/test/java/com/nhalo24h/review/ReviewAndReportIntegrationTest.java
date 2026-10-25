package com.nhalo24h.review;

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
import com.nhalo24h.order.repository.OrderRepository;
import com.nhalo24h.provider.domain.ProviderProfile;
import com.nhalo24h.provider.repository.ProviderProfileRepository;
import com.nhalo24h.report.domain.PenaltyType;
import com.nhalo24h.report.domain.ReportReasonType;
import com.nhalo24h.report.domain.ReportStatus;
import com.nhalo24h.report.dto.CreateReportRequest;
import com.nhalo24h.report.dto.ResolveReportRequest;
import com.nhalo24h.report.repository.ProviderReportRepository;
import com.nhalo24h.review.dto.CreateReviewRequest;
import com.nhalo24h.review.dto.ProviderReplyRequest;
import com.nhalo24h.review.repository.ReviewRepository;
import com.nhalo24h.user.domain.CustomerAddress;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.repository.CustomerAddressRepository;
import com.nhalo24h.user.repository.UserRepository;
import com.nhalo24h.wallet.domain.ProviderWallet;
import com.nhalo24h.wallet.domain.WalletStatus;
import com.nhalo24h.wallet.repository.PlatformFinancialRecordRepository;
import com.nhalo24h.wallet.repository.ProviderWalletRepository;
import com.nhalo24h.wallet.repository.WalletTransactionRepository;
import com.nhalo24h.wallet.service.WalletService;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReviewAndReportIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private PasswordEncoder passwordEncoder;

    @Autowired private UserRepository userRepository;
    @Autowired private CustomerAddressRepository addressRepository;
    @Autowired private ProviderProfileRepository providerProfileRepository;
    @Autowired private ServiceCategoryRepository categoryRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private ProviderReportRepository reportRepository;
    @Autowired private ProviderWalletRepository walletRepository;
    @Autowired private WalletTransactionRepository transactionRepository;
    @Autowired private PlatformFinancialRecordRepository financialRecordRepository;
    @Autowired private InvalidatedTokenRepository tokenRepository;
    @Autowired private WalletService walletService;

    private User adminUser;
    private User customerUser;
    private User providerUser;
    private ProviderProfile providerProfile;
    private ServiceCategory category;
    private CustomerAddress address;
    private Order completedOrder;

    private String adminToken;
    private String customerToken;
    private String providerToken;

    @BeforeEach
    void setUp() throws Exception {
        cleanUp();

        // 1. Setup Admin
        adminUser = userRepository.save(new User("Admin Quản Trị", "admin_rr@nhalo24h.com", "0901000001", UserRole.ADMIN));
        adminUser.setPasswordHash(passwordEncoder.encode("Password@123"));
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUser = userRepository.save(adminUser);

        // 2. Setup Customer
        customerUser = userRepository.save(new User("Khách Hàng A", "customer_rr@nhalo24h.com", "0901000002", UserRole.CUSTOMER));
        customerUser.setPasswordHash(passwordEncoder.encode("Password@123"));
        customerUser.setStatus(UserStatus.ACTIVE);
        customerUser = userRepository.save(customerUser);

        // 3. Setup Provider
        providerUser = userRepository.save(new User("Thợ Kỹ Thuật B", "provider_rr@nhalo24h.com", "0901000003", UserRole.PROVIDER));
        providerUser.setPasswordHash(passwordEncoder.encode("Password@123"));
        providerUser.setStatus(UserStatus.ACTIVE);
        providerUser = userRepository.save(providerUser);

        providerProfile = new ProviderProfile(providerUser);
        providerProfile.setHeadline("Thợ Điện Nước");
        providerProfile.setIsAvailable(true);
        providerProfile.setRatingAverage(5.0);
        providerProfile.setReviewCount(0);
        providerProfile = providerProfileRepository.save(providerProfile);

        // Nạp cọc 2 triệu cho thợ
        ProviderWallet wallet = walletService.getOrCreateWallet(providerProfile.getId());
        wallet.setDepositBalance(2_000_000L);
        walletRepository.save(wallet);

        // Category & Address
        category = new ServiceCategory("Sửa Điện", "sua-dien-" + UUID.randomUUID(), "Dịch vụ điện", "/icon.png", CategoryStatus.ACTIVE, 1);
        category = categoryRepository.save(category);

        address = addressRepository.save(new CustomerAddress(
                customerUser,
                "Nhà riêng",
                "123 Đường 3/2, Ninh Kiều, Cần Thơ",
                true
        ));

        // Completed Order
        completedOrder = new Order();
        completedOrder.setOrderCode("NL-RR-" + UUID.randomUUID().toString().substring(0, 8));
        completedOrder.setCustomer(customerUser);
        completedOrder.setCategory(category);
        completedOrder.setAddress(address);
        completedOrder.setAddressSnapshot(address.getFullAddress());
        completedOrder.setContactName(customerUser.getFullName());
        completedOrder.setContactPhone(customerUser.getPhone());
        completedOrder.setTitle("Sửa chập điện phòng khách");
        completedOrder.setDescription("Chập cầu dao");
        completedOrder.setWorkflowMode(QuoteMode.SURVEY_REQUIRED);
        completedOrder.setExpectedScheduleTime(Instant.now().plusSeconds(3600));
        completedOrder.setAssignedProvider(providerProfile);
        completedOrder.setStatus(OrderStatus.COMPLETED);
        completedOrder.setPaymentMethod(PaymentMethod.ONLINE);
        completedOrder.setPaymentStatus(PaymentStatus.PAID_ONLINE);
        completedOrder.setFinalPrice(500_000L);
        completedOrder = orderRepository.save(completedOrder);

        // Login Tokens
        adminToken = loginAndGetToken("admin_rr@nhalo24h.com", "Password@123");
        customerToken = loginAndGetToken("customer_rr@nhalo24h.com", "Password@123");
        providerToken = loginAndGetToken("provider_rr@nhalo24h.com", "Password@123");
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        reviewRepository.deleteAll();
        reportRepository.deleteAll();
        transactionRepository.deleteAll();
        financialRecordRepository.deleteAll();
        walletRepository.deleteAll();
        orderRepository.deleteAll();
        addressRepository.deleteAll();
        providerProfileRepository.deleteAll();
        categoryRepository.deleteAll();
        tokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        LoginRequest req = new LoginRequest(email, password);
        MvcResult res = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).get("accessToken").asText();
    }

    @Test
    @DisplayName("Khách hàng đánh giá đơn hoàn tất -> Cập nhật uy tín thợ & Thợ phản hồi thành công")
    void testReviewWorkflow() throws Exception {
        // 1. Khách gửi đánh giá 4 sao
        CreateReviewRequest reviewReq = new CreateReviewRequest(
                completedOrder.getId(),
                (short) 4,
                (short) 5, // punctuality
                (short) 4, // skill
                (short) 5, // attitude
                (short) 4, // price
                "Thợ làm rất nhiệt tình và sạch sẽ!",
                List.of("Đúng giờ", "Nhiệt tình", "Tay nghề giỏi"),
                List.of("https://example.com/img1.jpg"),
                false
        );

        MvcResult reviewResult = mockMvc.perform(post("/api/v1/reviews")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rating").value(4))
                .andExpect(jsonPath("$.comment").value("Thợ làm rất nhiệt tình và sạch sẽ!"))
                .andReturn();

        String reviewIdStr = objectMapper.readTree(reviewResult.getResponse().getContentAsString()).get("id").asText();
        UUID reviewId = UUID.fromString(reviewIdStr);

        // 2. Kiểm tra chỉ số Thợ đã được cập nhật
        ProviderProfile updatedProfile = providerProfileRepository.findById(providerProfile.getId()).orElseThrow();
        assertThat(updatedProfile.getRatingAverage()).isEqualTo(4.0);
        assertThat(updatedProfile.getReviewCount()).isEqualTo(1);

        // 3. Thợ gửi phản hồi lịch sự
        ProviderReplyRequest replyReq = new ProviderReplyRequest("Dạ em cảm ơn quý khách đã tin tưởng và ủng hộ!");
        mockMvc.perform(post("/api/v1/provider/reviews/" + reviewId + "/reply")
                        .header("Authorization", "Bearer " + providerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(replyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.providerReply").value("Dạ em cảm ơn quý khách đã tin tưởng và ủng hộ!"));

        // 4. Khách xem công khai danh sách review và rating summary của thợ
        mockMvc.perform(get("/api/v1/providers/" + providerProfile.getId() + "/rating-summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageRating").value(4.0))
                .andExpect(jsonPath("$.totalReviews").value(1))
                .andExpect(jsonPath("$.star4Count").value(1));

        // 5. Thử gửi đánh giá lần 2 trên cùng đơn hàng -> Bị chặn 409
        mockMvc.perform(post("/api/v1/reviews")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewReq)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Khách hàng khiếu nại vi phạm -> Admin kết luận xử phạt trừ ký quỹ thợ")
    void testReportAndDisputePenaltyWorkflow() throws Exception {
        // 1. Khách gửi báo cáo vi phạm
        CreateReportRequest reportReq = new CreateReportRequest(
                completedOrder.getId(),
                providerProfile.getId(),
                ReportReasonType.POOR_QUALITY_OR_DAMAGE,
                "Làm vỡ gạch ốp tường khi khoan",
                "Thợ khoan ẩu làm nứt gạch nhưng không chịu khắc phục",
                List.of("https://example.com/broken_tile.jpg"),
                "Yêu cầu bồi thường 500.000đ"
        );

        MvcResult reportResult = mockMvc.perform(post("/api/v1/reports")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reportReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.reportCode").exists())
                .andReturn();

        String reportIdStr = objectMapper.readTree(reportResult.getResponse().getContentAsString()).get("id").asText();
        UUID reportId = UUID.fromString(reportIdStr);

        // 1b. Admin xem danh sách khiếu nại
        mockMvc.perform(get("/api/v1/admin/reports")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page.totalElements").value(1));

        // 2. Admin xem chi tiết khiếu nại
        mockMvc.perform(get("/api/v1/admin/reports/" + reportId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Làm vỡ gạch ốp tường khi khoan"));

        // 3. Admin kết luận xử phạt trừ 500.000đ từ quỹ ký quỹ của thợ
        ResolveReportRequest resolveReq = new ResolveReportRequest(
                ReportStatus.RESOLVED,
                PenaltyType.DEPOSIT_DEDUCTION,
                500_000L,
                "Xác định thợ thi công gây vỡ gạch của khách, trích 500.000đ từ tiền cọc để bồi thường."
        );

        mockMvc.perform(post("/api/v1/admin/reports/" + reportId + "/resolve")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resolveReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"))
                .andExpect(jsonPath("$.penaltyType").value("DEPOSIT_DEDUCTION"))
                .andExpect(jsonPath("$.penaltyAmount").value(500000));

        // 4. Kiểm tra ví ký quỹ của thợ: 2.000.000đ - 500.000đ = 1.500.000đ
        // Và trạng thái ví phải chuyển thành DEPOSIT_DEFICIT vì dưới 2 triệu định mức!
        ProviderWallet wallet = walletRepository.findByProviderProfileId(providerProfile.getId()).orElseThrow();
        assertThat(wallet.getDepositBalance()).isEqualTo(1_500_000L);
        assertThat(wallet.getStatus()).isEqualTo(WalletStatus.DEPOSIT_DEFICIT);
        assertThat(walletService.isProviderEligibleToAcceptOrders(providerProfile.getId())).isFalse();
    }
}
