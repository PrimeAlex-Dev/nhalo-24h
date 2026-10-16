package com.nhalo24h.user.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Vai trò người dùng trong hệ thống Nhà Lo 24h")
public enum UserRole {
    CUSTOMER,
    PROVIDER,
    ADMIN
}
