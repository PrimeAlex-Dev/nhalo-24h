package com.nhalo24h.user.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Trạng thái hoạt động của tài khoản người dùng")
public enum UserStatus {
    ACTIVE,
    DISABLED
}
