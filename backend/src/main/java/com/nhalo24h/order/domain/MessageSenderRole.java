package com.nhalo24h.order.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Vai trò người gửi tin nhắn trong báo giá")
public enum MessageSenderRole {
    CUSTOMER,
    PROVIDER
}
