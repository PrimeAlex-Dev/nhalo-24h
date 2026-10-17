package com.nhalo24h.user.service;

import com.nhalo24h.common.config.AdminSeedProperties;
import com.nhalo24h.user.domain.User;
import com.nhalo24h.user.domain.UserRole;
import com.nhalo24h.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class AdminUserInitializerTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Khởi tạo Admin thành công khi DB chưa có Admin và enabled = true")
    void run_WhenEnabledAndNoAdmin_ShouldCreateAdminUser() {
        AdminSeedProperties properties = new AdminSeedProperties(
            true,
            "admin.test@nhalo24h.com",
            "Admin1234",
            "Admin Kiểm Thử",
            "0900000000"
        );

        AdminUserInitializer initializer = new AdminUserInitializer(userRepository, passwordEncoder, properties);
        initializer.run(new DefaultApplicationArguments());

        User admin = userRepository.findByEmailIgnoreCase("admin.test@nhalo24h.com").orElse(null);
        assertThat(admin).isNotNull();
        assertThat(admin.getRole()).isEqualTo(UserRole.ADMIN);
        assertThat(admin.getFullName()).isEqualTo("Admin Kiểm Thử");
        assertThat(passwordEncoder.matches("Admin1234", admin.getPasswordHash())).isTrue();
    }

    @Test
    @DisplayName("Bỏ qua khởi tạo khi hệ thống đã có tài khoản ADMIN")
    void run_WhenAdminAlreadyExists_ShouldNotDuplicate() {
        User existingAdmin = new User("Admin Cũ", "old.admin@nhalo24h.com", "0911111111", UserRole.ADMIN);
        existingAdmin.setPasswordHash(passwordEncoder.encode("OldPass123"));
        userRepository.save(existingAdmin);

        AdminSeedProperties properties = new AdminSeedProperties(
            true,
            "new.admin@nhalo24h.com",
            "NewPass123",
            "Admin Mới",
            "0900000000"
        );

        AdminUserInitializer initializer = new AdminUserInitializer(userRepository, passwordEncoder, properties);
        initializer.run(new DefaultApplicationArguments());

        assertThat(userRepository.count()).isEqualTo(1);
        assertThat(userRepository.findByEmailIgnoreCase("new.admin@nhalo24h.com")).isEmpty();
    }

    @Test
    @DisplayName("Không tạo Admin khi cờ enabled = false")
    void run_WhenDisabled_ShouldNotCreateAdmin() {
        AdminSeedProperties properties = new AdminSeedProperties(
            false,
            "admin.disabled@nhalo24h.com",
            "Admin1234",
            "Admin Disabled",
            "0900000000"
        );

        AdminUserInitializer initializer = new AdminUserInitializer(userRepository, passwordEncoder, properties);
        initializer.run(new DefaultApplicationArguments());

        assertThat(userRepository.count()).isEqualTo(0);
    }
}
