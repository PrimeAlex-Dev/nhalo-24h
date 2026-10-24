package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Quản trị viên xử lý tranh chấp thanh toán / đối soát đơn hàng")
public record ResolveDisputeRequest(
    @Schema(description = "Tiền công thực tế sau khi Admin đối soát (VNĐ)", example = "250000")
    @NotNull(message = "Vui lòng nhập tiền công xác minh")
    @Min(value = 0, message = "Tiền công không được âm")
    Long verifiedLaborFee,

    @Schema(description = "Tiền vật tư thực tế sau khi Admin đối soát (VNĐ)", example = "180000")
    @NotNull(message = "Vui lòng nhập tiền vật tư xác minh")
    @Min(value = 0, message = "Tiền vật tư không được âm")
    Long verifiedMaterialsFee,

    @Schema(description = "Tổng số tiền thực tế khách đã thanh toán được Admin xác nhận (VNĐ)", example = "430000")
    @NotNull(message = "Vui lòng nhập tổng số tiền đã thanh toán")
    @Min(value = 0, message = "Tổng số tiền không được âm")
    Long verifiedTotalPaid,

    @Schema(description = "Kết luận xử lý đối soát của Quản trị viên")
    @NotBlank(message = "Vui lòng nhập ghi chú kết luận xử lý")
    String resolutionNote
) {
}
