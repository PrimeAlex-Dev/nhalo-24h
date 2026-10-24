package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Yêu cầu Quản trị viên điều chỉnh hóa đơn trước thanh toán (do hòa giải khiếu nại báo giá/tiền công/vật tư)")
public record AdjustInvoiceRequest(
    @Schema(description = "Tiền công sau khi Admin hòa giải (VNĐ)", example = "200000")
    @NotNull(message = "Vui lòng nhập tiền công điều chỉnh")
    @Min(value = 0, message = "Tiền công không được âm")
    Long adjustedLaborFee,

    @Schema(description = "Tiền vật tư sau khi Admin hòa giải (VNĐ)", example = "150000")
    @NotNull(message = "Vui lòng nhập tiền vật tư điều chỉnh")
    @Min(value = 0, message = "Tiền vật tư không được âm")
    Long adjustedMaterialsFee,

    @Schema(description = "Biên bản / Lý do Admin điều chỉnh hóa đơn")
    @NotBlank(message = "Vui lòng nhập lý do điều chỉnh hóa đơn")
    String adminNote
) {
}
