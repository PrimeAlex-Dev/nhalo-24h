package com.nhalo24h.order.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Loại phiên bản báo giá / điều chỉnh trong vòng đời đơn hàng")
public enum QuoteVersionType {
    @Schema(description = "Báo giá sơ bộ ban đầu khi thợ ứng tuyển")
    INITIAL_ESTIMATE,

    @Schema(description = "Báo giá cuối cùng sau khi thợ đã khảo sát thực tế tại nhà khách")
    POST_SURVEY_FINAL,

    @Schema(description = "Yêu cầu điều chỉnh chi phí / phát sinh vật tư trong quá trình thực hiện")
    IN_PROGRESS_CHANGE,

    @Schema(description = "Hóa đơn quyết toán khi thợ báo hoàn thành công việc")
    COMPLETION_INVOICE
}
