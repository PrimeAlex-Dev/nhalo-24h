package com.nhalo24h.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.seed.admin")
public record AdminSeedProperties(
    boolean enabled,
    String email,
    String password,
    String fullName,
    String phone
) {
    public AdminSeedProperties {
        if (email == null || email.isBlank()) {
            email = "admin@nhalo24h.com";
        }
        if (password == null || password.isBlank()) {
            password = "Admin1234";
        }
        if (fullName == null || fullName.isBlank()) {
            fullName = "Quản Trị Viên Hệ Thống";
        }
        if (phone == null || phone.isBlank()) {
            phone = "0900000000";
        }
    }
}
