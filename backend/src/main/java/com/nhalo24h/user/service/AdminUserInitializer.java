package com.nhalo24h.user.service;

import com.nhalo24h.common.config.AdminSeedProperties;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.domain.UserStatus;
import com.nhalo24h.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Tự động khởi tạo tài khoản Quản trị viên (ADMIN) đầu tiên khi ứng dụng khởi động
 * nếu hệ thống chưa có bất kỳ tài khoản ADMIN nào trong cơ sở dữ liệu.
 * Thông tin tài khoản được nạp an toàn từ biến môi trường (.env) qua AdminSeedProperties.
 */
@Component
@Order(1)
public class AdminUserInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminSeedProperties adminSeedProperties;

    public AdminUserInitializer(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        AdminSeedProperties adminSeedProperties
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminSeedProperties = adminSeedProperties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!adminSeedProperties.enabled()) {
            log.info("Tính năng tự động khởi tạo tài khoản Admin đã bị tắt (app.seed.admin.enabled = false).");
            return;
        }

        String adminEmail = adminSeedProperties.email().trim().toLowerCase();

        // Kiểm tra xem đã có tài khoản ADMIN nào hoặc đã có user với email này chưa
        if (userRepository.existsByRole(UserRole.ADMIN) || userRepository.existsByEmailIgnoreCase(adminEmail)) {
            log.info("Hệ thống đã có tài khoản Quản trị viên (ADMIN). Bỏ qua bước khởi tạo mặc định.");
            return;
        }

        String rawPassword = adminSeedProperties.password();
        if (rawPassword == null || rawPassword.isBlank()) {
            log.warn("Mật khẩu Admin khởi tạo trống. Bỏ qua khởi tạo tài khoản Admin.");
            return;
        }

        User admin = new User(
            adminSeedProperties.fullName().trim(),
            adminEmail,
            adminSeedProperties.phone() != null ? adminSeedProperties.phone().trim() : null,
            UserRole.ADMIN
        );
        admin.setPasswordHash(passwordEncoder.encode(rawPassword.trim()));
        admin.setStatus(UserStatus.ACTIVE);
        admin.setEmailVerified(true);

        userRepository.save(admin);

        log.info("================================================================================");
        log.info("ĐÃ KHỞI TẠO TÀI KHOẢN ADMIN BAN ĐẦU CHO HỆ THỐNG:");
        log.info("  Email   : {}", adminEmail);
        log.info("  Họ tên  : {}", admin.getFullName());
        log.info("  Vai trò : {}", admin.getRole());
        log.info("  Lưu ý   : Mật khẩu được nạp an toàn từ biến môi trường SEED_ADMIN_PASSWORD.");
        log.info("            Vui lòng giữ bảo mật hoặc đổi mật khẩu sau khi đăng nhập!");
        log.info("================================================================================");
    }
}
