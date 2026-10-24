package com.nhalo24h.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Schema(description = "Thông tin một hạng mục vật tư / linh kiện trong báo giá")
public record QuoteItemDto(
    @Schema(description = "ID hạng mục (nếu đã lưu)")
    UUID id,

    @Schema(description = "Tên linh kiện / vật tư", example = "Tụ đề máy lạnh 35uF")
    @NotBlank(message = "Tên vật tư/hạng mục không được để trống")
    String itemName,

    @Schema(description = "Đơn vị tính", example = "Cái")
    String unit,

    @Schema(description = "Số lượng", example = "1")
    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn hoặc bằng 1")
    Integer quantity,

    @Schema(description = "Đơn giá (VNĐ)", example = "120000")
    @NotNull(message = "Đơn giá không được để trống")
    @Min(value = 0, message = "Đơn giá không được âm")
    Long unitPrice,

    @Schema(description = "Thành tiền (VNĐ)", example = "120000")
    Long totalPrice,

    @Schema(description = "Ghi chú xuất xứ / bảo hành linh kiện", example = "Hàng chính hãng, bảo hành 6 tháng")
    String note
) {
}
