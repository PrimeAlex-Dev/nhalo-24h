package com.nhalo24h.order.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Hình thức báo giá của thợ")
public enum QuoteMode {
    @Schema(description = "Báo giá sơ bộ, cần đến khảo sát thực tế rồi mới chốt giá sửa chữa cuối cùng")
    SURVEY_REQUIRED,

    @Schema(description = "Báo giá cố định cam kết theo đúng mô tả ban đầu (áp dụng cho gói vệ sinh chuẩn hoặc hạng mục rõ ràng)")
    COMMITTED_FIXED
}
