package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

@Schema(description = "Yêu cầu gửi mời báo giá tới thêm danh sách thợ")
public record DispatchOrderRequestsDto(
    @Schema(description = "Danh sách ID hồ sơ thợ (ProviderProfile id) muốn gửi yêu cầu")
    @NotEmpty(message = "Vui lòng chọn ít nhất một thợ để gửi yêu cầu")
    List<UUID> providerIds
) {
}
