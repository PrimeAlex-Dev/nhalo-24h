package com.nhalo24h.category.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Trạng thái danh mục dịch vụ: ACTIVE (Đang hoạt động), INACTIVE (Tạm ngưng)")
public enum CategoryStatus {
    ACTIVE,
    INACTIVE
}
